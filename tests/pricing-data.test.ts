/**
 * Test suite per il sistema di pricing di Azure Container Apps
 * Verifica che tutti i prezzi e le conversioni funzionino correttamente
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pricingDataPath = join(__dirname, '../src/data/azure-pricing.json');

let pricingData: any;

beforeAll(() => {
  pricingData = JSON.parse(readFileSync(pricingDataPath, 'utf8'));
});

describe('Azure Pricing Data Structure', () => {
  it('should have the correct structure', () => {
    expect(pricingData).toBeDefined();
    expect(pricingData.currencies).toBeDefined();
    expect(pricingData.consumptionPlan).toBeDefined();
    expect(pricingData.regions).toBeDefined();
    expect(pricingData.rawApiData).toBeDefined();
  });

  it('should have USD currency as base', () => {
    expect(pricingData.currencies.USD).toBeDefined();
    expect(pricingData.currencies.USD.conversion).toBe(1.0);
    expect(pricingData.currencies.USD.modernConversion).toBe(1.0);
    expect(pricingData.currencies.USD.symbol).toBe('$');
  });

  it('should have all required currencies with correct properties', () => {
    const requiredCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    
    requiredCurrencies.forEach(currency => {
      expect(pricingData.currencies[currency]).toBeDefined();
      expect(pricingData.currencies[currency].name).toBe(currency);
      expect(pricingData.currencies[currency].symbol).toBeDefined();
      expect(pricingData.currencies[currency].displayName).toBeDefined();
      expect(typeof pricingData.currencies[currency].conversion).toBe('number');
      expect(typeof pricingData.currencies[currency].modernConversion).toBe('number');
    });
  });
});

describe('Azure Container Apps Pricing - Critical Values', () => {
  it('should have correct USD memory pricing (0.000004)', () => {
    const memoryPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond;
    expect(memoryPrice).toBe(4E-06); // 0.000004
    expect(memoryPrice).toBe(0.000004);
  });

  it('should have correct USD vCPU pricing (0.000034)', () => {
    const vcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    expect(vcpuPrice).toBe(3.4E-05); // 0.000034
    expect(vcpuPrice).toBe(0.000034);
  });

  it('should have consistent memory pricing in specifications and raw data', () => {
    const specPrice = pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perSecond;
    const rawMemoryData = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard Memory Active Usage'
    );
    
    expect(rawMemoryData).toBeDefined();
    expect(rawMemoryData.unitPrice).toBe(4E-06);
    expect(specPrice).toBe(rawMemoryData.unitPrice);
  });

  it('should have consistent vCPU pricing in specifications and raw data', () => {
    const specPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond;
    const rawVcpuData = pricingData.rawApiData.find((item: any) => 
      item.meterName === 'Standard vCPU Active Usage'
    );
    
    expect(rawVcpuData).toBeDefined();
    expect(rawVcpuData.unitPrice).toBe(3.4E-05);
    expect(specPrice).toBe(rawVcpuData.unitPrice);
  });
});

describe('Currency Conversion Logic', () => {
  it('should have modernConversion for major currencies', () => {
    const majorCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    
    majorCurrencies.forEach(currency => {
      expect(pricingData.currencies[currency].modernConversion).toBeDefined();
      expect(typeof pricingData.currencies[currency].modernConversion).toBe('number');
      expect(pricingData.currencies[currency].modernConversion).toBeGreaterThan(0);
    });
  });

  it('should calculate EUR conversion correctly', () => {
    const eurRate = pricingData.currencies.EUR.modernConversion;
    const usdMemoryPrice = 4E-06;
    const eurMemoryPrice = usdMemoryPrice * eurRate;
    
    expect(eurRate).toBeGreaterThan(0.8);
    expect(eurRate).toBeLessThan(1.0);
    expect(eurMemoryPrice).toBeLessThan(usdMemoryPrice);
  });
});

describe('Regions Data', () => {
  it('should have all major Azure regions', () => {
    const majorRegions = ['eastus', 'westeurope', 'southeastasia', 'australiaeast', 'uksouth'];
    
    majorRegions.forEach(region => {
      expect(pricingData.regions[region]).toBeDefined();
      expect(pricingData.regions[region].name).toBeDefined();
      expect(pricingData.regions[region].multiplier).toBeDefined();
      expect(typeof pricingData.regions[region].multiplier).toBe('number');
    });
  });

  it('should have multiplier of 1.0 for all regions (pay-as-you-go)', () => {
    Object.values(pricingData.regions).forEach((region: any) => {
      expect(region.multiplier).toBe(1.0);
    });
  });
});

describe('Raw API Data Validation', () => {
  it('should contain Standard Memory Active Usage records', () => {
    const memoryRecords = pricingData.rawApiData.filter((item: any) => 
      item.meterName === 'Standard Memory Active Usage'
    );
    
    expect(memoryRecords.length).toBeGreaterThan(0);
    memoryRecords.forEach((record: any) => {
      expect(record.unitPrice).toBe(4E-06);
      expect(record.currencyCode).toBe('USD');
      expect(record.productName).toBe('Azure Container Apps');
    });
  });

  it('should contain Standard vCPU Active Usage records', () => {
    const vcpuRecords = pricingData.rawApiData.filter((item: any) => 
      item.meterName === 'Standard vCPU Active Usage'
    );
    
    expect(vcpuRecords.length).toBeGreaterThan(0);
    vcpuRecords.forEach((record: any) => {
      expect(record.unitPrice).toBe(3.4E-05);
      expect(record.currencyCode).toBe('USD');
      expect(record.productName).toBe('Azure Container Apps');
    });
  });

  it('should not contain any outdated memory prices (3E-06)', () => {
    const outdatedMemoryRecords = pricingData.rawApiData.filter((item: any) => 
      item.meterName === 'Standard Memory Active Usage' && item.unitPrice === 3E-06
    );
    
    expect(outdatedMemoryRecords).toHaveLength(0);
  });
});

describe('Cost Calculation Validation', () => {
  it('should calculate daily costs correctly for 1 vCPU, 2 GiB', () => {
    const vcpuCostPerSecond = 3.4E-05;
    const memoryCostPerSecond = 4E-06;
    const secondsPerDay = 86400;
    
    const dailyVcpuCost = vcpuCostPerSecond * secondsPerDay;
    const dailyMemoryCost = memoryCostPerSecond * 2 * secondsPerDay; // 2 GiB
    const totalDailyCost = dailyVcpuCost + dailyMemoryCost;
    
    expect(dailyVcpuCost).toBeCloseTo(2.9376, 4);
    expect(dailyMemoryCost).toBeCloseTo(0.6912, 4);
    expect(totalDailyCost).toBeCloseTo(3.6288, 4);
  });

  it('should calculate monthly costs correctly for 1 vCPU, 2 GiB', () => {
    const dailyCost = 3.6288; // From previous test
    const monthlyCost = dailyCost * 30;
    
    expect(monthlyCost).toBeCloseTo(108.864, 2);
  });
});
