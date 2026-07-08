import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { SpeakButton } from '../utils/tts.jsx';

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', color: 'green' },
  { id: 'elementary', label: 'Elementary', emoji: '📗', color: 'blue' },
  { id: 'intermediate', label: 'Intermediate', emoji: '📘', color: 'purple' },
  { id: 'advanced', label: 'Advanced', emoji: '📙', color: 'orange' },
];

export default function GrammarAcademy() {
  const [overview, setOverview] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grammar')
      .then((r) => r.json())
      .then((d) => { setOverview(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function loadLevel(levelId) {
    setLoading(true);
    setSelectedLesson(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    const data = await fetch(`/api/grammar/${levelId}`).then((r) => r.json());
    setSelectedLevel(levelId);
    setLevelData(data);
    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;

  // Level selection
  if (!selectedLevel) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <h2 className="text-xl font-bold">📝 Grammar Academy</h2>
          <p className="text-sm opacity-90">{overview?.title || 'English Grammar'}</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{overview?.description}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((lv) => {
            const meta = overview?.levels?.[lv.id];
            return (
              <button
                key={lv.id}
                onClick={() => loadLevel(lv.id)}
                className="rounded-xl border-2 border-transparent bg-white p-4 text-left shadow hover:border-blue-400 transition dark:bg-gray-900"
              >
                <div className="text-2xl">{lv.emoji}</div>
                <div className="mt-1 font-semibold">{meta?.label || lv.label}</div>
                <div className="text-sm text-gray-500">{meta?.lessons?.length || 0} lessons</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Lesson list
  if (!selectedLesson) {
    const lessons = levelData?.lessons || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedLevel(null)} className="text-blue-600 hover:underline text-sm">← Levels</button>
          <h2 className="font-bold text-lg">{levelData?.label}</h2>
        </div>
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => { setSelectedLesson(lesson); setQuizAnswers({}); setQuizSubmitted(false); }}
              className="w-full rounded-xl border bg-white p-4 text-left shadow-sm hover:border-blue-400 transition dark:bg-gray-900"
            >
              <span className="text-sm font-medium text-blue-600">Lesson {i + 1}</span>
              <p className="font-semibold">{lesson.title}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Lesson view
  const lesson = selectedLesson;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedLesson(null)} className="text-blue-600 hover:underline text-sm">← Lessons</button>
        <h2 className="font-bold text-lg flex-1">{lesson.title}</h2>
        <SpeakButton text={`${lesson.title}. ${lesson.explanation}`} lang="en" />
      </div>

      <div className="rounded-xl border bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="font-semibold mb-1">Explanation</h3>
        <p className="text-sm">{lesson.explanation}</p>
      </div>

      {lesson.examples && lesson.examples.length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Examples</h3>
          <ul className="space-y-1">
            {lesson.examples.map((ex, i) => (
              <li key={i} className="text-sm italic text-gray-600 dark:text-gray-300">"{ex}"</li>
            ))}
          </ul>
        </div>
      )}

      {lesson.structure && (
        <div className="rounded-xl border p-4 space-y-2">
          <h3 className="font-semibold">Essay Structure</h3>
          {Object.entries(lesson.structure).map(([k, v]) => (
            <div key={k}>
              <p className="text-sm font-medium capitalize text-blue-600">{k}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{v}</p>
            </div>
          ))}
        </div>
      )}

      {lesson.exercises && lesson.exercises.length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Exercises</h3>
          <div className="space-y-3">
            {lesson.exercises.map((ex, i) => (
              <div key={i} className="rounded bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500">{ex.instruction}</p>
                <p className="text-sm mt-1 italic">"{ex.sentence}"</p>
                <details className="mt-1">
                  <summary className="text-xs text-blue-500 cursor-pointer">Show answer</summary>
                  <p className="text-sm text-green-600 mt-1">{ex.answer}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.quiz && lesson.quiz.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <h3 className="font-semibold">Quick Quiz</h3>
          {lesson.quiz.map((q, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-medium">{i + 1}. {q.question}</p>
              <div className="space-y-1">
                {q.options.map((opt, j) => {
                  const isSelected = quizAnswers[i] === j;
                  const isCorrect = quizSubmitted && j === q.answer;
                  const isWrong = quizSubmitted && isSelected && j !== q.answer;
                  return (
                    <label key={j} className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm ${
                      isCorrect ? 'bg-green-100 dark:bg-green-900' :
                      isWrong ? 'bg-red-100 dark:bg-red-900' :
                      isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}>
                      <input
                        type="radio"
                        name={`gq${i}`}
                        disabled={quizSubmitted}
                        checked={isSelected}
                        onChange={() => setQuizAnswers({ ...quizAnswers, [i]: j })}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Check Answers
            </button>
          ) : (
            <p className="font-semibold text-green-600">
              Score: {lesson.quiz.filter((q, i) => quizAnswers[i] === q.answer).length} / {lesson.quiz.length} ✅
            </p>
          )}
        </div>
      )}
    </div>
  );
}
