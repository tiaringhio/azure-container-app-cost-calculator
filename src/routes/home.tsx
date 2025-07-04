import React, { useState, useEffect, useCallback } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { useMultiApp } from '../hooks/useMultiApp';
import { ResourceConfiguration } from '../components/calculator/ResourceConfiguration';
import { CostBreakdown } from '../components/calculator/CostBreakdown';
import { StepConfiguration } from '../components/calculator/StepConfiguration';
import { ScheduleGrid } from '../components/calculator/ScheduleGrid';
import { SchedulePresets } from '../components/calculator/SchedulePresets';
import { ChartVisualization } from '../components/calculator/ChartVisualization';
import { RegionSelector } from '../components/calculator/RegionSelector';
import { AppManager } from '../components/calculator/AppManager';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { Download, FileText } from 'lucide-react';
import { usePricing } from '../hooks/usePricing';
import { exportToPDF } from '../lib/utils';
import { VALID_COMBINATIONS } from '../lib/constants';
import type { ContainerApp, CostResults, Schedule } from '../types/calculator';

// CSV Export functionality
const exportToCSV = (
  apps: ContainerApp[],
  totalCosts: any,
  estimateName: string,
  selectedRegion: string,
  freeTierEnabled: boolean,
  getFormattedPrice: (amount: number, decimals?: number) => string
) => {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Prepare CSV headers
  const headers = [
    'App Name',
    'CPU (vCPU)',
    'Memory (GB)',
    'Total Instance Hours/Week',
    'Weekly Cost',
    'Monthly Cost',
    'Yearly Cost',
    'Peak Instances',
    'Efficiency %'
  ];
  
  // Calculate costs for each app
  const rows = apps.map(app => {
    const combo = VALID_COMBINATIONS[app.selectedCombination];
    
    // Calculate total instance hours for this app
    let totalInstanceHours = 0;
    let maxInstances = 0;
    let activeSlots = 0;
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const instances = app.schedule[day]?.[hour] || 0;
        if (instances > 0) {
          totalInstanceHours += instances;
          activeSlots++;
          maxInstances = Math.max(maxInstances, instances);
        }
      }
    }
    
    const weeklyCost = totalInstanceHours * 0.1; // Simplified calculation for export
    const monthlyCost = weeklyCost * 4.33;
    const yearlyCost = monthlyCost * 12;
    const efficiency = (activeSlots / 168) * 100;
    
    return [
      app.name,
      combo.cpu.toString(),
      combo.memory.toString(),
      totalInstanceHours.toString(),
      getFormattedPrice(weeklyCost, 2).replace(/[^\d.,]/g, ''), // Remove currency symbols
      getFormattedPrice(monthlyCost, 2).replace(/[^\d.,]/g, ''),
      getFormattedPrice(yearlyCost, 0).replace(/[^\d.,]/g, ''),
      maxInstances.toString(),
      efficiency.toFixed(1) + '%'
    ];
  });
  
  // Add summary row
  const summaryRow = [
    'TOTAL SUMMARY',
    '',
    '',
    '',
    (totalCosts?.weeklyCost || 0).toFixed(2),
    (totalCosts?.monthlyCost || 0).toFixed(2),
    (totalCosts?.yearlyCost || 0).toFixed(0),
    (totalCosts?.totalInstances || 0).toString(),
    ''
  ];
  
  // Add metadata rows
  const metadataRows = [
    ['Export Details'],
    ['Estimate Name', estimateName],
    ['Region', selectedRegion],
    ['Free Tier Enabled', freeTierEnabled ? 'Yes' : 'No'],
    ['Export Date', timestamp],
    ['Total Apps', apps.length.toString()],
    [''],
    ['App Details']
  ];
  
  // Combine all rows
  const csvContent = [
    ...metadataRows,
    headers,
    ...rows,
    [''],
    summaryRow
  ];
  
  // Convert to CSV string
  const csvString = csvContent
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `azure-container-apps-cost-estimate-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Helper function to convert ContainerApp[] to AppData[] for export utilities
const convertAppsForExport = (apps: ContainerApp[], selectedRegion: string) => {
  return apps.map(app => {
    const combo = VALID_COMBINATIONS[app.selectedCombination];
    
    // Convert Schedule (Record<number, Record<number, number>>) to number[][]
    const scheduleArray: number[][] = [];
    for (let day = 0; day < 7; day++) {
      const daySchedule: number[] = [];
      for (let hour = 0; hour < 24; hour++) {
        daySchedule.push(app.schedule[day]?.[hour] || 0);
      }
      scheduleArray.push(daySchedule);
    }
    
    return {
      name: app.name,
      cpu: combo.cpu,
      memory: combo.memory,
      region: selectedRegion,
      schedule: scheduleArray
    };
  });
};

// Helper function to calculate costs for any app
const calculateAppCosts = (
  app: ContainerApp, 
  selectedRegion: string, 
  vcpuPricePerHour: number,  // Calculated from per-second * 3600
  memoryPricePerHour: number, // Calculated from per-second * 3600
  regionMultiplier: number = 1.0,
  freeTierEnabled: boolean = false
): CostResults => {
  const combo = VALID_COMBINATIONS[app.selectedCombination];
  const vcpu = combo.cpu;
  const memory = combo.memory;

  // Initialize schedule if empty
  const schedule: Schedule = {};
  for (let day = 0; day < 7; day++) {
    schedule[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      schedule[day][hour] = app.schedule[day]?.[hour] || 0;
    }
  }

  // Calculate total active instance hours
  let totalActiveInstanceHours = 0;
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const instances = schedule[day][hour];
      if (instances > 0) {
        totalActiveInstanceHours += instances;
      }
    }
  }

  // Calculate monthly usage in seconds
  const monthlyVcpuSeconds = totalActiveInstanceHours * 4.33 * vcpu * 3600; // hours to seconds
  const monthlyMemoryGibSeconds = totalActiveInstanceHours * 4.33 * memory * 3600; // hours to seconds
  
  let billableVcpuSeconds = monthlyVcpuSeconds;
  let billableMemoryGibSeconds = monthlyMemoryGibSeconds;
  
  // Apply free tier if enabled
  if (freeTierEnabled) {
    const freeVcpuSeconds = 180000; // From azure-pricing.json
    const freeMemoryGibSeconds = 360000; // From azure-pricing.json
    
    billableVcpuSeconds = Math.max(0, monthlyVcpuSeconds - freeVcpuSeconds);
    billableMemoryGibSeconds = Math.max(0, monthlyMemoryGibSeconds - freeMemoryGibSeconds);
  }

  // Cost per hour per single active instance (adjusted for free tier)
  const vcpuCostPerHour = (billableVcpuSeconds / (monthlyVcpuSeconds || 1)) * vcpu * vcpuPricePerHour * regionMultiplier;
  const memoryCostPerHour = (billableMemoryGibSeconds / (monthlyMemoryGibSeconds || 1)) * memory * memoryPricePerHour * regionMultiplier;
  const totalCostPerInstancePerHour = vcpuCostPerHour + memoryCostPerHour;

  // Weekly and monthly costs
  const weeklyCost = totalActiveInstanceHours * totalCostPerInstancePerHour;
  const monthlyCost = weeklyCost * 4.33;
  const yearlyCost = monthlyCost * 12;

  // Additional statistics
  const totalSlots = 7 * 24;
  const activeSlots = Object.values(schedule).reduce((total, day) => {
    return total + Object.values(day).filter(instances => instances > 0).length;
  }, 0);
  const avgInstancesPerHour = totalActiveInstanceHours / 168;
  const avgActiveInstancesPerActiveHour = activeSlots > 0 ? totalActiveInstanceHours / activeSlots : 0;
  const maxInstances = Math.max(0, ...Object.values(schedule).map(day => {
    const dayValues = Object.values(day);
    return dayValues.length > 0 ? Math.max(0, ...dayValues) : 0;
  }).filter(val => typeof val === 'number'));

  const efficiencyPercentage = (activeSlots / totalSlots) * 100;

  return {
    vcpuCostPerHour,
    memoryCostPerHour,
    totalCostPerInstancePerHour,
    totalActiveInstanceHours,
    weeklyCost,
    monthlyCost,
    yearlyCost,
    avgInstancesPerHour,
    avgActiveInstancesPerActiveHour,
    maxInstances,
    vcpu,
    memory,
    activeSlots,
    efficiencyPercentage,
  };
};

export default function Home() {
  
  // Multi-app state management
  const {
    state: multiAppState,
    activeApp,
    addApp,
    removeApp,
    setActiveApp,
    updateAppName,
    updateAppCombination,
    updateAppSchedule,
    updateAppSteps,
    updateRegion,
    updateEstimateName,
    updateFreeTier,
    updateTotalCosts
  } = useMultiApp();

  // Use dynamic pricing with global region
  const { 
    pricing, 
    getFormattedPrice, 
    updateRegion: updatePricingRegion, 
    updateCurrency: updatePricingCurrency,
    selectedCurrency,
    selectedRegion: pricingSelectedRegion
  } = usePricing(multiAppState.selectedRegion);
  
  // Calculator for the active app
  const {
    state,
    updateCombination,
    updateSchedule,
    setSchedulePreset,
    addStep,
    removeStep,
    updateStep,
    applySteps,
    calculateCosts,
    getCurrentCombination,
    setState
  } = useCalculator();

  // Sync pricing region with multi-app region
  useEffect(() => {
    updatePricingRegion(multiAppState.selectedRegion);
  }, [multiAppState.selectedRegion, updatePricingRegion]);

  // Sync active app data with calculator state
  useEffect(() => {
    if (activeApp) {
      // Ensure schedule is properly initialized
      const normalizedSchedule: Schedule = {};
      for (let day = 0; day < 7; day++) {
        normalizedSchedule[day] = {};
        for (let hour = 0; hour < 24; hour++) {
          normalizedSchedule[day][hour] = activeApp.schedule[day]?.[hour] || 0;
        }
      }

      setState({
        selectedCombination: activeApp.selectedCombination,
        selectedRegion: multiAppState.selectedRegion,
        schedule: normalizedSchedule,
        configSteps: activeApp.configSteps
      });
    }
  }, [activeApp?.id, activeApp?.selectedCombination, multiAppState.selectedRegion]); // Only sync when app ID or combination changes

  // Manual sync functions to update the app when user makes changes
  const syncAppWithCalculator = useCallback(() => {
    if (activeApp) {
      updateAppCombination(activeApp.id, state.selectedCombination);
      updateAppSchedule(activeApp.id, state.schedule);
      updateAppSteps(activeApp.id, state.configSteps);
    }
  }, [activeApp, state, updateAppCombination, updateAppSchedule, updateAppSteps]);

  // Wrapper functions that auto-sync changes to multi-app state
  const handleScheduleUpdate = useCallback((day: number, hour: number, instances: number) => {
    updateSchedule(day, hour, instances);
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [updateSchedule, syncAppWithCalculator]);

  const handleSetPreset = useCallback((preset: "business" | "extended" | "247" | "clear") => {
    setSchedulePreset(preset);
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [setSchedulePreset, syncAppWithCalculator]);

  const handleAddStep = useCallback(() => {
    addStep();
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [addStep, syncAppWithCalculator]);

  const handleRemoveStep = useCallback((index: number) => {
    removeStep(index);
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [removeStep, syncAppWithCalculator]);

  const handleUpdateStep = useCallback((index: number, step: any) => {
    updateStep(index, step);
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [updateStep, syncAppWithCalculator]);

  const handleApplySteps = useCallback(() => {
    applySteps();
    // Sync after update
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [applySteps, syncAppWithCalculator]);

  // Trigger recalculation when the active app's calculator state changes
  useEffect(() => {
    if (activeApp) {
      // Piccolo ritardo per permettere che tutte le modifiche siano applicate
      const timeoutId = setTimeout(() => {
        syncAppWithCalculator();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [state.selectedCombination, state.schedule, syncAppWithCalculator]);

  // Calculate total costs for all apps (debounced to avoid too frequent updates)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (multiAppState.apps.length > 0) { // Changed from > 1 to > 0 to include single app
        let totalWeeklyCost = 0;
        let totalInstances = 0;
        let totalCpuHours = 0;
        let totalMemoryHours = 0;

        multiAppState.apps.forEach((app, index) => {
          const costs = calculateAppCosts(
            app, 
            multiAppState.selectedRegion, 
            pricing.vcpu_per_second * 3600, 
            pricing.memory_per_gib_second * 3600, 
            pricing.regions[multiAppState.selectedRegion] || 1.0,
            multiAppState.freeTierEnabled
          );
          
          totalWeeklyCost += costs.weeklyCost;
          totalInstances += costs.maxInstances;
          
          const combo = VALID_COMBINATIONS[app.selectedCombination];
          totalCpuHours += costs.totalActiveInstanceHours * combo.cpu;
          totalMemoryHours += costs.totalActiveInstanceHours * combo.memory;
        });

        updateTotalCosts({
          weeklyCost: totalWeeklyCost,
          monthlyCost: totalWeeklyCost * 4.33,
          yearlyCost: totalWeeklyCost * 52,
          totalInstances,
          totalCpuHours,
          totalMemoryHours
        });
      } else {
        // Se non ci sono app, imposta tutto a 0
        updateTotalCosts({
          weeklyCost: 0,
          monthlyCost: 0,
          yearlyCost: 0,
          totalInstances: 0,
          totalCpuHours: 0,
          totalMemoryHours: 0
        });
      }
    }, 100); // Debounce di 100ms

    return () => clearTimeout(timeoutId);
  }, [
    multiAppState.apps.length,
    multiAppState.selectedRegion,
    multiAppState.freeTierEnabled,
    pricing,
    updateTotalCosts,
    // Aggiungi una dipendenza che cambierà quando le app vengono modificate
    JSON.stringify(multiAppState.apps.map(app => ({
      id: app.id,
      selectedCombination: app.selectedCombination,
      schedule: app.schedule,
      configSteps: app.configSteps
    })))
  ]);

  // Calculate costs for active app using dynamic pricing
  const costResults = React.useMemo(() => {
    if (!activeApp) return {
      vcpuCostPerHour: 0,
      memoryCostPerHour: 0,
      totalCostPerInstancePerHour: 0,
      totalActiveInstanceHours: 0,
      weeklyCost: 0,
      monthlyCost: 0,
      yearlyCost: 0,
      avgInstancesPerHour: 0,
      avgActiveInstancesPerActiveHour: 0,
      maxInstances: 0,
      vcpu: 0,
      memory: 0,
      activeSlots: 0,
      efficiencyPercentage: 0
    };
    
    // Create temporary app object with current calculator state
    const currentApp = {
      ...activeApp,
      selectedCombination: state.selectedCombination,
      schedule: state.schedule
    };
    
    return calculateAppCosts(
      currentApp,
      multiAppState.selectedRegion,
      pricing.vcpu_per_second * 3600,
      pricing.memory_per_gib_second * 3600,
      pricing.regions[multiAppState.selectedRegion] || 1.0,
      multiAppState.freeTierEnabled
    );
  }, [activeApp, multiAppState.selectedRegion, pricing, state.selectedCombination, state.schedule]);
  
  const currentCombination = getCurrentCombination();

  const handleCombinationChange = useCallback((index: number) => {
    updateCombination(index);
    // Sync immediately for combination changes
    setTimeout(() => syncAppWithCalculator(), 0);
  }, [updateCombination, syncAppWithCalculator]);

  const handleRegionChange = (region: string) => {
    updateRegion(region);
    updatePricingRegion(region);
  };

  if (!activeApp) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">No Container App Selected</h1>
          <p className="text-muted-foreground">Add a container app to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Azure Container Apps Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Calculate costs for your containerized applications on Azure
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 xl:grid-cols-12">
        {/* Left Side - App Management Only */}
        <div className="order-1 md:order-1 lg:col-span-3 xl:col-span-3">
          <div className="lg:sticky lg:top-6">
            {/* App Manager */}
            <AppManager
              apps={multiAppState.apps}
              activeAppId={multiAppState.activeAppId}
              onAddApp={addApp}
              onRemoveApp={removeApp}
              onSetActiveApp={setActiveApp}
              onUpdateAppName={updateAppName}
              estimateName={multiAppState.estimateName}
              onUpdateEstimateName={updateEstimateName}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="order-2 md:order-2 lg:col-span-6 xl:col-span-6 space-y-6">
          {/* Resource Configuration */}
          <ResourceConfiguration
            selectedCombination={state.selectedCombination}
            onCombinationChange={handleCombinationChange}
            selectedRegion={multiAppState.selectedRegion}
            getFormattedPrice={getFormattedPrice}
            pricing={pricing}
          />

          {/* Step Configuration */}
          <StepConfiguration
            configSteps={state.configSteps}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onUpdateStep={handleUpdateStep}
            onApplySteps={handleApplySteps}
          />

          {/* Schedule Grid */}
          <ScheduleGrid
            schedule={state.schedule}
            onUpdateSchedule={handleScheduleUpdate}
            getFormattedPrice={getFormattedPrice}
          />

          {/* Schedule Presets */}
          <SchedulePresets
            onSetPreset={handleSetPreset}
          />

          {/* Chart Visualization */}
          <ChartVisualization
            schedule={state.schedule}
            costResults={costResults}
            currentCombination={currentCombination}
            getFormattedPrice={getFormattedPrice}
            pricing={pricing}
          />

          {/* Cost Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{getFormattedPrice(costResults.totalCostPerInstancePerHour)}</div>
                </div>
                <p className="text-xs text-muted-foreground">per hour per instance</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{getFormattedPrice(costResults.monthlyCost, 2)}</div>
                </div>
                <p className="text-xs text-muted-foreground">estimated monthly</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{costResults.efficiencyPercentage.toFixed(1)}%</div>
                </div>
                <p className="text-xs text-muted-foreground">efficiency</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Cost Breakdown */}
          <CostBreakdown 
            costResults={costResults} 
            currentCombination={currentCombination}
            schedule={state.schedule}
            selectedRegion={multiAppState.selectedRegion}
            freeTierEnabled={multiAppState.freeTierEnabled}
            getFormattedPrice={getFormattedPrice}
            pricing={pricing}
          />
        </div>

        {/* Right Sidebar - Region Info & Total Summary (Sticky) */}
        <div className="order-3 md:order-3 lg:col-span-3 xl:col-span-3">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Region & Currency Selector */}
            <RegionSelector
              selectedRegion={multiAppState.selectedRegion}
              selectedCurrency={selectedCurrency}
              onRegionChange={updateRegion}
              onCurrencyChange={updatePricingCurrency}
              currencySymbol={pricing.currencySymbol}
              freeTierEnabled={multiAppState.freeTierEnabled}
              onFreeTierChange={updateFreeTier}
            />
            
            {/* Total Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                    Total Summary
                  </CardTitle>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {multiAppState.apps.length === 1 
                      ? `Current app estimate` 
                      : `All ${multiAppState.apps.length} apps combined`
                    }
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full space-y-2">
                  {/* Weekly */}
                  <div className="w-full p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Weekly
                      </div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(multiAppState.totalCosts?.weeklyCost || 0, 2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Monthly */}
                  <div className="w-full p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Monthly
                      </div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(multiAppState.totalCosts?.monthlyCost || 0, 2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Yearly */}
                  <div className="w-full p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Yearly
                      </div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {getFormattedPrice(multiAppState.totalCosts?.yearlyCost || 0, 0)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Export Buttons */}
                <div className="pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
                  <Button
                    onClick={() => exportToCSV(
                      multiAppState.apps,
                      multiAppState.totalCosts,
                      multiAppState.estimateName || 'Azure Container Apps Estimate',
                      multiAppState.selectedRegion,
                      multiAppState.freeTierEnabled,
                      getFormattedPrice
                    )}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const appsForExport = convertAppsForExport(multiAppState.apps, multiAppState.selectedRegion);
                      const pricingForExport = {
                        vcpu: { perSecond: pricing.vcpu_per_second },
                        memory: { perGibPerSecond: pricing.memory_per_gib_second },
                        currency: selectedCurrency
                      };
                      exportToPDF(
                        appsForExport, 
                        pricingForExport, 
                        multiAppState.estimateName,
                        multiAppState.freeTierEnabled,
                        multiAppState.totalCosts
                      );
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
