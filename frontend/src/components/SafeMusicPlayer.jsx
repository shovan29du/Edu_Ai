import React, { useEffect, useState, useRef } from 'react';
import { fetchSafeMusic } from '../api/safety.js';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';

const GENRE_COLORS = {
  pop: 'bg-pink-100 text-pink-700 border-pink-200',
  rock: 'bg-red-100 text-red-700 border-red-200',
  classical: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  jazz: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  folk: 'bg-lime-100 text-lime-700 border-lime-200',
  country: 'bg-amber-100 text-amber-700 border-amber-200',
  reggae: 'bg-green-100 text-green-700 border-green-200',
  blues: 'bg-blue-100 text-blue-700 border-blue-200',
  gospel: 'bg-violet-100 text-violet-700 border-violet-200',
  soul: 'bg-orange-100 text-orange-700 border-orange-200',
  nursery: 'bg-sky-100 text-sky-700 border-sky-200',
  educational: 'bg-teal-100 text-teal-700 border-teal-200',
};

function genreColor(genre) {
  if (!genre) return 'bg-sky-100 text-sky-700 border-sky-200';
  const key = genre.toLowerCase().replace(/\s+/g, '_');
  return GENRE_COLORS[key] || 'bg-sky-100 text-sky-700 border-sky-200';
}

const CARD_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-blue-400 to-indigo-500',
  'from-cyan-400 to-sky-500',
  'from-indigo-400 to-blue-600',
  'from-sky-300 to-cyan-500',
  'from-blue-300 to-sky-600',
];

export default function SafeMusicPlayer() {
  const { isRestricted } = useChild();
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);

  useEffect(() => {
    fetchSafeMusic()
      .then(setSongs)
      .catch((err) => setError(err.message));
  }, []);

  const visible = songs.filter((s) => !isRestricted || isResourceSafe(s));

  const genres = [...new Set(visible.flatMap(s => s.genre ? (Array.isArray(s.genre) ? s.genre : [s.genre]) : []))].sort();

  const filtered = visible.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.title?.toLowerCase().includes(q) && !s.artist?.toLowerCase().includes(q) && !s.description?.toLowerCase().includes(q)) return false;
    if (filterGenre) {
      const sGenres = s.genre ? (Array.isArray(s.genre) ? s.genre : [s.genre]) : [];
      if (!sGenres.some(g => g.toLowerCase() === filterGenre.toLowerCase())) return false;
    }
    return true;
  });

  function handlePlay(song) {
    setNowPlaying(song);
    const url = song.videoUrl || song.audioUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <section aria-label="Safe music library" className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-1">🎵 Safe Music Library</h1>
        <p className="text-sky-100">Child-friendly songs from around the world</p>
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-sky-200">
          <span>🎶 {visible.length} songs</span>
          {genres.length > 0 && <span>🎸 {genres.length} genres</span>}
        </div>
      </div>

      {error && <p role="alert" className="text-red-600 mb-4 rounded-lg bg-red-50 border border-red-200 p-3">{error}</p>}

      {/* Search & filter */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-sky-100 dark:border-gray-700 p-4 mb-5 space-y-3">
        <input
          type="search"
          aria-label="Search songs"
          placeholder="🔍 Search songs, artists…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-sky-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterGenre('')}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${filterGenre === '' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              All
            </button>
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setFilterGenre(filterGenre === g ? '' : g)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${filterGenre === g ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 dark:bg-gray-800 dark:text-gray-300'}`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">{filtered.length} song{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Now playing banner */}
      {nowPlaying && (
        <div className="mb-5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 dark:bg-sky-900/20 dark:border-sky-600 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-lg animate-pulse">▶</div>
          <div>
            <p className="text-xs text-sky-500 font-medium uppercase tracking-wide">Now Playing</p>
            <p className="font-bold text-sky-800 dark:text-sky-200">{nowPlaying.title}</p>
            {nowPlaying.artist && <p className="text-xs text-sky-600 dark:text-sky-400">{nowPlaying.artist}</p>}
          </div>
          <button
            onClick={() => setNowPlaying(null)}
            className="ml-auto text-sky-400 hover:text-sky-600 text-lg font-bold"
            aria-label="Close now playing"
          >×</button>
        </div>
      )}

      {/* Song cards */}
      {filtered.length === 0 && !error && (
        <p className="text-center text-gray-400 py-12">No songs found.</p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((song, i) => {
          const isNP = nowPlaying && nowPlaying.title === song.title;
          const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          const songGenres = song.genre ? (Array.isArray(song.genre) ? song.genre : [song.genre]) : [];
          const url = song.videoUrl || song.audioUrl;
          return (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden shadow-md transition-all hover:shadow-xl hover:-translate-y-1 ${isNP ? 'ring-4 ring-sky-400 ring-offset-2' : ''}`}
            >
              {/* Card header */}
              <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="text-3xl mb-2">{song.emoji || '🎵'}</div>
                  {isNP && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Playing</span>}
                </div>
                <h3 className="font-bold text-lg leading-tight">{song.title}</h3>
                {song.artist && <p className="text-sky-100 text-sm mt-0.5">{song.artist}</p>}
              </div>
              {/* Card body */}
              <div className="bg-white dark:bg-gray-900 p-4 space-y-3">
                {songGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {songGenres.map(g => (
                      <span key={g} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${genreColor(g)}`}>{g}</span>
                    ))}
                  </div>
                )}
                {song.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{song.description}</p>
                )}
                {song.source && (
                  <p className="text-xs text-gray-400">{song.source}</p>
                )}
                {url && (
                  <button
                    onClick={() => handlePlay(song)}
                    className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 text-sm transition-colors"
                  >
                    <span>▶</span> Play Song
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
