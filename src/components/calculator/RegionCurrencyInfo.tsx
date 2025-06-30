import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AZURE_REGIONS, CURRENCIES } from '../../lib/constants';

interface RegionCurrencyInfoProps {
  selectedRegion: string;
  selectedCurrency: string;
  currencySymbol: string;
  freeTierEnabled: boolean;
}

export const RegionCurrencyInfo: React.FC<RegionCurrencyInfoProps> = ({
  selectedRegion,
  selectedCurrency,
  currencySymbol,
  freeTierEnabled
}) => {
  const currentRegion = AZURE_REGIONS.find(r => r.value === selectedRegion);
  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency);
  
  return (
    <Card className="bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {currentRegion?.label || selectedRegion}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {currentCurrency?.displayName || selectedCurrency} ({currencySymbol})
              </div>
            </div>
            {freeTierEnabled && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                Free Tier
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
