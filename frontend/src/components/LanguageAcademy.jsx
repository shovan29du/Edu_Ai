import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function LanguageAcademy() {
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [tab, setTab] = useState('overview');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/languages')
      .then((r) => r.json())
      .then((d) => { setLanguages(d.languages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function selectLang(code) {
    setLoading(true);
    setVocab(null);
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setTab('overview');
    try {
      const [langRes, quizRes] = await Promise.all([
        fetch(`/api/languages/${code}`).then((r) => r.json()),
        fetch(`/api/languages/${code}/quiz`).then((r) => r.json()),
      ]);
      setSelected(langRes);
      setVocab(langRes.vocabulary || null);
      setQuiz(quizRes.quiz || null);
      if (langRes.vocabulary) {
        setCategory(Object.keys(langRes.vocabulary)[0]);
      }
    } catch {}
    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
          <h2 className="text-xl font-bold">🌍 Language Academy</h2>
          <p className="text-sm opacity-90">Learn 10 world languages</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLang(lang.code)}
              className="rounded-xl border-2 border-transparent p-4 text-left shadow hover:border-green-400 hover:shadow-md transition bg-white dark:bg-gray-900"
            >
              <div className="text-3xl">{lang.flag}</div>
              <div className="mt-1 font-semibold">{lang.name}</div>
              <div className="text-sm text-gray-500">{lang.native}</div>
              <div className="mt-1 text-xs text-gray-400">{lang.speakers} speakers</div>
              <div className="mt-1 text-xs italic text-green-600">{lang.greeting}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const lang = selected;
  const tabs = ['overview', 'vocabulary', 'sentences', 'grammar', 'quiz'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelected(null)} className="text-green-600 hover:underline text-sm">← All Languages</button>
        <h2 className="text-lg font-bold">{lang.flag} {lang.name}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize font-medium ${
              tab === t ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm">{lang.description}</p>
            <p className="mt-2 text-xs text-gray-500">Family: {lang.family} · Countries: {Array.isArray(lang.countries) ? lang.countries.join(', ') : lang.countries}</p>
            {lang.fun_fact && <p className="mt-2 text-xs italic">💡 {lang.fun_fact}</p>}
          </div>
          {lang.alphabet && (
            <div className="rounded-xl border p-4">
              <h3 className="font-semibold mb-1">Alphabet / Script</h3>
              <p className="text-sm">{lang.alphabet}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'vocabulary' && vocab && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.keys(vocab).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded px-3 py-1 text-sm capitalize ${
                  category === cat ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {category && vocab[category] && (
            <div className="grid gap-2 sm:grid-cols-2">
              {vocab[category].map((item, i) => (
                <div key={i} className={`rounded-lg border p-3 ${lang.direction === 'rtl' ? 'text-right' : ''}`}>
                  <div className="text-lg font-bold" dir={lang.direction || 'ltr'}>{item.word}</div>
                  {item.transliteration && <div className="text-xs text-gray-500 italic">{item.transliteration}</div>}
                  <div className="text-sm font-medium text-green-600">{item.translation}</div>
                  {item.example && <div className="mt-1 text-xs text-gray-500">{item.example}</div>}
                  {item.pronunciation && <div className="text-xs text-gray-400">{item.pronunciation}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sentences' && lang.common_sentences && (
        <div className="space-y-2">
          {lang.common_sentences.map((s, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="font-medium" dir={lang.direction || 'ltr'}>{s[lang.code] || s.french || s.spanish || s.arabic || s.german || Object.values(s)[0]}</div>
              {s.pronunciation && <div className="text-xs text-gray-500 italic">{s.pronunciation}</div>}
              {s.transliteration && <div className="text-xs text-gray-500 italic">{s.transliteration}</div>}
              <div className="text-sm text-green-600">{s.english}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'grammar' && lang.grammar_basics && (
        <div className="space-y-3">
          {lang.grammar_basics.map((g, i) => (
            <div key={i} className="rounded-xl border p-4">
              <h3 className="font-semibold">{g.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{g.explanation}</p>
              {g.examples && (
                <ul className="mt-2 space-y-1">
                  {g.examples.map((ex, j) => <li key={j} className="text-xs text-gray-500">• {ex}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && quiz && (
        <QuizPanel questions={quiz} answers={quizAnswers} setAnswers={setQuizAnswers} submitted={quizSubmitted} setSubmitted={setQuizSubmitted} />
      )}

      {tab === 'quiz' && !quiz && <p className="text-gray-500">Quiz coming soon for this language.</p>}
    </div>
  );
}

function QuizPanel({ questions, answers, setAnswers, submitted, setSubmitted }) {
  function score() {
    return questions.filter((q, i) => answers[i] === q.answer).length;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Language Quiz</h3>
      {questions.map((q, i) => (
        <div key={i} className="space-y-1">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => {
              const letter = ['A', 'B', 'C', 'D'][j];
              const isSelected = answers[i] === letter;
              const isCorrect = submitted && letter === q.answer;
              const isWrong = submitted && isSelected && letter !== q.answer;
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
                    onChange={() => setAnswers({ ...answers, [i]: letter })}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="text-xs text-gray-500 italic">{q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded bg-green-500 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Submit Quiz
        </button>
      ) : (
        <p className="font-semibold text-green-600">Score: {score()} / {questions.length} 🎉</p>
      )}
    </div>
  );
}
