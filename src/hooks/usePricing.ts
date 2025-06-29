import { useState, useCallback, useMemo } from 'react';
import { getDynamicPricing, getCurrencySymbolForRegion, AZURE_REGIONS, CURRENCIES } from '../lib/constants';
import type { PricingConfig } from '../types/calculator';

export interface UsePricingReturn {
  selectedRegion: string;
  selectedCurrency: string;
  pricing: PricingConfig;
  currencySymbol: string;
  regions: typeof AZURE_REGIONS;
  currencies: typeof CURRENCIES;
  updateRegion: (region: string) => void;
  updateCurrency: (currency: string) => void;
  getFormattedPrice: (amount: number, decimals?: number) => string;
}

export const usePricing = (initialRegion = 'westeurope'): UsePricingReturn => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  
  // Auto-detect currency from region
  const regionData = AZURE_REGIONS.find(r => r.value === selectedRegion);
  const [selectedCurrency, setSelectedCurrency] = useState(regionData?.currency || 'USD');

  const pricing = useMemo(() => {
    return getDynamicPricing(selectedRegion, selectedCurrency);
  }, [selectedRegion, selectedCurrency]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbolForRegion(selectedRegion);
  }, [selectedRegion]);

  const updateRegion = useCallback((region: string) => {
    setSelectedRegion(region);
    // Auto-update currency when region changes
    const newRegionData = AZURE_REGIONS.find(r => r.value === region);
    if (newRegionData) {
      setSelectedCurrency(newRegionData.currency);
    }
  }, []);

  const updateCurrency = useCallback((currency: string) => {
    setSelectedCurrency(currency);
  }, []);

  const getFormattedPrice = useCallback((amount: number, decimals = 4): string => {
    return `${currencySymbol}${amount.toFixed(decimals)}`;
  }, [currencySymbol]);

  return {
    selectedRegion,
    selectedCurrency,
    pricing,
    currencySymbol,
    regions: AZURE_REGIONS,
    currencies: CURRENCIES,
    updateRegion,
    updateCurrency,
    getFormattedPrice
  };
};
