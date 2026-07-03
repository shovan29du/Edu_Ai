import { useState, useEffect } from 'react';

const API = '/api';

function ObjectLinks({ links }) {
  if (!links) return null;
  const items = [
    links.wikipedia && { href: links.wikipedia, label: 'ℹ Wikipedia', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    links.image_search && { href: links.image_search, label: '🖼 Images', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    links.video && { href: links.video, label: '▶ Watch Video', color: 'bg-red-100 text-red-700 border-red-200' },
    links.podcast && { href: links.podcast, label: '🎙 Podcast', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    links.museum_channel && { href: links.museum_channel, label: '🏛 Museum Channel', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-5 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">🔗 Explore Further</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(({ href, label, color }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium hover:opacity-80 transition-opacity ${color}`}>
            {label}
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">Links open Wikipedia, Wikimedia Commons, YouTube, and BBC In Our Time podcast.</p>
    </div>
  );
}

function ObjectQuiz({ quiz }) {
  const [selected, setSelected] = useState(null);
  if (!quiz?.question) return null;
  return (
    <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-4">
      <h3 className="font-semibold text-green-800 mb-3">🧠 Quick Quiz</h3>
      <p className="text-sm font-medium text-green-900 mb-3">{quiz.question}</p>
      <div className="grid grid-cols-2 gap-2">
        {quiz.options?.map((opt, i) => {
          let cls = 'text-left px-3 py-2 rounded-lg text-sm border transition-colors ';
          if (selected === null) cls += 'bg-white border-green-300 hover:bg-green-100 text-green-800 cursor-pointer';
          else if (i === quiz.answer) cls += 'bg-green-500 text-white border-green-500 font-semibold';
          else if (i === selected) cls += 'bg-red-100 border-red-400 text-red-700';
          else cls += 'bg-gray-50 border-gray-200 text-gray-400';
          return (
            <button key={i} className={cls} disabled={selected !== null}
              onClick={() => setSelected(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className={`mt-3 text-sm font-semibold ${selected === quiz.answer ? 'text-green-700' : 'text-red-600'}`}>
          {selected === quiz.answer ? '✅ Correct!' : `❌ The answer is: ${quiz.options[quiz.answer]}`}
        </p>
      )}
    </div>
  );
}

function ObjectDetail({ gallery, objectId, onBack }) {
  const [obj, setObj] = useState(null);
  useEffect(() => {
    fetch(`${API}/museum/${gallery}/${objectId}`).then(r => r.json()).then(setObj);
  }, [gallery, objectId]);
  if (!obj) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-indigo-600 hover:underline">← Back</button>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{obj.name}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {obj.origin && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">📍 {obj.origin}</span>}
        {obj.year && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📅 {obj.year}</span>}
        {obj.material && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">🪨 {obj.material}</span>}
        {obj.category && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">{obj.category}</span>}
        {obj.related_lesson && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">📚 {obj.related_lesson}</span>}
      </div>

      {obj.image_hint && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-4 flex items-center gap-3">
          <span className="text-3xl">🖼️</span>
          <div>
            <p className="text-xs text-gray-400 italic">{obj.image_hint}</p>
            {obj.links?.image_search && (
              <a href={obj.links.image_search} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-0.5 block">View real images on Wikimedia Commons →</a>
            )}
          </div>
        </div>
      )}

      {obj.museum && (
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm text-indigo-700 border border-indigo-200">
          🏛️ {obj.museum}
        </div>
      )}

      <p className="text-gray-700 leading-relaxed mb-4">{obj.description}</p>

      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 mb-4">
        <h3 className="font-semibold text-indigo-800 mb-1">⭐ Why It Matters</h3>
        <p className="text-sm text-indigo-900">{obj.significance}</p>
      </div>

      {obj.educational_importance && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-1">🎓 Educational Importance</h3>
          <p className="text-sm text-blue-900">{obj.educational_importance}</p>
        </div>
      )}

      {obj.fun_fact && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-1">💡 Fun Fact</h3>
          <p className="text-sm text-yellow-900">{obj.fun_fact}</p>
        </div>
      )}

      {obj.activity && (
        <div className="rounded-xl bg-pink-50 border border-pink-200 p-4 mb-4">
          <h3 className="font-semibold text-pink-800 mb-1">✏️ Activity</h3>
          <p className="text-sm text-pink-900">{obj.activity}</p>
        </div>
      )}

      <ObjectQuiz quiz={obj.quiz} />

      {obj.related_subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 mb-2">
          <span className="text-xs text-gray-500 mr-1">Related:</span>
          {obj.related_subjects.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-600">{s}</span>
          ))}
        </div>
      )}

      <ObjectLinks links={obj.links} />
    </div>
  );
}

function ObjectCard({ obj, onClick }) {
  return (
    <button onClick={onClick}
      className="text-left rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 hover:shadow-md transition-shadow">
      <p className="font-bold text-gray-800">{obj.name}</p>
      <p className="text-xs text-gray-500 mt-1">{obj.origin} · {obj.year || obj.period}</p>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{obj.description?.slice(0, 120)}…</p>
      <div className="flex gap-1 mt-2 flex-wrap">
        {obj.category && <span className="text-xs px-2 py-0.5 rounded-full bg-white border capitalize">{obj.category}</span>}
        {obj.links?.video && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">▶</span>}
        {obj.links?.podcast && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">🎙</span>}
        {obj.links?.wikipedia && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">ℹ</span>}
      </div>
    </button>
  );
}

function GalleryView({ gallery, onBack }) {
  const [data, setData] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  useEffect(() => {
    fetch(`${API}/museum/${gallery.id}`).then(r => r.json()).then(setData);
  }, [gallery.id]);
  if (selectedObj) return <ObjectDetail gallery={gallery.id} objectId={selectedObj} onBack={() => setSelectedObj(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-indigo-600 hover:underline">← All Galleries</button>
      <h2 className="text-2xl font-bold mb-4">{gallery.emoji} {gallery.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.objects?.map(obj => (
            <ObjectCard key={obj.id} obj={obj} onClick={() => setSelectedObj(obj.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchView() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const search = () => {
    if (q.length < 2) return;
    fetch(`${API}/museum/search?q=${encodeURIComponent(q)}`).then(r => r.json())
      .then(d => { setResults(d.results || []); setSearched(true); });
  };
  if (selectedObj) return (
    <ObjectDetail gallery={selectedObj.gallery} objectId={selectedObj.id} onBack={() => setSelectedObj(null)} />
  );
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search objects, places, periods…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button onClick={search} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
      </div>
      {searched && results.length === 0 && <p className="text-gray-500 text-sm">No results found.</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {results.map(obj => (
          <button key={obj.id} onClick={() => setSelectedObj(obj)}
            className="text-left rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-gray-800">{obj.name}</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-700">{obj.gallery_label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{obj.origin} · {obj.period}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{obj.description?.slice(0, 100)}…</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VirtualMuseum() {
  const [overview, setOverview] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [tab, setTab] = useState('galleries');
  useEffect(() => { fetch(`${API}/museum`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedGallery) return <div className="max-w-3xl mx-auto p-4"><GalleryView gallery={selectedGallery} onBack={() => setSelectedGallery(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🏛️ Virtual Museum</h1>
      <p className="text-gray-500 mb-1">{overview.description}</p>
      <p className="text-xs text-gray-400 mb-4">Every object includes Wikipedia, image gallery, video, and BBC podcast links.</p>
      <div className="flex gap-3 mb-6 border-b">
        {['galleries', 'search'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'galleries' ? 'Browse Galleries' : '🔍 Search'}
          </button>
        ))}
      </div>
      {tab === 'search' && <SearchView />}
      {tab === 'galleries' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {overview.galleries.map(gallery => (
            <button key={gallery.id} onClick={() => setSelectedGallery(gallery)}
              className="text-left rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 hover:shadow-lg transition-shadow">
              <p className="text-3xl mb-2">{gallery.emoji}</p>
              <p className="font-bold text-gray-800">{gallery.label}</p>
              <p className="text-xs text-indigo-600 mt-1">{gallery.object_count} object{gallery.object_count !== 1 ? 's' : ''}</p>
              <div className="flex gap-1 mt-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">▶ Videos</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">🎙 Podcasts</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">🖼 Images</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
