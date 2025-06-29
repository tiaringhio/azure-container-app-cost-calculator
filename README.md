# Azure Container Apps Cost Calculator

Un calcolatore moderno e interattivo per stimare i costi di Azure Container Apps, costruito con React, Vite, TailwindCSS e shadcn/ui.

## ✨ Funzionalità Principali

### 💰 **Calcolo Costi Accurato**
- Prezzi ufficiali Azure Container Apps 2025
- Supporto active usage (pay-per-use)
- Calcolo costi zero-scale (0 istanze = €0.00)
- Proiezioni temporali: giornaliere, settimanali, mensili, annuali
- Breakdown dettagliato per CPU e memoria

### ⚙️ **Configurazione Risorse**
- Solo combinazioni CPU/memoria ufficialmente supportate da Azure
- Quick preset: XS (0.25), S (0.5), M (1), L (2), XL (4) vCPU
- Supporto multi-regione con moltiplicatori di prezzo
- Card riepilogo costi in tempo reale

### 📅 **Pianificazione Avanzata**
- **Griglia settimanale interattiva**: 24h × 7 giorni con sticky days
- **Quick schedule presets**: Business Hours, Extended, 24/7, Clear
- **Step configuration**: Configurazione batch per più giorni/orari
- **Badge giorni cliccabili**: UX moderna per selezione rapida

### 📊 **Analytics e Visualizzazione**
- **Chart visualization**: Vista giorno/settimana/mese
- **Evidenziazione ore zero**: Slot inattivi in grigio
- **Legenda interattiva**: Distinzione istanze attive/zero/costi
- **Metriche efficienza**: Percentuale utilizzo, picco istanze, ore attive

### 🎨 **Design Moderno**
- Interface responsive con TailwindCSS
- Componenti shadcn/ui per design system coerente
- Gradienti colorati per categorizzazione visiva
- Layout ottimizzato per mobile e desktop

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js 18+
- npm o yarn

### Installazione
```bash
# Clona il repository
git clone <repository-url>
cd azure-container-apps-cost-calculator

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Il calcolatore sarà disponibile su `http://localhost:5173`

### Build per produzione
```bash
npm run build
npm run preview
```

## 🏗️ Architettura Tecnica

### Stack Tecnologico
- **React 18**: Framework UI con hooks
- **Vite**: Build tool veloce per sviluppo
- **React Router**: Routing client-side
- **TailwindCSS**: Styling utility-first
- **shadcn/ui**: Componenti UI high-quality
- **TypeScript**: Type safety e developer experience

### Struttura del Progetto
```
src/
├── components/
│   ├── ui/                 # Componenti shadcn/ui base
│   └── calculator/         # Componenti specifici del calcolatore
├── hooks/
│   └── useCalculator.ts    # Hook principale per la logica
├── lib/
│   ├── constants.ts        # Costanti (prezzi, combinazioni)
│   └── utils.ts           # Utility functions
├── types/
│   └── calculator.ts      # TypeScript types
└── routes/
    └── home.tsx           # Pagina principale
```

## � Configurazione e Sviluppo

### Scripts Disponibili
```bash
npm run dev          # Avvia development server
npm run build        # Build per produzione
npm run preview      # Preview build locale
npm run type-check   # Controllo tipi TypeScript
npm run lint         # ESLint
```

### Prezzi Ufficiali Azure 2025
- **vCPU**: €0.10836 per ora
- **Memoria**: €0.01296 per GB per ora
- **Regioni supportate**: West Europe (default), North Europe, East US, West US, Central US

## 📱 Responsive Design

Il calcolatore è completamente responsive con:
- Layout mobile-first con TailwindCSS
- Grid adaptive per card e componenti
- Ottimizzazione touch per dispositivi mobili
- Sticky navigation per griglia orari

## 🎯 Case d'Uso

### Per Sviluppatori
- Stima costi prima del deployment
- Ottimizzazione scaling policies
- Confronto configurazioni diverse

### Per DevOps/SRE
- Pianificazione budget infrastruttura
- Analisi costi operativi
- Simulation scaling scenarios

### Per Business
- Forecast costi mensili/annuali
- ROI analysis per progetti
- Budget planning e approval

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE.md` per dettagli.

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Supporto

Per domande o supporto, apri una issue su GitHub.

---

*Sviluppato con ❤️ per la community Azure*
