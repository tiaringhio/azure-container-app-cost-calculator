import type { CpuMemoryCombination, PricingConfig, PricingData, AzureRegion, Currency } from '../types/calculator';
import azurePricingData from '../data/azure-pricing.json';

// Load Azure pricing data from JSON
const pricingData = azurePricingData as PricingData;

// Funzione helper per convertire prezzi da USD alla valuta target
const convertFromUSD = (priceUSD: number, toCurrency: string): number => {
  if (toCurrency === 'USD') return priceUSD;
  
  const currencies = pricingData.currencies;
  const targetCurrency = currencies[toCurrency as keyof typeof currencies];
  
  if (!targetCurrency) {
    console.warn(`Currency ${toCurrency} not found, using USD`);
    return priceUSD;
  }
  
  // Usa modernConversion come preferenza, poi conversion come fallback
  const conversionRate = targetCurrency.modernConversion || targetCurrency.conversion;
  return priceUSD * conversionRate;
};

// Prezzi Azure Container Apps - Active Usage (Dynamic pricing)
export const PRICING: PricingConfig = {
  vcpu_per_second: convertFromUSD(pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond, 'EUR'),
  memory_per_gib_second: convertFromUSD(pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond, 'EUR'),
  currency: 'EUR',
  currencySymbol: '€',
  regions: Object.fromEntries(
    Object.entries(pricingData.regions).map(([key, region]) => [key, region.multiplier])
  )
};

// Combinazioni valide CPU-Memoria per Azure Container Apps
export const VALID_COMBINATIONS: CpuMemoryCombination[] = [
  { cpu: 0.25, memory: 0.5, label: "0.25 CPU cores, 0.5 Gi memory" },
  { cpu: 0.5, memory: 1, label: "0.5 CPU cores, 1 Gi memory" },
  { cpu: 0.75, memory: 1.5, label: "0.75 CPU cores, 1.5 Gi memory" },
  { cpu: 1, memory: 2, label: "1 CPU cores, 2 Gi memory" },
  { cpu: 1.25, memory: 2.5, label: "1.25 CPU cores, 2.5 Gi memory" },
  { cpu: 1.5, memory: 3, label: "1.5 CPU cores, 3 Gi memory" },
  { cpu: 1.75, memory: 3.5, label: "1.75 CPU cores, 3.5 Gi memory" },
  { cpu: 2, memory: 4, label: "2 CPU cores, 4 Gi memory" },
  { cpu: 2.25, memory: 4.5, label: "2.25 CPU cores, 4.5 Gi memory" },
  { cpu: 2.5, memory: 5, label: "2.5 CPU cores, 5 Gi memory" },
  { cpu: 2.75, memory: 5.5, label: "2.75 CPU cores, 5.5 Gi memory" },
  { cpu: 3, memory: 6, label: "3 CPU cores, 6 Gi memory" },
  { cpu: 3.25, memory: 6.5, label: "3.25 CPU cores, 6.5 Gi memory" },
  { cpu: 3.5, memory: 7, label: "3.5 CPU cores, 7 Gi memory" },
  { cpu: 3.75, memory: 7.5, label: "3.75 CPU cores, 7.5 Gi memory" },
  { cpu: 4, memory: 8, label: "4 CPU cores, 8 Gi memory" }
];

// Giorni della settimana
export const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const DAYS_FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

// Regioni Azure (Dynamic from JSON)
export const AZURE_REGIONS: AzureRegion[] = Object.entries(pricingData.regions).map(([key, region]) => ({
  value: key,
  label: region.name,
  currency: region.currency,
  multiplier: region.multiplier
}));

// Valute supportate (Dynamic from JSON)
export const CURRENCIES: Currency[] = Object.entries(pricingData.currencies).map(([key, currency]) => ({
  code: key,
  symbol: currency.symbol,
  name: currency.name,
  displayName: currency.displayName
}));

// Funzione per ottenere il pricing dinamico
export const getDynamicPricing = (region: string, currency: string): PricingConfig => {
  const regionData = pricingData.regions[region as keyof typeof pricingData.regions];
  
  if (!regionData) {
    console.warn(`Region ${region} not found, using defaults`);
    return {
      ...PRICING,
      currency: currency,
      currencySymbol: pricingData.currencies[currency as keyof typeof pricingData.currencies]?.symbol || '$'
    };
  }

  // Ottieni i prezzi base USD dall'API
  const basePricingUSD = {
    vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond,
    memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond
  };

  // Applica il moltiplicatore della regione
  const regionAdjustedPricingUSD = {
    vcpu_per_second: basePricingUSD.vcpu_per_second * regionData.multiplier,
    memory_per_gib_second: basePricingUSD.memory_per_gib_second * regionData.multiplier
  };

  // Converti nella valuta richiesta dall'utente
  const finalPricing = {
    vcpu_per_second: convertFromUSD(regionAdjustedPricingUSD.vcpu_per_second, currency),
    memory_per_gib_second: convertFromUSD(regionAdjustedPricingUSD.memory_per_gib_second, currency)
  };

  // Ottieni il simbolo della valuta richiesta
  const currencySymbol = pricingData.currencies[currency as keyof typeof pricingData.currencies]?.symbol || '$';
  
  return {
    vcpu_per_second: finalPricing.vcpu_per_second,
    memory_per_gib_second: finalPricing.memory_per_gib_second,
    currency: currency,
    currencySymbol: currencySymbol,
    regions: Object.fromEntries(
      Object.entries(pricingData.regions).map(([key, region]) => [key, region.multiplier])
    )
  };
};

// Funzione per ottenere il simbolo di valuta per una regione
export const getCurrencySymbolForRegion = (region: string): string => {
  const regionData = pricingData.regions[region as keyof typeof pricingData.regions];
  if (!regionData) return '$';
  
  const currencyData = pricingData.currencies[regionData.currency as keyof typeof pricingData.currencies];
  return currencyData?.symbol || '$';
};

// Preset di risorse
export const RESOURCE_PRESETS = [
  { key: 'xs', index: 0, label: 'XS (0.25 vCPU, 0.5 GB)' },
  { key: 's', index: 1, label: 'S (0.5 vCPU, 1 GB)' },
  { key: 'm', index: 3, label: 'M (1 vCPU, 2 GB)' },
  { key: 'l', index: 7, label: 'L (2 vCPU, 4 GB)' },
  { key: 'xl', index: 15, label: 'XL (4 vCPU, 8 GB)' }
];
