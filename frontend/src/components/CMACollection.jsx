import { useState, useEffect, useCallback } from 'react';

const TYPE_EMOJI = {
  Painting: '🖼️', Drawing: '✏️', Print: '🖨️', Photograph: '📷',
  Sculpture: '🗿', Ceramic: '🏺', Textile: '🧵', Jewelry: '💎',
  Furniture: '🪑', Book: '📖', Manuscript: '📜', Coin: '🪙',
  Weapon: '⚔️', Armor: '🛡️', Glass: '🔮', Metalwork: '⚙️',
  default: '🏛️',
};
function typeEmoji(t) {
  return TYPE_EMOJI[t] || TYPE_EMOJI.default;
}

function ObjectCard({ obj, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = obj.image_local || obj.image;
  return (
    <button
      onClick={() => onClick(obj)}
      className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="h-36 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {src && !imgFailed ? (
          <img src={src} alt={obj.title} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
        ) : (
          <span className="text-4xl">{typeEmoji(obj.type)}</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-2 dark:text-gray-100">{obj.title}</p>
        {obj.creator && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{obj.creator}</p>}
        <div className="flex gap-1 mt-1 flex-wrap">
          {obj.type && <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 rounded">{obj.type}</span>}
          {obj.date && <span className="text-xs bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1.5 rounded">{obj.date}</span>}
        </div>
      </div>
    </button>
  );
}

function ObjectModal({ obj, onClose }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = obj.image_local || obj.image;
  if (!obj) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">✕</button>
        {src && !imgFailed ? (
          <img src={src} alt={obj.title} className="w-full h-56 object-cover rounded-xl mb-4" onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-36 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <span className="text-6xl">{typeEmoji(obj.type)}</span>
          </div>
        )}
        <h2 className="text-lg font-bold dark:text-white">{obj.title}</h2>
        {obj.creator && <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{obj.creator}</p>}
        <div className="flex flex-wrap gap-1 mt-2">
          {obj.type && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{obj.type}</span>}
          {obj.date && <span className="text-xs bg-gray-50 text-gray-600 border px-2 py-0.5 rounded-full">{obj.date}</span>}
          {(Array.isArray(obj.culture) ? obj.culture : obj.culture ? [obj.culture] : []).map((c, i) => <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{c}</span>)}
        </div>
        {obj.description && <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{obj.description}</p>}
        {obj.url && (
          <a href={obj.url} target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition w-fit">
            🏛️ View at {obj.source?.split(' ')[0] || 'Museum'}
            <span className="opacity-70">↗</span>
          </a>
        )}
        <p className="mt-2 text-xs text-gray-400">{obj.source}</p>
      </div>
    </div>
  );
}

export default function CMACollection() {
  const [data, setData] = useState({ objects: [], total: 0 });
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 40;

  useEffect(() => {
    fetch('/api/museum-objects/types').then(r => r.json()).then(d => setTypes(d.types || [])).catch(() => {});
  }, []);

  const load = useCallback(async (pageNum, query, type) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, per_page: PER_PAGE });
      if (query) params.set('q', query);
      if (type) params.set('type_filter', type);
      const r = await fetch(`/api/museum-objects?${params}`);
      if (!r.ok) throw new Error('fetch failed');
      const d = await r.json();
      setData(d);
      setFetchError(false);
    } catch {
      setFetchError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, q, typeFilter); }, 300);
    return () => clearTimeout(t);
  }, [q, typeFilter, load]);

  useEffect(() => { load(page, q, typeFilter); }, [page, load]);

  const totalPages = Math.ceil(data.total / PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <h2 className="text-xl font-bold">🏛️ Open-Access Art Collection</h2>
        <p className="text-sm opacity-90">Cleveland Museum of Art · 5,000 public-domain artworks</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search artworks, artists, cultures…"
          className="flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border px-2 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option value="">All types</option>
          {types.slice(0, 30).map(t => <option key={t} value={t}>{typeEmoji(t)} {t}</option>)}
        </select>
      </div>

      <p className="text-xs text-gray-500">{data.total.toLocaleString()} artworks{loading ? ' (loading…)' : ''}</p>

      {fetchError && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700 p-4 text-sm text-red-700 dark:text-red-300">
          Could not load artworks — make sure the backend is running.
          <button onClick={() => load(page, q, typeFilter)} className="ml-3 underline font-medium">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.objects.map(obj => (
          <ObjectCard key={obj.id} obj={obj} onClick={setSelected} />
        ))}
      </div>

      {!loading && !fetchError && data.objects.length === 0 && (
        <p className="text-center text-gray-400 py-8">No artworks match your filters.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1 rounded-lg bg-amber-500 text-white text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {selected && <ObjectModal obj={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
