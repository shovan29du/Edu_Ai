import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import LevelSelector from './LevelSelector.jsx';

const API = '/api/ai-tutor';

const DIFFICULTIES = ['', 'simple', 'standard', 'advanced'];

export default function AiTutor({ level: initialLevel = '1', subjectName = '' }) {
  const [mode, setMode] = useState('ask');
  const [input, setInput] = useState('');
  const [level, setLevel] = useState(initialLevel);
  const [subject, setSubject] = useState(subjectName);
  const [ageGroup, setAgeGroup] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function post(endpoint, body) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          age_group: ageGroup,
          language,
          difficulty,
          ...body,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    if (mode === 'ask') post('ask', { question: input, subject });
    else if (mode === 'explain') post('explain', { concept: input, subject });
    else if (mode === 'flashcards') post('flashcards', { topic: input, subject, count: 8 });
    else if (mode === 'quiz') post('quiz', { topic: input, subject, count: 5 });
    else if (mode === 'study-plan') post('study-plan', { subject: input, days: 7 });
  }

  const MODES = [
    { id: 'ask', label: '❓ Ask a Question' },
    { id: 'explain', label: '📖 Explain a Concept' },
    { id: 'flashcards', label: '🃏 Flashcards' },
    { id: 'quiz', label: '📝 Generate Quiz' },
    { id: 'study-plan', label: '📅 Study Plan' },
  ];

  const placeholder = {
    ask: 'Ask EduBot anything about your subject…',
    explain: 'Enter a concept to explain (e.g. photosynthesis, gradient descent, market equilibrium)…',
    flashcards: 'Enter a topic for flashcards (e.g. fractions, neural networks)…',
    quiz: 'Enter a topic for a quiz (e.g. World War II, transformers, microeconomics)…',
    'study-plan': 'Enter a subject for a 7-day study plan…',
  }[mode];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <h2 className="text-xl font-bold">🤖 EduBot — AI Tutor</h2>
        <p className="text-sm opacity-90">
          Your personal learning assistant for school, college, undergraduate, master's, and adult self-study.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); setInput(''); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              mode === m.id ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <LevelSelector level={level} onChange={setLevel} />
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500">Subject (optional)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Machine Learning"
              className="w-full rounded border px-2 py-1 dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Age group (optional)</label>
            <input
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              placeholder="e.g. adult, 25-34"
              className="w-full rounded border px-2 py-1 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Preferred language (optional)</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English, Spanish"
              className="w-full rounded border px-2 py-1 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Difficulty preference</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded border px-2 py-1 dark:bg-gray-800"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d ? d[0].toUpperCase() + d.slice(1) : 'Default for level'}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border p-3 dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-purple-600 px-6 py-2 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Ask EduBot'}
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border bg-white p-4 shadow dark:bg-gray-900">
          {(mode === 'ask' || mode === 'explain') && (
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {result.answer || result.explanation}
            </div>
          )}

          {mode === 'flashcards' && Array.isArray(result.flashcards) && (
            <div>
              <h3 className="mb-3 font-semibold">Flashcards</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.flashcards.map((fc, i) => (
                  <FlashCard key={i} front={fc.front ?? fc.q} back={fc.back ?? fc.a} />
                ))}
              </div>
            </div>
          )}

          {mode === 'quiz' && Array.isArray(result.quiz) && (
            <MiniQuiz questions={result.quiz} />
          )}

          {mode === 'study-plan' && (
            <div className="whitespace-pre-wrap text-sm">{result.plan}</div>
          )}
        </div>
      )}
    </div>
  );
}

function FlashCard({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped(!flipped)}
      className="min-h-[80px] rounded-lg border-2 border-purple-300 p-3 text-left transition hover:border-purple-500"
    >
      <p className="text-xs font-medium text-purple-500">{flipped ? 'Answer' : 'Question'}</p>
      <p className="mt-1 text-sm">{flipped ? back : front}</p>
      <p className="mt-1 text-xs text-gray-400">Tap to flip</p>
    </button>
  );
}

function MiniQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function score() {
    return questions.filter((q, i) => answers[i] === q.answer).length;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Mini Quiz</h3>
      {questions.map((q, i) => (
        <div key={i} className="space-y-1">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => {
              const isSelected = answers[i] === j;
              const isCorrect = submitted && j === q.answer;
              const isWrong = submitted && isSelected && j !== q.answer;
              return (
                <label
                  key={j}
                  className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm ${
                    isCorrect ? 'bg-green-100 dark:bg-green-900' :
                    isWrong ? 'bg-red-100 dark:bg-red-900' :
                    isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${i}`}
                    disabled={submitted}
                    checked={isSelected}
                    onChange={() => setAnswers({ ...answers, [i]: j })}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded bg-purple-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Submit
        </button>
      ) : (
        <p className="font-semibold text-green-600">Score: {score()} / {questions.length}</p>
      )}
    </div>
  );
}
