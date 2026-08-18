import { useState, useEffect } from 'react';
import { speak, SpeakButton } from '../utils/tts.jsx';

const API = '/api';
const LEVEL_COLOURS = {
  beginner: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', btn: 'bg-green-500 hover:bg-green-600' },
  elementary: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', btn: 'bg-blue-500 hover:bg-blue-600' },
  intermediate: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', btn: 'bg-purple-500 hover:bg-purple-600' },
  advanced: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', btn: 'bg-red-500 hover:bg-red-600' },
};

function WordCard({ entry, flipped, onFlip }) {
  return (
    <div
      className="cursor-pointer"
      style={{ perspective: 600 }}
      onClick={onFlip}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: 140 }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-2xl font-bold text-indigo-700">{entry.word}</p>
          <button onClick={(e) => { e.stopPropagation(); speak(entry.word, 'en'); }}
            className="mt-1 rounded-full px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 hover:bg-indigo-200">
            🔊 Hear it
          </button>
          <p className="mt-1 text-xs text-indigo-400">Tap to reveal</p>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-start justify-center rounded-xl border-2 border-indigo-300 bg-white p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="font-semibold text-gray-800">{entry.meaning}</p>
          <p className="mt-1 text-sm italic text-gray-500">"{entry.example}"</p>
          {entry.synonyms?.length > 0 && (
            <p className="mt-1 text-xs text-green-600">Synonyms: {entry.synonyms.join(', ')}</p>
          )}
          {entry.antonyms?.length > 0 && (
            <p className="text-xs text-red-500">Antonyms: {entry.antonyms.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FlashcardMode({ words }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!words.length) return <p className="text-gray-500">No words in this category.</p>;
  const entry = words[index];
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-500">{index + 1} / {words.length}</p>
      <div className="w-full max-w-sm">
        <WordCard entry={entry} flipped={flipped} onFlip={() => setFlipped(f => !f)} />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          disabled={index === 0}
        >← Prev</button>
        <button
          onClick={() => { setIndex(i => Math.min(words.length - 1, i + 1)); setFlipped(false); }}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
          disabled={index === words.length - 1}
        >Next →</button>
      </div>
    </div>
  );
}

function QuizMode({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!quiz?.length) return <p className="text-gray-500">No quiz for this level.</p>;
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div className="space-y-6">
      {quiz.map((q, i) => (
        <div key={i} className="rounded-lg border p-4">
          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, j) => {
              let cls = 'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ';
              if (!submitted) cls += answers[i] === j ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
              else cls += 'border-gray-200 text-gray-400';
              return (
                <label key={j} className={cls}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-indigo-500"
                  />
                  {String.fromCharCode(65 + j)}. {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          disabled={Object.keys(answers).length < quiz.length}
        >Submit</button>
      ) : (
        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{score}/{quiz.length}</p>
          <p className="text-gray-600">{score === quiz.length ? '🎉 Perfect!' : score >= quiz.length * 0.6 ? '👍 Good job!' : '📚 Keep practising!'}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-2 text-sm text-indigo-600 underline">Try again</button>
        </div>
      )}
    </div>
  );
}

function LevelDetail({ levelId, onBack }) {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [activeCat, setActiveCat] = useState(null);
  const colours = LEVEL_COLOURS[levelId] || LEVEL_COLOURS.beginner;

  useEffect(() => {
    fetch(`${API}/vocabulary/${levelId}`)
      .then(r => r.json())
      .then(d => { setData(d); setActiveCat(Object.keys(d.categories || {})[0]); });
  }, [levelId]);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  const categories = data.categories || {};
  const catWords = activeCat ? (Array.isArray(categories[activeCat]) ? categories[activeCat] : []) : [];

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-indigo-600 hover:underline">← Back to levels</button>
      <h2 className={`text-2xl font-bold mb-1 ${colours.text}`}>{data.label}</h2>
      <p className="text-gray-600 mb-4 text-sm">{data.word_count} words across {Object.keys(categories).length} categories</p>

      <div className="flex gap-2 mb-6 border-b">
        {['browse', 'flashcards', 'quiz'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{t}</button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(categories).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize border transition-colors ${activeCat === cat ? `${colours.btn} text-white border-transparent` : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >{cat.replace(/_/g, ' ')}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {catWords.map((entry, i) => (
              <div key={i} className={`rounded-lg border-2 ${colours.border} ${colours.bg} p-3`}>
                <div className="flex items-center gap-1">
                  <p className={`font-bold text-lg flex-1 ${colours.text}`}>{entry.word}</p>
                  <SpeakButton text={entry.word} lang="en" />
                </div>
                <p className="text-gray-700 text-sm mt-0.5">{entry.meaning}</p>
                <p className="text-gray-500 text-xs italic mt-1">"{entry.example}"</p>
                {entry.synonyms?.length > 0 && (
                  <p className="text-xs mt-1 text-green-600">≈ {entry.synonyms.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(categories).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize border transition-colors ${activeCat === cat ? `${colours.btn} text-white border-transparent` : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >{cat.replace(/_/g, ' ')}</button>
            ))}
          </div>
          <FlashcardMode words={catWords} />
        </div>
      )}

      {activeTab === 'quiz' && <QuizMode quiz={data.quiz} />}
    </div>
  );
}

function SearchPanel() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = () => {
    if (q.length < 2) return;
    fetch(`${API}/vocabulary/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || []); setSearched(true); });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search any word…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={search}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >Search</button>
      </div>
      {searched && results.length === 0 && <p className="text-gray-500 text-sm">No results found.</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        {results.map((entry, i) => (
          <div key={i} className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-indigo-700">{entry.word}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-600 capitalize">{entry.level}</span>
            </div>
            <p className="text-gray-700 text-sm mt-0.5">{entry.meaning}</p>
            <p className="text-gray-500 text-xs italic">"{entry.example}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VocabularyAcademy() {
  const [overview, setOverview] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [tab, setTab] = useState('levels');

  useEffect(() => {
    fetch(`${API}/vocabulary`).then(r => r.json()).then(setOverview);
  }, []);

  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  if (selectedLevel) return (
    <div className="max-w-3xl mx-auto p-4">
      <LevelDetail levelId={selectedLevel} onBack={() => setSelectedLevel(null)} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-1">📖 English Vocabulary Academy</h1>
      <p className="text-gray-600 mb-6">{overview.description}</p>

      <div className="flex gap-3 mb-6 border-b">
        {['levels', 'search'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{t === 'levels' ? 'Browse Levels' : '🔍 Search'}</button>
        ))}
      </div>

      {tab === 'search' && <SearchPanel />}

      {tab === 'levels' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {overview.levels.map(level => {
            const colours = LEVEL_COLOURS[level.id] || LEVEL_COLOURS.beginner;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`text-left rounded-xl border-2 ${colours.border} ${colours.bg} p-5 hover:shadow-md transition-shadow`}
              >
                <p className={`text-xl font-bold capitalize ${colours.text}`}>{level.label}</p>
                <p className="text-gray-600 text-sm mt-1">{level.word_count} words</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {level.categories.map(c => (
                    <span key={c} className="text-xs bg-white/60 border border-gray-300 px-2 py-0.5 rounded-full capitalize">{c.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
