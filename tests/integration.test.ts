/**
 * Test di integrazione per il sistema di pricing completo
 * Verifica che l'intero sistema funzioni correttamente end-to-end
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

describe('End-to-End Pricing System Integration', () => {
  it('should have all required data for a complete pricing calculation', () => {
    // Verifica che tutti i componenti necessari siano presenti
    expect(pricingData.currencies).toBeDefined();
    expect(pricingData.regions).toBeDefined();
    expect(pricingData.consumptionPlan).toBeDefined();
    expect(pricingData.consumptionPlan.activeUsage).toBeDefined();
    expect(pricingData.consumptionPlan.activeUsage.pricing).toBeDefined();
    
    // Verifica pricing vCPU e memory
    const vcpuPricing = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd;
    const memoryPricing = pricingData.consumptionPlan.activeUsage.pricing.memory.usd;
    
    expect(vcpuPricing.perSecond).toBeDefined();
    expect(memoryPricing.perSecond).toBeDefined();
    expect(memoryPricing.perGibPerSecond).toBeDefined();
  });

  it('should support all major Azure regions for container apps', () => {
    const requiredRegions = [
      'eastus', 'eastus2', 'westus', 'westus2', 'westus3',
      'westeurope', 'northeurope', 'uksouth', 'ukwest',
      'southeastasia', 'eastasia', 'australiaeast', 'australiasoutheast',
      'canadacentral', 'canadaeast', 'brazilsouth',
      'japaneast', 'japanwest', 'koreacentral', 'koreasouth',
      'centralindia', 'southindia', 'westindia'
    ];
    
    requiredRegions.forEach(region => {
      expect(pricingData.regions[region]).toBeDefined();
      expect(pricingData.regions[region].name).toBeDefined();
      expect(pricingData.regions[region].multiplier).toBe(1.0);
    });
  });

  it('should support all major global currencies', () => {
    const majorCurrencies = [
      'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
      'SEK', 'NOK', 'DKK', 'INR', 'BRL', 'KRW', 'TWD', 'HKD'
    ];
    
    majorCurrencies.forEach(currency => {
      expect(pricingData.currencies[currency]).toBeDefined();
      expect(pricingData.currencies[currency].symbol).toBeDefined();
      expect(pricingData.currencies[currency].displayName).toBeDefined();
      expect(typeof pricingData.currencies[currency].conversion).toBe('number');
    });
  });

  it('should calculate realistic monthly costs for typical workloads', () => {
    const baseVcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const baseMemoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond;
    
    // Test case: Small microservice (0.25 vCPU, 0.5 GiB, running 12h/day)
    const smallServiceHoursPerDay = 12;
    const smallServiceDailyCost = (
      baseVcpuPrice * 0.25 * smallServiceHoursPerDay * 3600 +
      baseMemoryPrice * 0.5 * smallServiceHoursPerDay * 3600
    );
    const smallServiceMonthlyCost = smallServiceDailyCost * 30;
    
    // Dovrebbe essere sotto i $50/mese per piccoli servizi
    expect(smallServiceMonthlyCost).toBeLessThan(50);
    expect(smallServiceMonthlyCost).toBeGreaterThan(5);
    
    // Test case: Production app (2 vCPU, 4 GiB, running 24h/day)
    const prodAppDailyCost = (
      baseVcpuPrice * 2 * 24 * 3600 +
      baseMemoryPrice * 4 * 24 * 3600
    );
    const prodAppMonthlyCost = prodAppDailyCost * 30;
    
    // Dovrebbe essere nell'ordine di $200-300/mese per app di produzione
    expect(prodAppMonthlyCost).toBeLessThan(500);
    expect(prodAppMonthlyCost).toBeGreaterThan(100);
  });

  it('should maintain price consistency across all currency conversions', () => {
    const baseUsdVcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const baseUsdMemoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond;
    
    // Test calcolo costi in diverse valute per stesso workload
    const testCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
    const workloadCosts: Record<string, number> = {};
    
    testCurrencies.forEach(currency => {
      const currencyData = pricingData.currencies[currency];
      const conversionRate = currencyData.modernConversion || currencyData.conversion;
      
      const vcpuPriceConverted = baseUsdVcpuPrice * conversionRate;
      const memoryPriceConverted = baseUsdMemoryPrice * conversionRate;
      
      // Calcola costo giornaliero per 1 vCPU, 2 GiB
      const dailyCost = (
        vcpuPriceConverted * 1 * 24 * 3600 +
        memoryPriceConverted * 2 * 24 * 3600
      );
      
      workloadCosts[currency] = dailyCost;
    });
    
    // Verifica che i rapporti di costo siano consistenti con i tassi di cambio
    const eurToUsdRate = pricingData.currencies.EUR.modernConversion;
    const costRatio = workloadCosts.EUR / workloadCosts.USD;
    
    expect(costRatio).toBeCloseTo(eurToUsdRate, 3);
  });

  it('should have correct Azure Portal price alignment', () => {
    // Questi sono i prezzi che dovrebbero corrispondere al portale Azure
    const expectedMemoryPriceUSD = 0.000004; // Per GiB per secondo
    const expectedVcpuPriceUSD = 0.000034;   // Per vCPU per secondo
    
    const actualMemoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond;
    const actualVcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    
    expect(actualMemoryPrice).toBe(expectedMemoryPriceUSD);
    expect(actualVcpuPrice).toBe(expectedVcpuPriceUSD);
    
    // Verifica anche nei raw data
    const rawMemoryData = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard Memory Active Usage'
    );
    const rawVcpuData = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard vCPU Active Usage'
    );
    
    expect(rawMemoryData?.unitPrice).toBe(expectedMemoryPriceUSD);
    expect(rawVcpuData?.unitPrice).toBe(expectedVcpuPriceUSD);
  });

  it('should provide complete data source attribution', () => {
    expect(pricingData.source).toBeDefined();
    expect(pricingData.source).toContain('Azure Retail Prices API');
    expect(pricingData.lastUpdated).toBeDefined();
    expect(pricingData.apiVersion).toBeDefined();
  });

  it('should support free tier allowances calculation', () => {
    const freeAllowances = pricingData.consumptionPlan.activeUsage.freeAllowances;
    
    expect(freeAllowances).toBeDefined();
    expect(freeAllowances.vcpuSeconds).toBeDefined();
    expect(freeAllowances.memoryGibSeconds).toBeDefined();
    expect(freeAllowances.requests).toBeDefined();
    
    // Verifica che i valori siano ragionevoli
    expect(freeAllowances.vcpuSeconds).toBeGreaterThan(100000); // Almeno 100k secondi vCPU gratis
    expect(freeAllowances.memoryGibSeconds).toBeGreaterThan(300000); // Almeno 300k GiB-secondi gratis
    expect(freeAllowances.requests).toBeGreaterThan(1000000); // Almeno 1M richieste gratis
  });
});

describe('Data Quality and Completeness', () => {
  it('should have no missing or null critical pricing data', () => {
    // Verifica che non ci siano valori null o undefined nei dati critici
    expect(pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond).not.toBeNull();
    expect(pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond).not.toBeNull();
    
    // Verifica che tutti i prezzi siano numeri positivi
    expect(pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond).toBeGreaterThan(0);
    expect(pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond).toBeGreaterThan(0);
  });

  it('should have consistent currency display names format', () => {
    Object.values(pricingData.currencies).forEach((currency: any) => {
      expect(currency.displayName).toMatch(/^[A-Z].*–.*\([^\)]+\)\s[A-Z]{3}$/);
      expect(currency.name).toMatch(/^[A-Z]{3}$/);
      expect(currency.symbol).toBeDefined();
      expect(currency.symbol.length).toBeGreaterThan(0);
    });
  });

  it('should have valid raw API data structure', () => {
    expect(Array.isArray(pricingData.rawApiData)).toBe(true);
    expect(pricingData.rawApiData.length).toBeGreaterThan(0);
    
    // Verifica struttura di alcuni record
    const sampleRecord = pricingData.rawApiData[0];
    expect(sampleRecord.unitOfMeasure).toBeDefined();
    expect(sampleRecord.location).toBeDefined();
    expect(sampleRecord.unitPrice).toBeDefined();
    expect(sampleRecord.region).toBeDefined();
    expect(sampleRecord.productName).toBe('Azure Container Apps');
    expect(sampleRecord.currencyCode).toBe('USD');
  });
});
