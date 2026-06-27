import React, { useState } from 'react';

export default function PracticeQuiz({ questions }) {
  const [revealed, setRevealed] = useState({});

  if (!questions?.length) return null;

  function toggle(index) {
    setRevealed((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} className="rounded border p-3 dark:border-gray-700">
          <p className="font-medium">
            Practice Question {i + 1}: {q.question}
          </p>
          {q.type === 'multiple_choice' && q.options?.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
              {q.options.map((opt) => (
                <li key={opt}>{opt}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => toggle(i)}
            className="mt-2 rounded border px-2 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
          >
            {revealed[i] ? 'Hide answer' : 'Show answer'}
          </button>
          {revealed[i] && (
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">Answer: {q.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
