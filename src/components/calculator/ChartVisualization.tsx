import React, { useState, useMemo } from 'react';
import type { Schedule, CostResults } from '../../types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { usePricing } from '../../hooks/usePricing';

interface ChartVisualizationProps {
  schedule: Schedule;
  costResults: CostResults;
  currentCombination: { cpu: number; memory: number; label: string };
}

type ViewType = 'day' | 'week' | 'month';

const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  schedule,
  costResults,
  currentCombination
}) => {
  const [activeView, setActiveView] = useState<ViewType>('day');
  const [selectedDay, setSelectedDay] = useState(0); // Monday by default

  // Use dynamic pricing
  const { getFormattedPrice, pricing } = usePricing();

  // Calculate hourly costs for the selected day
  const dayInstancesData = useMemo(() => {
    const daySchedule = schedule[selectedDay] || {};
    return HOURS.map((hour, index) => ({
      time: hour,
      instances: daySchedule[index] || 0,
      cost: (daySchedule[index] || 0) * costResults.totalCostPerInstancePerHour
    }));
  }, [schedule, selectedDay, costResults.totalCostPerInstancePerHour]);

  // Calculate weekly data
  const weeklyData = useMemo(() => {
    return DAYS_FULL.map((day, dayIndex) => {
      const daySchedule = schedule[dayIndex] || {};
      const totalInstances = Object.values(daySchedule).reduce((sum, instances) => sum + instances, 0);
      const avgInstances = totalInstances / 24;
      const dailyCost = totalInstances * costResults.totalCostPerInstancePerHour;
      
      return {
        day: day.substring(0, 3), // Mon, Tue, etc.
        instances: avgInstances,
        totalInstances,
        cost: dailyCost
      };
    });
  }, [schedule, costResults.totalCostPerInstancePerHour]);

  // Calculate monthly projection (4.33 weeks average)
  const monthlyData = useMemo(() => {
    const weeksInMonth = 4.33;
    return Array.from({ length: 4 }, (_, weekIndex) => ({
      week: `Week ${weekIndex + 1}`,
      instances: costResults.avgInstancesPerHour * 168, // 168 hours per week
      cost: costResults.weeklyCost
    }));
  }, [costResults]);

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]), 1);
  };

  const renderDayView = () => {
    const maxInstances = getMaxValue(dayInstancesData, 'instances');
    const maxCost = getMaxValue(dayInstancesData, 'cost');

    return (
      <div className="space-y-4">
        {/* Day Selector */}
        <div className="flex flex-wrap gap-2">
          {DAYS_FULL.map((day, index) => (
            <Button
              key={index}
              variant={selectedDay === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(index)}
              className="text-xs"
            >
              {day.substring(0, 3)}
            </Button>
          ))}
        </div>

        {/* Hourly Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Hourly View - {DAYS_FULL[selectedDay]}</h4>
          
          {/* Legend - Move to top */}
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Active Instances</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Zero Instances</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Cost (€)</span>
            </div>
          </div>

          {/* Chart with proper spacing */}
          <div className="space-y-2">
            {/* Hour labels row */}
            <div className="grid grid-cols-24 gap-1 text-xs">
              {dayInstancesData.map((item, index) => (
                <div key={index} className="text-center text-xs text-muted-foreground h-4 flex items-end justify-center">
                  {index % 4 === 0 ? item.time.split(':')[0] : ''}
                </div>
              ))}
            </div>
            
            {/* Charts row */}
            <div className="grid grid-cols-24 gap-1">
              {dayInstancesData.map((item, index) => (
                <div key={index} className="space-y-1">
                  {/* Instances bar */}
                  <div className={`h-16 rounded relative overflow-hidden ${
                    item.instances === 0 ? 'bg-muted' : 'bg-muted/50'
                  }`}>
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-300 ${
                        item.instances === 0 ? 'bg-muted-foreground/50' : 'bg-blue-500'
                      }`}
                      style={{ height: `${item.instances === 0 ? 100 : (item.instances / maxInstances) * 100}%` }}
                      title={`${item.instances} instances at ${item.time}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white text-shadow">
                        {item.instances === 0 ? '0' : item.instances}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cost bar */}
                  <div className={`h-8 rounded relative overflow-hidden ${
                    item.cost === 0 ? 'bg-muted' : 'bg-muted/50'
                  }`}>
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-300 ${
                        item.cost === 0 ? 'bg-muted-foreground/50' : 'bg-green-500'
                      }`}
                      style={{ height: `${item.cost === 0 ? 100 : (item.cost / maxCost) * 100}%` }}
                      title={`€${item.cost.toFixed(3)} cost at ${item.time}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const maxInstances = getMaxValue(weeklyData, 'instances');
    const maxCost = getMaxValue(weeklyData, 'cost');

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Weekly Overview</h4>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((item, index) => (
            <div key={index} className="space-y-2 text-center">
              <div className="text-xs font-medium">{item.day}</div>
              
              {/* Instances bar */}
              <div className="h-24 bg-muted/50 rounded relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
                  style={{ height: `${(item.instances / maxInstances) * 100}%` }}
                  title={`Avg ${item.instances.toFixed(1)} instances/hour`}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <span className="text-xs font-bold text-white">
                    {item.instances.toFixed(1)}
                  </span>
                </div>
              </div>
              
              {/* Daily cost */}
              <div className="text-xs">
                <div className="font-medium">€{item.cost.toFixed(2)}</div>
                <div className="text-muted-foreground">{item.totalInstances}h total</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Shows average instances per hour and total daily cost for each day of the week.</p>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Monthly Projection</h4>
        
        {/* Monthly summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {costResults.totalActiveInstanceHours * 4.33}
            </div>
            <div className="text-xs text-muted-foreground">Total Instance Hours/Month</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {getFormattedPrice(costResults.monthlyCost, 2)}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Cost</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {costResults.efficiencyPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {getFormattedPrice(costResults.yearlyCost, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Yearly Projection</div>
          </Card>
        </div>

        {/* Weekly breakdown in month */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Weekly Breakdown</h5>
          <div className="grid grid-cols-4 gap-2">
            {monthlyData.map((item, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded text-center">
                <div className="text-sm font-medium">{item.week}</div>
                <div className="text-xs text-muted-foreground">
                  €{item.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Cost Breakdown</h5>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>CPU Cost ({getFormattedPrice(currentCombination.cpu * pricing.vcpu_per_hour)}/hour/instance):</span>
              <span>{getFormattedPrice((costResults.monthlyCost * (currentCombination.cpu * pricing.vcpu_per_hour) / costResults.totalCostPerInstancePerHour), 2)}/month</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Cost ({getFormattedPrice(currentCombination.memory * pricing.memory_per_gb_per_hour)}/hour/instance):</span>
              <span>{getFormattedPrice((costResults.monthlyCost * (currentCombination.memory * pricing.memory_per_gb_per_hour) / costResults.totalCostPerInstancePerHour), 2)}/month</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usage & Cost Analytics</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('day')}
            >
              Day
            </Button>
            <Button
              variant={activeView === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('week')}
            >
              Week
            </Button>
            <Button
              variant={activeView === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('month')}
            >
              Month
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Visualize instance usage patterns and costs across different time periods.
        </p>
      </CardHeader>
      <CardContent>
        {activeView === 'day' && renderDayView()}
        {activeView === 'week' && renderWeekView()}
        {activeView === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
};
