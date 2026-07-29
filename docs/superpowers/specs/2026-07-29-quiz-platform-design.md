# Quiz Platform — Design

Date: 2026-07-29
Status: Approved

## Purpose

A static, client-side quiz app for personal exam preparation across seven
technical and language topics. No backend, no auth, no database. Builds to a
static `dist/` folder that can be dropped onto Netlify. Used mostly on a phone.

## Stack

React 18 + TypeScript + Vite, Tailwind CSS 3.4, React Router 6. Vitest for the
pure quiz-engine logic. No state-management library — React Context is enough.

## Content model

`src/types/quiz.ts` defines the shared shape:

```ts
interface Question {
  id: string;
  question: string;          // may contain `____` for English blanks
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  category?: 'grammar' | 'vocabulary' | 'sentence-completion';
}
```

`category` is optional and only used by the English topic.

Questions live in one JSON file per topic under `src/data/`. Adding a topic
requires exactly one change: a new JSON file plus one `defineTopic(...)` entry in
`src/data/topics.ts`. Nothing else in the app enumerates topics.

`defineTopic` validates every question as it loads (required fields present,
`correctIndex` within `options` bounds, at least two options) and drops invalid
entries rather than throwing, so a hand-edited JSON file can never white-screen
the app. It also contributes to a global `questionById` map, which is what makes
cross-topic features (mistakes, stats by tag) possible.

Each file is seeded with 10 sample questions, to be replaced with full sets
later.

## Storage

`src/lib/storage.ts` is the only module that touches `localStorage`. All keys are
namespaced `quiz:v1:`. Every read and write is wrapped in try/catch so a full
quota or private-browsing mode degrades to in-memory state instead of throwing.

| Key        | Contents                                          |
| ---------- | ------------------------------------------------- |
| `attempts` | Attempt history, including per-question outcomes   |
| `mistakes` | Wrong-answer set keyed by question id              |
| `flags`    | Flagged question ids                               |
| `settings` | Theme plus last-used quiz-setup defaults           |
| `active`   | The single in-progress quiz session                |

Decisions:

- **Mistakes clear on correct.** Answering a question correctly removes it from
  the mistakes set, so `/review` reads as a live list of what is still unknown.
- **Mid-quiz refresh resumes.** `active` is rewritten on every answer, flag, and
  navigation. Because each session item stores its own `optionOrder`, a resumed
  quiz renders the identical question order and option order.
- **Elapsed time is wall-clock** from `startedAt`, not accumulated focus time.
  Closing the tab does not pause an exam.

## Quiz engine

`src/lib/session.ts` contains no React and no storage access, which makes it
directly testable:

- `filterPool(pool, { difficulty, category })` — narrows the question pool.
- `buildSession(opts)` — filters, Fisher-Yates shuffles the pool, takes `count`,
  then shuffles each question's options while recording
  `optionOrder: number[]` (display index → original index).
- `gradeSession(session, getQuestion)` — maps display indices back through
  `optionOrder` and produces the attempt record and results breakdown.

Randomness is injectable (`random?: () => number`) so tests are deterministic.

## Screens

| Route                 | Screen                                                     |
| --------------------- | ---------------------------------------------------------- |
| `/`                   | Topic grid: name, question count, best score, last attempt |
| `/topic/:topicId`     | Setup: count, difficulty, category (English), mode, timer  |
| `/quiz`               | One question at a time, progress bar, flag, prev/next      |
| `/results/:attemptId` | Score, percentage, duration, full per-question breakdown   |
| `/review`             | "My mistakes" across all topics, with retake-only button   |
| `/stats`              | Per-topic accuracy, attempt history, weakest tags          |
| `/settings`           | Theme, defaults, "Reset all progress"                      |

`/quiz` reads the active session from storage rather than from route state, which
is what makes refresh-resume work. No active session redirects home.

`BrowserRouter`, with `public/_redirects` (`/* /index.html 200`) and
`netlify.toml` (build command, publish dir) so deep links resolve.

## Modes

- **Practice** — confirming an answer immediately reveals correctness and the
  explanation.
- **Exam** — no feedback until submission. Timer is off by default; when enabled
  it prefills 1.5 minutes per question, is editable, and auto-submits at zero.

## Behaviour details

- Question order and option order are reshuffled on every attempt.
- Keyboard: `1`–`4` select an option, `Enter` confirms or advances. Shortcuts are
  ignored while focus is in a form field.
- English blanks: `QuestionText` splits on `____` and renders a visible ruled gap.
- Theme is applied by an inline script before first paint, so there is no
  light-mode flash on a dark-mode device.

## Edge cases

- Empty topic file → card marked empty, setup shows an empty state, no start.
- Requested count exceeds available after filtering → the available count is
  shown live in setup and the session is silently capped.
- Refresh mid-quiz → resumes.
- A question id in `active`, `attempts`, or `mistakes` that no longer resolves
  (because a JSON file was replaced) is skipped rather than crashing. If an
  active session loses all of its questions it is discarded.

## Layout and visual direction

Mobile-first, a single column capped around 640px. System font stack, so no
external font requests. Neutral slate palette with one accent per topic, drawn
from a static map so Tailwind's purge never strips a class. Flat cards, generous
spacing, no dashboard chrome — closer to a reading app than an analytics tool.

## Out of scope

Deployment steps, CI configuration, backend sync, accounts.
