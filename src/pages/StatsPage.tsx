import { useNavigate } from 'react-router-dom';
import { getQuestion, MISTAKES_TOPIC_ID, TOPICS } from '../data/topics';
import { useProgress } from '../state/ProgressContext';
import { summariseByTopic, weakestTags } from '../lib/stats';
import { percentage } from '../lib/session';
import { formatDate, formatDuration, pluralise } from '../lib/format';
import { ACCENT } from '../lib/accents';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeading } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

const HISTORY_LIMIT = 15;

export function StatsPage() {
  const navigate = useNavigate();
  const { attempts } = useProgress();

  if (attempts.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <EmptyState
          title="No attempts yet"
          description="Finish a quiz and your accuracy, history, and weakest tags will appear here."
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              Start a quiz
            </Button>
          }
        />
      </div>
    );
  }

  const summaries = summariseByTopic(attempts);
  const tags = weakestTags(attempts, getQuestion);

  const totalAnswered = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
  const totalCorrect = attempts.reduce((sum, attempt) => sum + attempt.correct, 0);
  const history = [...attempts].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, HISTORY_LIMIT);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {percentage(totalCorrect, totalAnswered)}% overall across{' '}
          {pluralise(attempts.length, 'attempt')}
        </p>
      </div>

      <section>
        <SectionHeading>Accuracy by topic</SectionHeading>
        <ul className="space-y-3">
          {TOPICS.map((topic) => {
            const summary = summaries[topic.id];
            return (
              <li key={topic.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{topic.name}</span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">
                    {summary ? `${summary.accuracy}%` : '—'}
                  </span>
                </div>
                <ProgressBar
                  value={summary?.correct ?? 0}
                  max={summary?.answered ?? 1}
                  className={ACCENT[topic.accent].bar}
                  label={`${topic.name} accuracy`}
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {summary
                    ? `${pluralise(summary.attempts, 'attempt')} · best ${summary.bestPct ?? 0}%`
                    : 'Not attempted yet'}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {tags.length > 0 && (
        <section>
          <SectionHeading>Weakest tags</SectionHeading>
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li
                key={tag.tag}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="font-medium">{tag.tag}</span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {tag.accuracy}% of {tag.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeading>Recent attempts</SectionHeading>
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {history.map((attempt) => (
            <li key={attempt.id} className="flex items-center justify-between gap-3 px-3.5 py-3">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(`/results/${attempt.id}`)}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {attempt.topicId === MISTAKES_TOPIC_ID ? 'My mistakes' : attempt.label}
                </button>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(attempt.finishedAt)} · {attempt.mode} ·{' '}
                  {formatDuration(attempt.durationMs)}
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-slate-600 dark:text-slate-300">
                {percentage(attempt.correct, attempt.total)}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
