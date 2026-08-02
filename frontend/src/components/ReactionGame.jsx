import React, { useEffect, useState } from 'react';
import { sample } from '../utils/gameUtils.js';
import DifficultyPicker from './DifficultyPicker.jsx';
import GameScoreBadge from './GameScoreBadge.jsx';

// Difficulty shortens the round and grows the grid (more distractors to
// scan through), so Hard needs faster, sharper attention than Easy.
const TIME_BY_DIFFICULTY = { easy: 35, medium: 30, hard: 22 };
const SIZE_MULTIPLIER = { easy: 0.75, medium: 1, hard: 1.5 };

function effectiveGridSize(base, difficulty) {
  return Math.max(6, Math.round(base * (SIZE_MULTIPLIER[difficulty] ?? 1)));
}

function buildGrid(size, target, distractorPool) {
  const distractor = sample(distractorPool);
  const targetIndex = Math.floor(Math.random() * size);
  return Array.from({ length: size }, (_, i) => (i === targetIndex ? target : distractor));
}

export default function ReactionGame({
  title,
  blurb,
  target,
  distractorPool,
  gridSize = 16,
  onComplete,
  stats,
  initialDifficulty,
}) {
  const [difficulty, setDifficulty] = useState(initialDifficulty || 'medium');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIME_BY_DIFFICULTY[initialDifficulty || 'medium']);
  const [grid, setGrid] = useState(() =>
    buildGrid(effectiveGridSize(gridSize, initialDifficulty || 'medium'), target, distractorPool)
  );
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
      maxScore: null,
      label: `${score} found in ${TIME_BY_DIFFICULTY[difficulty]}s (${difficulty})`,
      difficulty,
    });
  }, [finished, reported, onComplete, score, difficulty]);

  function start() {
    setStarted(true);
    setFinished(false);
    setScore(0);
    setSecondsLeft(TIME_BY_DIFFICULTY[difficulty]);
    setGrid(buildGrid(effectiveGridSize(gridSize, difficulty), target, distractorPool));
    setReported(false);
  }

  function changeDifficulty(next) {
    setDifficulty(next);
    if (!started || finished) setSecondsLeft(TIME_BY_DIFFICULTY[next]);
  }

  function clickCell(symbol) {
    if (!started || finished) return;
    if (symbol === target) {
      setScore((s) => s + 1);
      setGrid(buildGrid(effectiveGridSize(gridSize, difficulty), target, distractorPool));
    }
  }

  return (
    <section aria-label={`${title} reaction game`} className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">{title}</h3>
      {blurb && <p className="text-sm text-gray-600 dark:text-gray-400">{blurb}</p>}
      <DifficultyPicker value={difficulty} onChange={changeDifficulty} disabled={started && !finished} />
      <GameScoreBadge stats={stats} />

      {!started && (
        <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
          Start
        </button>
      )}

      {started && !finished && (
        <div className="space-y-2">
          <p className="text-sm">
            Time left: <span className="font-semibold">{secondsLeft}s</span> · Found:{' '}
            <span className="font-semibold">{score}</span>
          </p>
          <div className="grid grid-cols-4 gap-1">
            {grid.map((symbol, i) => (
              <button
                key={i}
                type="button"
                onClick={() => clickCell(symbol)}
                className="flex h-12 w-12 items-center justify-center rounded border text-xl"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="space-y-2">
          <p className="font-medium">Time's up! You found {score}.</p>
          <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
            Play again
          </button>
        </div>
      )}
    </section>
  );
}
