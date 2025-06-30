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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Azure Region</label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AZURE_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    <span>{region.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Display Currency</label>
            <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span>{currency.displayName}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Free Tier</label>
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="space-y-0">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Include Azure Free Tier
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  180K vCPU-s + 360K GiB-s monthly
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
