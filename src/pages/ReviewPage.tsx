import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../types/quiz';
import { getQuestion, getTopicOfQuestion, MISTAKES_TOPIC_ID } from '../data/topics';
import { buildSession } from '../lib/session';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { ReviewQuestionCard } from '../components/review/ReviewQuestionCard';
import { formatRelative, pluralise } from '../lib/format';

type Tab = 'mistakes' | 'flagged';

interface Row {
  question: Question;
  topicName: string;
  meta?: string;
}

export function ReviewPage() {
  const navigate = useNavigate();
  const { mistakes, flags, setFlag, clearFlags } = useProgress();
  const { start } = useSession();
  const [tab, setTab] = useState<Tab>('mistakes');

  // Questions can disappear if a JSON file is replaced, so resolve and filter.
  const mistakeRows = useMemo<Row[]>(
    () =>
      mistakes.flatMap((entry) => {
        const question = getQuestion(entry.questionId);
        if (!question) return [];
        return [
          {
            question,
            topicName: getTopicOfQuestion(entry.questionId)?.name ?? 'Unknown topic',
            meta: `wrong ${pluralise(entry.timesWrong, 'time')} · ${formatRelative(entry.lastWrongAt)}`,
          },
        ];
      }),
    [mistakes],
  );

  const flaggedRows = useMemo<Row[]>(
    () =>
      flags.flatMap((questionId) => {
        const question = getQuestion(questionId);
        if (!question) return [];
        return [
          {
            question,
            topicName: getTopicOfQuestion(questionId)?.name ?? 'Unknown topic',
          },
        ];
      }),
    [flags],
  );

  const rows = tab === 'mistakes' ? mistakeRows : flaggedRows;

  function retake(pool: Question[], label: string) {
    if (pool.length === 0) return;
    start(
      buildSession({
        topicId: MISTAKES_TOPIC_ID,
        label,
        mode: 'practice',
        count: pool.length,
        difficulty: 'all',
        category: 'all',
        timeLimitSec: null,
        pool,
      }),
    );
    navigate('/quiz');
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Questions leave this list as soon as you answer them correctly.
        </p>
      </div>

      <SegmentedControl
        label="Review list"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'mistakes', label: `My mistakes (${mistakeRows.length})` },
          { value: 'flagged', label: `Flagged (${flaggedRows.length})` },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={tab === 'mistakes' ? 'No mistakes recorded' : 'Nothing flagged'}
          description={
            tab === 'mistakes'
              ? 'Wrong answers collect here automatically after each quiz.'
              : 'Flag a question during a quiz to keep it here for later.'
          }
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              Start a quiz
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                retake(
                  rows.map((row) => row.question),
                  tab === 'mistakes' ? 'My mistakes' : 'Flagged questions',
                )
              }
            >
              Retake {pluralise(rows.length, 'question')}
            </Button>
            {tab === 'flagged' && (
              <Button variant="ghost" onClick={clearFlags}>
                Clear all flags
              </Button>
            )}
          </div>

          <ul className="space-y-3">
            {rows.map((row) => (
              <ReviewQuestionCard
                key={row.question.id}
                question={row.question}
                topicName={row.topicName}
                meta={row.meta}
                action={
                  tab === 'flagged' ? (
                    <button
                      type="button"
                      onClick={() => setFlag(row.question.id, false)}
                      className="shrink-0 text-xs text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      Unflag
                    </button>
                  ) : undefined
                }
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
