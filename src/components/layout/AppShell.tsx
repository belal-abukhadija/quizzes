import { NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { ChartIcon, FlagIcon, SlidersIcon } from '../ui/icons';
import { useProgress } from '../../state/ProgressContext';

/**
 * Icon-only below `sm` so the bar cannot overflow a 320px screen; text labels
 * appear once there is room for them.
 */
function NavItem({
  to,
  label,
  icon,
  children,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors sm:px-4 ${
          isActive
            ? 'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-950'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        }`
      }
    >
      <span className="sm:hidden">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      {children}
    </NavLink>
  );
}

export function AppShell() {
  const { mistakes } = useProgress();

  return (
    <div className="flex min-h-full flex-col">
      <header className="wb-bar w-full" style={{ maxWidth: '44rem' }}>
        <NavLink to="/" className="wb-brand mr-auto">
          <span className="wb-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 9a3 3 0 1 1 4 2.83c-.6.22-1 .8-1 1.42V14" />
              <path d="M12 17.5h.01" />
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
          </span>
          <span className="wb-brand-text">
            <span className="wb-brand-name">Exam Prep</span>
            <span className="wb-brand-owner">Belal&apos;s tools</span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="Main">
          <NavItem to="/review" label="Mistakes" icon={<FlagIcon className="h-5 w-5" />}>
            {mistakes.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-xs font-semibold tabular-nums text-accent-ink">
                {mistakes.length}
              </span>
            )}
          </NavItem>

          <NavItem to="/stats" label="Stats" icon={<ChartIcon className="h-5 w-5" />} />

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `grid size-10 place-items-center rounded-full transition-colors ${
                isActive
                  ? 'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`
            }
            aria-label="Settings"
          >
            <SlidersIcon className="h-5 w-5" />
          </NavLink>

          <ThemeToggle />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-4 pb-16 pt-2 sm:px-6">
        <Outlet />
      </main>

      <footer className="wb-foot w-full" style={{ maxWidth: '44rem' }}>
        <span>Made by <a href="mailto:belalabukhadija97@gmail.com">Belal</a></span>
        <span>More free tools at <a href="https://belal.work" target="_blank" rel="noopener noreferrer">belal.work</a></span>
      </footer>
    </div>
  );
}
