import { useState, useCallback, useEffect } from 'react';
import { ContainerApp, MultiAppState, Schedule, ScheduleStep } from '../types/calculator';

// Colori predefiniti per le app
const APP_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

const STORAGE_KEY = 'container-apps-calculator';

// Funzione per generare un ID univoco
const generateId = () => Math.random().toString(36).substr(2, 9);

// Funzione per ottenere un colore random non ancora utilizzato
const getRandomColor = (usedColors: string[]): string => {
  const availableColors = APP_COLORS.filter(color => !usedColors.includes(color));
  if (availableColors.length === 0) {
    // Se tutti i colori sono stati usati, genera un colore random
    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

// Stato iniziale
const getInitialState = (): MultiAppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Verifica che la struttura sia valida
      if (parsed.apps && Array.isArray(parsed.apps)) {
        // Aggiungi estimateName se non esiste (backward compatibility)
        if (!parsed.estimateName) {
          parsed.estimateName = 'Container Apps';
        }
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }

  // Stato iniziale con una app di default
  const defaultAppId = generateId();
  return {
    apps: [{
      id: defaultAppId,
      name: 'Container App 1',
      color: APP_COLORS[0],
      selectedCombination: 3, // 1 CPU, 2 GB
      schedule: {},
      configSteps: []
    }],
    activeAppId: defaultAppId,
    selectedRegion: 'westeurope',
    estimateName: 'Container Apps'
  };
};

export interface UseMultiAppReturn {
  state: MultiAppState;
  activeApp: ContainerApp | null;
  addApp: (name?: string) => void;
  removeApp: (appId: string) => void;
  setActiveApp: (appId: string) => void;
  updateApp: (appId: string, updates: Partial<ContainerApp>) => void;
  updateAppName: (appId: string, name: string) => void;
  updateAppCombination: (appId: string, combination: number) => void;
  updateAppSchedule: (appId: string, schedule: Schedule) => void;
  updateAppSteps: (appId: string, steps: ScheduleStep[]) => void;
  updateRegion: (region: string) => void;
  updateEstimateName: (name: string) => void;
  updateTotalCosts: (totalCosts: MultiAppState['totalCosts']) => void;
  clearAllData: () => void;
}

export const useMultiApp = (): UseMultiAppReturn => {
  const [state, setState] = useState<MultiAppState>(getInitialState);

  // Salva lo stato nel localStorage ogni volta che cambia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }, [state]);

  // Ottieni l'app attiva
  const activeApp = state.apps.find(app => app.id === state.activeAppId) || null;

  // Aggiungi una nuova app
  const addApp = useCallback((name?: string) => {
    setState(prev => {
      const usedColors = prev.apps.map(app => app.color);
      const newColor = getRandomColor(usedColors);
      const newAppId = generateId();
      const appNumber = prev.apps.length + 1;
      
      const newApp: ContainerApp = {
        id: newAppId,
        name: name || `Container App ${appNumber}`,
        color: newColor,
        selectedCombination: 3, // Default: 1 CPU, 2 GB
        schedule: {},
        configSteps: []
      };

      return {
        ...prev,
        apps: [...prev.apps, newApp],
        activeAppId: newAppId
      };
    });
  }, []);

  // Rimuovi un'app
  const removeApp = useCallback((appId: string) => {
    setState(prev => {
      const newApps = prev.apps.filter(app => app.id !== appId);
      
      // Se l'app rimossa era quella attiva, seleziona la prima disponibile
      let newActiveAppId = prev.activeAppId;
      if (prev.activeAppId === appId && newApps.length > 0) {
        newActiveAppId = newApps[0].id;
      }

      return {
        ...prev,
        apps: newApps,
        activeAppId: newActiveAppId
      };
    });
  }, []);

  // Imposta l'app attiva
  const setActiveApp = useCallback((appId: string) => {
    setState(prev => ({
      ...prev,
      activeAppId: appId
    }));
  }, []);

  // Aggiorna un'app
  const updateApp = useCallback((appId: string, updates: Partial<ContainerApp>) => {
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => 
        app.id === appId ? { ...app, ...updates } : app
      )
    }));
  }, []);

  // Aggiorna il nome di un'app
  const updateAppName = useCallback((appId: string, name: string) => {
    updateApp(appId, { name });
  }, [updateApp]);

  // Aggiorna la combinazione CPU/memoria di un'app
  const updateAppCombination = useCallback((appId: string, combination: number) => {
    updateApp(appId, { selectedCombination: combination });
  }, [updateApp]);

  // Aggiorna lo schedule di un'app
  const updateAppSchedule = useCallback((appId: string, schedule: Schedule) => {
    updateApp(appId, { schedule });
  }, [updateApp]);

  // Aggiorna gli step di configurazione di un'app
  const updateAppSteps = useCallback((appId: string, steps: ScheduleStep[]) => {
    updateApp(appId, { configSteps: steps });
  }, [updateApp]);

  // Aggiorna la regione selezionata
  const updateRegion = useCallback((region: string) => {
    setState(prev => ({
      ...prev,
      selectedRegion: region
    }));
  }, []);

  // Aggiorna il nome della stima
  const updateEstimateName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      estimateName: name
    }));
  }, []);

  // Aggiorna i costi totali
  const updateTotalCosts = useCallback((totalCosts: MultiAppState['totalCosts']) => {
    setState(prev => ({
      ...prev,
      totalCosts
    }));
  }, []);

  // Cancella tutti i dati
  const clearAllData = useCallback(() => {
    const initialState = getInitialState();
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    activeApp,
    addApp,
    removeApp,
    setActiveApp,
    updateApp,
    updateAppName,
    updateAppCombination,
    updateAppSchedule,
    updateAppSteps,
    updateRegion,
    updateEstimateName,
    updateTotalCosts,
    clearAllData
  };
};