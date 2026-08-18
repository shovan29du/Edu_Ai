import { useEffect, useRef, useState } from 'react';
import { BACKGROUND_IMAGE_TITLES } from '../data/backgroundImageTitles.js';

const ROTATE_INTERVAL_MS = 15 * 60 * 1000;
const CONCURRENCY = 4;

function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A rotating, full-viewport background of space/nature/famous-art images,
 * resolved at runtime via the existing Wikipedia thumbnail proxy (so this
 * never depends on a hardcoded image URL going stale). Sits behind the app
 * content at z-0; failures for individual titles are skipped silently so a
 * bad title just means one fewer frame in the rotation, not a broken page. */
export default function AppBackground() {
  const [urls, setUrls] = useState([]);
  const [index, setIndex] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const queue = shuffled(BACKGROUND_IMAGE_TITLES);

    async function worker() {
      while (queue.length && !cancelledRef.current) {
        const title = queue.shift();
        try {
          const res = await fetch(`/api/museum/thumbnail?wiki_title=${encodeURIComponent(title)}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.thumbnail_url && !cancelledRef.current) {
            setUrls((prev) => (prev.includes(data.thumbnail_url) ? prev : [...prev, data.thumbnail_url]));
          }
        } catch {
          // Skip a failed/unresolvable title -- one fewer frame, not a crash.
        }
      }
    }

    Promise.all(Array.from({ length: CONCURRENCY }, worker));
    return () => { cancelledRef.current = true; };
  }, []);

  useEffect(() => {
    if (urls.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % urls.length), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [urls.length]);

  const currentUrl = urls[index];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gray-50 dark:bg-gray-950" aria-hidden="true">
      {currentUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-1000 dark:opacity-10"
          style={{ backgroundImage: `url(${currentUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gray-50/85 dark:bg-gray-950/85" />
    </div>
  );
}
