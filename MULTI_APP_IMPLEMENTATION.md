# Multi-App Support Implementation

## Overview
Il calcolatore supporta ora il calcolo di costi per multiple Container Apps simultaneamente, con persistenza dei dati e gestione individuale di ogni app.

## Caratteristiche Implementate

### 1. Gestione Multi-App
- **Supporto per N Container Apps**: L'utente può aggiungere e gestire multiple apps
- **Nomi personalizzati**: Ogni app può avere un nome personalizzato
- **Colori distintivi**: Ogni app ha un colore univoco assegnato automaticamente
- **Gestione stato individuale**: Ogni app mantiene la propria configurazione (CPU/Memory, schedule, steps)

### 2. Persistenza LocalStorage
- **Salvataggio automatico**: Tutti i dati vengono salvati automaticamente nel localStorage
- **Recupero all'avvio**: Al riavvio dell'applicazione, tutte le app vengono ripristinate
- **Gestione errori**: Fallback sicuro in caso di corruzione dei dati
- **Chiave storage**: `container-apps-calculator`

### 3. Interface Utente

#### AppManager Component
- Lista delle apps con indicatori di colore
- Selezione dell'app attiva con evidenziazione
- Editing inline dei nomi delle apps
- Aggiunta/rimozione apps
- Riepilogo totale quando ci sono multiple apps

#### Layout Modificato
- **Sidebar sinistra**: Gestione apps (1/4 della larghezza)
- **Area principale**: Configurazione dell'app attiva (3/4 della larghezza)
- **Header app attiva**: Mostra nome e colore dell'app corrente

### 4. Calcolo Costi Aggregati
- **Riepilogo totale**: Somma dei costi di tutte le apps quando sono multiple
- **Metriche aggregate**:
  - Costo settimanale/mensile/annuale totale
  - Numero totale di istanze peak
  - Ore totali CPU e Memory
  - Numero di apps gestite

## Struttura Dati

### ContainerApp Interface
```typescript
interface ContainerApp {
  id: string;              // ID univoco generato automaticamente
  name: string;            // Nome personalizzabile dall'utente
  color: string;           // Colore esadecimale per identificazione visiva
  selectedCombination: number;  // Indice combinazione CPU/Memory
  schedule: Schedule;      // Schedule settimanale dell'app
  configSteps: ScheduleStep[];  // Steps di configurazione
  costResults?: CostResults;    // Risultati di calcolo (opzionale)
}
```

### MultiAppState Interface
```typescript
interface MultiAppState {
  apps: ContainerApp[];           // Array delle apps
  activeAppId: string | null;     // ID dell'app attivamente selezionata
  selectedRegion: string;         // Regione Azure globale
  totalCosts?: {                  // Costi aggregati (opzionale)
    weeklyCost: number;
    monthlyCost: number;
    yearlyCost: number;
    totalInstances: number;
    totalCpuHours: number;
    totalMemoryHours: number;
  };
}
```

## Hook useMultiApp

### Funzionalità Principali
- `addApp(name?)`: Aggiunge nuova app con nome opzionale
- `removeApp(appId)`: Rimuove app (minimo 1 app sempre presente)
- `setActiveApp(appId)`: Cambia l'app attiva
- `updateAppName(appId, name)`: Aggiorna nome app
- `updateAppCombination(appId, combination)`: Aggiorna configurazione CPU/Memory
- `updateAppSchedule(appId, schedule)`: Aggiorna schedule app
- `updateAppSteps(appId, steps)`: Aggiorna configuration steps
- `updateRegion(region)`: Aggiorna regione globale
- `clearAllData()`: Reset completo dei dati

### Gestione Colori
- Array predefinito di 12 colori
- Algoritmo per evitare duplicati
- Generazione colori random quando i predefiniti sono esauriti

## Integrazione con Sistema Esistente

### Sincronizzazione Stati
- **Hook esistente**: `useCalculator` gestisce l'app attiva
- **Nuovo hook**: `useMultiApp` gestisce il sistema multi-app
- **Sync automatica**: Cambiamenti nell'app attiva sincronizzati con multiapp state

### Compatibilità
- **Retrocompatibilità**: Il sistema funziona con una sola app (comportamento originale)
- **Migrazione automatica**: Dati esistenti vengono automaticamente migrati al nuovo formato
- **Fallback**: In caso di errori, viene creata un'app di default

## File Modificati/Creati

### Nuovi File
- `src/hooks/useMultiApp.ts` - Hook per gestione multi-app
- `src/components/calculator/AppManager.tsx` - Componente gestione apps
- `src/components/ui/input.tsx` - Componente input shadcn/ui
- `src/components/ui/tabs.tsx` - Componente tabs shadcn/ui

### File Modificati
- `src/types/calculator.ts` - Aggiunti tipi per multi-app
- `src/routes/home.tsx` - Layout e logica aggiornati per multi-app
- `src/hooks/useCalculator.ts` - Esposto setState per sincronizzazione

## Prossimi Miglioramenti Possibili
1. **Export/Import**: Possibilità di esportare/importare configurazioni
2. **Templates**: Templates predefiniti per tipologie di app comuni
3. **Comparazione**: Vista side-by-side per confrontare apps
4. **Gruppi**: Raggruppamento apps per progetti
5. **Charts multi-app**: Visualizzazioni aggregate per tutte le apps
