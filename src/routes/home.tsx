import React, { useState } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { ResourceConfiguration } from '../components/calculator/ResourceConfiguration';
import { CostBreakdown } from '../components/calculator/CostBreakdown';
import { StepConfiguration } from '../components/calculator/StepConfiguration';
import { ScheduleGrid } from '../components/calculator/ScheduleGrid';
import { SchedulePresets } from '../components/calculator/SchedulePresets';
import { ChartVisualization } from '../components/calculator/ChartVisualization';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { usePricing } from '../hooks/usePricing';

export default function Home() {
  const [showDetailedCosts, setShowDetailedCosts] = useState(false);
  
  // Use dynamic pricing
  const { getFormattedPrice } = usePricing();
  
  const {
    state,
    updateCombination,
    updateRegion,
    updateSchedule,
    setSchedulePreset,
    addStep,
    removeStep,
    updateStep,
    applySteps,
    calculateCosts,
    getCurrentCombination,
    getCurrentCost
  } = useCalculator();

  const costResults = calculateCosts();
  const currentCost = getCurrentCost();
  const currentCombination = getCurrentCombination();

  const handleApplySteps = () => {
    applySteps();
    setShowDetailedCosts(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      <div className="space-y-6">
        {/* Resource Configuration */}
        <ResourceConfiguration
          selectedCombination={state.selectedCombination}
          onCombinationChange={updateCombination}
        />

        {/* Step Configuration */}
        <StepConfiguration
          configSteps={state.configSteps}
          onAddStep={addStep}
          onRemoveStep={removeStep}
          onUpdateStep={updateStep}
          onApplySteps={handleApplySteps}
        />

        {/* Schedule Grid */}
        <ScheduleGrid
          schedule={state.schedule}
          onUpdateSchedule={updateSchedule}
        />

        {/* Schedule Presets */}
        <SchedulePresets
          onSetPreset={setSchedulePreset}
        />

        {/* Chart Visualization */}
        <ChartVisualization
          schedule={state.schedule}
          costResults={costResults}
          currentCombination={currentCombination}
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
        {showDetailedCosts && (
          <CostBreakdown 
            costResults={costResults} 
            currentCombination={currentCombination}
            schedule={state.schedule}
          />
        )}
      </div>
    </div>
  );
}
