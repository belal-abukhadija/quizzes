import { Link, useNavigate } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { TopicCard } from '../components/home/TopicCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { emptySummary, summariseByTopic } from '../lib/stats';
import { answeredCount } from '../lib/session';
import { pluralise } from '../lib/format';

export function HomePage() {
  const navigate = useNavigate();
  const { attempts, mistakes } = useProgress();
  const { session, discard } = useSession();

  const summaries = summariseByTopic(attempts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="wb-title">Topics</h1>
        <p className="wb-lede">
          Pick a topic to start a practice or exam run.
        </p>
      </div>

      {session && (
        <Card>
          <p className="text-sm font-medium">Quiz in progress</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {session.label} — {answeredCount(session)} of {session.items.length} answered
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => navigate('/quiz')}>
              Resume
            </Button>
            <Button size="sm" variant="ghost" onClick={discard}>
              Discard
            </Button>
          </div>
        </Card>
      )}

      {mistakes.length > 0 && (
        <Link
          to="/review"
          className="block text-sm text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-slate-50"
        >
          {pluralise(mistakes.length, 'question')} waiting in your mistakes list
        </Link>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            summary={summaries[topic.id] ?? emptySummary()}
          />
        ))}
      </div>
    </div>
  );
}
