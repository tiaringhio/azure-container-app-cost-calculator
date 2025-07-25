import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { VALID_COMBINATIONS, RESOURCE_PRESETS } from '../../lib/constants';

interface ResourceConfigurationProps {
  selectedCombination: number;
  onCombinationChange: (index: number) => void;
  selectedRegion?: string;
  getFormattedPrice: (amount: number, decimals?: number) => string;
  pricing: any; // PricingConfig
}

export const ResourceConfiguration: React.FC<ResourceConfigurationProps> = ({
  selectedCombination,
  onCombinationChange,
  selectedRegion,
  getFormattedPrice,
  pricing
}) => {
  const currentCombo = VALID_COMBINATIONS[selectedCombination];
  
  // Calculate current cost with dynamic pricing
  const currentCost = (currentCombo.cpu * pricing.vcpu_per_second * 3600) + (currentCombo.memory * pricing.memory_per_gib_second * 3600);

  const handlePresetClick = (presetIndex: number) => {
    onCombinationChange(presetIndex);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Select CPU/Memory configuration and Azure region
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">CPU/Memory</label>
          <Select
            value={selectedCombination.toString()}
            onValueChange={(value) => onCombinationChange(parseInt(value))}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VALID_COMBINATIONS.map((combo, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {combo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cost Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Current Configuration</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {currentCombo.cpu} vCPU, {currentCombo.memory} GB Memory
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {getFormattedPrice(currentCost)}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">per hour per instance</div>
              </div>
            </div>
            
            {/* Cost breakdown by component */}
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-blue-600 dark:text-blue-400">CPU Cost:</div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-blue-500 dark:text-blue-500">Per second:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(pricing.vcpu_per_second, 7)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-blue-400 dark:text-blue-500">
                      <span>× {currentCombo.cpu} vCPU:</span>
                      <span className="font-medium">
                        {getFormattedPrice(currentCombo.cpu * pricing.vcpu_per_second, 7)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 dark:border-blue-600 pt-1">
                      <span className="text-blue-500 dark:text-blue-500">Per hour (×3600):</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(currentCombo.cpu * pricing.vcpu_per_second * 3600)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-blue-600 dark:text-blue-400">Memory Cost:</div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-blue-500 dark:text-blue-500">Per second:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(pricing.memory_per_gib_second, 7)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-blue-400 dark:text-blue-500">
                      <span>× {currentCombo.memory} GB:</span>
                      <span className="font-medium">
                        {getFormattedPrice(currentCombo.memory * pricing.memory_per_gib_second, 7)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 dark:border-blue-600 pt-1">
                      <span className="text-blue-500 dark:text-blue-500">Per hour (×3600):</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(currentCombo.memory * pricing.memory_per_gib_second * 3600)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quick presets</label>
          <div className="flex flex-wrap gap-2">
            {RESOURCE_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant={selectedCombination === preset.index ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset.index)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
