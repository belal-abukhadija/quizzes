import type { Attempt } from '../../types/quiz';
import { percentage } from '../../lib/session';
import { formatDuration } from '../../lib/format';
import { ProgressBar } from '../ui/ProgressBar';

export function ScoreSummary({ attempt }: { attempt: Attempt }) {
  const pct = percentage(attempt.correct, attempt.total);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{attempt.label}</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{pct}%</p>
        </div>
        <p className="text-right text-sm text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">
            {attempt.correct} / {attempt.total}
          </span>
          <br />
          correct
        </p>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={attempt.correct}
          max={attempt.total}
          label="Score"
          className={
            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }
        />
      </div>

      <dl className="mt-4 flex gap-6 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Time</dt>
          <dd className="tabular-nums">{formatDuration(attempt.durationMs)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Mode</dt>
          <dd className="capitalize">{attempt.mode}</dd>
        </div>
      </dl>
    </div>
  );
}
