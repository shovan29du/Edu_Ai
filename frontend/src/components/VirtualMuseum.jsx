import { useState, useEffect } from 'react';

const API = '/api';

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
        {obj.period && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📅 {obj.period}</span>}
        {obj.category && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">{obj.category}</span>}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-500 italic border">
        🏛️ {obj.museum}
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">{obj.description}</p>
      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 mb-4">
        <h3 className="font-semibold text-indigo-800 mb-1">⭐ Why It Matters</h3>
        <p className="text-sm text-indigo-900">{obj.significance}</p>
      </div>
      {obj.fun_fact && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-1">💡 Fun Fact</h3>
          <p className="text-sm text-yellow-900">{obj.fun_fact}</p>
        </div>
      )}
      {obj.related_subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-gray-500 mr-1">Related:</span>
          {obj.related_subjects.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-600">{s}</span>
          ))}
        </div>
      )}
    </div>
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
            <button key={obj.id} onClick={() => setSelectedObj(obj.id)}
              className="text-left rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800">{obj.name}</p>
              <p className="text-xs text-gray-500 mt-1">{obj.origin} · {obj.period}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{obj.description?.slice(0, 120)}…</p>
              <div className="flex gap-1 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border capitalize">{obj.category}</span>
              </div>
            </button>
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
      <p className="text-gray-500 mb-4">{overview.description}</p>
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
