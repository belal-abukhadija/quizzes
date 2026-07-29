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
        `inline-flex items-center gap-1.5 rounded-xl px-2 py-2.5 text-sm transition-colors ${
          isActive
            ? 'font-medium text-slate-900 dark:text-slate-100'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-page items-center gap-0.5 px-4 py-2">
          <NavLink
            to="/"
            className="mr-auto min-w-0 truncate pr-2 text-sm font-semibold tracking-tight sm:text-base"
          >
            Exam Prep
          </NavLink>

          <NavItem to="/review" label="Mistakes" icon={<FlagIcon className="h-5 w-5" />}>
            {mistakes.length > 0 && (
              <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                {mistakes.length}
              </span>
            )}
          </NavItem>

          <NavItem to="/stats" label="Stats" icon={<ChartIcon className="h-5 w-5" />} />

          <NavLink
            to="/settings"
            className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Settings"
          >
            <SlidersIcon className="h-5 w-5" />
          </NavLink>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-page px-4 pb-16 pt-6">
        <Outlet />
      </main>
    </div>
  );
}
