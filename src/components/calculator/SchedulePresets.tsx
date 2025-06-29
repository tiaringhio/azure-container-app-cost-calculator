import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SchedulePresetsProps {
  onSetPreset: (preset: 'business' | 'extended' | '247' | 'clear') => void;
}

export const SchedulePresets: React.FC<SchedulePresetsProps> = ({
  onSetPreset
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Schedule Presets</CardTitle>
        <p className="text-sm text-muted-foreground">
          Apply common scheduling patterns to quickly configure your weekly schedule.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onSetPreset('business')}
            className="flex flex-col h-auto p-4 space-y-1 text-center"
          >
            <div className="font-medium text-sm">Business Hours</div>
            <div className="text-xs text-muted-foreground">
              Mon-Fri 9-18
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSetPreset('extended')}
            className="flex flex-col h-auto p-4 space-y-1 text-center"
          >
            <div className="font-medium text-sm">Extended Hours</div>
            <div className="text-xs text-muted-foreground">
              Mon-Fri 6-23
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSetPreset('247')}
            className="flex flex-col h-auto p-4 space-y-1 text-center"
          >
            <div className="font-medium text-sm">24/7 Service</div>
            <div className="text-xs text-muted-foreground">
              Always on
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSetPreset('clear')}
            className="flex flex-col h-auto p-4 space-y-1 text-center"
          >
            <div className="font-medium text-sm">Clear All</div>
            <div className="text-xs text-muted-foreground">
              Reset schedule
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
