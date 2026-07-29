import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { QuizSettings } from '../types/quiz';
import { storage } from '../lib/storage';

interface SettingsValue {
  settings: QuizSettings;
  update: (patch: Partial<QuizSettings>) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<QuizSettings>(() => storage.getSettings());
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Only relevant while the theme is set to "system".
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const isDark = settings.theme === 'system' ? systemDark : settings.theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const update = useCallback((patch: Partial<QuizSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      storage.setSettings(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    update({ theme: isDark ? 'light' : 'dark' });
  }, [isDark, update]);

  const value = useMemo<SettingsValue>(
    () => ({ settings, update, isDark, toggleTheme }),
    [settings, update, isDark, toggleTheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
