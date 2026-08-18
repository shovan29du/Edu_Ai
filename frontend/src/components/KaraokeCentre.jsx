import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchSingAlongSongs } from '../api/safety.js';

const API = '/api';

const FLAG = {
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Jamaica': '🇯🇲',
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'India': '🇮🇳', 'India (West Bengal)': '🇮🇳',
  'Egypt': '🇪🇬', 'Lebanon': '🇱🇧', 'South Africa': '🇿🇦', 'Senegal': '🇸🇳',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'France': '🇫🇷', 'Cuba': '🇨🇺',
  'Argentina': '🇦🇷', 'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Ireland': '🇮🇪',
  'Australia': '🇦🇺', 'Canada': '🇨🇦', 'Nigeria': '🇳🇬', 'Mexico': '🇲🇽',
  'Bangladesh': '🇧🇩', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Belgium': '🇧🇪',
  'Austria': '🇦🇹', 'Russia': '🇷🇺', 'Puerto Rico': '🇵🇷', 'Barbados': '🇧🇧',
  'Benin': '🇧🇯', 'Bolivia': '🇧🇴',
};

const GENRE_COLORS = {
  rock: 'bg-red-100 text-red-700', pop: 'bg-pink-100 text-pink-700',
  classical: 'bg-indigo-100 text-indigo-700', jazz: 'bg-yellow-100 text-yellow-700',
  reggae: 'bg-green-100 text-green-700', soul: 'bg-orange-100 text-orange-700',
  'hip-hop': 'bg-purple-100 text-purple-700', country: 'bg-amber-100 text-amber-700',
  folk: 'bg-lime-100 text-lime-700', electronic: 'bg-cyan-100 text-cyan-700',
  gospel: 'bg-violet-100 text-violet-700', latin: 'bg-rose-100 text-rose-700',
  blues: 'bg-blue-100 text-blue-700', afrobeats: 'bg-emerald-100 text-emerald-700',
  rabindra_sangeet: 'bg-teal-100 text-teal-700',
  nazrul_geeti: 'bg-orange-100 text-orange-700',
  baul: 'bg-amber-100 text-amber-700',
  bangla_rock: 'bg-red-100 text-red-700',
  bangla_pop: 'bg-pink-100 text-pink-700',
  bangla_film: 'bg-violet-100 text-violet-700',
  bangla_indie: 'bg-cyan-100 text-cyan-700',
};

function genreColor(g) {
  return GENRE_COLORS[g] || 'bg-gray-100 text-gray-700';
}

function GenreBadge({ genre }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${genreColor(genre)}`}>
      {genre.replace(/_/g, ' ')}
    </span>
  );
}

function LinkButton({ href, label, icon, color }) {
  if (!href) return null;
  const colors = {
    red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    pink: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${colors[color] || colors.gray}`}>
      {icon} {label}
    </a>
  );
}

function SongCard({ song, onClick }) {
  const flag = FLAG[song.origin_country] || '🌍';
  const primaryGenre = song.genre?.[0] || 'pop';
  return (
    <button onClick={() => onClick(song)}
      className="w-full text-left rounded-xl border border-purple-100 bg-white hover:shadow-md hover:border-purple-300 transition-all p-4 flex gap-3">
      <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
        {flag}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{song.title}</p>
        <p className="text-sm text-gray-500 truncate">{song.artist} · {song.year}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          <GenreBadge genre={primaryGenre} />
          {song.language !== 'English' && (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">
              {song.language}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400 self-start pt-1">{song.decade}</div>
    </button>
  );
}

function karaokeSearchUrl(song) {
  const q = encodeURIComponent(`${song.title} ${song.artist} karaoke lyrics`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

function SongDetail({ song, onBack }) {
  const flag = FLAG[song.origin_country] || '🌍';
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-purple-600 hover:underline">← Back to songs</button>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-6 mb-5 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-4xl shadow">
            {flag}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{song.title}</h2>
            <p className="text-purple-200 mt-1">{song.artist}</p>
            <p className="text-purple-300 text-sm mt-0.5">{song.album} · {song.year}</p>
            {song.verified_views && (
              <p className="text-xs text-purple-100 mt-1">
                {song.verified_views.toLocaleString()} observed YouTube views
                {song.chart_rank ? ` · chart #${song.chart_rank}` : ''}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {song.genre?.map(g => (
                <span key={g} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {g.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          ['🌍', 'Country', song.origin_country],
          ['🗣', 'Language', song.language],
          ['📅', 'Decade', song.decade],
          ['👧', 'Age', song.suitable_for_ages],
        ].map(([icon, label, val]) => (
          <div key={label} className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-center">
            <p className="text-lg">{icon}</p>
            <p className="text-xs text-purple-400 mt-0.5">{label}</p>
            <p className="text-sm font-semibold text-purple-800 mt-0.5 truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-xl bg-gray-50 border p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">About this song</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{song.description}</p>
      </div>

      {/* Educational notes */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
        <h3 className="font-semibold text-blue-800 mb-2">🎓 Educational Notes</h3>
        <p className="text-sm text-blue-900 leading-relaxed">{song.educational_notes}</p>
      </div>

      {/* Fun fact */}
      {song.fun_fact && song.fun_fact !== song.educational_notes && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <h3 className="font-semibold text-amber-800 mb-1">✨ Fun Fact</h3>
          <p className="text-sm text-amber-900">{song.fun_fact}</p>
        </div>
      )}

      {/* Awards */}
      {song.awards?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {song.awards.map(a => (
            <span key={a} className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full font-medium">
              🏆 {a}
            </span>
          ))}
        </div>
      )}

      {/* Karaoke helper */}
      <div className="rounded-xl bg-pink-50 border border-pink-200 p-4 mb-4">
        <h3 className="font-semibold text-pink-800 mb-2">🎤 Sing Along</h3>
        <p className="text-xs text-pink-700 mb-3">
          This is a commercially released song, so we can't reproduce its lyrics here — that's licensed
          content. Open a karaoke or lyrics video and sing along there instead.
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={karaokeSearchUrl(song)} label="Karaoke video" icon="🎤" color="pink" />
          <LinkButton href={song.links?.lyrics_search} label="Lyrics" icon="🎵" color="blue" />
        </div>
      </div>

      {/* Links */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">🔗 Listen & Explore</h3>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={song.links?.youtube_video} label="Official chart video" icon="▶" color="red" />
          <LinkButton href={song.links?.youtube_search} label="Search on YouTube" icon="▶" color="red" />
          <LinkButton href={song.links?.chart_source} label="View-count source" icon="📊" color="purple" />
          <LinkButton href={song.links?.spotify_search} label="Spotify" icon="🎧" color="green" />
          <LinkButton href={song.links?.apple_music_search} label="Apple Music" icon="♫" color="pink" />
          <LinkButton href={song.links?.wiki_search} label="Wikipedia" icon="📖" color="gray" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Chart counts are snapshots and continue to change. Review the source for the latest total.
        </p>
      </div>
    </div>
  );
}

// ── Karaoke Classics: full in-app synced lyrics (public-domain songs only) ────

function KaraokeClassics() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [secsPerLine, setSecsPerLine] = useState(3);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSingAlongSongs().then(setSongs).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => s.title.toLowerCase().includes(q));
  }, [songs, search]);

  const song = filtered[selected];

  useEffect(() => {
    if (!autoPlay || !song) return;
    timerRef.current = setInterval(() => {
      setLineIndex((i) => (i >= song.lyrics.length - 1 ? i : i + 1));
    }, secsPerLine * 1000);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, secsPerLine, song]);

  useEffect(() => {
    if (lineIndex >= (song?.lyrics.length ?? 1) - 1) setAutoPlay(false);
  }, [lineIndex, song]);

  function selectSong(index) {
    setSelected(index);
    setLineIndex(0);
    setAutoPlay(false);
  }

  return (
    <section aria-label="Karaoke classics" className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {songs.length} classic, traditional public-domain songs with full sing-along lyrics —
        safe to display in full since they're centuries-old folk songs and nursery rhymes, not
        copyrighted commercial recordings.
      </p>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!error && songs.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading songs…</p>}
      {songs.length > 0 && (
        <>
          <input
            type="search"
            aria-label="Search karaoke classics"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(0); }}
            placeholder="🔍 Search classics…"
            className="w-full rounded border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <label className="flex flex-col text-sm font-medium">
            Choose a song
            <select
              value={selected}
              onChange={(e) => selectSong(Number(e.target.value))}
              className="mt-1 rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
            >
              {filtered.map((s, i) => (
                <option key={s.title} value={i}>{s.title}</option>
              ))}
            </select>
          </label>

          {song && (
            <div className="space-y-2">
              <div className="space-y-1 rounded border p-3 dark:border-gray-700">
                {song.lyrics.map((line, i) => (
                  <p
                    key={i}
                    className={
                      i === lineIndex
                        ? 'rounded bg-yellow-200 px-1 font-semibold dark:bg-yellow-700'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { setAutoPlay(false); setLineIndex((i) => Math.max(0, i - 1)); }}
                  className="rounded border px-3 py-1 text-sm">
                  Previous line
                </button>
                <button type="button" onClick={() => { setAutoPlay(false); setLineIndex((i) => Math.min(song.lyrics.length - 1, i + 1)); }}
                  className="rounded border px-3 py-1 text-sm">
                  Next line
                </button>
                <button type="button" onClick={() => { if (lineIndex >= song.lyrics.length - 1) setLineIndex(0); setAutoPlay((p) => !p); }}
                  className={`rounded border px-3 py-1 text-sm font-medium ${autoPlay ? 'bg-pink-600 text-white border-pink-600' : ''}`}>
                  {autoPlay ? '⏸ Pause auto-scroll' : '▶ Auto-scroll'}
                </button>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  Speed:
                  <select value={secsPerLine} onChange={(e) => setSecsPerLine(Number(e.target.value))}
                    className="rounded border px-1 py-0.5 dark:bg-gray-800 dark:text-white">
                    <option value={1.5}>Fast</option>
                    <option value={3}>Normal</option>
                    <option value={5}>Slow</option>
                  </select>
                </label>
              </div>
              {song.channelUrl && (
                <a href={song.channelUrl} target="_blank" rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:underline dark:text-blue-400">
                  Play music for this song ({song.source})
                </a>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ── Full Song Catalog: Song Centre's browse/search/filter ─────────────────────

const PAGE_SIZE = 20;

function SongCatalog() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterDecade, setFilterDecade] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetch(`${API}/songs`).then(r => r.json()).then(setData);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.songs.filter(s => {
      if (q && !s.title.toLowerCase().includes(q) && !s.artist.toLowerCase().includes(q) &&
          !s.origin_country.toLowerCase().includes(q)) return false;
      if (filterGenre && !s.genre?.some(g => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false;
      if (filterDecade && s.decade !== filterDecade) return false;
      if (filterLang && !s.language.toLowerCase().includes(filterLang.toLowerCase())) return false;
      return true;
    });
  }, [data, search, filterGenre, filterDecade, filterLang]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSongs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  if (!data) return <div className="p-8 text-center text-gray-400">Loading Song Centre…</div>;

  if (selected) return <SongDetail song={selected} onBack={() => setSelected(null)} />;

  const langs = [...new Set(data.songs.map(s => s.language))].sort();

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-violet-700 text-white p-6 mb-6 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-1">🎵 Full Song Catalog</h2>
          <p className="text-purple-200 mb-3">World music collection — all ages, all cultures</p>
          <div className="flex flex-wrap gap-4 text-sm text-purple-100">
            <span>🎶 {data.total} songs</span>
            <span>🌍 50+ countries</span>
            <span>🗣 {langs.length} languages</span>
            <span>📅 {data.decades.length} decades</span>
            <span>👶 All child-friendly</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-5 space-y-3">
        <input
          type="text" placeholder="Search songs, artists or countries…"
          value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
          className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex flex-wrap gap-2">
          <select value={filterLang} onChange={e => { setFilterLang(e.target.value); resetPage(); }}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">All languages</option>
            {langs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterDecade} onChange={e => { setFilterDecade(e.target.value); resetPage(); }}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">All decades</option>
            {data.decades.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterGenre} onChange={e => { setFilterGenre(e.target.value); resetPage(); }}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">All genres</option>
            {data.genres.map(g => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
          </select>
          {(search || filterLang || filterDecade || filterGenre) && (
            <button onClick={() => { setSearch(''); setFilterLang(''); setFilterDecade(''); setFilterGenre(''); resetPage(); }}
              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200">
              ✕ Clear
            </button>
          )}
          <button onClick={() => {
            const r = data.songs[Math.floor(Math.random() * data.songs.length)];
            setSelected(r);
          }} className="ml-auto px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
            🎲 Random Song
          </button>
        </div>
        <p className="text-xs text-gray-400">{filtered.length} songs found</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['rabindra_sangeet','nazrul_geeti','baul','bangla_rock','jazz','classical','reggae','soul','folk','K-pop','afrobeats'].map(g => (
          <button key={g} onClick={() => { setFilterGenre(filterGenre === g ? '' : g); resetPage(); }}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${filterGenre === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
            {g.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {pageSongs.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No songs match your search.</p>
        ) : pageSongs.map(s => (
          <SongCard key={s.id} song={s} onClick={setSelected} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${page === p ? 'bg-purple-600 text-white border-purple-600' : 'hover:bg-gray-50'}`}>
                {p}
              </button>
            );
          })}
          {totalPages > 10 && <span className="text-gray-400">…</span>}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  );
}

export default function KaraokeCentre() {
  const [mode, setMode] = useState('classics');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">🎤 Karaoke &amp; Song Centre</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sing along with full lyrics, or browse and discover from the full world-music catalog.
        </p>
      </div>

      <div role="tablist" aria-label="Karaoke sections" className="flex gap-2 mb-5 border-b dark:border-gray-700">
        <button
          role="tab" aria-selected={mode === 'classics'}
          onClick={() => setMode('classics')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${mode === 'classics' ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          🎤 Karaoke Classics
        </button>
        <button
          role="tab" aria-selected={mode === 'catalog'}
          onClick={() => setMode('catalog')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${mode === 'catalog' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          🎵 Full Song Catalog
        </button>
      </div>

      {mode === 'classics' ? <KaraokeClassics /> : <SongCatalog />}
    </div>
  );
}
