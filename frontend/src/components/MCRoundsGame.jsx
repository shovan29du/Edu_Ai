import React, { useEffect, useState } from 'react';
import { shuffle } from '../utils/gameUtils.js';
import GameScoreBadge from './GameScoreBadge.jsx';

export default function MCRoundsGame({ title, blurb, rounds, onComplete, stats }) {
  const [order, setOrder] = useState(() => shuffle(rounds.map((_, i) => i)));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [reported, setReported] = useState(false);

  const finished = step >= order.length;
  const round = !finished ? rounds[order[step]] : null;

  useEffect(() => {
    if (!finished || reported) return;
    setReported(true);
    if (!onComplete) return;
    onComplete({ score, maxScore: order.length, label: `${score}/${order.length} correct` });
  }, [finished, reported, onComplete, score, order.length]);

  function choose(option) {
    if (answered || !round) return;
    setSelected(option);
    setAnswered(true);
    if (option === round.answer) setScore((s) => s + 1);
  }

  function next() {
    setStep((s) => s + 1);
    setSelected(null);
    setAnswered(false);
  }

  function restart() {
    setOrder(shuffle(rounds.map((_, i) => i)));
    setStep(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setReported(false);
  }

  return (
    <section aria-label={`${title} puzzle`} className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">{title}</h3>
      {blurb && <p className="text-sm text-gray-600 dark:text-gray-400">{blurb}</p>}
      <GameScoreBadge stats={stats} />

      {!finished && round && (
        <div className="space-y-2">
          <p className="text-sm">
            Round {step + 1} / {order.length} · Score: <span className="font-semibold">{score}</span>
          </p>
          {round.clues && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {round.clues.map((clue, i) => (
                <li key={i}>{clue}</li>
              ))}
            </ul>
          )}
          <p className="font-medium">{round.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {round.options.map((opt) => {
              const isSelected = selected === opt;
              const isAnswer = opt === round.answer;
              let cls = 'rounded border px-3 py-1 text-sm';
              if (answered && isAnswer) cls += ' border-green-500 bg-green-100 dark:bg-green-900';
              else if (answered && isSelected) cls += ' border-red-500 bg-red-100 dark:bg-red-900';
              return (
                <button key={opt} type="button" onClick={() => choose(opt)} disabled={answered} className={cls}>
                  {opt}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="space-y-2">
              <p className={selected === round.answer ? 'text-green-600' : 'text-red-600'}>
                {selected === round.answer ? 'Correct! ✓' : `Not quite — the answer was ${round.answer}.`}
              </p>
              {round.explanation && <p className="text-xs text-gray-500 dark:text-gray-400">{round.explanation}</p>}
              <button type="button" onClick={next} className="rounded border px-3 py-1 text-sm">
                Next
              </button>
            </div>
          )}
        </div>
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
