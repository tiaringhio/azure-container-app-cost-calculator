# Sistema Dark Mode - Azure Container Apps Calculator

## Panoramica

Il sistema di dark mode è completamente implementato utilizzando **shadcn/ui** e Tailwind CSS, seguendo le best practices per l'accessibilità e l'esperienza utente.

## Caratteristiche

### 🌓 Modalità Supportate
- **Light**: Tema chiaro
- **Dark**: Tema scuro
- **System**: Segue automaticamente le preferenze del sistema operativo

### 🔄 Funzionalità
- **Toggle UI**: Menu dropdown con icone intuitive (Sun, Moon, Monitor)
- **Persistenza**: Le preferenze vengono salvate nel localStorage
- **Rilevamento Sistema**: Ascolta automaticamente i cambiamenti delle preferenze di sistema
- **Responsive**: Funziona su tutti i dispositivi

## Implementazione Tecnica

### Hook `useTheme`
Posizione: `/src/hooks/useTheme.ts`

```typescript
export type Theme = 'light' | 'dark' | 'system';
```

**Funzionalità principali:**
- Gestione dello stato del tema
- Persistenza nel localStorage
- Rilevamento delle preferenze di sistema
- Applicazione automatica delle classi CSS

### Componente `ThemeToggle`
Posizione: `/src/components/ui/theme-toggle.tsx`

**Componenti shadcn/ui utilizzati:**
- `DropdownMenu`
- `Button`
- Icons da `lucide-react`

### Configurazione CSS
Le variabili CSS per light/dark mode sono definite in `/src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... altre variabili */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... altre variabili */
}
```

### Configurazione Tailwind
In `tailwind.config.js`:
```javascript
darkMode: ["class"]
```

## Integrazione nell'App

Il `ThemeToggle` è posizionato nell'header principale dell'applicazione:

```tsx
// In src/routes/home.tsx
<div className="mb-8 flex items-center justify-between">
  <div>
    <h1>Azure Container Apps Calculator</h1>
    <p>Calculate costs for your containerized applications on Azure</p>
  </div>
  <ThemeToggle />
</div>
```

## Personalizzazioni Dark Mode

### Classi CSS Aggiornate
Le classi custom sono state aggiornate per supportare entrambi i temi:

```css
.cost-card {
  @apply relative overflow-hidden bg-gradient-to-br from-background to-muted/50 border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200;
}

.dark .cost-card {
  @apply from-card to-muted/20;
}
```

### Variabili di Colore Semantiche
Utilizziamo le variabili semantiche di shadcn/ui:
- `background` / `foreground`
- `card` / `card-foreground`
- `primary` / `primary-foreground`
- `muted` / `muted-foreground`
- `border`, `input`, `ring`

## Come Funziona

1. **Inizializzazione**: All'avvio, l'app legge il tema dal localStorage o usa 'system'
2. **Rilevamento Sistema**: Se impostato su 'system', ascolta i cambiamenti delle preferenze OS
3. **Applicazione**: Aggiunge/rimuove la classe 'dark' dal documento HTML
4. **Persistenza**: Salva le preferenze dell'utente nel localStorage
5. **Reattività**: I componenti si aggiornano automaticamente grazie alle variabili CSS

## Accessibilità

- **Screen Reader**: Etichette appropriate (`sr-only`)
- **Keyboard Navigation**: Supporto completo per navigazione da tastiera
- **High Contrast**: Rispetta le preferenze di contrasto del sistema
- **Icone Semantiche**: Sun (light), Moon (dark), Monitor (system)

## Componenti shadcn/ui Utilizzati

- `Button` (per il trigger)
- `DropdownMenu` e sottocounter (`DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`)
- Icone da `lucide-react` (`Sun`, `Moon`, `Monitor`)

## Estensibilità

Il sistema è facilmente estendibile per:
- Aggiungere nuovi temi (es. high contrast)
- Personalizzare i colori per brand specifici
- Integrare con provider di stato globali (se necessario)
- Aggiungere animazioni di transizione tra temi

---

*Implementazione completa e pronta per l'uso in produzione.*
