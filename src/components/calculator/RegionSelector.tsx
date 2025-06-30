import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { AZURE_REGIONS } from '../../lib/constants';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  currencySymbol: string;
  currency: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange,
  currencySymbol,
  currency
}) => {
  const currentRegion = AZURE_REGIONS.find(r => r.value === selectedRegion);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Region & Currency</CardTitle>
        <CardDescription>
          Pricing varies by region and currency. Current: {currentRegion?.label} ({currencySymbol})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    <Badge variant="outline" className="ml-2 text-xs">
                      {region.currency}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
