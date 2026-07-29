import type { Attempt, MistakeEntry, QuizSession, QuizSettings } from '../types/quiz';

const PREFIX = 'quiz:v1:';

export const KEYS = {
  attempts: `${PREFIX}attempts`,
  mistakes: `${PREFIX}mistakes`,
  flags: `${PREFIX}flags`,
  settings: `${PREFIX}settings`,
  active: `${PREFIX}active`,
} as const;

/**
 * Every access is guarded: Safari private mode throws on write, and a full
 * quota throws too. The app degrades to in-memory state rather than crashing.
 */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — this session stays in memory only */
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

export const DEFAULT_SETTINGS: QuizSettings = {
  theme: 'system',
  lastCount: 10,
  lastMode: 'practice',
  lastDifficulty: 'all',
};

export const storage = {
  getSettings(): QuizSettings {
    return { ...DEFAULT_SETTINGS, ...read<Partial<QuizSettings>>(KEYS.settings, {}) };
  },
  setSettings(settings: QuizSettings): void {
    write(KEYS.settings, settings);
  },

  getAttempts(): Attempt[] {
    const attempts = read<Attempt[]>(KEYS.attempts, []);
    return Array.isArray(attempts) ? attempts : [];
  },
  setAttempts(attempts: Attempt[]): void {
    write(KEYS.attempts, attempts);
  },

  getMistakes(): Record<string, MistakeEntry> {
    const mistakes = read<Record<string, MistakeEntry>>(KEYS.mistakes, {});
    return mistakes && typeof mistakes === 'object' ? mistakes : {};
  },
  setMistakes(mistakes: Record<string, MistakeEntry>): void {
    write(KEYS.mistakes, mistakes);
  },

  getFlags(): string[] {
    const flags = read<string[]>(KEYS.flags, []);
    return Array.isArray(flags) ? flags : [];
  },
  setFlags(flags: string[]): void {
    write(KEYS.flags, flags);
  },

  getActiveSession(): QuizSession | null {
    return read<QuizSession | null>(KEYS.active, null);
  },
  setActiveSession(session: QuizSession): void {
    write(KEYS.active, session);
  },
  clearActiveSession(): void {
    remove(KEYS.active);
  },

  /** Everything except settings: the theme is a preference, not progress. */
  clearProgress(): void {
    [KEYS.attempts, KEYS.mistakes, KEYS.flags, KEYS.active].forEach(remove);
  },
};
