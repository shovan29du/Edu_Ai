import React, { useState } from 'react';

const ROUNDS = [
  { letter: 'A', correct: 'Apple', options: ['Apple', 'Ball', 'Cat'] },
  { letter: 'B', correct: 'Ball', options: ['Sun', 'Ball', 'Hat'] },
  { letter: 'C', correct: 'Cat', options: ['Dog', 'Cat', 'Egg'] },
  { letter: 'D', correct: 'Dog', options: ['Dog', 'Fox', 'Ice'] },
  { letter: 'E', correct: 'Egg', options: ['Egg', 'Net', 'Owl'] },
  { letter: 'F', correct: 'Fish', options: ['Pig', 'Fish', 'Box'] },
  { letter: 'G', correct: 'Goat', options: ['Hat', 'Goat', 'Jam'] },
  { letter: 'H', correct: 'Hat', options: ['Hat', 'Kite', 'Lamp'] },
  { letter: 'M', correct: 'Moon', options: ['Sun', 'Star', 'Moon'] },
  { letter: 'S', correct: 'Sun', options: ['Sun', 'Rain', 'Tree'] },
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PhonicsMatchGame() {
  const [order] = useState(() => shuffle(ROUNDS.map((_, i) => i)));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const finished = step >= order.length;
  const round = !finished ? ROUNDS[order[step]] : null;

  function choose(word) {
    if (round.correct === word) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    setTimeout(() => {
      setFeedback(null);
      setStep((s) => s + 1);
    }, 600);
  }

  function restart() {
    setStep(0);
    setScore(0);
    setFeedback(null);
  }

  return (
    <section aria-label="Phonics matching game" className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">Phonics Match</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Pick the word that starts with the letter shown.
      </p>
      {!finished && round && (
        <div className="space-y-2">
          <p className="text-sm">
            Score: <span className="font-semibold">{score}</span> / {order.length}
          </p>
          <p className="text-3xl font-bold">{round.letter}</p>
          <div className="flex flex-wrap gap-2">
            {round.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => choose(opt)}
                className="rounded border px-3 py-1 text-sm"
              >
                {opt}
              </button>
            ))}
          </div>
          {feedback === 'correct' && <p className="text-green-600">Correct! ✓</p>}
          {feedback === 'incorrect' && <p className="text-red-600">Not quite — try the next one!</p>}
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
