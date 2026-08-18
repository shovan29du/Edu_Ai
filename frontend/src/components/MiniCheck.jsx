import React, { useState } from 'react';

export default function MiniCheck({ question, onPassed }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  function check(value) {
    const correct = String(value).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
    if (correct) {
      setFeedback('correct');
      onPassed();
    } else {
      setFeedback('incorrect');
    }
  }

  return (
    <div className="mt-3 rounded border p-3 dark:border-gray-700">
      <p className="text-sm font-medium">Quick check: {question.question}</p>
      {question.type === 'multiple_choice' && question.options?.length > 0 ? (
        <div className="mt-2 space-y-1">
          {question.options.map((opt) => (
            <label key={opt} className="block text-sm">
              <input
                type="radio"
                name="mini-check"
                value={opt}
                checked={answer === opt}
                onChange={() => {
                  setAnswer(opt);
                  check(opt);
                }}
              />{' '}
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            check(answer);
          }}
        >
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          />
          <button type="submit" className="rounded border px-2 py-1 text-sm">
            Check
          </button>
        </form>
      )}
      {feedback === 'incorrect' && (
        <p className="mt-1 text-sm text-red-600">Not quite — try again!</p>
      )}
      {feedback === 'correct' && <p className="mt-1 text-sm text-green-600">Correct! ✓</p>}
    </div>
  );
}
