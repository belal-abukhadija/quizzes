import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Attempt, MistakeEntry } from '../types/quiz';
import { storage } from '../lib/storage';
import { getTopicOfQuestion } from '../data/topics';

/** Keeps localStorage bounded on a device used for months. */
const MAX_ATTEMPTS = 200;

interface ProgressValue {
  attempts: Attempt[];
  mistakes: MistakeEntry[];
  flags: string[];
  isFlagged: (questionId: string) => boolean;
  setFlag: (questionId: string, flagged: boolean) => void;
  clearFlags: () => void;
  recordAttempt: (attempt: Attempt) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => storage.getAttempts());
  const [mistakeMap, setMistakeMap] = useState<Record<string, MistakeEntry>>(() =>
    storage.getMistakes(),
  );
  const [flags, setFlags] = useState<string[]>(() => storage.getFlags());

  const flagSet = useMemo(() => new Set(flags), [flags]);

  const isFlagged = useCallback((questionId: string) => flagSet.has(questionId), [flagSet]);

  const setFlag = useCallback((questionId: string, flagged: boolean) => {
    setFlags((current) => {
      const has = current.includes(questionId);
      if (has === flagged) return current;
      const next = flagged ? [...current, questionId] : current.filter((id) => id !== questionId);
      storage.setFlags(next);
      return next;
    });
  }, []);

  const clearFlags = useCallback(() => {
    setFlags([]);
    storage.setFlags([]);
  }, []);

  /**
   * Appends the attempt and reconciles the mistake list: wrong answers are added
   * or bumped, correct answers remove the question entirely.
   */
  const recordAttempt = useCallback((attempt: Attempt) => {
    setAttempts((current) => {
      const next = [...current, attempt].slice(-MAX_ATTEMPTS);
      storage.setAttempts(next);
      return next;
    });

    setMistakeMap((current) => {
      const next = { ...current };
      for (const answer of attempt.answers) {
        if (answer.correct) {
          delete next[answer.questionId];
          continue;
        }
        const existing = next[answer.questionId];
        next[answer.questionId] = {
          questionId: answer.questionId,
          topicId: getTopicOfQuestion(answer.questionId)?.id ?? attempt.topicId,
          lastWrongAt: attempt.finishedAt,
          timesWrong: (existing?.timesWrong ?? 0) + 1,
        };
      }
      storage.setMistakes(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    storage.clearProgress();
    setAttempts([]);
    setMistakeMap({});
    setFlags([]);
  }, []);

  const mistakes = useMemo(
    () => Object.values(mistakeMap).sort((a, b) => b.lastWrongAt - a.lastWrongAt),
    [mistakeMap],
  );

  const value = useMemo<ProgressValue>(
    () => ({
      attempts,
      mistakes,
      flags,
      isFlagged,
      setFlag,
      clearFlags,
      recordAttempt,
      resetAll,
    }),
    [attempts, mistakes, flags, isFlagged, setFlag, clearFlags, recordAttempt, resetAll],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
