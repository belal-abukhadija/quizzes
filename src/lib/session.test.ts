import { describe, expect, it } from 'vitest';
import type { Question, QuizSession, SessionItem } from '../types/quiz';
import { buildSession, filterPool, gradeSession, percentage, toOriginalIndex } from './session';
import { shuffle } from './shuffle';

function question(overrides: Partial<Question> & { id: string }): Question {
  const base: Question = {
    id: overrides.id,
    question: 'Q?',
    options: ['a', 'b', 'c', 'd'],
    correctIndex: 0,
    explanation: 'because',
    difficulty: 'easy',
    tags: ['t'],
  };
  return Object.assign(base, overrides);
}

const POOL: Question[] = [
  question({ id: 'q1', difficulty: 'easy' }),
  question({ id: 'q2', difficulty: 'medium' }),
  question({ id: 'q3', difficulty: 'hard', category: 'grammar' }),
  question({ id: 'q4', difficulty: 'easy', category: 'vocabulary' }),
];

const lookup = (id: string) => POOL.find((entry) => entry.id === id);

/** Deterministic stand-in for Math.random. */
function seeded(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('shuffle', () => {
  it('returns a permutation without touching the input', () => {
    const input = [0, 1, 2, 3, 4];
    const result = shuffle(input, seeded([0.1, 0.9, 0.4, 0.6]));
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual(input);
    expect(input).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('filterPool', () => {
  it('filters by difficulty', () => {
    const result = filterPool(POOL, { difficulty: 'easy', category: 'all' });
    expect(result.map((entry) => entry.id)).toEqual(['q1', 'q4']);
  });

  it('filters by category', () => {
    const result = filterPool(POOL, { difficulty: 'all', category: 'grammar' });
    expect(result.map((entry) => entry.id)).toEqual(['q3']);
  });

  it('combines both filters', () => {
    const result = filterPool(POOL, { difficulty: 'easy', category: 'vocabulary' });
    expect(result.map((entry) => entry.id)).toEqual(['q4']);
  });
});

describe('buildSession', () => {
  const base = {
    topicId: 'demo',
    label: 'Demo',
    mode: 'practice' as const,
    difficulty: 'all' as const,
    category: 'all' as const,
    timeLimitSec: null,
    pool: POOL,
    random: seeded([0.2, 0.7, 0.5, 0.9, 0.1]),
  };

  it('takes the requested number of questions', () => {
    expect(buildSession({ ...base, count: 2 }).items).toHaveLength(2);
  });

  it('caps at the number available when more are requested', () => {
    expect(buildSession({ ...base, count: 99 }).items).toHaveLength(POOL.length);
  });

  it('respects filters when picking', () => {
    const session = buildSession({ ...base, count: 10, difficulty: 'easy' });
    expect(session.items.map((item) => item.questionId).sort()).toEqual(['q1', 'q4']);
  });

  it('gives every item a complete permutation of its option indices', () => {
    const session = buildSession({ ...base, count: 4 });
    for (const item of session.items) {
      expect([...item.optionOrder].sort()).toEqual([0, 1, 2, 3]);
    }
  });

  it('starts unanswered, unflagged, and unrevealed', () => {
    const session = buildSession({ ...base, count: 4 });
    for (const item of session.items) {
      expect(item.selected).toBeNull();
      expect(item.flagged).toBe(false);
      expect(item.revealed).toBe(false);
    }
  });
});

function item(overrides: Partial<SessionItem> & { questionId: string }): SessionItem {
  const base: SessionItem = {
    questionId: overrides.questionId,
    optionOrder: [0, 1, 2, 3],
    selected: null,
    flagged: false,
    revealed: false,
  };
  return Object.assign(base, overrides);
}

function session(items: SessionItem[]): QuizSession {
  return {
    id: 'att_test',
    topicId: 'demo',
    label: 'Demo',
    mode: 'exam',
    items,
    currentIndex: 0,
    startedAt: 1_000,
    timeLimitSec: null,
  };
}

describe('toOriginalIndex', () => {
  it('maps the displayed choice back through the shuffled order', () => {
    // Displayed position 0 is really option 2.
    const entry = item({ questionId: 'q1', optionOrder: [2, 0, 3, 1], selected: 0 });
    expect(toOriginalIndex(entry)).toBe(2);
  });

  it('returns null when nothing was selected', () => {
    expect(toOriginalIndex(item({ questionId: 'q1' }))).toBeNull();
  });
});

describe('gradeSession', () => {
  it('marks a shuffled answer correct when it maps to correctIndex', () => {
    // q1's correct option is 0, which is shown in display position 1.
    const graded = gradeSession(
      session([item({ questionId: 'q1', optionOrder: [3, 0, 1, 2], selected: 1 })]),
      lookup,
      2_000,
    );
    expect(graded.correct).toBe(1);
    expect(graded.answers[0].selectedIndex).toBe(0);
  });

  it('marks a shuffled answer wrong when it does not', () => {
    const graded = gradeSession(
      session([item({ questionId: 'q1', optionOrder: [3, 0, 1, 2], selected: 0 })]),
      lookup,
      2_000,
    );
    expect(graded.correct).toBe(0);
    expect(graded.answers[0].selectedIndex).toBe(3);
  });

  it('counts an unanswered question as wrong, not as absent', () => {
    const graded = gradeSession(session([item({ questionId: 'q1' })]), lookup, 2_000);
    expect(graded.total).toBe(1);
    expect(graded.correct).toBe(0);
    expect(graded.answers[0].selectedIndex).toBeNull();
  });

  it('drops items whose question no longer exists', () => {
    const graded = gradeSession(
      session([item({ questionId: 'gone' }), item({ questionId: 'q1', selected: 0 })]),
      lookup,
      2_000,
    );
    expect(graded.total).toBe(1);
    expect(graded.answers.map((answer) => answer.questionId)).toEqual(['q1']);
  });

  it('records the elapsed duration', () => {
    const graded = gradeSession(session([item({ questionId: 'q1' })]), lookup, 4_500);
    expect(graded.durationMs).toBe(3_500);
  });
});

describe('percentage', () => {
  it('rounds to the nearest whole percent', () => {
    expect(percentage(2, 3)).toBe(67);
  });

  it('returns 0 rather than NaN for an empty attempt', () => {
    expect(percentage(0, 0)).toBe(0);
  });
});
