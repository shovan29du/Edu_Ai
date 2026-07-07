import React, { useEffect, useState } from 'react';
import { fetchWorldTour } from '../api/adultLearning.js';

const REGIONS = ['', 'Africa', 'Americas', 'Asia', 'Europe', 'Middle East', 'Oceania'];

export default function WorldTour() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchWorldTour({ query, region })
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
  }, [query, region]);

  return (
    <section className="space-y-4 rounded border p-4 dark:border-gray-700" aria-label="Virtual world tour">
      <div>
        <h2 className="text-lg font-bold">Virtual World Tour</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data ? `${data.total} routes across the world; showing ${data.shown}.` : 'Loading routes...'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="search"
          aria-label="Search world tours"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search place or theme"
          className="rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
        />
        <select aria-label="Filter world tour region" value={region} onChange={(e) => setRegion(e.target.value)} className="rounded border px-3 py-2 dark:bg-gray-800 dark:text-white">
          {REGIONS.map((name) => <option key={name} value={name}>{name || 'All regions'}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(data?.tours || []).map((tour) => (
          <li key={tour.id} className="rounded border p-3 dark:border-gray-700">
            <p className="font-semibold">{tour.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tour.region} · {tour.theme}</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{tour.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <a href={tour.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Read</a>
              <a href={tour.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Map</a>
              <a href={tour.museumSearchUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Museum search</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
