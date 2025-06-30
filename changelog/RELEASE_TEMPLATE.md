# Release Template

Usa questo template per documentare future release nel CHANGELOG.md

## [Unreleased]

### ✨ Added
- 

### 🔧 Changed
- 

### 🐛 Fixed
- 

### 🗑️ Deprecated
- 

### ❌ Removed
- 

### 🔒 Security
- 

---

## Template per Release

```markdown
## [X.Y.Z] - YYYY-MM-DD

### ✨ Added
- Nuove features backwards-compatible

### 🔧 Changed  
- Modifiche a features esistenti

### 🐛 Fixed
- Bug fixes e correzioni

### 🗑️ Deprecated
- Features che saranno rimosse in futuro

### ❌ Removed
- Features rimosse (BREAKING CHANGE se non deprecated)

### 🔒 Security
- Correzioni vulnerabilità
```

## Linee Guida Versioning

### PATCH (0.0.X)
- Bug fixes
- Correzioni typo
- Aggiornamenti dipendenze minori
- Miglioramenti performance senza breaking changes
- Correzioni prezzi/dati

### MINOR (0.X.0)  
- Nuove features backwards-compatible
- Aggiunta nuove regioni/valute
- Nuovi preset/configurazioni
- Miglioramenti UI non-breaking
- Nuove funzionalità opzionali

### MAJOR (X.0.0)
- Breaking changes API
- Rimozione features deprecated
- Restructuring dati
- Cambio architettura
- Requisiti minimi diversi

## Pre-Release Tags

- `alpha`: Pre-release early development
- `beta`: Feature-complete, testing phase  
- `rc`: Release candidate, final testing

Esempi:
- `2.0.0-alpha.1`
- `2.0.0-beta.2`
- `2.0.0-rc.1`
