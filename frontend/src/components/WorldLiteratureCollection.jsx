import React, { useEffect, useState } from 'react';
import { fetchWorldLiterature } from '../api/adultLearning.js';

export default function WorldLiteratureCollection() {
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchWorldLiterature({ kind, query, limit: 160 })
      .then((next) => {
        if (active) {
          setData(next);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [kind, query]);

  return (
    <section className="space-y-4 rounded border p-4 dark:border-gray-700" aria-label="World literature collection">
      <div>
        <h2 className="text-lg font-bold">World Literature Collection</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data ? `${data.fictionTotal} fiction paths and ${data.nonfictionTotal} non-fiction paths; showing ${data.shown}.` : 'Loading literature...'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="search"
          aria-label="Search literature"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topic"
          className="rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
        />
        <select aria-label="Filter literature type" value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border px-3 py-2 dark:bg-gray-800 dark:text-white">
          <option value="all">All</option>
          <option value="fiction">Fiction</option>
          <option value="nonfiction">Non-fiction</option>
        </select>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(data?.items || []).map((item) => (
          <li key={item.id} className="rounded border p-3 dark:border-gray-700">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">Open collection</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
