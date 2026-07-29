import type { AccentKey, Difficulty, EnglishCategory, Question, Topic } from '../types/quiz';

import csharp from './csharp.json';
import dotnetcore from './dotnetcore.json';
import english from './english.json';
import entityframework from './entityframework.json';
import oracleforms from './oracleforms.json';
import sqlserver from './sqlserver.json';
import testing from './testing.json';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const CATEGORIES: readonly EnglishCategory[] = ['grammar', 'vocabulary', 'sentence-completion'];

function warn(message: string): void {
  if (import.meta.env.DEV) {
    // Surfaces bad content while editing the JSON files, without breaking the app.
    console.warn(`[topics] ${message}`);
  }
}

/**
 * Guards against a hand-edited JSON file taking the whole app down. Anything
 * that fails is skipped, not thrown.
 */
function isValidQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) return false;
  const q = value as Record<string, unknown>;

  if (typeof q.id !== 'string' || q.id.length === 0) return false;
  if (typeof q.question !== 'string' || q.question.length === 0) return false;
  if (typeof q.explanation !== 'string') return false;
  if (!Array.isArray(q.options) || q.options.length < 2) return false;
  if (!q.options.every((option) => typeof option === 'string')) return false;
  if (typeof q.correctIndex !== 'number' || !Number.isInteger(q.correctIndex)) return false;
  if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return false;
  if (!DIFFICULTIES.includes(q.difficulty as Difficulty)) return false;
  if (!Array.isArray(q.tags) || !q.tags.every((tag) => typeof tag === 'string')) return false;
  if (q.category !== undefined && !CATEGORIES.includes(q.category as EnglishCategory)) return false;

  return true;
}

interface TopicInput {
  id: string;
  name: string;
  blurb: string;
  accent: AccentKey;
  raw: unknown;
}

function defineTopic({ id, name, blurb, accent, raw }: TopicInput): Topic {
  const entries = Array.isArray(raw) ? raw : [];
  if (!Array.isArray(raw)) warn(`${id}: JSON root is not an array; treating as empty.`);

  const questions: Question[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!isValidQuestion(entry)) {
      warn(`${id}: skipped a malformed question.`);
      continue;
    }
    if (seen.has(entry.id)) {
      warn(`${id}: skipped duplicate question id "${entry.id}".`);
      continue;
    }
    seen.add(entry.id);
    questions.push(entry);
  }

  return {
    id,
    name,
    blurb,
    accent,
    questions,
    hasCategories: questions.some((question) => question.category !== undefined),
  };
}

/**
 * The single registry. To add a topic: drop a JSON file in this folder, import
 * it above, and add one entry here. Nothing else in the app lists topics.
 */
export const TOPICS: Topic[] = [
  defineTopic({
    id: 'sqlserver',
    name: 'SQL Server',
    blurb: 'Indexes, joins, isolation levels, T-SQL',
    accent: 'sky',
    raw: sqlserver,
  }),
  defineTopic({
    id: 'oracleforms',
    name: 'Oracle Forms',
    blurb: 'Blocks, triggers, built-ins, LOVs',
    accent: 'amber',
    raw: oracleforms,
  }),
  defineTopic({
    id: 'dotnetcore',
    name: '.NET Core',
    blurb: 'Hosting, middleware, DI, configuration',
    accent: 'violet',
    raw: dotnetcore,
  }),
  defineTopic({
    id: 'csharp',
    name: 'C#',
    blurb: 'Types, async, LINQ, the language itself',
    accent: 'indigo',
    raw: csharp,
  }),
  defineTopic({
    id: 'entityframework',
    name: 'Entity Framework',
    blurb: 'DbContext, loading, migrations, tracking',
    accent: 'emerald',
    raw: entityframework,
  }),
  defineTopic({
    id: 'testing',
    name: 'Testing',
    blurb: 'Unit tests, doubles, TDD, coverage',
    accent: 'teal',
    raw: testing,
  }),
  defineTopic({
    id: 'english',
    name: 'English',
    blurb: 'Grammar, vocabulary, sentence completion',
    accent: 'rose',
    raw: english,
  }),
];

/** Pseudo-topic id used by the "retake my mistakes" session. */
export const MISTAKES_TOPIC_ID = '__mistakes__';

const questionIndex = new Map<string, { question: Question; topic: Topic }>();

for (const topic of TOPICS) {
  for (const question of topic.questions) {
    if (questionIndex.has(question.id)) {
      warn(`duplicate question id "${question.id}" across topics; keeping the first.`);
      continue;
    }
    questionIndex.set(question.id, { question, topic });
  }
}

export function getTopic(topicId: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === topicId);
}

export function getQuestion(questionId: string): Question | undefined {
  return questionIndex.get(questionId)?.question;
}

export function getTopicOfQuestion(questionId: string): Topic | undefined {
  return questionIndex.get(questionId)?.topic;
}
