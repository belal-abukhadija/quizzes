import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Difficulty, EnglishCategory, QuizMode } from '../types/quiz';
import { getTopic } from '../data/topics';
import { buildSession, filterPool } from '../lib/session';
import { useSession } from '../state/SessionContext';
import { useSettings } from '../state/SettingsContext';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { SegmentedControl, type SegmentOption } from '../components/ui/SegmentedControl';
import { pluralise } from '../lib/format';

const DIFFICULTY_OPTIONS: SegmentOption<Difficulty | 'all'>[] = [
  { value: 'all', label: 'Any' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const CATEGORY_OPTIONS: SegmentOption<EnglishCategory | 'all'>[] = [
  { value: 'all', label: 'All' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'sentence-completion', label: 'Sentence completion' },
];

const MODE_OPTIONS: SegmentOption<QuizMode>[] = [
  { value: 'practice', label: 'Practice' },
  { value: 'exam', label: 'Exam' },
];

const COUNT_PRESETS = [5, 10, 15, 20, 30, 50];

/** 1.5 minutes per question, rounded up. */
function suggestMinutes(count: number): number {
  return Math.max(1, Math.ceil(count * 1.5));
}

export function SetupPage() {
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { start } = useSession();
  const { settings, update: updateSettings } = useSettings();

  const topic = getTopic(topicId);

  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>(settings.lastDifficulty);
  const [category, setCategory] = useState<EnglishCategory | 'all'>('all');
  const [mode, setMode] = useState<QuizMode>(settings.lastMode);
  const [count, setCount] = useState<number>(settings.lastCount);
  const [timerOn, setTimerOn] = useState(false);
  const [minutes, setMinutes] = useState<number>(() => suggestMinutes(settings.lastCount));
  const [minutesTouched, setMinutesTouched] = useState(false);

  const available = useMemo(() => {
    if (!topic) return 0;
    return filterPool(topic.questions, { difficulty, category }).length;
  }, [topic, difficulty, category]);

  // Never request more than exists.
  const effectiveCount = Math.min(count, available);

  const countOptions = useMemo<SegmentOption<number>[]>(() => {
    const presets = COUNT_PRESETS.filter((preset) => preset < available);
    return [
      ...presets.map((preset) => ({ value: preset, label: String(preset) })),
      { value: available, label: `All (${available})` },
    ];
  }, [available]);

  function changeCount(next: number) {
    setCount(next);
    if (!minutesTouched) setMinutes(suggestMinutes(Math.min(next, available)));
  }

  function handleStart() {
    if (!topic || available === 0) return;

    updateSettings({ lastCount: count, lastMode: mode, lastDifficulty: difficulty });

    start(
      buildSession({
        topicId: topic.id,
        label: topic.name,
        mode,
        count: effectiveCount,
        difficulty,
        category,
        timeLimitSec: mode === 'exam' && timerOn ? minutes * 60 : null,
        pool: topic.questions,
      }),
    );
    navigate('/quiz');
  }

  if (!topic) {
    return (
      <EmptyState
        title="Topic not found"
        description="It may have been renamed or removed from the topics index."
        action={
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to topics
          </Button>
        }
      />
    );
  }

  if (topic.questions.length === 0) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title={`No questions in ${topic.name} yet`}
          description={`Add questions to src/data/${topic.id}.json and they will show up here.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <BackLink />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{topic.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {pluralise(available, 'question')} match your filters
          </p>
        </div>
      </div>

      <Field label="Difficulty">
        <SegmentedControl
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={setDifficulty}
        />
      </Field>

      {topic.hasCategories && (
        <Field label="Category">
          <SegmentedControl
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
        </Field>
      )}

      {available > 0 && (
        <Field label="Questions" hint={`${effectiveCount} selected`}>
          <SegmentedControl
            label="Number of questions"
            options={countOptions}
            value={effectiveCount}
            onChange={changeCount}
          />
        </Field>
      )}

      <Field label="Mode">
        <SegmentedControl label="Mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === 'practice'
            ? 'Feedback and the explanation appear as soon as you answer.'
            : 'No feedback until you submit at the end.'}
        </p>
      </Field>

      {mode === 'exam' && (
        <Field label="Countdown timer">
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={timerOn}
              onChange={(event) => setTimerOn(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
            />
            Auto-submit when time runs out
          </label>

          {timerOn && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={300}
                inputMode="numeric"
                value={minutes}
                onChange={(event) => {
                  setMinutesTouched(true);
                  const next = Number(event.target.value);
                  setMinutes(Number.isFinite(next) && next > 0 ? Math.min(300, next) : 1);
                }}
                aria-label="Time limit in minutes"
                className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                minutes{!minutesTouched && ' (suggested)'}
              </span>
            </div>
          )}
        </Field>
      )}

      {available === 0 ? (
        <EmptyState
          title="Nothing matches those filters"
          description="Widen the difficulty or category to find questions."
        />
      ) : (
        <Button size="lg" fullWidth onClick={handleStart}>
          Start {effectiveCount} {effectiveCount === 1 ? 'question' : 'questions'}
        </Button>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
    >
      ← All topics
    </Link>
  );
}
