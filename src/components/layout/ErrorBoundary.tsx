import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * Last line of defence. Storage is already guarded and question data is
 * validated on load, so this exists to keep an unexpected render error from
 * leaving a blank white page on a phone.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="mx-auto max-w-page px-4 py-16 text-center">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Reloading usually fixes it. Your saved progress is untouched.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="mt-5 min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink"
        >
          Reload
        </button>
      </div>
    );
  }
}
