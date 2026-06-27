import React, { useMemo, useState } from 'react';

const ROUND_SECONDS = 30;

function collectQuestions(grade) {
  if (!grade?.subjects) return [];
  const all = [];
  for (const [subjectName, subject] of Object.entries(grade.subjects)) {
    for (const q of subject.quiz_bank || []) {
      if (q.type === 'multiple_choice' && q.options?.length > 0) {
        all.push({ ...q, subjectName });
      }
    }
  }
  return all;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizSprintGame({ grade }) {
  const questions = useMemo(() => shuffle(collectQuestions(grade)), [grade]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  React.useEffect(() => {
    if (!started || finished) return;
    if (secondsLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, finished, secondsLeft]);

  if (questions.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No quiz questions available for this grade yet.</p>;
  }

  function start() {
    setStarted(true);
    setFinished(false);
    setIndex(0);
    setScore(0);
    setSecondsLeft(ROUND_SECONDS);
  }

  function answer(option) {
    const q = questions[index % questions.length];
    if (String(option).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) {
      setScore((s) => s + 1);
    }
    setIndex((i) => i + 1);
  }

  const current = questions[index % questions.length];

  return (
    <section aria-label="Quiz Sprint game" className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">Quiz Sprint</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Answer as many practice questions as you can before time runs out!
      </p>
      {!started && (
        <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
          Start
        </button>
      )}
      {started && !finished && current && (
        <div className="space-y-2">
          <p className="text-sm">
            Time left: <span className="font-semibold">{secondsLeft}s</span> · Score:{' '}
            <span className="font-semibold">{score}</span>
          </p>
          <p className="font-medium">{current.question}</p>
          <div className="flex flex-wrap gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => answer(opt)}
                className="rounded border px-3 py-1 text-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {finished && (
        <div className="space-y-2">
          <p className="font-medium">Time's up! Final score: {score}</p>
          <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
            Play again
          </button>
        </div>
      )}
    </section>
  );
}
