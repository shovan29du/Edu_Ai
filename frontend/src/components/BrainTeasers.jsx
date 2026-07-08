import { useState, useEffect } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API = '/api';

function PuzzleCard({ item, type }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 mb-4">
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm font-medium text-gray-800 flex-1">{item.puzzle}</p>
        <SpeakButton text={item.puzzle} lang="en" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {item.hint && (
          <button onClick={() => setShowHint(h => !h)}
            className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200">
            {showHint ? 'Hide hint' : '💡 Hint'}
          </button>
        )}
        <button onClick={() => setShowAnswer(a => !a)}
          className="text-xs px-3 py-1 rounded-full bg-purple-200 text-purple-800 hover:bg-purple-300">
          {showAnswer ? 'Hide answer' : '🔓 Reveal answer'}
        </button>
      </div>
      {showHint && item.hint && (
        <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{item.hint}</p>
      )}
      {showAnswer && (
        <div className="mt-2 bg-white border border-purple-200 rounded-lg px-3 py-2">
          <p className="text-sm font-semibold text-purple-800">Answer: {item.answer}</p>
          {item.explanation && <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>}
        </div>
      )}
    </div>
  );
}

function CategoryView({ catId, onBack }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${API}/brain-teasers/${catId}`).then(r => r.json()).then(setData);
  }, [catId]);
  if (!data) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-purple-700 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-1">{data.emoji} {data.label}</h2>
      <p className="text-gray-500 text-sm mb-5">{data.items?.length} puzzle{data.items?.length !== 1 ? 's' : ''}</p>
      <div>
        {data.items?.map((item, i) => (
          <div key={item.id || i}>
            <p className="text-xs font-bold text-purple-500 mb-1 uppercase tracking-wide">#{i + 1}</p>
            <PuzzleCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrainTeasers() {
  const [overview, setOverview] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  useEffect(() => { fetch(`${API}/brain-teasers`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedCat) return (
    <div className="max-w-3xl mx-auto p-4">
      <CategoryView catId={selectedCat.id} onBack={() => setSelectedCat(null)} />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-purple-700 mb-1">🧩 Brain Teasers & Puzzles</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat)}
            className="text-left rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{cat.emoji}</p>
            <p className="font-bold text-gray-800">{cat.label}</p>
            <p className="text-xs text-purple-600 mt-2">{cat.count} puzzle{cat.count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
