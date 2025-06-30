/**
 * Test suite per le funzioni di utilità e costanti
 * Verifica che le funzioni di conversione e pricing dinamico funzionino correttamente
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Importiamo i dati direttamente dal JSON
const pricingData = JSON.parse(
  readFileSync(join(__dirname, '../src/data/azure-pricing.json'), 'utf8')
);

// Riproduciamo le funzioni da constants.ts per testare
const convertFromUSD = (priceUSD: number, toCurrency: string): number => {
  if (toCurrency === 'USD') return priceUSD;
  
  const currencies = pricingData.currencies;
  const targetCurrency = currencies[toCurrency];
  
  if (!targetCurrency) {
    console.warn(`Currency ${toCurrency} not found, using USD`);
    return priceUSD;
  }
  
  const conversionRate = targetCurrency.modernConversion || targetCurrency.conversion;
  return priceUSD * conversionRate;
};

const getDynamicPricing = (region: string, currency: string) => {
  const regionData = pricingData.regions[region];
  
  if (!regionData) {
    console.warn(`Region ${region} not found, using defaults`);
    return null;
  }

  const basePricingUSD = {
    vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond,
    memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond
  };

  const regionAdjustedPricingUSD = {
    vcpu_per_second: basePricingUSD.vcpu_per_second * regionData.multiplier,
    memory_per_gib_second: basePricingUSD.memory_per_gib_second * regionData.multiplier
  };

  const finalPricing = {
    vcpu_per_second: convertFromUSD(regionAdjustedPricingUSD.vcpu_per_second, currency),
    memory_per_gib_second: convertFromUSD(regionAdjustedPricingUSD.memory_per_gib_second, currency)
  };

  const currencySymbol = pricingData.currencies[currency]?.symbol || '$';
  
  return {
    vcpu_per_second: finalPricing.vcpu_per_second,
    memory_per_gib_second: finalPricing.memory_per_gib_second,
    currency: currency,
    currencySymbol: currencySymbol,
    regions: Object.fromEntries(
      Object.entries(pricingData.regions).map(([key, region]: [string, any]) => [key, region.multiplier])
    )
  };
};

describe('Currency Conversion Functions', () => {
  it('should return same price for USD conversion', () => {
    const usdPrice = 0.000004;
    const convertedPrice = convertFromUSD(usdPrice, 'USD');
    expect(convertedPrice).toBe(usdPrice);
  });

  it('should convert USD to EUR correctly', () => {
    const usdPrice = 0.000004;
    const eurPrice = convertFromUSD(usdPrice, 'EUR');
    const expectedEurRate = pricingData.currencies.EUR.modernConversion;
    
    expect(eurPrice).toBeCloseTo(usdPrice * expectedEurRate, 8);
    expect(eurPrice).toBeLessThan(usdPrice); // EUR should be less than USD
  });

  it('should convert USD to GBP correctly', () => {
    const usdPrice = 0.000034;
    const gbpPrice = convertFromUSD(usdPrice, 'GBP');
    const expectedGbpRate = pricingData.currencies.GBP.modernConversion;
    
    expect(gbpPrice).toBeCloseTo(usdPrice * expectedGbpRate, 8);
    expect(gbpPrice).toBeLessThan(usdPrice); // GBP should be less than USD
  });

  it('should handle unknown currency gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const usdPrice = 0.000004;
    const result = convertFromUSD(usdPrice, 'UNKNOWN');
    
    expect(result).toBe(usdPrice);
    expect(consoleSpy).toHaveBeenCalledWith('Currency UNKNOWN not found, using USD');
    
    consoleSpy.mockRestore();
  });
});

describe('Dynamic Pricing Function', () => {
  it('should return correct pricing for East US in USD', () => {
    const pricing = getDynamicPricing('eastus', 'USD');
    
    expect(pricing).toBeDefined();
    expect(pricing!.vcpu_per_second).toBe(3.4E-05);
    expect(pricing!.memory_per_gib_second).toBe(4E-06);
    expect(pricing!.currency).toBe('USD');
    expect(pricing!.currencySymbol).toBe('$');
  });

  it('should return correct pricing for West Europe in EUR', () => {
    const pricing = getDynamicPricing('westeurope', 'EUR');
    const eurRate = pricingData.currencies.EUR.modernConversion;
    
    expect(pricing).toBeDefined();
    expect(pricing!.vcpu_per_second).toBeCloseTo(3.4E-05 * eurRate, 8);
    expect(pricing!.memory_per_gib_second).toBeCloseTo(4E-06 * eurRate, 8);
    expect(pricing!.currency).toBe('EUR');
    expect(pricing!.currencySymbol).toBe('€');
  });

  it('should apply region multiplier correctly', () => {
    // Tutti i moltiplicatori dovrebbero essere 1.0 per pay-as-you-go
    const pricing = getDynamicPricing('southeastasia', 'USD');
    
    expect(pricing).toBeDefined();
    expect(pricing!.vcpu_per_second).toBe(3.4E-05 * 1.0);
    expect(pricing!.memory_per_gib_second).toBe(4E-06 * 1.0);
  });

  it('should handle unknown region gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const pricing = getDynamicPricing('unknown-region', 'USD');
    
    expect(pricing).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Region unknown-region not found, using defaults');
    
    consoleSpy.mockRestore();
  });

  it('should return regions mapping', () => {
    const pricing = getDynamicPricing('eastus', 'USD');
    
    expect(pricing).toBeDefined();
    expect(pricing!.regions).toBeDefined();
    expect(typeof pricing!.regions).toBe('object');
    expect(pricing!.regions['eastus']).toBe(1.0);
    expect(pricing!.regions['westeurope']).toBe(1.0);
  });
});

describe('Cross-Currency Consistency', () => {
  it('should maintain cost relationships across currencies', () => {
    const usdPricing = getDynamicPricing('eastus', 'USD');
    const eurPricing = getDynamicPricing('eastus', 'EUR');
    const gbpPricing = getDynamicPricing('eastus', 'GBP');
    
    expect(usdPricing).toBeDefined();
    expect(eurPricing).toBeDefined();
    expect(gbpPricing).toBeDefined();
    
    // Test 1 vCPU for 1 hour costs
    const usdHourlyCost = usdPricing!.vcpu_per_second * 3600;
    const eurHourlyCost = eurPricing!.vcpu_per_second * 3600;
    const gbpHourlyCost = gbpPricing!.vcpu_per_second * 3600;
    
    // EUR e GBP dovrebbero costare meno in valore assoluto
    expect(eurHourlyCost).toBeLessThan(usdHourlyCost);
    expect(gbpHourlyCost).toBeLessThan(usdHourlyCost);
  });

  it('should have consistent currency symbols', () => {
    const currencyTests = [
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
      { code: 'GBP', symbol: '£' },
      { code: 'JPY', symbol: '¥' },
      { code: 'CHF', symbol: 'CHF ' }
    ];
    
    currencyTests.forEach(({ code, symbol }) => {
      const pricing = getDynamicPricing('eastus', code);
      expect(pricing).toBeDefined();
      expect(pricing!.currencySymbol).toBe(symbol);
    });
  });
});

describe('Real-world Cost Scenarios', () => {
  it('should calculate realistic costs for small app (0.5 vCPU, 1 GiB)', () => {
    const pricing = getDynamicPricing('eastus', 'USD');
    expect(pricing).toBeDefined();
    
    const vcpu = 0.5;
    const memory = 1; // GiB
    const hoursPerDay = 24;
    const secondsPerHour = 3600;
    
    const dailyCost = (
      pricing!.vcpu_per_second * vcpu * hoursPerDay * secondsPerHour +
      pricing!.memory_per_gib_second * memory * hoursPerDay * secondsPerHour
    );
    
    // Should be around $1.81 per day for small app
    expect(dailyCost).toBeGreaterThan(1.5);
    expect(dailyCost).toBeLessThan(2.5);
  });

  it('should calculate realistic costs for medium app (2 vCPU, 4 GiB)', () => {
    const pricing = getDynamicPricing('eastus', 'USD');
    expect(pricing).toBeDefined();
    
    const vcpu = 2;
    const memory = 4; // GiB
    const hoursPerDay = 24;
    const secondsPerHour = 3600;
    
    const dailyCost = (
      pricing!.vcpu_per_second * vcpu * hoursPerDay * secondsPerHour +
      pricing!.memory_per_gib_second * memory * hoursPerDay * secondsPerHour
    );
    
    // Should be around $7.26 per day for medium app
    expect(dailyCost).toBeGreaterThan(6.5);
    expect(dailyCost).toBeLessThan(8.0);
  });
});
