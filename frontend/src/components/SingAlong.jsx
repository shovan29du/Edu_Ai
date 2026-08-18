import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchSingAlongSongs } from '../api/safety.js';

const CARD_COLORS = [
  { bg: 'from-pink-400 to-rose-500', border: 'border-pink-300', badge: 'bg-pink-100 text-pink-700' },
  { bg: 'from-purple-400 to-violet-500', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  { bg: 'from-fuchsia-400 to-pink-500', border: 'border-fuchsia-300', badge: 'bg-fuchsia-100 text-fuchsia-700' },
  { bg: 'from-violet-400 to-purple-600', border: 'border-violet-300', badge: 'bg-violet-100 text-violet-700' },
  { bg: 'from-rose-400 to-pink-600', border: 'border-rose-300', badge: 'bg-rose-100 text-rose-700' },
  { bg: 'from-purple-500 to-fuchsia-600', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
];

export default function SingAlong() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [filterGenre, setFilterGenre] = useState('');
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(3000);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchSingAlongSongs()
      .then(setSongs)
      .catch((err) => setError(err.message));
  }, []);

  const song = selected !== null ? songs[selected] : null;

  function selectSong(index) {
    setSelected(index);
    setLineIndex(0);
    setAutoAdvance(false);
    clearInterval(intervalRef.current);
  }

  const advanceLine = useCallback(() => {
    if (!song) return;
    setLineIndex(i => {
      if (i >= song.lyrics.length - 1) {
        setAutoAdvance(false);
        return i;
      }
      return i + 1;
    });
  }, [song]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (autoAdvance && song) {
      intervalRef.current = setInterval(advanceLine, autoSpeed);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoAdvance, autoSpeed, advanceLine, song]);

  const genres = [...new Set(songs.flatMap(s => s.genre ? (Array.isArray(s.genre) ? s.genre : [s.genre]) : []))].sort();

  const filteredSongs = filterGenre
    ? songs.filter(s => {
        const g = s.genre ? (Array.isArray(s.genre) ? s.genre : [s.genre]) : [];
        return g.some(x => x.toLowerCase() === filterGenre.toLowerCase());
      })
    : songs;

  return (
    <section aria-label="Sing-along karaoke" className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-1">🎤 Sing-Along</h1>
        <p className="text-pink-100">Karaoke-style nursery rhymes and songs — sing along line by line!</p>
        <p className="text-xs text-pink-200 mt-1">Use the channel link to play music while you sing.</p>
      </div>

      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}

      {/* Song picker — shown if no song selected */}
      {selected === null && (
        <div>
          {/* Genre filter */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setFilterGenre('')}
                className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${filterGenre === '' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 dark:bg-gray-800 dark:text-gray-300'}`}
              >All</button>
              {genres.map(g => (
                <button key={g}
                  onClick={() => setFilterGenre(filterGenre === g ? '' : g)}
                  className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${filterGenre === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 dark:bg-gray-800 dark:text-gray-300'}`}
                >{g}</button>
              ))}
            </div>
          )}

          {filteredSongs.length === 0 && <p className="text-gray-400 text-center py-8">Loading songs…</p>}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((s, idx) => {
              const realIdx = songs.indexOf(s);
              const colors = CARD_COLORS[realIdx % CARD_COLORS.length];
              const songGenres = s.genre ? (Array.isArray(s.genre) ? s.genre : [s.genre]) : [];
              return (
                <button
                  key={realIdx}
                  onClick={() => selectSong(realIdx)}
                  className={`text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border-2 ${colors.border}`}
                >
                  <div className={`bg-gradient-to-br ${colors.bg} p-5 text-white`}>
                    <div className="text-3xl mb-2">🎵</div>
                    <h3 className="font-bold text-lg leading-tight">{s.title}</h3>
                    {s.source && <p className="text-sm text-white/80 mt-0.5">{s.source}</p>}
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-3 space-y-2">
                    {songGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {songGenres.map(g => (
                          <span key={g} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>{g}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{s.lyrics?.length || 0} lines</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                      <span>🎤</span> Sing Along →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Karaoke view */}
      {selected !== null && song && (
        <div>
          <button
            onClick={() => { setSelected(null); setAutoAdvance(false); clearInterval(intervalRef.current); }}
            className="mb-4 text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >← Back to songs</button>

          {/* Song header */}
          {(() => {
            const colors = CARD_COLORS[selected % CARD_COLORS.length];
            const songGenres = song.genre ? (Array.isArray(song.genre) ? song.genre : [song.genre]) : [];
            return (
              <div className={`rounded-2xl bg-gradient-to-r ${colors.bg} text-white p-5 mb-5 shadow-lg`}>
                <h2 className="text-2xl font-bold">{song.title}</h2>
                {song.source && <p className="text-sm text-white/80 mt-0.5">{song.source}</p>}
                {songGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {songGenres.map(g => (
                      <span key={g} className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Controls bar */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-purple-100 dark:border-gray-700 p-4 mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLineIndex(i => Math.max(0, i - 1))}
              disabled={lineIndex === 0}
              className="rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-5 py-2 text-sm disabled:opacity-40 transition-colors"
            >← Prev</button>
            <span className="text-xs text-gray-400">{lineIndex + 1} / {song.lyrics.length}</span>
            <button
              type="button"
              onClick={() => setLineIndex(i => Math.min(song.lyrics.length - 1, i + 1))}
              disabled={lineIndex >= song.lyrics.length - 1}
              className="rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-5 py-2 text-sm disabled:opacity-40 transition-colors"
            >Next →</button>

            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                <div
                  onClick={() => setAutoAdvance(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${autoAdvance ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                Auto-advance
              </label>
              {autoAdvance && (
                <select
                  value={autoSpeed}
                  onChange={e => setAutoSpeed(Number(e.target.value))}
                  className="text-xs border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                >
                  <option value={2000}>Fast (2s)</option>
                  <option value={3000}>Normal (3s)</option>
                  <option value={5000}>Slow (5s)</option>
                </select>
              )}
            </div>
          </div>

          {/* Lyrics display */}
          <div className="rounded-2xl border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-900 p-5 space-y-1 mb-4">
            {song.lyrics.map((line, i) => {
              if (i === lineIndex) {
                return (
                  <p
                    key={i}
                    className="rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 border-2 border-pink-300 dark:border-pink-600 px-4 py-2 font-bold text-lg text-pink-800 dark:text-pink-200 animate-pulse"
                    style={{ animationDuration: '1.5s' }}
                  >
                    🎤 {line}
                  </p>
                );
              }
              if (i < lineIndex) {
                return (
                  <p key={i} className="px-4 py-1 text-gray-300 dark:text-gray-600 line-through text-sm">{line}</p>
                );
              }
              return (
                <p key={i} className="px-4 py-1 text-gray-500 dark:text-gray-400 text-sm">{line}</p>
              );
            })}
          </div>

          {/* Play link */}
          {song.channelUrl && (
            <a
              href={song.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              ▶ Play music for this song ({song.source})
            </a>
          )}
        </div>
      )}
    </section>
  );
}
