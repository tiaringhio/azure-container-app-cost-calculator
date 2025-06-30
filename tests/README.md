# Test Suite - Azure Container Apps Cost Calculator

Questa cartella contiene la suite completa di test per validare il sistema di pricing di Azure Container Apps.

## Struttura dei Test

### 📊 `pricing-data.test.ts`
Test per la struttura e validità dei dati di pricing:
- Verifica struttura JSON
- Valida prezzi USD critici (Memory: 0.000004, vCPU: 0.000034)
- Controlla consistenza tra specifiche e raw data
- Valida conversioni valute
- Testa dati regioni Azure

### 🔧 `pricing-functions.test.ts`
Test per le funzioni di conversione e pricing dinamico:
- Funzioni di conversione valuta
- Pricing dinamico per regione/valuta
- Gestione errori (regioni/valute sconosciute)
- Consistenza cross-currency
- Scenari di costo realistici

### 🌐 `integration.test.ts`
Test di integrazione end-to-end:
- Sistema completo di pricing
- Supporto regioni e valute globali
- Calcoli costi mensili realistici
- Allineamento prezzi portale Azure
- Free tier allowances
- Qualità e completezza dati

### 🔄 `regression.test.ts`
Test di regressione per prevenire rotture:
- Compatibilità backwards
- Eliminazione prezzi legacy (0.000003)
- Mantenimento supporto valute/regioni originali
- Consistenza calcoli costi
- Integrità dati
- Compatibilità UI

## Come Eseguire i Test

```bash
# Esegui tutti i test
npm test

# Esegui test una volta (CI/CD)
npm run test:run

# Esegui test con UI interattiva
npm run test:ui

# Esegui test con coverage
npm run test:coverage
```

## Test Critici

### ✅ Prezzi Corretti
- Memory: **0.000004 USD/GiB/sec** (non 0.000003)
- vCPU: **0.000034 USD/vCPU/sec**

### ✅ Conversioni Valute
- USD base con rate 1.0
- modernConversion per valute principali
- Consistenza cross-currency

### ✅ Compatibilità
- Struttura dati backwards compatible
- Nessun prezzo legacy
- Support regioni/valute complete

## Continuous Integration

I test sono progettati per essere eseguiti in CI/CD e fallire se:
- I prezzi critici sono incorretti
- La struttura dati è rotta
- Le conversioni valute sono inconsistenti
- I calcoli costi sono irrealistici

## Aggiungere Nuovi Test

Quando aggiungi nuove funzionalità:
1. Aggiungi test unitari in `pricing-functions.test.ts`
2. Aggiungi test di integrazione in `integration.test.ts`
3. Aggiungi test di regressione in `regression.test.ts`
4. Aggiorna questo README

## Debugging Test

Se un test fallisce:
1. Controlla i prezzi nel file `src/data/azure-pricing.json`
2. Verifica che le conversioni valute siano aggiornate
3. Controlla che la struttura dati sia consistente
4. Usa `npm run test:ui` per debugging interattivo
