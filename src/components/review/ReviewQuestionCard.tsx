import type { ReactNode } from 'react';
import type { Question } from '../../types/quiz';
import { QuestionText } from '../quiz/QuestionText';
import { Pill } from '../ui/Pill';

export function ReviewQuestionCard({
  question,
  topicName,
  meta,
  action,
}: {
  question: Question;
  topicName: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{topicName}</Pill>
          {meta && <span className="text-xs text-slate-400 dark:text-slate-500">{meta}</span>}
        </div>
        {action}
      </div>

      <QuestionText
        text={question.question}
        className="font-medium leading-relaxed text-slate-900 dark:text-slate-50"
      />

      <p className="mt-2 break-words text-sm text-emerald-700 dark:text-emerald-400">
        {question.options[question.correctIndex]}
      </p>

      <p className="mt-1.5 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {question.explanation}
      </p>
    </li>
  );
}
