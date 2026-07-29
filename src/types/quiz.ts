export type Difficulty = 'easy' | 'medium' | 'hard';

export type EnglishCategory = 'grammar' | 'vocabulary' | 'sentence-completion';

export type QuizMode = 'practice' | 'exam';

/** The shape of every object in the topic JSON files under src/data. */
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  /** Only used by the English topic. */
  category?: EnglishCategory;
}

export type AccentKey = 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'teal' | 'indigo';

export interface Topic {
  id: string;
  name: string;
  blurb: string;
  accent: AccentKey;
  questions: Question[];
  /** True when questions carry a `category`, which unlocks the setup filter. */
  hasCategories: boolean;
}

/** One question inside a running attempt. */
export interface SessionItem {
  questionId: string;
  /** Display index -> original index in `Question.options`. */
  optionOrder: number[];
  /** The display index the user picked, or null if unanswered. */
  selected: number | null;
  flagged: boolean;
  /** Practice mode only: the answer has been confirmed and feedback shown. */
  revealed: boolean;
}

export interface QuizSession {
  id: string;
  topicId: string;
  label: string;
  mode: QuizMode;
  items: SessionItem[];
  currentIndex: number;
  startedAt: number;
  timeLimitSec: number | null;
}

export interface AttemptAnswer {
  questionId: string;
  /** Original index into `Question.options`, or null if skipped. */
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
}

export interface Attempt {
  id: string;
  topicId: string;
  label: string;
  mode: QuizMode;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  total: number;
  correct: number;
  answers: AttemptAnswer[];
}

export interface MistakeEntry {
  questionId: string;
  topicId: string;
  lastWrongAt: number;
  timesWrong: number;
}

export interface QuizSettings {
  theme: 'light' | 'dark' | 'system';
  lastCount: number;
  lastMode: QuizMode;
  lastDifficulty: Difficulty | 'all';
}
