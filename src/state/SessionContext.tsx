import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Attempt, QuizSession, SessionItem } from '../types/quiz';
import { storage } from '../lib/storage';
import { getQuestion } from '../data/topics';
import { gradeSession } from '../lib/session';
import { useProgress } from './ProgressContext';

interface SessionValue {
  session: QuizSession | null;
  start: (session: QuizSession) => void;
  update: (updater: (session: QuizSession) => QuizSession) => void;
  /** Grades, stores the attempt, clears the active session. */
  finish: () => Attempt | null;
  discard: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** An option order must be a permutation of the question's option indices. */
function reviveOptionOrder(item: SessionItem, optionCount: number): number[] {
  const order = Array.isArray(item.optionOrder) ? item.optionOrder : [];
  const valid =
    order.length === optionCount &&
    new Set(order).size === optionCount &&
    order.every((index) => Number.isInteger(index) && index >= 0 && index < optionCount);
  return valid ? order : Array.from({ length: optionCount }, (_, index) => index);
}

/**
 * Restores a session saved before a refresh. Questions that no longer exist
 * (because a JSON file was replaced) are dropped; if none survive, the session
 * is discarded rather than shown as an empty quiz.
 */
function reviveSession(raw: QuizSession | null): QuizSession | null {
  if (!raw || typeof raw.id !== 'string' || !Array.isArray(raw.items)) return null;

  const items: SessionItem[] = [];
  for (const item of raw.items) {
    if (typeof item?.questionId !== 'string') continue;
    const question = getQuestion(item.questionId);
    if (!question) continue;
    const optionOrder = reviveOptionOrder(item, question.options.length);
    const selected =
      typeof item.selected === 'number' && item.selected >= 0 && item.selected < optionOrder.length
        ? item.selected
        : null;
    items.push({
      questionId: question.id,
      optionOrder,
      selected,
      flagged: item.flagged === true,
      revealed: item.revealed === true,
    });
  }

  if (items.length === 0) return null;

  // Normalise the fields a timer or the grader depends on, so corrupted storage
  // cannot produce a NaN countdown.
  return {
    ...raw,
    items,
    mode: raw.mode === 'practice' ? 'practice' : 'exam',
    currentIndex: clamp(raw.currentIndex, 0, items.length - 1),
    startedAt: Number.isFinite(raw.startedAt) ? raw.startedAt : Date.now(),
    timeLimitSec:
      typeof raw.timeLimitSec === 'number' && Number.isFinite(raw.timeLimitSec) && raw.timeLimitSec > 0
        ? raw.timeLimitSec
        : null,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { recordAttempt } = useProgress();
  const [session, setSession] = useState<QuizSession | null>(() => {
    const revived = reviveSession(storage.getActiveSession());
    if (!revived) storage.clearActiveSession();
    return revived;
  });

  const start = useCallback((next: QuizSession) => {
    storage.setActiveSession(next);
    setSession(next);
  }, []);

  const update = useCallback((updater: (session: QuizSession) => QuizSession) => {
    setSession((current) => {
      if (!current) return current;
      const next = updater(current);
      storage.setActiveSession(next);
      return next;
    });
  }, []);

  const discard = useCallback(() => {
    storage.clearActiveSession();
    setSession(null);
  }, []);

  const finish = useCallback((): Attempt | null => {
    if (!session) return null;
    const attempt = gradeSession(session, getQuestion);
    recordAttempt(attempt);
    storage.clearActiveSession();
    setSession(null);
    return attempt;
  }, [session, recordAttempt]);

  const value = useMemo<SessionValue>(
    () => ({ session, start, update, finish, discard }),
    [session, start, update, finish, discard],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
