import React, { useEffect, useState } from 'react';
import { fetchSingAlongSongs } from '../api/safety.js';

export default function SingAlong() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    fetchSingAlongSongs()
      .then(setSongs)
      .catch((err) => setError(err.message));
  }, []);

  const song = songs[selected];

  function selectSong(index) {
    setSelected(index);
    setLineIndex(0);
  }

  return (
    <section aria-label="Sing-along karaoke" className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h2 className="text-lg font-bold">Sing-Along</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Classic, traditional public-domain nursery rhyme lyrics for singing along. There is no
        synced audio playback here — use the channel link to play the song while you sing.
      </p>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!error && songs.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading songs…</p>}
      {songs.length > 0 && (
        <>
          <label className="flex flex-col text-sm font-medium">
            Choose a song
            <select
              value={selected}
              onChange={(e) => selectSong(Number(e.target.value))}
              className="mt-1 rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
            >
              {songs.map((s, i) => (
                <option key={s.title} value={i}>
                  {s.title}
                </option>
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLineIndex((i) => Math.max(0, i - 1))}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Previous line
                </button>
                <button
                  type="button"
                  onClick={() => setLineIndex((i) => Math.min(song.lyrics.length - 1, i + 1))}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Next line
                </button>
              </div>
              {song.channelUrl && (
                <a
                  href={song.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
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
