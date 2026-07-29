import { Fragment } from 'react';

/**
 * Renders `____` in a question as a visible ruled gap. English items use it for
 * sentence completion; other topics simply never contain one.
 */
export function QuestionText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/_{3,}/);

  return (
    <p className={`break-words ${className}`}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="mx-1 inline-block w-14 translate-y-[-0.15em] border-b-2 border-slate-400 align-middle dark:border-slate-500">
              <span className="sr-only">blank</span>
            </span>
          )}
        </Fragment>
      ))}
    </p>
  );
}
