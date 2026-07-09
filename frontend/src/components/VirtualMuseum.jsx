import { useState, useEffect, useRef } from 'react';
import CMACollection from './CMACollection.jsx';

const API = '/api';

// Category → emoji fallback for when Wikipedia thumbnail isn't available
const CAT_EMOJI = {
  painting: '🖼️', sculpture: '🗿', architecture: '🏛️', archaeology: '🏺',
  manuscript: '📜', fossil: '🦕', palaeontology: '🦴', technology: '⚙️',
  engineering: '🔧', astronomy: '🔭', ceremonial: '🪬', jewelry: '💎',
  'ritual object': '🪬', textile: '🧵', weapon: '⚔️', coin: '🪙',
  instrument: '🎵', map: '🗺️', default: '🏛️',
};
function catEmoji(cat) {
  if (!cat) return CAT_EMOJI.default;
  const key = cat.toLowerCase();
  return Object.entries(CAT_EMOJI).find(([k]) => key.includes(k))?.[1] ?? CAT_EMOJI.default;
}

// ── Lazy Wikipedia thumbnail ──────────────────────────────────────────────────
// Fetches once per wiki_title and caches in module-level map so sibling cards share results.
const thumbCache = {};

function WikiThumbnail({ wikiTitle, thumbnailLocal, category, size = 'list' }) {
  const cacheKey = thumbnailLocal || wikiTitle || '';
  const [src, setSrc] = useState(thumbnailLocal || thumbCache[wikiTitle] || null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    // Local SVG is already set as initial state; try to upgrade to real Wikipedia photo
    if (!wikiTitle) return;
    if (thumbCache[wikiTitle] && thumbCache[wikiTitle] !== 'loading') {
      if (thumbCache[wikiTitle]) setSrc(thumbCache[wikiTitle]);
      return;
    }
    thumbCache[wikiTitle] = 'loading';
    const encoded = encodeURIComponent(wikiTitle.replace(/ /g, '_'));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { 'Api-User-Agent': 'EduAI/1.0 (educational; contact@eduai.app)' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const url = d?.thumbnail?.source ?? d?.originalimage?.source ?? null;
        thumbCache[wikiTitle] = url || '';
        if (mounted.current && url) setSrc(url);
      })
      .catch(() => { thumbCache[wikiTitle] = ''; });
  }, [wikiTitle]);

  const emoji = catEmoji(category);

  if (size === 'list') {
    return (
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-indigo-100 flex items-center justify-center">
        {src
          ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setSrc('')} />
          : <span className="text-2xl">{emoji}</span>
        }
      </div>
    );
  }
  // hero size for detail view
  return (
    <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
      {src
        ? <img src={src} alt="" className="w-full h-full object-contain" onError={() => setSrc('')} />
        : <span className="text-6xl">{emoji}</span>
      }
    </div>
  );
}

// ── Explanation video banner (for paintings, sculptures, architecture) ─────────
function ExplanationVideoBanner({ links, name }) {
  if (!links?.explanation_video) return null;
  return (
    <a href={links.explanation_video} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl bg-red-600 text-white p-4 mb-4 hover:bg-red-700 transition-colors">
      <span className="text-3xl flex-shrink-0">▶️</span>
      <div>
        <p className="font-bold text-sm">Watch: {name} — Explained</p>
        <p className="text-xs text-red-200 mt-0.5">Art history · Museum analysis · Documentary</p>
      </div>
      <span className="ml-auto text-red-200 text-lg">↗</span>
    </a>
  );
}

// ── All links section ─────────────────────────────────────────────────────────
function ObjectLinks({ links }) {
  if (!links) return null;
  const items = [
    links.wikipedia && { href: links.wikipedia, label: 'ℹ Wikipedia', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    links.image_search && { href: links.image_search, label: '🖼 Images', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    links.video && { href: links.video, label: '▶ Documentary Search', color: 'bg-red-100 text-red-700 border-red-200' },
    links.smarthistory && { href: links.smarthistory, label: '📚 Smarthistory', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    links.podcast && { href: links.podcast, label: '🎙 BBC Podcast', color: 'bg-purple-100 text-purple-700 border-purple-200' },
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
      <p className="text-xs text-gray-400 mt-2">Links open YouTube, Wikipedia, Wikimedia Commons, Smarthistory, and BBC podcasts.</p>
    </div>
  );
}

// ── Quick Quiz ────────────────────────────────────────────────────────────────
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
            <button key={i} className={cls} disabled={selected !== null} onClick={() => setSelected(i)}>
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

// ── Object detail view ────────────────────────────────────────────────────────
function ObjectDetail({ gallery, objectId, onBack }) {
  const [obj, setObj] = useState(null);
  useEffect(() => {
    fetch(`${API}/museum/${gallery}/${objectId}`).then(r => r.json()).then(setObj);
  }, [gallery, objectId]);
  if (!obj) return <div className="p-4 text-gray-500">Loading…</div>;

  const isPaintingOrSculpture = ['painting', 'sculpture', 'architecture', 'art_culture'].some(k =>
    (obj.category || '').toLowerCase().includes(k) || gallery.includes(k)
  );

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-indigo-600 hover:underline">← Back</button>

      {/* Hero thumbnail */}
      <WikiThumbnail wikiTitle={obj.wiki_title} thumbnailLocal={obj.thumbnail_local} category={obj.category} size="hero" />

      <h2 className="text-2xl font-bold text-gray-800 mb-1">{obj.name}</h2>
      {(obj.artist || obj.architect) && (
        <p className="text-sm text-gray-500 mb-2 italic">{obj.artist || obj.architect}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {obj.origin && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">📍 {obj.origin}</span>}
        {(obj.year || obj.period) && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📅 {obj.year || obj.period}</span>}
        {obj.material && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">🪨 {obj.material}</span>}
        {obj.category && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">{obj.category}</span>}
        {obj.museum && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">🏛 {obj.museum}</span>}
      </div>

      {/* Prominent explanation video for art/sculpture/architecture */}
      <ExplanationVideoBanner links={obj.links} name={obj.name} />

      {/* Wikimedia image link */}
      {obj.image_hint && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">🖼️</span>
          <div>
            <p className="text-xs text-gray-400 italic">{obj.image_hint}</p>
            {obj.links?.image_search && (
              <a href={obj.links.image_search} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-0.5 block">View images on Wikimedia Commons →</a>
            )}
          </div>
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

// ── Object card in list (with lazy thumbnail) ─────────────────────────────────
function ObjectCard({ obj, onClick }) {
  return (
    <button onClick={onClick}
      className="text-left rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 p-3 hover:shadow-md transition-all flex gap-3 w-full">
      {/* Thumbnail */}
      <WikiThumbnail wikiTitle={obj.wiki_title} thumbnailLocal={obj.thumbnail_local} category={obj.category} size="list" />
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm leading-tight truncate">{obj.name}</p>
        {(obj.artist || obj.architect) && (
          <p className="text-xs text-gray-400 italic truncate">{obj.artist || obj.architect}</p>
        )}
        <p className="text-xs text-gray-500 mt-0.5 truncate">{obj.origin} · {obj.year || obj.period}</p>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{obj.description?.slice(0, 100)}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {obj.category && <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">{obj.category}</span>}
          {obj.links?.explanation_video && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">▶ Explained</span>}
          {obj.links?.smarthistory && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">📚</span>}
          {obj.links?.wikipedia && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">ℹ</span>}
        </div>
      </div>
    </button>
  );
}

// ── Gallery view (list of objects) ────────────────────────────────────────────
function GalleryView({ gallery, onBack }) {
  const [data, setData] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetch(`${API}/museum/${gallery.id}`).then(r => r.json()).then(setData);
  }, [gallery.id]);

  if (selectedObj) return (
    <ObjectDetail gallery={gallery.id} objectId={selectedObj} onBack={() => setSelectedObj(null)} />
  );

  const objects = data?.objects ?? [];
  const pageCount = Math.ceil(objects.length / PAGE_SIZE);
  const visible = objects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-indigo-600 hover:underline">← All Galleries</button>
      <h2 className="text-2xl font-bold mb-1">{gallery.emoji} {gallery.label}</h2>
      <p className="text-xs text-gray-400 mb-4">{objects.length} objects · thumbnails from Wikipedia</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map(obj => (
              <ObjectCard key={obj.id} obj={obj} onClick={() => setSelectedObj(obj.id)} />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="flex gap-2 mt-4 justify-center flex-wrap">
              {Array.from({ length: pageCount }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium border transition-colors ${i === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Search view ───────────────────────────────────────────────────────────────
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
      <div className="flex flex-col gap-2">
        {results.map(obj => (
          <button key={obj.id} onClick={() => setSelectedObj(obj)}
            className="text-left rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 p-3 hover:shadow-md transition-all flex gap-3">
            <WikiThumbnail wikiTitle={obj.wiki_title} thumbnailLocal={obj.thumbnail_local} category={obj.category} size="list" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-gray-800 text-sm truncate">{obj.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-700 flex-shrink-0">{obj.gallery_label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{obj.origin} · {obj.period}</p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{obj.description?.slice(0, 100)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function VirtualMuseum() {
  const [overview, setOverview] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [tab, setTab] = useState('galleries');
  useEffect(() => {
    setFetchError(false);
    fetch(`${API}/museum`)
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(setOverview)
      .catch(() => setFetchError(true));
  }, [retryCount]);
  if (fetchError) return (
    <div className="p-8 text-center">
      <p className="text-red-600">Could not load the museum. Make sure the backend is running.</p>
      <button onClick={() => setRetryCount(count => count + 1)} className="mt-3 text-sm font-medium text-indigo-600 underline">
        Retry
      </button>
    </div>
  );
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedGallery) return (
    <div className="max-w-3xl mx-auto p-4">
      <GalleryView gallery={selectedGallery} onBack={() => setSelectedGallery(null)} />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🏛️ Virtual Museum</h1>
      <p className="text-gray-500 mb-1">{overview.description}</p>
      <p className="text-xs text-gray-400 mb-4">
        {(overview.total_objects ?? overview.galleries?.reduce((s, g) => s + (g.object_count || 0), 0) ?? 0).toLocaleString()} objects · Wikipedia thumbnails · Explanation videos · Smarthistory links · BBC podcasts
      </p>
      <div className="flex gap-3 mb-6 border-b">
        {[['galleries', 'Browse Galleries'], ['search', '🔍 Search'], ['open-art', '🖼️ Open Art']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'search' && <SearchView />}
      {tab === 'open-art' && <CMACollection />}
      {tab === 'galleries' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {overview.galleries.map(gallery => (
            <button key={gallery.id} onClick={() => setSelectedGallery(gallery)}
              className="text-left rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 hover:shadow-lg transition-shadow">
              <p className="text-3xl mb-2">{gallery.emoji}</p>
              <p className="font-bold text-gray-800">{gallery.label}</p>
              <p className="text-xs text-indigo-600 mt-1">{gallery.object_count} object{gallery.object_count !== 1 ? 's' : ''}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">▶ Explained</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">🎙 Podcasts</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">🖼 Thumbnails</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
