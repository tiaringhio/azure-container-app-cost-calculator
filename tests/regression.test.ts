/**
 * Test di regressione per verificare che i cambiamenti al sistema di pricing
 * non rompano funzionalità esistenti e mantengano la compatibilità
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Importiamo i dati dal JSON
const pricingData = JSON.parse(
  readFileSync(join(__dirname, '../src/data/azure-pricing.json'), 'utf8')
);

describe('Regression Tests - Core Pricing Functionality', () => {
  it('should maintain backwards compatibility with existing pricing structure', () => {
    // Verifica che la struttura essenziale non sia cambiata
    expect(pricingData).toHaveProperty('consumptionPlan');
    expect(pricingData).toHaveProperty('currencies');
    expect(pricingData).toHaveProperty('regions');
    expect(pricingData).toHaveProperty('rawApiData');
    
    // Verifica path specifici per active usage
    expect(pricingData.consumptionPlan).toHaveProperty('activeUsage');
    expect(pricingData.consumptionPlan.activeUsage).toHaveProperty('pricing');
    expect(pricingData.consumptionPlan.activeUsage.pricing).toHaveProperty('vcpu');
    expect(pricingData.consumptionPlan.activeUsage.pricing).toHaveProperty('memory');
  });

  it('should not have any legacy 0.000003 memory pricing', () => {
    // REGRESSIONE CRITICA: assicurarsi che il vecchio prezzo memory (3E-06) non torni
    const memoryActivePrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond;
    const memoryActivePerGib = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond;
    
    // Verifica che NON sia il vecchio prezzo
    expect(memoryActivePrice).not.toBe(3E-06);
    expect(memoryActivePrice).not.toBe(0.000003);
    expect(memoryActivePerGib).not.toBe(3E-06);
    expect(memoryActivePerGib).not.toBe(0.000003);
    
    // Verifica che sia il nuovo prezzo corretto
    expect(memoryActivePrice).toBe(4E-06);
    expect(memoryActivePrice).toBe(0.000004);
    expect(memoryActivePerGib).toBe(4E-06);
    expect(memoryActivePerGib).toBe(0.000004);
    
    // Verifica anche nei raw data
    const memoryRawRecords = pricingData.rawApiData.filter((item: any) => 
      item.meterName === 'Standard Memory Active Usage'
    );
    
    memoryRawRecords.forEach((record: any) => {
      expect(record.unitPrice).not.toBe(3E-06);
      expect(record.unitPrice).toBe(4E-06);
    });
  });

  it('should maintain all original currency support', () => {
    // Verifica che tutte le valute originali siano ancora supportate
    const originalCurrencies = [
      'USD', 'EUR', 'CHF', 'AUD', 'DKK', 'CAD', 'JPY', 'KRW', 
      'NZD', 'NOK', 'RUB', 'SEK', 'TWD', 'GBP', 'INR', 'BRL'
    ];
    
    originalCurrencies.forEach(currency => {
      expect(pricingData.currencies).toHaveProperty(currency);
      expect(pricingData.currencies[currency]).toHaveProperty('name');
      expect(pricingData.currencies[currency]).toHaveProperty('symbol');
      expect(pricingData.currencies[currency]).toHaveProperty('displayName');
      expect(pricingData.currencies[currency]).toHaveProperty('conversion');
    });
  });

  it('should maintain all original region support', () => {
    // Verifica che tutte le regioni principali siano ancora supportate
    const originalRegions = [
      'eastus', 'eastus2', 'westus', 'westus2', 'westeurope', 'northeurope',
      'southeastasia', 'australiaeast', 'uksouth', 'canadacentral', 'brazilsouth'
    ];
    
    originalRegions.forEach(region => {
      expect(pricingData.regions).toHaveProperty(region);
      expect(pricingData.regions[region]).toHaveProperty('name');
      expect(pricingData.regions[region]).toHaveProperty('multiplier');
      expect(pricingData.regions[region]).toHaveProperty('currency');
    });
  });

  it('should maintain USD as base currency', () => {
    // USD deve rimanere la valuta base con conversion rate 1.0
    expect(pricingData.currencies.USD.conversion).toBe(1.0);
    expect(pricingData.currencies.USD.modernConversion).toBe(1.0);
    expect(pricingData.currencies.USD.symbol).toBe('$');
  });

  it('should maintain pay-as-you-go model (all multipliers = 1.0)', () => {
    // Tutti i moltiplicatori regionali dovrebbero essere 1.0 per pay-as-you-go
    Object.values(pricingData.regions).forEach((region: any) => {
      expect(region.multiplier).toBe(1.0);
    });
  });
});

describe('Regression Tests - Price Calculation Consistency', () => {
  it('should calculate same costs as before for standard workloads', () => {
    // Test case: verifica che i calcoli per workload standard siano consistenti
    const vcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const memoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond;
    
    // Workload di riferimento: 1 vCPU, 2 GiB, 24h
    const referenceDailyCost = (
      vcpuPrice * 1 * 86400 +
      memoryPrice * 2 * 86400
    );
    
    // Il costo giornaliero dovrebbe essere nel range atteso ($3.50-$3.70)
    // Questo è basato sui nuovi prezzi corretti
    expect(referenceDailyCost).toBeGreaterThan(3.5);
    expect(referenceDailyCost).toBeLessThan(3.8);
    
    // Verifica precision per confronti futuri
    expect(referenceDailyCost).toBeCloseTo(3.6288, 4);
  });

  it('should maintain correct free tier calculations', () => {
    const freeAllowances = pricingData.consumptionPlan.activeUsage.freeAllowances;
    
    // Verifica che i free allowances siano quelli di Azure Container Apps
    expect(freeAllowances.vcpuSeconds).toBe(180000); // 50 vCPU ore gratis
    expect(freeAllowances.memoryGibSeconds).toBe(360000); // 100 GiB-ora gratis
    expect(freeAllowances.requests).toBe(2000000); // 2M richieste gratis
  });

  it('should calculate correct costs after free tier consumption', () => {
    const vcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const memoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond;
    const freeAllowances = pricingData.consumptionPlan.activeUsage.freeAllowances;
    
    // Scenario: app che usa 0.5 vCPU, 1 GiB per tutto il mese
    const monthlyVcpuSeconds = 0.5 * 30 * 24 * 3600; // 1,296,000 secondi
    const monthlyMemoryGibSeconds = 1 * 30 * 24 * 3600; // 2,592,000 GiB-secondi
    
    // Calcola costi dopo free allowances
    const billableVcpuSeconds = Math.max(0, monthlyVcpuSeconds - freeAllowances.vcpuSeconds);
    const billableMemoryGibSeconds = Math.max(0, monthlyMemoryGibSeconds - freeAllowances.memoryGibSeconds);
    
    const monthlyCost = (
      billableVcpuSeconds * vcpuPrice +
      billableMemoryGibSeconds * memoryPrice
    );
    
    // Dovrebbe essere circa $45-50 per questo scenario (corretti con nuovi prezzi)
    expect(monthlyCost).toBeGreaterThan(40);
    expect(monthlyCost).toBeLessThan(55);
  });
});

describe('Regression Tests - Data Integrity', () => {
  it('should have consistent data across all sections', () => {
    const specVcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const specMemoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond;
    
    // Trova corrispondenze nei raw data
    const rawVcpuRecord = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard vCPU Active Usage'
    );
    const rawMemoryRecord = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard Memory Active Usage'
    );
    
    expect(rawVcpuRecord).toBeDefined();
    expect(rawMemoryRecord).toBeDefined();
    
    // I prezzi devono essere identici
    expect(specVcpuPrice).toBe(rawVcpuRecord.unitPrice);
    expect(specMemoryPrice).toBe(rawMemoryRecord.unitPrice);
  });

  it('should have valid modernConversion rates for major currencies', () => {
    const majorCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    
    majorCurrencies.forEach(currency => {
      const currencyData = pricingData.currencies[currency];
      
      expect(currencyData.modernConversion).toBeDefined();
      expect(typeof currencyData.modernConversion).toBe('number');
      expect(currencyData.modernConversion).toBeGreaterThan(0);
      
      // modernConversion dovrebbe essere diverso da conversion per essere utile
      if (currency !== 'USD') {
        expect(currencyData.modernConversion).not.toBe(currencyData.conversion);
      }
    });
  });

  it('should maintain data source metadata', () => {
    expect(pricingData.source).toBeDefined();
    expect(pricingData.lastUpdated).toBeDefined();
    expect(pricingData.totalRecords).toBeDefined();
    expect(typeof pricingData.totalRecords).toBe('number');
    expect(pricingData.totalRecords).toBeGreaterThan(0);
  });
});

describe('Regression Tests - UI Compatibility', () => {
  it('should provide all data needed for region/currency selectors', () => {
    // Verifica che ci siano dati sufficienti per i dropdown nell'UI
    expect(Object.keys(pricingData.regions).length).toBeGreaterThan(20);
    expect(Object.keys(pricingData.currencies).length).toBeGreaterThan(15);
    
    // Verifica che ogni region abbia un nome leggibile
    Object.values(pricingData.regions).forEach((region: any) => {
      expect(region.name).toBeDefined();
      expect(region.name.length).toBeGreaterThan(2);
    });
    
    // Verifica che ogni currency abbia displayName
    Object.values(pricingData.currencies).forEach((currency: any) => {
      expect(currency.displayName).toBeDefined();
      expect(currency.displayName.length).toBeGreaterThan(5);
    });
  });

  it('should maintain currency symbol consistency for UI display', () => {
    const expectedSymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF ',
      'CAD': '$',
      'AUD': '$'
    };
    
    Object.entries(expectedSymbols).forEach(([currency, expectedSymbol]) => {
      expect(pricingData.currencies[currency].symbol).toBe(expectedSymbol);
    });
  });
});
