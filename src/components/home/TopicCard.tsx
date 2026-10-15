import { Link } from 'react-router-dom';
import type { Topic } from '../../types/quiz';
import type { TopicSummary } from '../../lib/stats';
import { ACCENT } from '../../lib/accents';
import { formatRelative, pluralise } from '../../lib/format';

export function TopicCard({ topic, summary }: { topic: Topic; summary: TopicSummary }) {
  const isEmpty = topic.questions.length === 0;
  const accent = ACCENT[topic.accent];

  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{topic.name}</h3>
      </div>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{topic.blurb}</p>

      <dl className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <dt className="sr-only">Questions</dt>
          <dd>{isEmpty ? 'No questions yet' : pluralise(topic.questions.length, 'question')}</dd>
        </div>
        {summary.bestPct !== null && (
          <div>
            <dt className="sr-only">Best score</dt>
            <dd className={accent.text}>Best {summary.bestPct}%</dd>
          </div>
        )}
        {summary.lastAt !== null && (
          <div>
            <dt className="sr-only">Last attempt</dt>
            <dd>Last {formatRelative(summary.lastAt)}</dd>
          </div>
        )}
      </dl>
    </>
  );

  const shell = 'block rounded-2xl p-5 text-left transition-colors';

  if (isEmpty) {
    return (
      <div
        className={`${shell} bg-slate-100 opacity-70 dark:bg-slate-800/60`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      to={`/topic/${topic.id}`}
      className={`${shell} bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800`}
    >
      {body}
    </Link>
  );
}
