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
  
  // Valuta indipendente dalla regione - default EUR
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');

  const pricing = useMemo(() => {
    return getDynamicPricing(selectedRegion, selectedCurrency);
  }, [selectedRegion, selectedCurrency]);

  const currencySymbol = useMemo(() => {
    // Usa il simbolo della valuta selezionata, non quello della regione
    const currencyData = CURRENCIES.find(c => c.code === selectedCurrency);
    return currencyData?.symbol || '$';
  }, [selectedCurrency]);

  const updateRegion = useCallback((region: string) => {
    setSelectedRegion(region);
    // NON aggiorniamo più automaticamente la valuta quando cambia la regione
    // L'utente ora ha il controllo completo della valuta
  }, []);

  const updateCurrency = useCallback((currency: string) => {
    setSelectedCurrency(currency);
  }, []);

  const getFormattedPrice = useCallback((amount: number, decimals = 4): string => {
    return `${pricing.currencySymbol}${amount.toFixed(decimals)}`;
  }, [pricing.currencySymbol]);

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
