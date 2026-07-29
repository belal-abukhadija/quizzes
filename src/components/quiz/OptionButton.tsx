import { CheckIcon, CrossIcon } from '../ui/icons';

export type OptionStatus = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed';

const STATUS_CLASS: Record<OptionStatus, string> = {
  idle: 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
  selected:
    'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-slate-100',
  correct: 'border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40',
  incorrect: 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/40',
  missed: 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20',
};

const BADGE_CLASS: Record<OptionStatus, string> = {
  idle: 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400',
  selected: 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900',
  correct: 'border-emerald-600 bg-emerald-600 text-white',
  incorrect: 'border-red-600 bg-red-600 text-white',
  missed: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
};

export function OptionButton({
  index,
  label,
  status,
  disabled = false,
  onClick,
}: {
  index: number;
  label: string;
  status: OptionStatus;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const icon =
    status === 'correct' || status === 'missed' ? (
      <CheckIcon className="h-4 w-4" />
    ) : status === 'incorrect' ? (
      <CrossIcon className="h-4 w-4" />
    ) : (
      <span className="text-xs font-semibold">{index + 1}</span>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={status === 'selected'}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors disabled:cursor-default ${STATUS_CLASS[status]}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${BADGE_CLASS[status]}`}
      >
        {icon}
      </span>
      <span className="min-w-0 break-words text-[15px] leading-snug text-slate-800 dark:text-slate-100">
        {label}
      </span>
    </button>
  );
}
