import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { VALID_COMBINATIONS, AZURE_REGIONS, RESOURCE_PRESETS } from '../../lib/constants';

interface CostBreakdownProps {
  costResults: {
    totalCostPerInstancePerHour: number;
    weeklyCost: number;
    monthlyCost: number;
    yearlyCost: number;
    totalActiveInstanceHours: number;
    maxInstances: number;
    efficiencyPercentage: number;
    activeSlots: number;
  };
  currentCombination: {
    cpu: number;
    memory: number;
    label: string;
  };
  schedule: any; // Add schedule to show detailed calculations
  selectedRegion?: string; // Add region prop
  freeTierEnabled: boolean; // Add free tier indicator
  getFormattedPrice: (amount: number, decimals?: number) => string;
  pricing: any; // PricingConfig
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  costResults,
  currentCombination,
  schedule,
  selectedRegion = 'westeurope',
  freeTierEnabled,
  getFormattedPrice,
  pricing
}) => {
  const [showDetailedCalculations, setShowDetailedCalculations] = useState(false);
  
  const cpuCostPerHour = currentCombination.cpu * pricing.vcpu_per_second * 3600;
  const memoryCostPerHour = currentCombination.memory * pricing.memory_per_gib_second * 3600;
  
  // Calculate detailed daily breakdown
  const dailyBreakdown = DAYS.map((day, dayIndex) => {
    const daySchedule = schedule[dayIndex] || {};
    const hourlyDetails = Array.from({ length: 24 }, (_, hour) => {
      const instances = daySchedule[hour] || 0;
      const hourlyCost = instances * costResults.totalCostPerInstancePerHour;
      return {
        hour,
        instances,
        cost: hourlyCost,
        cpuCost: instances * cpuCostPerHour,
        memoryCost: instances * memoryCostPerHour
      };
    });
    
    const totalInstances = hourlyDetails.reduce((sum, h) => sum + h.instances, 0);
    const totalCost = hourlyDetails.reduce((sum, h) => sum + h.cost, 0);
    const activeHours = hourlyDetails.filter(h => h.instances > 0).length;
    
    return {
      day,
      dayIndex,
      hourlyDetails,
      totalInstances,
      totalCost,
      activeHours,
      averageInstances: totalInstances / 24
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Your complete cost analysis and projections
            </CardDescription>
          </div>
          {freeTierEnabled && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ✨ Free Tier Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* HERO SECTION - Primary Cost Results */}
        <div className="space-y-4">
          {/* Main Cost Cards - Large and Prominent */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700 dark:text-green-300">{getFormattedPrice(costResults.weeklyCost / 7, 2)}</div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">Daily Cost</p>
                  <p className="text-xs text-green-500 dark:text-green-500">per day average</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{getFormattedPrice(costResults.weeklyCost, 2)}</div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">Weekly Cost</p>
                  <p className="text-xs text-blue-500 dark:text-blue-500">current schedule</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{getFormattedPrice(costResults.monthlyCost, 2)}</div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">Monthly Cost</p>
                  <p className="text-xs text-purple-500 dark:text-purple-500">projected (4.33 weeks)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{getFormattedPrice(costResults.yearlyCost, 0)}</div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">Yearly Cost</p>
                  <p className="text-xs text-orange-500 dark:text-orange-500">annual projection</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Per Instance/Hour - Secondary but important */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost per Instance per Hour</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {currentCombination.cpu} vCPU, {currentCombination.memory} GB Memory
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {getFormattedPrice(costResults.totalCostPerInstancePerHour)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">base rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Efficiency Metrics - Quick Stats */}
        <div>
          <h4 className="font-medium mb-3">Efficiency & Usage Overview</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{costResults.efficiencyPercentage.toFixed(1)}%</div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Efficiency</p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-500">active vs total slots</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{costResults.maxInstances}</div>
                  <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mt-1">Peak Instances</p>
                  <p className="text-xs text-cyan-500 dark:text-cyan-500">maximum concurrent</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{costResults.totalActiveInstanceHours}</div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">Active Hours</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-500">per week total</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Component Cost Breakdown - Now secondary */}
        <div>
          <h4 className="font-medium mb-3">Cost per Component (per hour per instance)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>vCPU</TableCell>
                <TableCell className="text-right">{currentCombination.cpu}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{getFormattedPrice(pricing.vcpu_per_second, 7)}/sec</div>
                  <div className="text-xs text-muted-foreground">×3600 = {getFormattedPrice(pricing.vcpu_per_second * 3600)}/h</div>
                </TableCell>
                <TableCell className="text-right font-mono">{getFormattedPrice(cpuCostPerHour)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory (GB)</TableCell>
                <TableCell className="text-right">{currentCombination.memory}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{getFormattedPrice(pricing.memory_per_gib_second, 7)}/sec</div>
                  <div className="text-xs text-muted-foreground">×3600 = {getFormattedPrice(pricing.memory_per_gib_second * 3600)}/GB/h</div>
                </TableCell>
                <TableCell className="text-right font-mono">{getFormattedPrice(memoryCostPerHour)}</TableCell>
              </TableRow>
              <TableRow className="border-t">
                <TableCell className="font-medium">Total</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {getFormattedPrice(costResults.totalCostPerInstancePerHour)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Detailed Calculation Verification */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Detailed Calculation Verification</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedCalculations(!showDetailedCalculations)}
            >
              {showDetailedCalculations ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          {showDetailedCalculations && (
            <div className="space-y-4">
              {/* Daily breakdown table */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Daily Cost Breakdown</h5>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Total Instance Hours</TableHead>
                      <TableHead className="text-right">Active Hours</TableHead>
                      <TableHead className="text-right">Avg Instances/Hour</TableHead>
                      <TableHead className="text-right">Daily Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyBreakdown.map((day) => (
                      <TableRow key={day.dayIndex}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        <TableCell className="text-right">{day.totalInstances}</TableCell>
                        <TableCell className="text-right">{day.activeHours}/24</TableCell>
                        <TableCell className="text-right">{day.averageInstances.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{getFormattedPrice(day.totalCost, 3)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-medium">
                      <TableCell>Weekly Total</TableCell>
                      <TableCell className="text-right">
                        {dailyBreakdown.reduce((sum, day) => sum + day.totalInstances, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {dailyBreakdown.reduce((sum, day) => sum + day.activeHours, 0)}/168
                      </TableCell>
                      <TableCell className="text-right">
                        {(dailyBreakdown.reduce((sum, day) => sum + day.totalInstances, 0) / 168).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getFormattedPrice(dailyBreakdown.reduce((sum, day) => sum + day.totalCost, 0), 2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Calculation formulas */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">Calculation Formulas</h5>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-foreground">Component Costs (per second → per hour per instance):</strong>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        <li>• CPU: {currentCombination.cpu} vCPU × {getFormattedPrice(pricing.vcpu_per_second, 7)}/sec × 3,600 = {getFormattedPrice(cpuCostPerHour, 5)}/hour</li>
                        <li>• Memory: {currentCombination.memory} GB × {getFormattedPrice(pricing.memory_per_gib_second, 7)}/sec × 3,600 = {getFormattedPrice(memoryCostPerHour, 5)}/hour</li>
                        <li>• <strong className="text-foreground">Total per instance/hour: {getFormattedPrice(costResults.totalCostPerInstancePerHour, 5)}</strong></li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-foreground">Period Calculations:</strong>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        <li>• Weekly: {costResults.totalActiveInstanceHours} instance-hours × {getFormattedPrice(costResults.totalCostPerInstancePerHour, 5)} = {getFormattedPrice(costResults.weeklyCost, 2)}</li>
                        <li>• Monthly: {getFormattedPrice(costResults.weeklyCost, 2)} × 4.33 weeks = {getFormattedPrice(costResults.monthlyCost, 2)}</li>
                        <li>• Yearly: {getFormattedPrice(costResults.monthlyCost, 2)} × 12 months = {getFormattedPrice(costResults.yearlyCost, 2)}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
                    <strong className="text-foreground">Efficiency Metrics:</strong>
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      <li>• Active slots: {costResults.activeSlots} out of 168 total weekly time slots</li>
                      <li>• Efficiency: ({costResults.activeSlots} ÷ 168) × 100 = {costResults.efficiencyPercentage.toFixed(1)}%</li>
                      <li>• Cost savings from scaling to zero: {getFormattedPrice((168 * costResults.maxInstances * costResults.totalCostPerInstancePerHour) - costResults.weeklyCost, 2)}/week</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Peak usage analysis */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">Peak Usage Analysis</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-3">
                    <div className="text-lg font-bold text-blue-600">{costResults.maxInstances}</div>
                    <div className="text-xs text-muted-foreground">Peak concurrent instances</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-lg font-bold text-green-600">
                      {getFormattedPrice(costResults.maxInstances * costResults.totalCostPerInstancePerHour, 3)}
                    </div>
                    <div className="text-xs text-muted-foreground">Peak hourly cost</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-lg font-bold text-purple-600">
                      {((costResults.totalActiveInstanceHours / (costResults.maxInstances * 168)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Peak capacity utilization</div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
