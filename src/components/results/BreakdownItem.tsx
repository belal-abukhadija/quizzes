import type { AttemptAnswer, Question } from '../../types/quiz';
import { OptionButton, type OptionStatus } from '../quiz/OptionButton';
import { QuestionText } from '../quiz/QuestionText';
import { CheckIcon, CrossIcon } from '../ui/icons';

function statusFor(optionIndex: number, answer: AttemptAnswer): OptionStatus {
  const isChosen = answer.selectedIndex === optionIndex;
  if (optionIndex === answer.correctIndex) return isChosen ? 'correct' : 'missed';
  return isChosen ? 'incorrect' : 'idle';
}

export function BreakdownItem({
  position,
  question,
  answer,
}: {
  position: number;
  question: Question;
  answer: AttemptAnswer;
}) {
  return (
    <li
      className={`rounded-2xl border p-4 ${
        answer.correct
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-red-200 bg-red-50/40 dark:border-red-900/70 dark:bg-red-950/10'
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-slate-400 dark:text-slate-500">Question {position}</span>
        {answer.correct ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CheckIcon className="h-3.5 w-3.5" /> Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
            <CrossIcon className="h-3.5 w-3.5" />
            {answer.selectedIndex === null ? 'Skipped' : 'Wrong'}
          </span>
        )}
      </div>

      <QuestionText
        text={question.question}
        className="font-medium leading-relaxed text-slate-900 dark:text-slate-50"
      />

      <div className="mt-3 space-y-2">
        {question.options.map((option, optionIndex) => (
          <OptionButton
            key={optionIndex}
            index={optionIndex}
            label={option}
            status={statusFor(optionIndex, answer)}
            disabled
          />
        ))}
      </div>

      <p className="mt-3 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {question.explanation}
      </p>
    </li>
  );
}
