# Changelog

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-06-30

### 🐛 Fixed
- **CRITICAL**: Risolti errori build CI dovuti a conflitti dipendenze Vite/Vitest
- Sincronizzato package-lock.json con package.json per compatibilità `npm ci`
- Aggiornate dipendenze devDependencies per compatibilità:
  - Vitest: 3.2.4 → 1.6.0 (compatibile con Vite 4.x)
  - @vitest/ui: 3.2.4 → 1.6.0
  - jsdom: 26.1.0 → 24.1.0
  - @vitejs/plugin-react: aggiornato a 4.3.1
- Configurazione vitest.config.ts: rimosso `globals: true`, impostato `environment: 'jsdom'`

## [1.0.1] - 2025-06-30

### 🐛 Fixed
- **CRITICAL**: Corretto prezzo memory da 0.000003 a 0.000004 USD/GiB/sec per allineamento con portale Azure
- Eliminati tutti i riferimenti al prezzo memory legacy (3E-06) nei raw data
- Corretti calcoli costi per riflettere i prezzi ufficiali Azure Container Apps

### ✨ Added
- Suite completa di test con Vitest (54 test)
  - Test validazione dati pricing (`pricing-data.test.ts`)
  - Test funzioni conversione (`pricing-functions.test.ts`) 
  - Test integrazione end-to-end (`integration.test.ts`)
  - Test regressione (`regression.test.ts`)
- Configurazione Vitest con script npm
- Documentazione test completa in `tests/README.md`
- Report risultati test in `tests/TEST_RESULTS.md`

### 🔧 Changed
- Aggiornato `package.json` con script test: `test`, `test:run`, `test:ui`, `test:coverage`
- Configurato `vitest.config.ts` per ambiente test
- Migliorata struttura dati JSON con documentazione source

### 📚 Documentation
- Aggiunti commenti dettagliati nei file di test
- Documentazione completa coverage test (pricing, conversioni, regressioni)
- Guide per esecuzione e debugging test

### 🧪 Testing
- **54 test** che validano:
  - Prezzi corretti portale Azure
  - Conversioni valute (25+ valute supportate)
  - Supporto regioni (55+ regioni Azure)
  - Calcoli costi realistici
  - Free tier allowances
  - Compatibilità backwards
  - Integrità dati

### ⚡ Performance
- Nessun impatto performance (solo correzione dati)
- Test eseguiti in <500ms

### 🔒 Security
- Nessun impatto security

---

## [1.0.0] - 2025-06-30

### 🐛 Fixed
- Corretta reattività calcoli Total Summary per aggiornamenti in tempo reale (commit d94fcb6)

### 🔧 Changed  
- Migliorata visualizzazione Total Summary anche con una sola app (commit d41c3f6)

---

## [0.6.0] - 2025-06-30

### ✨ Added
- **Sistema conversione valute dinamiche** basato su regione selezionata
- **Supporto 10+ valute globali** con tassi di cambio automatici
- **Componente RegionSelector** dedicato per selezione regione/valuta
- **Simboli valuta automatici** (USD: $, EUR: €, GBP: £, JPY: ¥, etc.)

### 🔧 Changed
- Aggiornata funzione `getDynamicPricing()` con logica conversione valute
- Refactor hook `usePricing` per sincronizzazione valute migliore
- Layout CPU/Memory selector: label e dropdown affiancati
- Centralizzata funzione `getFormattedPrice` per display valute consistente

### 🌍 Global Support
- **Valute supportate**: USD, EUR, GBP, CHF, JPY, AUD, BRL, CAD, KRW, INR
- **Conversioni automatiche** con tassi di cambio
- **Default valute per regione** Azure

---

## [0.5.0] - 2025-06-29

### ✨ Added
- **Modernizzazione completa** architettura React + Vite + Tailwind
- **Pricing per-secondo** con calcoli trasparenti
- **Multi-app support** con color coding e gestione
- **Formule di calcolo** sempre visibili nel breakdown

### 🔧 Changed
- Rimossi tutti i prezzi hardcoded per-ora
- Tutti i calcoli ora usano per-secondo × 3600 per valori orari
- Aggiornati tipi TypeScript per nuova struttura pricing
- Migliorato state management multi-app con localStorage

### 📊 Cost Calculation Updates
- **ResourceConfiguration**: Mostra prezzi per-secondo e calcolati per-ora
- **CostBreakdown**: Formule di calcolo trasparenti
- **ChartVisualization**: Pricing dinamico per-secondo
- **useCalculator**: Refactor per hook pricing dinamico
- **Total Summary**: Calcoli aggregati accurati

### 🎨 UX Enhancements
- Supporto dark mode moderno
- Nomi estimate editabili
- Color coding e management app
- Componenti sticky per navigazione migliore
- UI professionale con shadcn/ui

---

## [0.4.0] - 2025-06-29

### ✨ Added
- **Multi-app support completo** con gestione avanzata
- **AppManager component** per creazione/gestione multiple app
- **Hook useMultiApp** per state management
- **Layout migliorato** con proporzioni ottimizzate (25% | 50% | 25%)

### 🔧 Changed
- Espanse sezioni sidebar da 1/5 a 3/12 ciascuna (25%)
- Area contenuto principale da 3/5 a 6/12 (50%)
- Rimosso constraint max-w-7xl per utilizzo full-screen
- Rimossa funzionalità detailed breakdown

### 📱 Mobile Improvements
- Responsive design migliorato con touch targets appropriati
- Layout mobile single-column mantenuto
- AppManager mobile-friendly

### 🗑️ Removed
- Pulsante "Show/Hide Detailed Breakdown"
- Modal detailed per-app breakdown nell'area principale

---

## [0.3.0] - 2025-06-29

### ✨ Initial Release - Dark Mode & Complete UI
- **Calcolatore costi Azure Container Apps** con interfaccia completa
- **Dark mode completo** con rilevamento sistema
- **ThemeToggle component** con opzioni light/dark/system
- **Hook useTheme** per gestione tema e persistenza

### 🎨 UI Components Added
- **ResourceConfiguration**: Card configurazione corrente
- **CostBreakdown**: Cards costi e metriche efficienza  
- **ScheduleGrid**: Griglia scheduling con legenda
- **ChartVisualization**: Grafici con elementi interattivi
- **StepConfiguration**: Form e campi input

### 🛠 Technical Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State**: Custom hooks (useCalculator, usePricing, useTheme)
- **Build**: Vite, ESLint, TypeScript

### 💰 Pricing System
- **Prezzi EUR base**:
  - vCPU: €0.0000301/sec
  - Memory: €0.0000036/sec
- **Free tier calculation**
- **Efficient cost calculations**

### 📱 Features
- **Responsive design** per mobile/desktop
- **Configurazione CPU/Memory** con combinazioni valide
- **Scheduling grid** per planning utilizzo
- **Preset configurazioni** per casi comuni
- **Visualizzazione grafici** costi
- **Cost breakdown** dettagliato

### 🌍 Initial Support
- **Language**: Inglese
- **Currency**: EUR (€)
- **Regions**: Pricing base (estendibile)
- **Browsers**: Moderni (ES2020+)

### 📚 Documentation
- README completo con setup e utilizzo
- Documentazione tecnica per ogni feature
- Guide implementazione dark mode
- File markdown specifici per ogni componente

---

## Semantic Versioning

Questo progetto segue [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes che richiedono aggiornamenti manuali
- **MINOR** (0.X.0): Nuove features backwards-compatible  
- **PATCH** (0.0.X): Bug fixes backwards-compatible

### Esempi Future Release

- **1.1.0**: Nuova feature (es. supporto Dedicated plan, nuove regioni, Azure API integration)
- **1.0.2**: Bug fix (es. correzione UI, fix conversioni, aggiornamenti prezzi)
- **2.0.0**: Breaking change (es. API restructuring, major UI overhaul, architettura change)
