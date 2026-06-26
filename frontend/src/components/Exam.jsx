import React, { useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { postProgress } from '../api/progress.js';

function isCorrect(question, answer) {
  if (answer == null) return false;
  return String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
}

export default function Exam({ subjectName, exam }) {
  const { child } = useChild();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (!exam || !exam.questions?.length) return null;

  function setAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const total = exam.questions.length;
    const correct = exam.questions.filter((q, i) => isCorrect(q, answers[i])).length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= exam.passing_score;

    setResult({ score, passed, correct, total });
    await postProgress(child, {
      scores: { [subjectName]: score },
      badges: passed ? [`${subjectName}-exam-passed`] : [],
    });
  }

  return (
    <section aria-label={`${subjectName} exam`} className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">{subjectName} Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {exam.questions.map((q, i) => (
          <fieldset key={i}>
            <legend className="font-medium">{q.question}</legend>
            {q.type === 'multiple_choice' ? (
              q.options.map((opt) => (
                <label key={opt} className="block">
                  <input
                    type="radio"
                    name={`question-${i}`}
                    value={opt}
                    checked={answers[i] === opt}
                    onChange={() => setAnswer(i, opt)}
                  />{' '}
                  {opt}
                </label>
              ))
            ) : (
              <label className="block">
                <span className="sr-only">{q.question}</span>
                <input
                  type="text"
                  value={answers[i] || ''}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
                />
              </label>
            )}
          </fieldset>
        ))}
        <button
          type="submit"
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Submit Exam
        </button>
      </form>

      {result && (
        <p role="status" className="mt-3 font-semibold">
          Score: {result.score}% ({result.correct}/{result.total}) —{' '}
          {result.passed ? 'Passed! 🎉' : 'Try again'}
        </p>
      )}
    </section>
  );
}
