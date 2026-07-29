import type { AccentKey } from '../types/quiz';

/**
 * Full class strings, written out literally so Tailwind's content scanner can
 * see them. Never build these by interpolation.
 */
export const ACCENT: Record<AccentKey, { dot: string; text: string; bar: string }> = {
  sky: { dot: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300', bar: 'bg-sky-500' },
  violet: {
    dot: 'bg-violet-500',
    text: 'text-violet-700 dark:text-violet-300',
    bar: 'bg-violet-500',
  },
  emerald: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  },
  amber: { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' },
  rose: { dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bar: 'bg-rose-500' },
  teal: { dot: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300', bar: 'bg-teal-500' },
  indigo: {
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    bar: 'bg-indigo-500',
  },
};
