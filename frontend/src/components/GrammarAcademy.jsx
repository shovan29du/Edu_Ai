import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { SpeakButton } from '../utils/tts.jsx';

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱' },
  { id: 'elementary', label: 'Elementary', emoji: '📗' },
  { id: 'intermediate', label: 'Intermediate', emoji: '📘' },
  { id: 'advanced', label: 'Advanced', emoji: '📙' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', ttsLang: 'en' },
  { code: 'fr', label: 'French', flag: '🇫🇷', ttsLang: 'fr' },
  { code: 'de', label: 'German', flag: '🇩🇪', ttsLang: 'de' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', ttsLang: 'es' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', ttsLang: 'it' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹', ttsLang: 'pt' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', ttsLang: 'ru' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', ttsLang: 'ar' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳', ttsLang: 'zh' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', ttsLang: 'ja' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷', ttsLang: 'ko' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', ttsLang: 'hi' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', ttsLang: 'tr' },
  { code: 'fa', label: 'Farsi', flag: '🇮🇷', ttsLang: 'fa' },
];

export default function GrammarAcademy() {
  const [langCode, setLangCode] = useState('en');
  const [overview, setOverview] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const activeLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setSelectedLevel(null);
    setSelectedLesson(null);
    setLevelData(null);
    const url = langCode === 'en' ? '/api/grammar' : `/api/grammar/language/${langCode}`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(d => { setOverview(d); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [langCode, retryCount]);

  async function loadLevel(levelId) {
    setLoading(true);
    setSelectedLesson(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const url = langCode === 'en'
        ? `/api/grammar/${levelId}`
        : `/api/grammar/language/${langCode}/${levelId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('fetch failed');
      const data = await response.json();
      setSelectedLevel(levelId);
      setLevelData(data);
    } catch {
      setFetchError(true);
    }
    setLoading(false);
  }

  const langPicker = (
    <div className="flex flex-wrap gap-2 mb-4">
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          onClick={() => setLangCode(l.code)}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
            langCode === l.code
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );

  if (loading) return <><div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white mb-4"><h2 className="text-xl font-bold">📝 Grammar Academy</h2></div>{langPicker}<LoadingSpinner /></>;

  if (fetchError) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <h2 className="text-xl font-bold">📝 Grammar Academy</h2>
      </div>
      {langPicker}
      <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
        Could not load grammar content — make sure the backend is running.
        <button onClick={() => setRetryCount(count => count + 1)} className="ml-3 underline font-medium">Retry</button>
      </div>
    </div>
  );

  // Level selection
  if (!selectedLevel) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <h2 className="text-xl font-bold">📝 Grammar Academy</h2>
          <p className="text-sm opacity-90">{overview?.title || `${activeLang.label} Grammar`}</p>
        </div>
        {langPicker}
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
        <SpeakButton text={`${lesson.title}. ${lesson.explanation}`} lang={activeLang.ttsLang} />
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
          <h3 className="font-semibold">Structure</h3>
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
