import React, { useState } from 'react';
import { searchGrade } from '../api/grade.js';
import VoiceInputButton from './VoiceInputButton.jsx';

export default function SearchBar({ standard }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setError(null);
      const data = await searchGrade(standard, query);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  }

  return (
    <section aria-label="Search safe resources" className="rounded border p-4 dark:border-gray-700">
      <form onSubmit={handleSearch} className="flex gap-2">
        <label className="sr-only" htmlFor="resource-search">
          Search safe resources for this grade
        </label>
        <input
          id="resource-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, videos, and lessons…"
          className="flex-1 rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <VoiceInputButton label="Speak your search" onResult={(transcript) => setQuery(transcript)} />
        <button
          type="submit"
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Search
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-red-600">
          {error}
        </p>
      )}

      {results && (
        <ul className="mt-3 space-y-2" aria-label="Search results">
          {results.length === 0 && <li className="text-gray-600 dark:text-gray-400">No safe results found.</li>}
          {results.map((r, i) => (
            <li key={i} className="rounded border p-2 dark:border-gray-700">
              <a
                href={r.link || r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {r.title}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {r.subject} · {r.resource_type?.replace('_', ' ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
