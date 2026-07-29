import { formatDuration } from '../../lib/format';
import { ClockIcon } from '../ui/icons';

export function Timer({ remainingMs }: { remainingMs: number }) {
  const urgent = remainingMs <= 60_000;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm tabular-nums ${
        urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
      }`}
      role="timer"
      aria-live="off"
    >
      <ClockIcon className="h-4 w-4" />
      {formatDuration(remainingMs)}
    </span>
  );
}
