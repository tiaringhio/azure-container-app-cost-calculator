import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface UseThemeReturn {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  // Ottieni il tema dal localStorage o usa 'system' come default
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  // Determina il tema effettivo basato sulle preferenze di sistema
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Calcola il tema attuale
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;

  // Applica il tema al documento
  const applyTheme = useCallback((appliedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (appliedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Funzione per cambiare il tema
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // Funzione per alternare tra light e dark (ignora system)
  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [actualTheme, setTheme]);

  // Effetto per applicare il tema quando cambia
  useEffect(() => {
    applyTheme(actualTheme);
  }, [actualTheme, applyTheme]);

  // Effetto per ascoltare i cambiamenti delle preferenze di sistema
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme, getSystemTheme]);

  // Applica il tema iniziale
  useEffect(() => {
    applyTheme(actualTheme);
  }, []);

  return {
    theme,
    actualTheme,
    setTheme,
    toggleTheme
  };
};
