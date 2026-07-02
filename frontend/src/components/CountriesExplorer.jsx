import React, { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const CONTINENTS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];

export default function CountriesExplorer() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((d) => { setCountries(d.countries || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function loadCountry(code) {
    const data = await fetch(`/api/countries/${code}`).then((r) => r.json());
    setSelected(data);
  }

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.capital?.toLowerCase().includes(search.toLowerCase());
      const matchContinent = continent === 'All' || c.continent === continent;
      return matchSearch && matchContinent;
    });
  }, [countries, search, continent]);

  if (loading) return <LoadingSpinner />;

  if (selected) {
    const c = selected;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="text-sm text-blue-600 hover:underline">← All Countries</button>
        <div className="rounded-xl overflow-hidden border shadow">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white text-center">
            <div className="text-6xl mb-2">{c.flag_emoji}</div>
            {c.flag_url && (
              <img src={c.flag_url} alt={`Flag of ${c.name}`} className="mx-auto h-16 rounded shadow mt-2" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            <h2 className="text-2xl font-bold mt-2">{c.name}</h2>
            <p className="opacity-90">{c.continent}</p>
          </div>
          <div className="p-4 grid gap-3 sm:grid-cols-2">
            <Fact label="🏛 Capital" value={c.capital} />
            <Fact label="👥 Population" value={c.population ? Number(c.population).toLocaleString() : '—'} />
            <Fact label="💰 Currency" value={c.currency} />
            <Fact label="🗣 Language" value={c.language} />
            <Fact label="🌍 Continent" value={c.continent} />
            {c.area_km2 && <Fact label="📐 Area" value={`${Number(c.area_km2).toLocaleString()} km²`} />}
          </div>
          {c.greeting && (
            <div className="border-t px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-600">Greeting in {c.language}:</p>
              <p className="text-sm italic">"{c.greeting}"</p>
            </div>
          )}
          {c.fun_fact && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-medium">💡 Fun Fact</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{c.fun_fact}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
        <h2 className="text-xl font-bold">🌍 Countries Explorer</h2>
        <p className="text-sm opacity-90">Discover all {countries.length} countries of the world</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search country or capital…"
          className="flex-1 rounded-lg border px-3 py-2 dark:bg-gray-800"
        />
        <select
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
          className="rounded-lg border px-3 py-2 dark:bg-gray-800"
        >
          {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} countries</p>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((c) => (
          <button
            key={c.code}
            onClick={() => loadCountry(c.code)}
            className="flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm hover:border-blue-400 transition dark:bg-gray-900"
          >
            <span className="text-2xl">{c.flag_emoji}</span>
            <div className="min-w-0">
              <p className="font-medium truncate">{c.name}</p>
              <p className="text-xs text-gray-500 truncate">{c.capital}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">No countries found.</p>
      )}
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value || '—'}</p>
    </div>
  );
}
