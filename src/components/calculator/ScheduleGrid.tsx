import React from 'react';
import type { Schedule } from '../../types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ScheduleGridProps {
  schedule: Schedule;
  onUpdateSchedule: (day: number, hour: number, instances: number) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  schedule,
  onUpdateSchedule
}) => {
  const getCellClassName = (instances: number) => {
    if (instances === 0) return 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    if (instances === 1) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    if (instances === 2) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    return 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700';
  };

  const handleInstanceChange = (day: number, hour: number, value: string) => {
    const instances = parseInt(value) || 0;
    onUpdateSchedule(day, hour, instances);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manually adjust instance counts for each hour of the week. Values are automatically updated when you apply steps.
        </p>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-800">
          <h4 className="text-sm font-medium mb-2">Color Legend</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"></div>
              <span>0 instances (€0.00/hour)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded"></div>
              <span>1 instance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded"></div>
              <span>2 instances</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-700 border border-blue-600 dark:border-blue-700 rounded"></div>
              <span>3+ instances</span>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max relative">
            {/* Header with hours */}
            <div className="grid grid-cols-25 gap-1 mb-1">
              <div className="p-2 text-xs font-medium text-center bg-gray-100 dark:bg-gray-800 rounded sticky left-0 z-10"></div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="p-1 text-xs font-medium text-center bg-gray-100 dark:bg-gray-800 rounded">
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Grid with days and hours */}
            {DAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="grid grid-cols-25 gap-1 mb-1">
                {/* Day label - Sticky */}
                <div className="p-2 text-xs font-medium text-center bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center sticky left-0 z-10 shadow-sm">
                  {day}
                </div>

                {/* Hour cells */}
                {Array.from({ length: 24 }, (_, hour) => {
                  const instances = schedule[dayIndex]?.[hour] || 0;
                  return (
                    <div
                      key={hour}
                      className={`p-1 border rounded text-center ${getCellClassName(instances)}`}
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={instances}
                        onChange={(e) => handleInstanceChange(dayIndex, hour, e.target.value)}
                        className={`w-full text-xs text-center bg-transparent border-none outline-none ${
                          instances === 0 ? 'text-gray-500 dark:text-gray-400' : 
                          instances >= 3 ? 'text-white placeholder-gray-300 dark:placeholder-gray-400' : 'text-inherit'
                        }`}
                        style={{ 
                          minWidth: '20px',
                          height: '20px'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> Use the Step Configuration above to quickly set up common scheduling patterns, 
            or manually adjust individual cells here for fine-tuning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
