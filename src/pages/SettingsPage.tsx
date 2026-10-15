import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizSettings } from '../types/quiz';
import { useSettings } from '../state/SettingsContext';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { SectionHeading } from '../components/ui/Card';
import { SegmentedControl, type SegmentOption } from '../components/ui/SegmentedControl';
import { pluralise } from '../lib/format';

const THEME_OPTIONS: SegmentOption<QuizSettings['theme']>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { attempts, mistakes, flags, resetAll } = useProgress();
  const { session, discard } = useSession();
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    resetAll();
    discard();
    setConfirming(false);
    navigate('/');
  }

  return (
    <div className="space-y-8">
      <h1 className="wb-title">Settings</h1>

      <Field label="Appearance">
        <SegmentedControl
          label="Theme"
          options={THEME_OPTIONS}
          value={settings.theme}
          onChange={(theme) => update({ theme })}
        />
      </Field>

      <section>
        <SectionHeading>Keyboard</SectionHeading>
        <dl className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex justify-between gap-4">
            <dt>Select an option</dt>
            <dd className="text-slate-500 dark:text-slate-400">1 – 4</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Confirm or continue</dt>
            <dd className="text-slate-500 dark:text-slate-400">Enter</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Previous / next question</dt>
            <dd className="text-slate-500 dark:text-slate-400">← →</dd>
          </div>
        </dl>
      </section>

      <section>
        <SectionHeading>Stored on this device</SectionHeading>
        <dl className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex justify-between gap-4">
            <dt>Attempt history</dt>
            <dd className="text-slate-500 dark:text-slate-400">
              {pluralise(attempts.length, 'attempt')}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Mistakes list</dt>
            <dd className="text-slate-500 dark:text-slate-400">
              {pluralise(mistakes.length, 'question')}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Flagged</dt>
            <dd className="text-slate-500 dark:text-slate-400">
              {pluralise(flags.length, 'question')}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Quiz in progress</dt>
            <dd className="text-slate-500 dark:text-slate-400">{session ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-red-200 p-4 dark:border-red-900/70">
        <SectionHeading>Reset all progress</SectionHeading>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Erases attempt history, your mistakes list, flags, and any quiz in progress from this
          device. Your theme choice is kept. This cannot be undone.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {confirming ? (
            <>
              <Button variant="danger" onClick={handleReset}>
                Yes, erase everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Reset all progress
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
