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

  const total = exam.questions.length;
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v !== '').length;
  const allAnswered = answeredCount === total;

  function setAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const perQuestion = exam.questions.map((q, i) => isCorrect(q, answers[i]));
    const correct = perQuestion.filter(Boolean).length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= exam.passing_score;

    setResult({ score, passed, correct, total, perQuestion });
    await postProgress(child, {
      scores: { [subjectName]: score },
      badges: passed ? [`${subjectName}-exam-passed`] : [],
    });
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <section aria-label={`${subjectName} exam`} className="rounded border p-4 dark:border-gray-700">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{subjectName} Exam</h2>
        {!result && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount}/{total} answered
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {exam.questions.map((q, i) => {
          const feedback = result?.perQuestion?.[i];
          return (
            <fieldset
              key={i}
              className={`rounded border p-3 dark:border-gray-700 ${
                result ? (feedback ? 'border-green-500' : 'border-red-500') : ''
              }`}
            >
              <legend className="font-medium">
                Question {i + 1} of {total}: {q.question}
                {result && (feedback ? ' ✅' : ' ❌')}
              </legend>
              {q.type === 'multiple_choice' ? (
                q.options.map((opt) => (
                  <label key={opt} className="block">
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => setAnswer(i, opt)}
                      disabled={!!result}
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
                    disabled={!!result}
                    className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
                  />
                </label>
              )}
              {result && !feedback && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Correct answer: {q.answer}
                </p>
              )}
            </fieldset>
          );
        })}

        {!result && (
          <button
            type="submit"
            disabled={!allAnswered}
            className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50"
          >
            Submit Exam
          </button>
        )}
      </form>

      {result && (
        <div className="mt-3">
          <p role="status" className="font-semibold">
            Score: {result.score}% ({result.correct}/{result.total}) —{' '}
            {result.passed ? 'Passed! 🎉' : 'Try again'}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
          >
            Retry exam
          </button>
        </div>
      )}
    </section>
  );
}
