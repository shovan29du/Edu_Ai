import React, { useEffect, useState } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API_URL = '/api/art-of-the-day';
const THUMB_URL = '/api/museum/thumbnail';

const KIND_EMOJI = { Painting: '🖼️', Photograph: '📷', Sculpture: '🗿' };

function parsePiece(raw) {
  const match = raw.title.match(/^Famous (Painting|Photograph|Sculpture): (.+)$/);
  return {
    kind: match ? match[1] : 'Painting',
    name: match ? match[2] : raw.title,
    fact: raw.fact,
  };
}

export default function ArtOfTheDay() {
  const [piece, setPiece] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load art of the day right now.');
        return res.json();
      })
      .then((data) => {
        if (data && data.title) setPiece(parsePiece(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!piece) return;
    setThumbnail(null);
    fetch(`${THUMB_URL}?wiki_title=${encodeURIComponent(piece.name)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setThumbnail(data?.thumbnail_url || ''))
      .catch(() => setThumbnail(''));
  }, [piece]);

  return (
    <section
      aria-label="Art of the day"
      className="overflow-hidden rounded border bg-rose-50 dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="p-4 pb-2 text-lg font-bold">🖼️ Art of the Day</h2>
      {loading && <p className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300">Loading…</p>}
      {error && <p role="alert" className="px-4 pb-4 text-red-600">{error}</p>}
      {piece && (
        <>
          <div className="mx-4 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-rose-200 to-amber-200 dark:from-rose-900 dark:to-amber-900">
            {thumbnail
              ? <img src={thumbnail} alt={piece.name} className="h-full w-full object-contain" onError={() => setThumbnail('')} />
              : <span className="text-5xl opacity-70">{KIND_EMOJI[piece.kind] || '🖼️'}</span>}
          </div>
          <div className="p-4">
            <div className="flex items-start gap-2">
              <p className="font-medium flex-1">{piece.name}</p>
              <SpeakButton text={`${piece.name}. ${piece.fact}`} lang="en" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{piece.fact}</p>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              A different famous painting, photograph, or sculpture each day.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
