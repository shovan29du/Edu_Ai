import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import LevelSelector from './LevelSelector.jsx';
import {
  deleteStudyTopic,
  generateStudyQuestions,
  getStudyStats,
  listDueQuestions,
  submitStudyAnswer,
} from '../api/studyCoach.js';

const MODES = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'mcq', label: 'Multiple choice' },
  { id: 'dissertative', label: 'Open-ended' },
];

export default function StudyCoach({ child, level: initialLevel = '1' }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState(initialLevel);
  const [mode, setMode] = useState('mixed');
  const [count, setCount] = useState(6);
  const [generating, setGenerating] = useState(false);

  const [queue, setQueue] = useState(null);
  const [startingSession, setStartingSession] = useState(false);

  function refreshStats() {
    if (!child) return;
    setLoadingStats(true);
    getStudyStats(child)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingStats(false));
  }

  useEffect(() => {
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child]);

  async function handleGenerate(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    try {
      await generateStudyQuestions({
        child, topic: topic.trim(), subject, level, mode, count: Number(count) || 6,
      });
      setTopic('');
      refreshStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function startSession() {
    setStartingSession(true);
    setError('');
    try {
      const data = await listDueQuestions(child, 20);
      setQueue(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setStartingSession(false);
    }
  }

  async function handleDeleteTopic(t) {
    setError('');
    try {
      await deleteStudyTopic(t, child);
      refreshStats();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSessionDone() {
    setQueue(null);
    refreshStats();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 p-4 text-white">
        <h2 className="text-xl font-bold">🧠 Study Coach</h2>
        <p className="text-sm opacity-90">
          Spaced-repetition practice: retrieval, interleaved topics, and confidence tracking — questions you get
          right come back later; ones you struggle with come back sooner.
        </p>
      </div>

      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {queue ? (
        <StudySession child={child} queue={queue} onDone={handleSessionDone} />
      ) : (
        <>
          {loadingStats ? (
            <LoadingSpinner />
          ) : stats && (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Total questions" value={stats.total_questions} />
              <StatCard label="Due today" value={stats.due_today} />
              <StatCard label="Mastered" value={stats.mastered} />
            </div>
          )}

          {stats?.due_today > 0 && (
            <button
              type="button"
              onClick={startSession}
              disabled={startingSession}
              className="rounded-lg bg-teal-700 px-6 py-2 text-white font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {startingSession ? 'Loading…' : `Start review session (${stats.due_today} due)`}
            </button>
          )}

          {stats?.topics?.length > 0 && (
            <div className="rounded-xl border p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold">Topics</h3>
              <ul className="space-y-1">
                {stats.topics.map((t) => (
                  <li key={t} className="flex items-center justify-between text-sm">
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(t)}
                      className="rounded border px-2 py-0.5 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleGenerate} className="grid gap-3 rounded-xl border p-4 dark:border-gray-700 sm:grid-cols-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic, e.g. the water cycle"
              className="rounded border px-2 py-1 dark:bg-gray-800 sm:col-span-2"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="rounded border px-2 py-1 dark:bg-gray-800"
            />
            <LevelSelector level={level} onChange={setLevel} />
            <label className="flex items-center gap-2 text-sm">
              Question type
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="flex-1 rounded border px-2 py-1 dark:bg-gray-800"
              >
                {MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              Number of questions
              <input
                type="number"
                min="1"
                max="15"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="flex-1 rounded border px-2 py-1 dark:bg-gray-800"
              />
            </label>
            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="rounded-lg bg-teal-700 px-6 py-2 text-white font-medium hover:bg-teal-800 disabled:opacity-50 sm:col-span-2"
            >
              {generating ? 'Generating…' : 'Add questions to my deck'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border p-4 text-center dark:border-gray-700">
      <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function StudySession({ child, queue, onDone }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const question = queue[index];

  async function handleSubmit(event) {
    event.preventDefault();
    if (!answer) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await submitStudyAnswer(question.id, child, answer, confidence);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setResult(null);
    setAnswer('');
    setConfidence(3);
    if (index + 1 >= queue.length) {
      onDone();
    } else {
      setIndex(index + 1);
    }
  }

  if (!question) {
    onDone();
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 shadow dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Question {index + 1} of {queue.length}</span>
        <span className="rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-800 dark:bg-teal-900 dark:text-teal-200">
          {question.topic}
        </span>
      </div>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <p className="font-medium">{question.question}</p>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {question.type === 'mcq' ? (
            <div className="space-y-1">
              {Object.entries(question.options || {}).map(([letter, text]) => (
                <label key={letter} className="flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="study-answer"
                    checked={answer === letter}
                    onChange={() => setAnswer(letter)}
                  />
                  {letter}) {text}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Write your answer…"
              className="w-full rounded border p-2 text-sm dark:bg-gray-800"
            />
          )}

          <label className="block text-sm">
            How confident are you? ({confidence}/5)
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !answer}
            className="rounded-lg bg-teal-700 px-6 py-2 text-white font-medium hover:bg-teal-800 disabled:opacity-50"
          >
            {submitting ? 'Checking…' : 'Submit answer'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className={`font-semibold ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
            {result.correct ? '✅ Correct' : '❌ Not quite'} — {result.score}/100
          </p>
          {question.type === 'mcq' && !result.correct && (
            <p className="text-sm">Correct answer: <strong>{result.correct_answer}</strong></p>
          )}
          {(result.feedback || result.explanation) && (
            <p className="whitespace-pre-wrap rounded bg-teal-50 p-3 text-sm dark:bg-teal-950">
              {result.feedback || result.explanation}
            </p>
          )}
          <p className="text-xs text-gray-500">Next review: {result.next_due_date} ({result.interval_days} day(s))</p>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-teal-700 px-6 py-2 text-white font-medium hover:bg-teal-800"
          >
            {index + 1 >= queue.length ? 'Finish session' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}
