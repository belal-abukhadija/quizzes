import type {
  Attempt,
  AttemptAnswer,
  Difficulty,
  EnglishCategory,
  Question,
  QuizMode,
  QuizSession,
  SessionItem,
} from '../types/quiz';
import { createId } from './id';
import { shuffle, type Random } from './shuffle';

export interface PoolFilters {
  difficulty: Difficulty | 'all';
  category: EnglishCategory | 'all';
}

export interface BuildSessionOptions extends PoolFilters {
  topicId: string;
  label: string;
  mode: QuizMode;
  count: number;
  timeLimitSec: number | null;
  pool: readonly Question[];
  random?: Random;
}

export function filterPool(
  pool: readonly Question[],
  { difficulty, category }: PoolFilters,
): Question[] {
  return pool.filter((question) => {
    if (difficulty !== 'all' && question.difficulty !== difficulty) return false;
    if (category !== 'all' && question.category !== category) return false;
    return true;
  });
}

/**
 * Shuffles the pool, takes `count`, then shuffles each question's options.
 * `optionOrder` is persisted so a resumed session renders identically.
 */
export function buildSession(options: BuildSessionOptions): QuizSession {
  const { topicId, label, mode, count, timeLimitSec, pool, random = Math.random } = options;

  const filtered = filterPool(pool, options);
  const picked = shuffle(filtered, random).slice(0, Math.max(1, count));

  const items: SessionItem[] = picked.map((question) => ({
    questionId: question.id,
    optionOrder: shuffle(
      question.options.map((_, index) => index),
      random,
    ),
    selected: null,
    flagged: false,
    revealed: false,
  }));

  return {
    id: createId('att'),
    topicId,
    label,
    mode,
    items,
    currentIndex: 0,
    startedAt: Date.now(),
    timeLimitSec,
  };
}

/** Maps a display selection back to the original option index. */
export function toOriginalIndex(item: SessionItem): number | null {
  if (item.selected === null) return null;
  const original = item.optionOrder[item.selected];
  return original === undefined ? null : original;
}

export function isItemCorrect(item: SessionItem, question: Question): boolean {
  return toOriginalIndex(item) === question.correctIndex;
}

export type QuestionLookup = (id: string) => Question | undefined;

/**
 * Grades a session into a persistable attempt. Items whose question no longer
 * resolves (the JSON file was replaced) are dropped rather than counted.
 */
export function gradeSession(
  session: QuizSession,
  getQuestion: QuestionLookup,
  finishedAt: number = Date.now(),
): Attempt {
  const answers: AttemptAnswer[] = [];

  for (const item of session.items) {
    const question = getQuestion(item.questionId);
    if (!question) continue;
    const selectedIndex = toOriginalIndex(item);
    answers.push({
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      correct: selectedIndex === question.correctIndex,
    });
  }

  return {
    id: session.id,
    topicId: session.topicId,
    label: session.label,
    mode: session.mode,
    startedAt: session.startedAt,
    finishedAt,
    durationMs: Math.max(0, finishedAt - session.startedAt),
    total: answers.length,
    correct: answers.filter((answer) => answer.correct).length,
    answers,
  };
}

export function answeredCount(session: QuizSession): number {
  return session.items.filter((item) => item.selected !== null).length;
}

export function deadlineOf(session: QuizSession): number | null {
  return session.timeLimitSec === null ? null : session.startedAt + session.timeLimitSec * 1000;
}

export function percentage(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
