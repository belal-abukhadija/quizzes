import { CheckIcon, CrossIcon } from '../ui/icons';

export type OptionStatus = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed';

const STATUS_CLASS: Record<OptionStatus, string> = {
  idle: 'border-transparent bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
  selected:
    'border-slate-900 bg-accent-wash dark:border-slate-100',
  correct: 'border-ok bg-ok-wash',
  incorrect: 'border-danger bg-danger-wash',
  missed: 'border-ok bg-transparent',
};

const BADGE_CLASS: Record<OptionStatus, string> = {
  idle: 'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  selected: 'border-slate-900 bg-slate-900 text-accent dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900',
  correct: 'border-ok bg-ok text-white dark:text-slate-950',
  incorrect: 'border-danger bg-danger text-white dark:text-slate-950',
  missed: 'border-ok text-ok',
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
      className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors disabled:cursor-default ${STATUS_CLASS[status]}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${BADGE_CLASS[status]}`}
      >
        {icon}
      </span>
      <span className="min-w-0 break-words text-[15px] leading-snug text-slate-800 dark:text-slate-100">
        {label}
      </span>
    </button>
  );
}
