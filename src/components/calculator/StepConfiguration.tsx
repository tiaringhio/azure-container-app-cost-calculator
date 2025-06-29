import React from 'react';
import type { ScheduleStep } from '../../types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface StepConfigurationProps {
  configSteps: ScheduleStep[];
  onAddStep: () => void;
  onRemoveStep: (stepId: number) => void;
  onUpdateStep: (stepId: number, updates: Partial<ScheduleStep>) => void;
  onApplySteps: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StepConfiguration: React.FC<StepConfigurationProps> = ({
  configSteps,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onApplySteps
}) => {
  const updateStepDay = (stepId: number, dayIndex: number, shouldAdd: boolean) => {
    const step = configSteps.find(s => s.id === stepId);
    if (!step) return;
    
    let newDays = [...step.days];
    if (shouldAdd) {
      if (!newDays.includes(dayIndex)) {
        newDays.push(dayIndex);
      }
    } else {
      newDays = newDays.filter(d => d !== dayIndex);
    }
    
    onUpdateStep(stepId, { days: newDays });
  };

  const updateStepTime = (stepId: number, type: 'startTime' | 'endTime', value: string) => {
    onUpdateStep(stepId, { [type]: value });
  };

  const updateStepInstances = (stepId: number, value: string) => {
    const instances = parseInt(value) || 0;
    onUpdateStep(stepId, { instances });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create scheduling steps to automatically configure instance counts across different time periods and days.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps List */}
        <div className="space-y-4">
          {configSteps.map((step, index) => (
            <Card key={step.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Step {index + 1}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveStep(step.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Days Selection */}
                <div>
                  <label className="text-sm font-medium">Days of the week</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {DAYS.map((day, dayIndex) => (
                      <Badge 
                        key={dayIndex}
                        variant={step.days.includes(dayIndex) ? "default" : "outline"}
                        className="text-xs cursor-pointer hover:opacity-80 transition-opacity px-3 py-1"
                        onClick={() => updateStepDay(step.id, dayIndex, !step.days.includes(dayIndex))}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Time and Instances */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <input
                      type="time"
                      value={step.startTime}
                      onChange={(e) => updateStepTime(step.id, 'startTime', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <input
                      type="time"
                      value={step.endTime}
                      onChange={(e) => updateStepTime(step.id, 'endTime', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Instances</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={step.instances}
                      onChange={(e) => updateStepInstances(step.id, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center"
                    />
                  </div>
                </div>

                {/* Step Summary */}
                <div className="text-xs text-muted-foreground">
                  {step.days.length > 0 ? (
                    <>
                      Active on: {step.days.map(d => DAYS_FULL[d]).join(', ')}&nbsp;from {step.startTime} to {step.endTime} with {step.instances} instance{step.instances !== 1 ? 's' : ''}
                    </>
                  ) : (
                    'Select days to activate this step'
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onAddStep}
            className="flex-1"
          >
            Add Step
          </Button>
          <Button 
            onClick={onApplySteps}
            disabled={configSteps.length === 0}
            className="flex-1"
          >
            Apply Steps
          </Button>
        </div>

        {configSteps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No steps configured yet.</p>
            <p className="text-xs">Click "Add Step" to create your first scheduling step.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
