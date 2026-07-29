import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { Question, QuizSession, SessionItem } from '../types/quiz';
import { getQuestion } from '../data/topics';
import { deadlineOf, isItemCorrect } from '../lib/session';
import { useSession } from '../state/SessionContext';
import { useProgress } from '../state/ProgressContext';
import { useCountdown } from '../hooks/useCountdown';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Pill } from '../components/ui/Pill';
import { QuestionText } from '../components/quiz/QuestionText';
import { OptionButton, type OptionStatus } from '../components/quiz/OptionButton';
import { Timer } from '../components/quiz/Timer';
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon } from '../components/ui/icons';

function patchCurrent(session: QuizSession, patch: Partial<SessionItem>): QuizSession {
  return {
    ...session,
    items: session.items.map((item, index) =>
      index === session.currentIndex ? { ...item, ...patch } : item,
    ),
  };
}

function optionStatusFor(
  item: SessionItem,
  question: Question,
  displayIndex: number,
  revealed: boolean,
): OptionStatus {
  const isSelected = item.selected === displayIndex;
  if (!revealed) return isSelected ? 'selected' : 'idle';
  const originalIndex = item.optionOrder[displayIndex];
  if (originalIndex === question.correctIndex) return isSelected ? 'correct' : 'missed';
  return isSelected ? 'incorrect' : 'idle';
}

/**
 * Guard only. Keeping the runner in its own component means its hooks are never
 * skipped when the session clears on submit.
 */
export function QuizPage() {
  const { session } = useSession();
  if (!session) return <Navigate to="/" replace />;
  return <QuizRunner key={session.id} session={session} />;
}

function QuizRunner({ session }: { session: QuizSession }) {
  const navigate = useNavigate();
  const { update, finish } = useSession();
  const { setFlag } = useProgress();
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const item = session.items[session.currentIndex];
  const question = item ? getQuestion(item.questionId) : undefined;

  const isPractice = session.mode === 'practice';
  const revealed = isPractice && item?.revealed === true;
  const isLast = session.currentIndex === session.items.length - 1;
  const unanswered = session.items.filter((entry) => entry.selected === null).length;

  function submit() {
    const attempt = finish();
    navigate(attempt ? `/results/${attempt.id}` : '/', { replace: true });
  }

  function select(displayIndex: number) {
    if (!question || revealed || displayIndex >= question.options.length) return;
    update((current) => patchCurrent(current, { selected: displayIndex }));
  }

  function step(direction: -1 | 1) {
    setConfirmSubmit(false);
    update((current) => ({
      ...current,
      currentIndex: Math.min(
        Math.max(current.currentIndex + direction, 0),
        current.items.length - 1,
      ),
    }));
  }

  function toggleFlag() {
    if (!item) return;
    const next = !item.flagged;
    setFlag(item.questionId, next);
    update((current) => patchCurrent(current, { flagged: next }));
  }

  /** Enter confirms a practice answer, otherwise advances or submits. */
  function confirmOrAdvance() {
    if (!item) return;
    if (isPractice && item.selected !== null && !item.revealed) {
      update((current) => patchCurrent(current, { revealed: true }));
      return;
    }
    if (isLast) {
      if (unanswered > 0 && !confirmSubmit) {
        setConfirmSubmit(true);
        return;
      }
      submit();
      return;
    }
    step(1);
  }

  const remainingMs = useCountdown(deadlineOf(session), submit);
  useKeyboardShortcuts({ onDigit: select, onEnter: confirmOrAdvance, onStep: step });

  // A replaced JSON file can leave an item pointing at a question that is gone.
  if (!item || !question) return <Navigate to="/" replace />;

  const correct = isItemCorrect(item, question);

  // The warning stops applying the moment the last blanks get filled in.
  const warnBeforeSubmit = confirmSubmit && unanswered > 0;

  const primaryLabel = (() => {
    if (isPractice && item.selected !== null && !item.revealed) return 'Check answer';
    if (isLast) return warnBeforeSubmit ? `Submit with ${unanswered} unanswered` : 'Submit';
    return 'Next';
  })();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">
            {session.currentIndex + 1} / {session.items.length}
          </span>
          <div className="flex items-center gap-3">
            {remainingMs !== null && <Timer remainingMs={remainingMs} />}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Leave this quiz? Your progress is saved.')) navigate('/');
              }}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              Exit
            </button>
          </div>
        </div>
        <ProgressBar
          value={session.currentIndex + 1}
          max={session.items.length}
          label="Quiz progress"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{question.difficulty}</Pill>
          {question.category && <Pill>{question.category.replace('-', ' ')}</Pill>}
        </div>
        <button
          type="button"
          onClick={toggleFlag}
          aria-pressed={item.flagged}
          className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm transition-colors ${
            item.flagged
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <FlagIcon filled={item.flagged} className="h-4 w-4" />
          {item.flagged ? 'Flagged' : 'Flag'}
        </button>
      </div>

      <QuestionText
        text={question.question}
        className="text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-50"
      />

      <div className="space-y-2.5">
        {item.optionOrder.map((originalIndex, displayIndex) => (
          <OptionButton
            key={originalIndex}
            index={displayIndex}
            label={question.options[originalIndex]}
            status={optionStatusFor(item, question, displayIndex, revealed)}
            disabled={revealed}
            onClick={() => select(displayIndex)}
          />
        ))}
      </div>

      {revealed && (
        <div
          className={`rounded-xl border p-4 text-sm leading-relaxed ${
            correct
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100'
          }`}
          role="status"
        >
          <p className="font-medium">{correct ? 'Correct' : 'Not quite'}</p>
          <p className="mt-1 break-words">{question.explanation}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="secondary"
          onClick={() => step(-1)}
          disabled={session.currentIndex === 0}
          aria-label="Previous question"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <Button
          fullWidth
          onClick={confirmOrAdvance}
          variant={warnBeforeSubmit ? 'danger' : 'primary'}
        >
          {primaryLabel}
          {!isLast && <ChevronRightIcon className="h-4 w-4" />}
        </Button>
      </div>

      <p className="hidden text-center text-xs text-slate-400 dark:text-slate-500 sm:block">
        Keys 1–{Math.min(9, question.options.length)} to answer · Enter to continue · ← → to move
      </p>
    </div>
  );
}
