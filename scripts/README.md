# Azure Pricing Data Updater

Questi script permettono di aggiornare automaticamente i dati di pricing di Azure Container Apps dal Azure Retail Prices API.

## Prerequisiti

### Per PowerShell (Windows/macOS/Linux) - RACCOMANDATO
- PowerShell 7+ (installare con `brew install powershell` su macOS)
- Accesso a Internet

### Per Bash (macOS/Linux)
- Bash shell
- `curl` (solitamente preinstallato)
- `jq` per il parsing JSON:
  - **macOS**: `brew install jq`
  - **Ubuntu/Debian**: `sudo apt-get install jq`

## Utilizzo

### Script PowerShell (Raccomandato)

```powershell
# Esegui con npm
npm run update-pricing

# Oppure direttamente con PowerShell
pwsh scripts/update-azure-pricing-simple.ps1

# Esegui con percorso personalizzato
pwsh scripts/update-azure-pricing-simple.ps1 -OutputPath "./custom/path/azure-pricing.json"

# Esegui con output verboso
pwsh scripts/update-azure-pricing-simple.ps1 -Verbose
```

### Script Bash

```bash
# Esegui con npm
npm run update-pricing-bash

# Oppure direttamente
./scripts/update-azure-pricing-simple.sh

# Esegui con percorso personalizzato
./scripts/update-azure-pricing-simple.sh "./custom/path/azure-pricing.json"
```

## Script Disponibili

1. **`update-azure-pricing-simple.ps1`** - Script PowerShell semplificato e testato (RACCOMANDATO)
2. **`update-azure-pricing-simple.sh`** - Script Bash semplificato
3. **`update-azure-pricing.ps1`** - Script PowerShell completo con multi-valuta
4. **`update-azure-pricing.sh`** - Script Bash completo con multi-valuta

## Test

Per testare gli script prima dell'uso:

```bash
# Test veloce con script di test
./scripts/test-pricing.sh
```

## Automazione

### NPM Scripts
Il modo più semplice per aggiornare i prezzi:

```bash
npm run update-pricing
```

### Cron Job (Linux/macOS)
Per aggiornare i dati automaticamente ogni giorno alle 2:00 AM:

```bash
# Modifica il crontab
crontab -e

# Aggiungi questa riga (modifica il percorso)
0 2 * * * cd /path/to/project && npm run update-pricing >> logs/pricing-update.log 2>&1
```

### GitHub Actions
Crea `.github/workflows/update-pricing.yml`:

```yaml
name: Update Azure Pricing Data

on:
  schedule:
    # Esegui ogni giorno alle 2:00 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Permetti esecuzione manuale

jobs:
  update-pricing:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup PowerShell
      uses: actions/setup-powershell@v1
      
    - name: Update pricing data
      run: npm run update-pricing
      
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add src/data/azure-pricing.json
        git commit -m "Auto-update Azure pricing data $(date)" || exit 0
        git push
```

## Struttura Dati Aggiornata

Il nuovo formato del file `azure-pricing.json` include dati reali dall'API:

```json
{
  "lastUpdated": "2025-06-30",
  "source": "Azure Retail Prices API",
  "apiVersion": "2023-01-01-preview",
  "totalRecords": 587,
  "consumptionPlan": {
    "activeUsage": {
      "freeAllowances": {
        "vcpuSeconds": 180000,
        "memoryGibSeconds": 360000,
        "requests": 2000000
      },
      "pricing": {
        "vcpu": {
          "usd": {
            "perSecond": 0.000034,
            "description": "vCPU usage per second"
          }
        },
        "memory": {
          "usd": {
            "perSecond": 0.0000034,
            "perGibPerSecond": 0.0000034,
            "description": "Memory (GiB) usage per second"
          }
        }
      }
    },
    "idleUsage": {
      "pricing": {
        "vcpu": {
          "usd": { "perSecond": 0.000003 }
        },
        "memory": {
          "usd": {
            "perSecond": 0.0000003,
            "perGibPerSecond": 0.0000003
          }
        }
      }
    },
    "requests": {
      "usd": {
        "perMillionRequests": 0.40,
        "freeRequestsPerMonth": 2000000
      }
    }
  },
  "dedicatedPlan": {
    "management": {
      "usd": { "perHour": 0.244 }
    },
    "compute": {
      "vcpu": {
        "usd": { "perHour": 0.216 }
      },
      "memory": {
        "usd": { "perGibPerHour": 0.004978 }
      }
    }
  },
  "regions": { /* 52 regioni Azure con dati reali */ },
  "currencies": { "USD": { "symbol": "$", "name": "US Dollar" } },
  "rawApiData": [ /* Primi 10 record grezzi per reference */ ]
}
```

## Caratteristiche

- ✅ **Dati reali**: Usa l'API ufficiale di Azure Retail Prices
- ✅ **Aggiornamento automatico**: Script npm per facilità d'uso
- ✅ **Multi-piattaforma**: Script PowerShell e Bash
- ✅ **Validation**: Controlla l'integrità dei dati
- ✅ **Logging**: Output dettagliato del processo
- ✅ **Error handling**: Gestione robusta degli errori
- ✅ **Dati strutturati**: Formato compatibile con il calcolatore esistente
- ✅ **Tracciabilità**: Timestamp e metadata per ogni aggiornamento

## Note Importanti

- I prezzi vengono recuperati dall'API ufficiale di Azure in tempo reale
- L'API restituisce tutti i dati in una singola chiamata (587 record attualmente)
- I dati sono organizzati per compatibilità con il sistema di calcolo esistente
- Include dati per tutte le 52 regioni Azure supportate
- La versione semplificata funziona solo con USD per maggiore affidabilità

## Troubleshooting

### Errore "pwsh command not found"
```bash
# macOS
brew install powershell

# Ubuntu
wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y powershell
```

### Errore "jq command not found" (solo per script Bash)
```bash
# macOS
brew install jq

# Ubuntu/Debian  
sudo apt-get install jq
```

### Errore di rete
- Verifica la connessione Internet
- Controlla eventuali proxy o firewall
- L'API Azure potrebbe essere temporaneamente non disponibile

### Prezzi mancanti
- Alcuni metri potrebbero non esistere in tutte le regioni
- Lo script usa valori di fallback ragionevoli
- Controlla i dati grezzi in `rawApiData` per debug
