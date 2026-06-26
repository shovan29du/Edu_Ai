import React, { useEffect, useState } from 'react';
import { fetchSafeMusic } from '../api/safety.js';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';

export default function SafeMusicPlayer() {
  const { isRestricted } = useChild();
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSafeMusic()
      .then(setSongs)
      .catch((err) => setError(err.message));
  }, []);

  const visible = songs.filter((s) => !isRestricted || isResourceSafe(s));

  return (
    <section aria-label="Safe music library" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Safe Music Library</h2>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!error && visible.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">No songs available.</p>
      )}
      <ul className="space-y-3">
        {visible.map((song, i) => (
          <li key={i} className="rounded border p-3 dark:border-gray-700">
            <a
              href={song.videoUrl || song.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {song.title}
            </a>
            {song.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300">{song.description}</p>
            )}
            {song.source && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{song.source}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
