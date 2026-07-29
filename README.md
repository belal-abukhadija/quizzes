# Exam Prep

A static, client-side quiz app. No backend, no accounts — every attempt, mistake,
flag, and setting lives in this browser's `localStorage`.

```bash
npm install
```

| Command         | Does                                              |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Dev server                                        |
| `npm run build` | Type-checks and builds the static site into `dist` |
| `npm run preview` | Serves the built `dist` locally                 |
| `npm test`      | Runs the quiz-engine tests                        |

## Editing questions

One JSON file per topic in `src/data/`. Each entry:

```json
{
  "id": "sql-001",
  "question": "…",
  "options": ["…", "…", "…", "…"],
  "correctIndex": 0,
  "explanation": "One or two sentences explaining why.",
  "difficulty": "easy",
  "tags": ["indexes"]
}
```

- `id` must be unique across every topic, not just within its file.
- `correctIndex` is the index into `options` **before** shuffling. The app
  reshuffles options on every attempt and maps your answer back, so the order in
  the file does not matter.
- Use four options to keep the `1`–`4` keyboard shortcuts fully usable.
- English questions may include `____` for a blank, and take an extra
  `"category"` of `"grammar"`, `"vocabulary"`, or `"sentence-completion"`.

Malformed entries are skipped rather than crashing the app, with a warning in the
dev console.

## Adding a topic

Two steps, both in `src/data/`:

1. Add `yourtopic.json`.
2. Add one entry to `TOPICS` in `topics.ts`:

```ts
defineTopic({
  id: 'yourtopic',
  name: 'Your Topic',
  blurb: 'Short description for the card',
  accent: 'sky',
  raw: yourtopic,
}),
```

Nothing else in the app enumerates topics. Accent keys are listed in
`src/lib/accents.ts`.
