import { useState, useEffect, useCallback } from 'react';

const AGE_LABELS = {
  '4+': '🌱 Ages 4+',
  '5+': '🌱 Ages 5+',
  '6+': '🌼 Ages 6+',
  '7+': '🌼 Ages 7+',
  '8+': '⭐ Ages 8+',
  '9+': '⭐ Ages 9+',
  '10+': '🔥 Ages 10+',
  '11+': '🔥 Ages 11+',
  '12+': '🎓 Ages 12+',
  '13+': '🎓 Ages 13+',
};

const GENRE_COLOURS = {
  Animation: 'bg-purple-100 text-purple-700',
  Adventure: 'bg-green-100 text-green-700',
  Comedy: 'bg-yellow-100 text-yellow-700',
  Drama: 'bg-blue-100 text-blue-700',
  Fantasy: 'bg-pink-100 text-pink-700',
  Family: 'bg-orange-100 text-orange-700',
  Musical: 'bg-red-100 text-red-700',
  'Sci-Fi': 'bg-cyan-100 text-cyan-700',
  Historical: 'bg-amber-100 text-amber-700',
  Mystery: 'bg-indigo-100 text-indigo-700',
};

function genreColour(g) {
  return GENRE_COLOURS[g] || 'bg-gray-100 text-gray-700';
}

function MovieCard({ movie, onClick }) {
  return (
    <button
      onClick={() => onClick(movie)}
      className="rounded-xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow text-left w-full overflow-hidden"
    >
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-28 flex flex-col items-center justify-center p-2">
        <span className="text-4xl">🎬</span>
        <span className="text-white text-xs font-semibold mt-1">{movie.year} · {movie.country.split('/')[0].trim()}</span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-2 dark:text-gray-100">{movie.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{movie.director}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {movie.genre.slice(0, 2).map(g => (
            <span key={g} className={`text-xs px-1.5 rounded ${genreColour(g)}`}>{g}</span>
          ))}
          <span className="text-xs px-1.5 rounded bg-emerald-50 text-emerald-700">{movie.age_group}</span>
          {movie.watch_url?.includes('archive.org') && (
            <span className="text-xs px-1.5 rounded bg-green-100 text-green-700 font-semibold">🆓 Free</span>
          )}
        </div>
      </div>
    </button>
  );
}

function embedUrl(watchUrl) {
  // Convert archive.org/details/ID → archive.org/embed/ID
  const m = watchUrl?.match(/archive\.org\/details\/([^?#]+)/);
  return m ? `https://archive.org/embed/${m[1]}` : null;
}

function MovieModal({ movie, onClose }) {
  if (!movie) return null;
  const isArchive = movie.watch_url?.includes('archive.org/details/');
  const isYouTubeSearch = movie.watch_url?.includes('youtube.com/results');
  const embed = isArchive ? embedUrl(movie.watch_url) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
        >✕</button>

        {/* Embedded player for Internet Archive films */}
        {embed ? (
          <div className="rounded-xl overflow-hidden mb-4 bg-black" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={embed}
              title={movie.title}
              width="100%"
              height="100%"
              allowFullScreen
              allow="fullscreen"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl h-36 flex flex-col items-center justify-center mb-4">
            <span className="text-6xl">🎬</span>
            <span className="text-white font-semibold mt-1">{movie.language}</span>
          </div>
        )}

        <h2 className="text-xl font-bold dark:text-white">{movie.title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{movie.director} · {movie.year}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genre.map(g => (
            <span key={g} className={`text-xs px-2 py-0.5 rounded-full border ${genreColour(g)}`}>{g}</span>
          ))}
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {AGE_LABELS[movie.age_group] || movie.age_group}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            🌍 {movie.country}
          </span>
        </div>

        {movie.language && (
          <p className="text-xs text-gray-500 mt-1">Language: {movie.language}</p>
        )}

        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{movie.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {isArchive && (
            <a
              href={movie.watch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-orange-700 transition"
            >
              ▶ Open on Internet Archive ↗
            </a>
          )}
          {!isArchive && (
            <>
              <a
                href={`https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-red-700 transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M5.398 0v24l5.733-15.655L16.862 24V0h-5.465v11.842L8.864 0z"/></svg>
                Netflix
              </a>
              <a
                href={`https://www.primevideo.com/search/?phrase=${encodeURIComponent(movie.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-600 transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.076-1.047-.872-1.232-1.276-1.806-2.108-1.726 1.76-2.948 2.286-5.187 2.286-2.649 0-4.712-1.635-4.712-4.906 0-2.557 1.384-4.297 3.356-5.149 1.711-.752 4.099-.887 5.925-1.094v-.41c0-.752.058-1.638-.383-2.286-.383-.578-1.116-.817-1.762-.817-1.197 0-2.265.614-2.527 1.888-.054.285-.261.567-.547.58l-3.064-.331c-.256-.059-.543-.266-.469-.66C6.094 1.399 9.072 0 11.949 0c1.468 0 3.386.391 4.543 1.497 1.468 1.368 1.327 3.193 1.327 5.183v4.697c0 1.41.587 2.032 1.139 2.793.194.277.236.61-.01.817l-1.804 1.808z"/></svg>
                Prime Video
              </a>
              {isYouTubeSearch && (
                <a
                  href={movie.watch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  🔍 YouTube
                </a>
              )}
            </>
          )}
        </div>
        {isArchive && <p className="text-xs text-green-600 dark:text-green-400 mt-1">✅ Free to watch — Internet Archive public domain</p>}
        <p className="text-xs text-gray-400 mt-1">Source: {movie.source}</p>
      </div>
    </div>
  );
}

export default function MoviesLibrary() {
  const [data, setData] = useState({ movies: [], total: 0 });
  const [genres, setGenres] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [countries, setCountries] = useState([]);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 24;

  useEffect(() => {
    fetch('/api/movies/genres').then(r => r.json()).then(d => setGenres(d.genres || [])).catch(() => {});
    fetch('/api/movies/age-groups').then(r => r.json()).then(d => setAgeGroups(d.age_groups || [])).catch(() => {});
    fetch('/api/movies/countries').then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
  }, []);

  const load = useCallback(async (pageNum, query, g, age, ctry) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, per_page: PER_PAGE });
      if (query) params.set('q', query);
      if (g) params.set('genre', g);
      if (age) params.set('age_group', age);
      if (ctry) params.set('country', ctry);
      const r = await fetch(`/api/movies?${params}`);
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
    const t = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        load(1, q, genre, ageGroup, country);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, genre, ageGroup, country]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page > 1) load(page, q, genre, ageGroup, country);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(data.total / PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-600 to-purple-700 p-4 text-white">
        <h2 className="text-xl font-bold">🎬 World Cinema for Kids</h2>
        <p className="text-sm opacity-90">Children-friendly films from around the world · Public domain &amp; official sources</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search title, director…"
          className="flex-1 min-w-40 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
        />
        <select value={genre} onChange={e => setGenre(e.target.value)}
          className="rounded-lg border px-2 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option value="">All genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
          className="rounded-lg border px-2 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option value="">All ages</option>
          {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="rounded-lg border px-2 py-2 text-sm dark:bg-gray-800 dark:text-white">
          <option value="">All countries</option>
          {countries.slice(0, 40).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p className="text-xs text-gray-500">{data.total} movies{loading ? ' (loading…)' : ''}</p>

      {fetchError && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700 p-4 text-sm text-red-700 dark:text-red-300">
          Could not load movies — make sure the backend is running.
          <button onClick={() => load(page, q, genre, ageGroup, country)} className="ml-3 underline font-medium">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.movies.map(m => (
          <MovieCard key={m.id} movie={m} onClick={setSelected} />
        ))}
      </div>

      {data.movies.length === 0 && !loading && !fetchError && (
        <p className="text-center text-gray-400 py-8">No movies match your filters.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
