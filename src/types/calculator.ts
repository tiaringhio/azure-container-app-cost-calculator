// Tipi per Azure Container Apps Cost Calculator

export interface CpuMemoryCombination {
  cpu: number;
  memory: number;
  label: string;
}

export interface PricingConfig {
  vcpu_per_second: number;
  memory_per_gib_second: number;
  vcpu_per_hour: number;
  memory_per_gb_per_hour: number;
  regions: Record<string, number>;
}

// Nuovi tipi per il pricing dinamico
export interface RegionData {
  name: string;
  multiplier: number;
  currency: string;
}

export interface CurrencyData {
  symbol: string;
  name: string;
  rates: Record<string, number>;
}

export interface PricingData {
  lastUpdated: string;
  source: string;
  consumptionPlan: {
    activeUsage: {
      freeAllowances: {
        vcpuSeconds: number;
        memoryGibSeconds: number;
        requests: number;
      };
      pricing: {
        vcpu: {
          usd: {
            perSecond: number;
            perHour: number;
            description: string;
          };
          eur: {
            perSecond: number;
            perHour: number;
            description: string;
          };
        };
        memory: {
          usd: {
            perSecond: number;
            perGibPerSecond: number;
            perGbPerHour: number;
            description: string;
          };
          eur: {
            perSecond: number;
            perGibPerSecond: number;
            perGbPerHour: number;
            description: string;
          };
        };
      };
    };
    idleUsage: {
      pricing: {
        vcpu: {
          usd: {
            perSecond: number;
            perHour: number;
          };
          eur: {
            perSecond: number;
            perHour: number;
          };
        };
        memory: {
          usd: {
            perSecond: number;
            perGibPerSecond: number;
            perGbPerHour: number;
          };
          eur: {
            perSecond: number;
            perGibPerSecond: number;
            perGbPerHour: number;
          };
        };
      };
    };
  };
  regions: Record<string, RegionData>;
  currencies: Record<string, CurrencyData>;
}

export interface AzureRegion {
  value: string;
  label: string;
  currency: string;
  multiplier: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface ScheduleStep {
  id: number;
  days: number[];
  startTime: string;
  endTime: string;
  instances: number;
}

export type Schedule = Record<number, Record<number, number>>;

export interface CostResults {
  vcpuCostPerHour: number;
  memoryCostPerHour: number;
  totalCostPerInstancePerHour: number;
  totalActiveInstanceHours: number;
  weeklyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  avgInstancesPerHour: number;
  avgActiveInstancesPerActiveHour: number;
  maxInstances: number;
  vcpu: number;
  memory: number;
  activeSlots: number;
  efficiencyPercentage: number;
}

export interface CalculatorState {
  selectedCombination: number;
  selectedRegion: string;
  schedule: Schedule;
  configSteps: ScheduleStep[];
}
