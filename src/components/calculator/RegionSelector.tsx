import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { AZURE_REGIONS, CURRENCIES } from '../../lib/constants';

interface RegionSelectorProps {
  selectedRegion: string;
  selectedCurrency: string;
  onRegionChange: (region: string) => void;
  onCurrencyChange: (currency: string) => void;
  currencySymbol: string;
  freeTierEnabled: boolean;
  onFreeTierChange: (enabled: boolean) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  selectedCurrency,
  onRegionChange,
  onCurrencyChange,
  currencySymbol,
  freeTierEnabled,
  onFreeTierChange
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Free Tier</label>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Include Azure Free Tier
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  180K vCPU-seconds + 360K GiB-seconds monthly
                </div>
              </div>
              <Switch
                checked={freeTierEnabled}
                onCheckedChange={onFreeTierChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
