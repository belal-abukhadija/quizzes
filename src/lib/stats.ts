import type { Attempt } from '../types/quiz';
import type { QuestionLookup } from './session';
import { percentage } from './session';

export interface TopicSummary {
  attempts: number;
  answered: number;
  correct: number;
  accuracy: number;
  bestPct: number | null;
  lastAt: number | null;
}

const EMPTY: TopicSummary = {
  attempts: 0,
  answered: 0,
  correct: 0,
  accuracy: 0,
  bestPct: null,
  lastAt: null,
};

export function emptySummary(): TopicSummary {
  return { ...EMPTY };
}

/** Rolls the attempt history up per topic id. */
export function summariseByTopic(attempts: Attempt[]): Record<string, TopicSummary> {
  const result: Record<string, TopicSummary> = {};

  for (const attempt of attempts) {
    const summary = result[attempt.topicId] ?? emptySummary();
    const pct = percentage(attempt.correct, attempt.total);

    summary.attempts += 1;
    summary.answered += attempt.total;
    summary.correct += attempt.correct;
    summary.bestPct = summary.bestPct === null ? pct : Math.max(summary.bestPct, pct);
    summary.lastAt = summary.lastAt === null ? attempt.finishedAt : Math.max(summary.lastAt, attempt.finishedAt);

    result[attempt.topicId] = summary;
  }

  for (const summary of Object.values(result)) {
    summary.accuracy = percentage(summary.correct, summary.answered);
  }

  return result;
}

export interface TagSummary {
  tag: string;
  total: number;
  correct: number;
  accuracy: number;
}

/**
 * Weakest tags across every attempt. Tags seen fewer than `minSamples` times are
 * excluded, because one wrong answer does not make a weakness.
 */
export function weakestTags(
  attempts: Attempt[],
  getQuestion: QuestionLookup,
  { limit = 6, minSamples = 2 }: { limit?: number; minSamples?: number } = {},
): TagSummary[] {
  const totals = new Map<string, { total: number; correct: number }>();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const question = getQuestion(answer.questionId);
      if (!question) continue;
      for (const tag of question.tags) {
        const entry = totals.get(tag) ?? { total: 0, correct: 0 };
        entry.total += 1;
        if (answer.correct) entry.correct += 1;
        totals.set(tag, entry);
      }
    }
  }

  return [...totals.entries()]
    .filter(([, entry]) => entry.total >= minSamples)
    .map(([tag, entry]) => ({
      tag,
      total: entry.total,
      correct: entry.correct,
      accuracy: percentage(entry.correct, entry.total),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, limit);
}
