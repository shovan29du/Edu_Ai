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
            {c.climate && <Fact label="🌤 Climate" value={c.climate} />}
            {c.geography && <Fact label="🗺 Geography" value={c.geography} />}
          </div>
          {c.greeting && (
            <div className="border-t px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-600">Greeting in {c.language}:</p>
              <p className="text-sm italic">"{c.greeting}"</p>
            </div>
          )}
          {c.culture && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-1">🎭 Culture</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{c.culture}</p>
            </div>
          )}
          {c.landmarks?.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-2">🗼 Major Landmarks</p>
              <div className="flex flex-wrap gap-1">
                {c.landmarks.map(l => <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">{l}</span>)}
              </div>
            </div>
          )}
          {c.unesco_sites?.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-2">🏆 UNESCO World Heritage Sites</p>
              <div className="flex flex-wrap gap-1">
                {c.unesco_sites.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">{s}</span>)}
              </div>
            </div>
          )}
          {c.wildlife?.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-2">🦁 Wildlife</p>
              <div className="flex flex-wrap gap-1">
                {c.wildlife.map(w => <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">{w}</span>)}
              </div>
            </div>
          )}
          {c.foods?.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-2">🍽 Traditional Foods</p>
              <div className="flex flex-wrap gap-1">
                {c.foods.map(f => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">{f}</span>)}
              </div>
            </div>
          )}
          {c.festivals?.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-semibold mb-2">🎉 Festivals & Celebrations</p>
              <div className="flex flex-wrap gap-1">
                {c.festivals.map(f => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">{f}</span>)}
              </div>
            </div>
          )}
          {c.fun_fact && (
            <div className="border-t px-4 py-3">
              <p className="text-sm font-medium">💡 Fun Fact</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{c.fun_fact}</p>
            </div>
          )}
          {c.links && (
            <div className="border-t px-4 py-4">
              <p className="text-sm font-semibold mb-3">🔗 Explore {c.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LinkCard href={c.links.tourist_attraction_video} icon="🎬" label="Tourist Attraction Video" color="red" />
                <LinkCard href={c.links.video_overview} icon="▶" label="Country Documentary" color="red" />
                <LinkCard href={c.links.virtual_tour_video} icon="🌐" label="Virtual Tour (4K)" color="red" />
                <LinkCard href={c.links.text_wikipedia} icon="📖" label="Wikipedia" color="gray" />
                <LinkCard href={c.links.text_cia_factbook} icon="🏛" label="CIA World Factbook" color="blue" />
                <LinkCard href={c.links.text_britannica} icon="📚" label="Britannica" color="indigo" />
                <LinkCard href={c.links.resource_lonely_planet} icon="✈️" label="Lonely Planet Travel Guide" color="green" />
                <LinkCard href={c.links.resource_nat_geo} icon="🌍" label="National Geographic" color="amber" />
              </div>
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

const COLOR_MAP = {
  red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
  blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
  green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
};

function LinkCard({ href, icon, label, color = 'gray' }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${COLOR_MAP[color] || COLOR_MAP.gray}`}>
      <span>{icon}</span>
      <span className="truncate">{label}</span>
      <span className="ml-auto opacity-50">↗</span>
    </a>
  );
}
