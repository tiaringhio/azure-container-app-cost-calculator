import { useState, useCallback } from 'react';
import type { CalculatorState, Schedule, ScheduleStep, CostResults } from '../types/calculator';
import { VALID_COMBINATIONS, PRICING } from '../lib/constants';

const initializeDefaultSteps = (): ScheduleStep[] => [
  {
    id: 1,
    days: [0, 1, 2, 3, 4], // Mon-Fri
    startTime: '06:00',
    endTime: '23:00',
    instances: 2
  },
  {
    id: 2,
    days: [5, 6], // Sat-Sun
    startTime: '06:00',
    endTime: '23:00',
    instances: 1
  },
  {
    id: 3,
    days: [0, 1, 2, 3, 4, 5, 6], // All days
    startTime: '23:00',
    endTime: '06:00',
    instances: 0
  }
];

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>({
    selectedCombination: 3, // Default: 1 vCPU, 2 GB
    selectedRegion: 'westeurope',
    schedule: initializeSchedule(),
    configSteps: initializeDefaultSteps()
  });

  const updateCombination = useCallback((index: number) => {
    setState(prev => ({ ...prev, selectedCombination: index }));
  }, []);

  const updateRegion = useCallback((region: string) => {
    setState(prev => ({ ...prev, selectedRegion: region }));
  }, []);

  const updateSchedule = useCallback((day: number, hour: number, instances: number) => {
    setState(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [hour]: instances
        }
      }
    }));
  }, []);

  const setSchedulePreset = useCallback((preset: 'business' | 'extended' | '247' | 'clear') => {
    const newSchedule = initializeSchedule();
    
    switch(preset) {
      case 'business':
        // Lunedì-Venerdì 9-18, 2 istanze
        for (let day = 0; day < 5; day++) {
          for (let hour = 9; hour < 18; hour++) {
            newSchedule[day][hour] = 2;
          }
        }
        break;
      case 'extended':
        // Lunedì-Venerdì 6-23, 2 istanze; weekend 1 istanza tutto il giorno
        for (let day = 0; day < 5; day++) {
          for (let hour = 6; hour < 23; hour++) {
            newSchedule[day][hour] = 2;
          }
        }
        // Weekend con 1 istanza
        for (let day = 5; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            newSchedule[day][hour] = 1;
          }
        }
        break;
      case '247':
        // 24/7 con 2 istanze
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            newSchedule[day][hour] = 2;
          }
        }
        break;
      case 'clear':
      default:
        // newSchedule è già inizializzato a 0
        break;
    }
    
    setState(prev => ({ ...prev, schedule: newSchedule }));
  }, []);

  const addStep = useCallback(() => {
    const newStep: ScheduleStep = {
      id: Date.now(),
      days: [],
      startTime: '09:00',
      endTime: '18:00',
      instances: 1
    };
    
    setState(prev => ({
      ...prev,
      configSteps: [...prev.configSteps, newStep]
    }));
  }, []);

  const removeStep = useCallback((stepId: number) => {
    setState(prev => ({
      ...prev,
      configSteps: prev.configSteps.filter(step => step.id !== stepId)
    }));
  }, []);

  const updateStep = useCallback((stepId: number, updates: Partial<ScheduleStep>) => {
    setState(prev => ({
      ...prev,
      configSteps: prev.configSteps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, []);

  const applySteps = useCallback(() => {
    const newSchedule = initializeSchedule();
    
    state.configSteps.forEach(step => {
      const startHour = parseInt(step.startTime.split(':')[0]);
      const startMinute = parseInt(step.startTime.split(':')[1]);
      const endHour = parseInt(step.endTime.split(':')[0]);
      const endMinute = parseInt(step.endTime.split(':')[1]);

      step.days.forEach(dayIndex => {
        // Assicurati che il giorno esista nello schedule
        if (!newSchedule[dayIndex]) {
          newSchedule[dayIndex] = {};
          for (let h = 0; h < 24; h++) {
            newSchedule[dayIndex][h] = 0;
          }
        }

        // Gestisci il caso in cui l'ora di fine è il giorno successivo
        if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
          // Applica dall'ora di inizio fino a mezzanotte
          for (let hour = startHour; hour < 24; hour++) {
            newSchedule[dayIndex][hour] = step.instances;
          }
          // Applica da mezzanotte all'ora di fine il giorno successivo
          const nextDay = (dayIndex + 1) % 7;
          
          // Assicurati che il giorno successivo esista
          if (!newSchedule[nextDay]) {
            newSchedule[nextDay] = {};
            for (let h = 0; h < 24; h++) {
              newSchedule[nextDay][h] = 0;
            }
          }
          
          for (let hour = 0; hour < endHour; hour++) {
            newSchedule[nextDay][hour] = step.instances;
          }
          // Gestisci l'ora parziale finale se necessario
          if (endMinute > 0) {
            newSchedule[nextDay][endHour] = step.instances;
          }
        } else {
          // Caso normale: stesso giorno
          for (let hour = startHour; hour < endHour; hour++) {
            newSchedule[dayIndex][hour] = step.instances;
          }
          // Gestisci l'ora parziale finale se necessario
          if (endMinute > 0) {
            newSchedule[dayIndex][endHour] = step.instances;
          }
        }
      });
    });
    
    setState(prev => ({ ...prev, schedule: newSchedule }));
  }, [state.configSteps]);

  const calculateCosts = useCallback((): CostResults => {
    const combo = VALID_COMBINATIONS[state.selectedCombination];
    const vcpu = combo.cpu;
    const memory = combo.memory;
    const regionMultiplier = PRICING.regions[state.selectedRegion] || 1.0;

    // Calcolo ore totali ATTIVE (solo quando istanze > 0) e costo per ora per istanza
    let totalActiveInstanceHours = 0;
    let totalZeroInstanceHours = 0;
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const instances = state.schedule[day][hour];
        if (instances > 0) {
          totalActiveInstanceHours += instances;
        } else {
          totalZeroInstanceHours += 1; // Per statistiche
        }
      }
    }

    // Costo per ora per singola istanza ATTIVA (0 istanze = 0 costi)
    const vcpuCostPerHour = vcpu * PRICING.vcpu_per_hour * regionMultiplier;
    const memoryCostPerHour = memory * PRICING.memory_per_gb_per_hour * regionMultiplier;
    const totalCostPerInstancePerHour = vcpuCostPerHour + memoryCostPerHour;

    // Costi settimanali e mensili (solo per ore attive)
    const weeklyCost = totalActiveInstanceHours * totalCostPerInstancePerHour;
    const monthlyCost = weeklyCost * 4.33; // 4.33 settimane in un mese medio
    const yearlyCost = monthlyCost * 12;

    // Statistiche aggiuntive
    const totalSlots = 7 * 24; // 168 slot totali nella settimana
    const activeSlots = Object.values(state.schedule).reduce((total, day) => {
      return total + Object.values(day).filter(instances => instances > 0).length;
    }, 0);
    const avgInstancesPerHour = totalActiveInstanceHours / 168; // 168 ore in una settimana
    const avgActiveInstancesPerActiveHour = activeSlots > 0 ? totalActiveInstanceHours / activeSlots : 0;
    const maxInstances = Math.max(0, ...Object.values(state.schedule).map(day => {
      const dayValues = Object.values(day);
      return dayValues.length > 0 ? Math.max(0, ...dayValues) : 0;
    }));

    // Calcolo efficienza (percentuale di tempo attivo)
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
      efficiencyPercentage
    };
  }, [state]);

  const getCurrentCombination = useCallback(() => {
    return VALID_COMBINATIONS[state.selectedCombination];
  }, [state.selectedCombination]);

  const getCurrentCost = useCallback(() => {
    const combo = getCurrentCombination();
    const regionMultiplier = PRICING.regions[state.selectedRegion] || 1.0;
    
    const vcpuCostPerHour = combo.cpu * PRICING.vcpu_per_hour * regionMultiplier;
    const memoryCostPerHour = combo.memory * PRICING.memory_per_gb_per_hour * regionMultiplier;
    const totalCostPerHour = vcpuCostPerHour + memoryCostPerHour;
    
    return totalCostPerHour;
  }, [state.selectedCombination, state.selectedRegion, getCurrentCombination]);

  return {
    state,
    setState,
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
  };
};

function initializeSchedule(): Schedule {
  const schedule: Schedule = {};
  for (let day = 0; day < 7; day++) {
    schedule[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      schedule[day][hour] = 0;
    }
  }
  return schedule;
}
