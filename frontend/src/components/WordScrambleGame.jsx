import React, { useEffect, useMemo, useState } from 'react';
import { shuffle, scrambleWord } from '../utils/gameUtils.js';
import GameScoreBadge from './GameScoreBadge.jsx';

export default function WordScrambleGame({ title, blurb, words, onComplete, stats }) {
  const [order] = useState(() => shuffle(words.map((_, i) => i)));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [reported, setReported] = useState(false);

  const finished = step >= order.length;
  const currentWord = !finished ? words[order[step]] : null;
  const scrambled = useMemo(() => (currentWord ? scrambleWord(currentWord) : ''), [currentWord]);

  useEffect(() => {
    if (!finished || reported) return;
    setReported(true);
    if (!onComplete) return;
    onComplete({ score, maxScore: order.length, label: `${score}/${order.length} words` });
  }, [finished, reported, onComplete, score, order.length]);

  function submit(e) {
    e.preventDefault();
    if (!currentWord || revealed) return;
    const isCorrect = input.trim().toUpperCase() === currentWord.toUpperCase();
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
  }

  function next() {
    setStep((s) => s + 1);
    setInput('');
    setFeedback(null);
    setRevealed(false);
  }

  function restart() {
    setStep(0);
    setScore(0);
    setInput('');
    setFeedback(null);
    setRevealed(false);
    setReported(false);
  }

  return (
    <section aria-label={`${title} word scramble`} className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">{title}</h3>
      {blurb && <p className="text-sm text-gray-600 dark:text-gray-400">{blurb}</p>}
      <GameScoreBadge stats={stats} />

      {!finished && currentWord && (
        <form onSubmit={submit} className="space-y-2">
          <p className="text-sm">
            Word {step + 1} / {order.length} · Score: <span className="font-semibold">{score}</span>
          </p>
          <p className="text-3xl font-bold tracking-widest">{scrambled}</p>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="scramble-answer" className="sr-only">
              Your answer
            </label>
            <input
              id="scramble-answer"
              type="text"
              value={input}
              disabled={revealed}
              onChange={(e) => setInput(e.target.value)}
              className="rounded border px-2 py-1 text-sm uppercase"
              placeholder="Type your answer"
            />
            {!revealed && (
              <button type="submit" className="rounded border px-3 py-1 text-sm">
                Check
              </button>
            )}
            {revealed && (
              <button type="button" onClick={next} className="rounded border px-3 py-1 text-sm">
                Next
              </button>
            )}
          </div>
          {feedback === 'correct' && <p className="text-green-600">Correct! ✓</p>}
          {feedback === 'incorrect' && (
            <p className="text-red-600">Not quite — the word was {currentWord}.</p>
          )}
        </form>
      )}

      {finished && (
        <div className="space-y-2">
          <p className="font-medium">
            Done! You scored {score} / {order.length}.
          </p>
          <button type="button" onClick={restart} className="rounded border px-3 py-1 text-sm">
            Play again
          </button>
        </div>
      )}
    </section>
  );
}
