export function ProgressBar({
  value,
  max,
  className = 'bg-slate-900 dark:bg-slate-100',
  label,
}: {
  value: number;
  max: number;
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${className}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
