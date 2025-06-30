import type { CpuMemoryCombination, PricingConfig, PricingData, AzureRegion, Currency } from '../types/calculator';
import azurePricingData from '../data/azure-pricing.json';

// Load Azure pricing data from JSON
const pricingData = azurePricingData as PricingData;

// Prezzi Azure Container Apps - Active Usage (Dynamic pricing)
export const PRICING: PricingConfig = {
  vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.eur.perSecond,
  memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.eur.perGibPerSecond,
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
  name: currency.name
}));

// Funzione helper per convertire prezzi tra valute
const convertPrice = (price: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return price;
  
  const currencies = pricingData.currencies;
  
  // Se abbiamo il tasso diretto
  if (currencies[fromCurrency as keyof typeof currencies]?.rates[toCurrency]) {
    return price * currencies[fromCurrency as keyof typeof currencies].rates[toCurrency];
  }
  
  // Conversione tramite USD come valuta base
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const toUSD = fromCurrency === 'USD' ? price : price * (currencies[fromCurrency as keyof typeof currencies]?.rates.USD || 1);
    return toUSD * (currencies.USD?.rates[toCurrency] || 1);
  }
  
  return price;
};

// Funzione per ottenere il pricing dinamico
export const getDynamicPricing = (region: string, currency: string): PricingConfig => {
  const regionData = pricingData.regions[region as keyof typeof pricingData.regions];
  
  if (!regionData) {
    console.warn(`Region ${region} not found, using defaults`);
    return {
      ...PRICING,
      currency: 'EUR',
      currencySymbol: '€'
    };
  }

  // Determina la valuta della regione
  const regionCurrency = regionData.currency;
  let basePricing;

  // Usa direttamente i prezzi nella valuta della regione se disponibili nel JSON
  if (regionCurrency === 'EUR' && pricingData.consumptionPlan.activeUsage.pricing.vcpu.eur) {
    basePricing = {
      vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.eur.perSecond,
      memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.eur.perGibPerSecond,
      currency: 'EUR'
    };
  } else if (regionCurrency === 'USD' && pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd) {
    basePricing = {
      vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond,
      memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond,
      currency: 'USD'
    };
  } else {
    // Per altre valute, converti da USD
    const usdPricing = {
      vcpu_per_second: pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond,
      memory_per_gib_second: pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGibPerSecond,
    };
    
    basePricing = {
      vcpu_per_second: convertPrice(usdPricing.vcpu_per_second, 'USD', regionCurrency),
      memory_per_gib_second: convertPrice(usdPricing.memory_per_gib_second, 'USD', regionCurrency),
      currency: regionCurrency
    };
  }

  // Applica il moltiplicatore della regione
  const currencySymbol = pricingData.currencies[basePricing.currency as keyof typeof pricingData.currencies]?.symbol || '$';
  
  return {
    vcpu_per_second: basePricing.vcpu_per_second * regionData.multiplier,
    memory_per_gib_second: basePricing.memory_per_gib_second * regionData.multiplier,
    currency: basePricing.currency,
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
