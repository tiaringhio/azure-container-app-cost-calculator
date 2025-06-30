import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { AZURE_REGIONS, CURRENCIES } from '../../lib/constants';

interface RegionSelectorProps {
  selectedRegion: string;
  selectedCurrency: string;
  onRegionChange: (region: string) => void;
  onCurrencyChange: (currency: string) => void;
  currencySymbol: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  selectedCurrency,
  onRegionChange,
  onCurrencyChange,
  currencySymbol
}) => {
  const currentRegion = AZURE_REGIONS.find(r => r.value === selectedRegion);
  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Region & Currency</CardTitle>
        <CardDescription>
          Pricing varies by region. You can view prices in any currency. 
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Azure Region</label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AZURE_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{region.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Currency</label>
            <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{currency.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Prices are calculated for <strong>{currentRegion?.label}</strong> region 
            and converted to <strong>{currentCurrency?.displayName}</strong> using current exchange rates.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
