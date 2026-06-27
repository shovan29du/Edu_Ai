import React, { useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

function storageKey(child, subjectName) {
  return `practiceMissed:${child}:${subjectName}`;
}

function loadMissed(child, subjectName) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(child, subjectName)) || '[]');
  } catch {
    return [];
  }
}

function saveMissed(child, subjectName, missedQuestions) {
  localStorage.setItem(storageKey(child, subjectName), JSON.stringify(missedQuestions));
}

function orderWithMissedFirst(questions, missedQuestions) {
  const missedSet = new Set(missedQuestions);
  const missed = questions.filter((q) => missedSet.has(q.question));
  const rest = questions.filter((q) => !missedSet.has(q.question));
  return [...missed, ...rest];
}

export default function PracticeQuiz({ subjectName, questions }) {
  const { child } = useChild();
  const [missedQuestions, setMissedQuestions] = useState(() => loadMissed(child, subjectName));
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  if (!questions?.length) return null;

  const ordered = orderWithMissedFirst(questions, missedQuestions);

  function checkAnswer(question, given) {
    const correct = String(given).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
    setFeedback((prev) => ({ ...prev, [question.question]: correct ? 'correct' : 'incorrect' }));
    setMissedQuestions((prev) => {
      const next = correct
        ? prev.filter((q) => q !== question.question)
        : prev.includes(question.question)
          ? prev
          : [...prev, question.question];
      saveMissed(child, subjectName, next);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {missedQuestions.length > 0 && (
        <p className="text-sm text-orange-600 dark:text-orange-400">
          Questions you missed before are shown first so you can try them again.
        </p>
      )}
      {ordered.map((q) => {
        const wasMissed = missedQuestions.includes(q.question);
        const result = feedback[q.question];
        return (
          <div
            key={q.question}
            className={`rounded border p-3 dark:border-gray-700 ${wasMissed ? 'border-orange-500' : ''}`}
          >
            <p className="font-medium">
              Practice Question: {q.question} {wasMissed && <span className="text-orange-600">(missed before)</span>}
            </p>
            {q.type === 'multiple_choice' && q.options?.length > 0 ? (
              <div className="mt-2 space-y-1">
                {q.options.map((opt) => (
                  <label key={opt} className="block text-sm">
                    <input
                      type="radio"
                      name={`practice-${q.question}`}
                      value={opt}
                      checked={answers[q.question] === opt}
                      onChange={() => {
                        setAnswers((prev) => ({ ...prev, [q.question]: opt }));
                        checkAnswer(q, opt);
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
                  checkAnswer(q, answers[q.question] || '');
                }}
              >
                <input
                  type="text"
                  value={answers[q.question] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.question]: e.target.value }))}
                  className="rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
                />
                <button type="submit" className="rounded border px-2 py-1 text-sm">
                  Check
                </button>
              </form>
            )}
            {result === 'correct' && <p className="mt-1 text-sm text-green-600">Correct! ✓</p>}
            {result === 'incorrect' && (
              <p className="mt-1 text-sm text-red-600">Not quite. Answer: {q.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
