import React, { useEffect, useState } from 'react';
import DifficultyPicker from './DifficultyPicker.jsx';
import GameScoreBadge from './GameScoreBadge.jsx';

// Difficulty widens the number ranges the `generate` function draws from
// (see gameCentreData.js) and shortens/lengthens the time available.
const ROUND_SECONDS = { easy: 40, medium: 30, hard: 20 };

export default function MathSprintGame({ title, blurb, generate, onComplete, stats, initialDifficulty }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty || 'medium');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS[initialDifficulty || 'medium']);
  const [current, setCurrent] = useState(null);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    if (secondsLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, finished, secondsLeft]);

  useEffect(() => {
    if (!finished || reported) return;
    setReported(true);
    if (!onComplete) return;
    onComplete({
      score,
      maxScore: total || null,
      label: `${score} correct in ${ROUND_SECONDS[difficulty]}s (${difficulty})`,
      difficulty,
    });
  }, [finished, reported, onComplete, score, total, difficulty]);

  function start() {
    setStarted(true);
    setFinished(false);
    setScore(0);
    setTotal(0);
    setSecondsLeft(ROUND_SECONDS[difficulty]);
    setCurrent(generate(difficulty));
    setReported(false);
  }

  function changeDifficulty(next) {
    setDifficulty(next);
    if (!started || finished) setSecondsLeft(ROUND_SECONDS[next]);
  }

  function answer(option) {
    setTotal((t) => t + 1);
    if (String(option) === String(current.answer)) {
      setScore((s) => s + 1);
    }
    setCurrent(generate(difficulty));
  }

  return (
    <section aria-label={`${title} math sprint`} className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">{title}</h3>
      {blurb && <p className="text-sm text-gray-600 dark:text-gray-400">{blurb}</p>}
      <DifficultyPicker value={difficulty} onChange={changeDifficulty} disabled={started && !finished} />
      <GameScoreBadge stats={stats} />

      {!started && (
        <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
          Start
        </button>
      )}

      {started && !finished && current && (
        <div className="space-y-2">
          <p className="text-sm">
            Time left: <span className="font-semibold">{secondsLeft}s</span> · Score:{' '}
            <span className="font-semibold">{score}</span> / {total}
          </p>
          <p className="text-2xl font-bold">{current.question}</p>
          <div className="flex flex-wrap gap-2">
            {current.options.map((opt, i) => (
              <button
                key={`${opt}-${i}`}
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
          <p className="font-medium">
            Time's up! Final score: {score} / {total}
          </p>
          <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
            Play again
          </button>
        </div>
      )}
    </section>
  );
}
