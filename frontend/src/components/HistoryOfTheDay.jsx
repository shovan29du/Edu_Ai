import React, { useEffect, useState } from 'react';
import { isTextSafe } from '../utils/safetyFilter.js';
import { SpeakButton } from '../utils/tts.jsx';

const FEED_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected';

export default function HistoryOfTheDay() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDateLabel(
      now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    );

    setLoading(true);
    setError(null);
    fetch(`${FEED_URL}/${mm}/${dd}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load today in history right now.');
        return res.json();
      })
      .then((data) => {
        const safeEvents = (data.selected || [])
          .filter((e) => isTextSafe(e.text))
          .slice(0, 8);
        setEvents(safeEvents);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section
      aria-label="History of the day"
      className="rounded border bg-amber-50 p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-2 text-lg font-bold">📜 This Day in History — {dateLabel}</h2>
      {loading && <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300">No events found for today.</p>
      )}
      <ul className="space-y-3">
        {events.map((event, idx) => (
          <li key={idx} className="border-b pb-2 last:border-b-0 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <p className="font-medium">{event.year}</p>
              <SpeakButton text={`${event.year}. ${event.text}`} lang="en" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{event.text}</p>
            {event.pages?.[0]?.content_urls?.desktop?.page && (
              <a
                href={event.pages[0].content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline dark:text-blue-400"
              >
                Read more
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Source: Wikipedia "On this day" feed.
      </p>
    </section>
  );
}
