import { Link, useNavigate, useParams } from 'react-router-dom';
import { getQuestion, MISTAKES_TOPIC_ID } from '../data/topics';
import { useProgress } from '../state/ProgressContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionHeading } from '../components/ui/Card';
import { ScoreSummary } from '../components/results/ScoreSummary';
import { BreakdownItem } from '../components/results/BreakdownItem';

export function ResultsPage() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const { attempts } = useProgress();

  const attempt = attempts.find((entry) => entry.id === attemptId);

  if (!attempt) {
    return (
      <EmptyState
        title="Result not found"
        description="This attempt is no longer in your history. It may have been cleared."
        action={
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to topics
          </Button>
        }
      />
    );
  }

  const wrong = attempt.answers.filter((answer) => !answer.correct).length;
  const canRetakeTopic = attempt.topicId !== MISTAKES_TOPIC_ID;

  return (
    <div className="space-y-6">
      <h1 className="wb-title">Results</h1>

      <ScoreSummary attempt={attempt} />

      <div className="flex flex-wrap gap-2">
        {canRetakeTopic && (
          <Button onClick={() => navigate(`/topic/${attempt.topicId}`)}>Retake this topic</Button>
        )}
        <Button variant="secondary" onClick={() => navigate('/')}>
          All topics
        </Button>
        {wrong > 0 && (
          <Button variant="ghost" onClick={() => navigate('/review')}>
            Review mistakes
          </Button>
        )}
      </div>

      <div>
        <SectionHeading>Breakdown</SectionHeading>
        <ul className="space-y-3">
          {attempt.answers.map((answer, index) => {
            const question = getQuestion(answer.questionId);
            if (!question) {
              return (
                <li
                  key={answer.questionId}
                  className="rounded-2xl bg-white p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                >
                  Question {index + 1} is no longer available.
                </li>
              );
            }
            return (
              <BreakdownItem
                key={answer.questionId}
                position={index + 1}
                question={question}
                answer={answer}
              />
            );
          })}
        </ul>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to="/stats" className="underline decoration-slate-300 underline-offset-4">
          See how this fits your overall stats
        </Link>
      </p>
    </div>
  );
}
