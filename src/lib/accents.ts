import type { AccentKey } from '../types/quiz';

/**
 * Full class strings, written out literally so Tailwind's content scanner can
 * see them. Never build these by interpolation.
 */
export const ACCENT: Record<AccentKey, { dot: string; text: string; bar: string }> = {
  sky: { dot: 'bg-sky-500', text: 'text-slate-900 dark:text-slate-100', bar: 'bg-slate-900 dark:bg-slate-100' },
  violet: {
    dot: 'bg-violet-500',
    text: 'text-slate-900 dark:text-slate-100',
    bar: 'bg-slate-900 dark:bg-slate-100',
  },
  emerald: {
    dot: 'bg-emerald-500',
    text: 'text-slate-900 dark:text-slate-100',
    bar: 'bg-slate-900 dark:bg-slate-100',
  },
  amber: { dot: 'bg-amber-500', text: 'text-slate-900 dark:text-slate-100', bar: 'bg-slate-900 dark:bg-slate-100' },
  rose: { dot: 'bg-rose-500', text: 'text-slate-900 dark:text-slate-100', bar: 'bg-slate-900 dark:bg-slate-100' },
  teal: { dot: 'bg-teal-500', text: 'text-slate-900 dark:text-slate-100', bar: 'bg-slate-900 dark:bg-slate-100' },
  indigo: {
    dot: 'bg-indigo-500',
    text: 'text-slate-900 dark:text-slate-100',
    bar: 'bg-slate-900 dark:bg-slate-100',
  },
};
