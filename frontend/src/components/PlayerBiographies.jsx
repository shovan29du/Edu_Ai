import { useState, useEffect } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API = '/api';

const SPORT_COLORS = {
  football:     { bg: 'bg-green-50',   border: 'border-green-200',   badge: 'bg-green-600',   text: 'text-green-700',   dark: 'dark:bg-green-900/20 dark:border-green-700' },
  cricket:      { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-600',   text: 'text-amber-700',   dark: 'dark:bg-amber-900/20 dark:border-amber-700' },
  tennis:       { bg: 'bg-yellow-50',  border: 'border-yellow-200',  badge: 'bg-yellow-600',  text: 'text-yellow-700',  dark: 'dark:bg-yellow-900/20 dark:border-yellow-700' },
  swimming:     { bg: 'bg-cyan-50',    border: 'border-cyan-200',    badge: 'bg-cyan-600',    text: 'text-cyan-700',    dark: 'dark:bg-cyan-900/20 dark:border-cyan-700' },
  athletics:    { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-600',     text: 'text-red-700',     dark: 'dark:bg-red-900/20 dark:border-red-700' },
  badminton:    { bg: 'bg-purple-50',  border: 'border-purple-200',  badge: 'bg-purple-600',  text: 'text-purple-700',  dark: 'dark:bg-purple-900/20 dark:border-purple-700' },
  golf:         { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', text: 'text-emerald-700', dark: 'dark:bg-emerald-900/20 dark:border-emerald-700' },
  cycling:      { bg: 'bg-orange-50',  border: 'border-orange-200',  badge: 'bg-orange-600',  text: 'text-orange-700',  dark: 'dark:bg-orange-900/20 dark:border-orange-700' },
  rugby:        { bg: 'bg-rose-50',    border: 'border-rose-200',    badge: 'bg-rose-600',    text: 'text-rose-700',    dark: 'dark:bg-rose-900/20 dark:border-rose-700' },
  baseball:     { bg: 'bg-blue-50',    border: 'border-blue-200',    badge: 'bg-blue-600',    text: 'text-blue-700',    dark: 'dark:bg-blue-900/20 dark:border-blue-700' },
  hockey:       { bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-700', text: 'text-emerald-700', dark: 'dark:bg-emerald-900/20 dark:border-emerald-700' },
  billiards:    { bg: 'bg-slate-50',   border: 'border-slate-300',   badge: 'bg-slate-700',   text: 'text-slate-700',   dark: 'dark:bg-slate-900/20 dark:border-slate-700' },
  chess:        { bg: 'bg-gray-50',    border: 'border-gray-400',    badge: 'bg-gray-800',    text: 'text-gray-700',    dark: 'dark:bg-gray-900/20 dark:border-gray-600' },
  table_tennis: { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-600',     text: 'text-red-700',     dark: 'dark:bg-red-900/20 dark:border-red-700' },
  basketball:   { bg: 'bg-orange-50',  border: 'border-orange-200',  badge: 'bg-orange-600',  text: 'text-orange-700',  dark: 'dark:bg-orange-900/20 dark:border-orange-700' },
  gymnastics:   { bg: 'bg-violet-50',  border: 'border-violet-200',  badge: 'bg-violet-700',  text: 'text-violet-700',  dark: 'dark:bg-violet-900/20 dark:border-violet-700' },
  boxing:       { bg: 'bg-red-50',     border: 'border-red-300',     badge: 'bg-red-700',     text: 'text-red-800',     dark: 'dark:bg-red-900/20 dark:border-red-800' },
  formula1:     { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-600',     text: 'text-red-700',     dark: 'dark:bg-red-900/20 dark:border-red-700' },
};

const defaultColors = { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-600', text: 'text-gray-700', dark: '' };

function PlayerDetail({ player, sportId, onBack }) {
  const c = SPORT_COLORS[sportId] || defaultColors;
  return (
    <div>
      <button onClick={onBack} className={`mb-4 text-sm ${c.text} hover:underline`}>← Back to players</button>
      <div className={`rounded-2xl border-2 ${c.border} ${c.bg} ${c.dark} p-6 mb-5`}>
        <div className="flex items-start gap-4">
          <div className={`text-5xl w-20 h-20 rounded-full flex items-center justify-center ${c.badge} text-white text-3xl flex-shrink-0 shadow-md`}>
            {player.image_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{player.name}</h2>
              <SpeakButton text={`${player.name}. ${player.biography}`} lang="en" />
            </div>
            {player.full_name && player.full_name !== player.name && (
              <p className="text-sm text-gray-500 italic">{player.full_name}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} text-white font-medium`}>🌍 {player.country}</span>
              {player.position && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{player.position}</span>}
              {player.born && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Born: {player.born}</span>}
              {player.died && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Died: {player.died}</span>}
              {player.career && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Career: {player.career}</span>}
              {player.gender === 'female' && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">👩 Women's Sport</span>}
            </div>
            {(player.clubs || player.teams) && (
              <p className="text-xs text-gray-500 mt-1">
                🏟 {(player.clubs || player.teams).join(' → ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 mb-4 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-white mb-2">📖 Biography</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{player.biography}</p>
      </div>

      {player.achievements?.length > 0 && (
        <div className={`rounded-xl border ${c.border} ${c.bg} ${c.dark} p-4 mb-4`}>
          <h3 className={`font-bold ${c.text} mb-3`}>🏆 Major Achievements</h3>
          <ul className="space-y-1.5">
            {player.achievements.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-800 dark:text-gray-200">
                <span className={`${c.text} font-bold flex-shrink-0`}>✓</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {player.style && (
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 p-4 mb-4">
          <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">🎯 Playing Style</h3>
          <p className="text-sm text-indigo-900 dark:text-indigo-200">{player.style}</p>
        </div>
      )}

      {player.fun_facts?.length > 0 && (
        <div className="rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 p-4 mb-4">
          <h3 className="font-bold text-pink-700 dark:text-pink-300 mb-3">🎉 Did You Know?</h3>
          <ul className="space-y-2">
            {player.fun_facts.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-pink-900 dark:text-pink-200">
                <span className="text-pink-500 flex-shrink-0">★</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SportSection({ sport, onSelectPlayer }) {
  const c = SPORT_COLORS[sport.id] || defaultColors;
  return (
    <div className="mb-8">
      <div className={`rounded-xl border-2 ${c.border} ${c.bg} ${c.dark} p-4 mb-3`}>
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">
          {sport.emoji} {sport.label}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">{sport.players?.length} featured legend{sport.players?.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sport.players?.map(player => (
          <button key={player.id} onClick={() => onSelectPlayer(sport.id, player)}
            className={`text-left rounded-xl border-2 ${c.border} bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-all hover:-translate-y-0.5`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{player.image_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{player.name}</p>
                <p className="text-xs text-gray-500 truncate">{player.country}</p>
              </div>
            </div>
            {player.position && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${c.badge} text-white`}>{player.position}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">{player.career}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{player.biography?.slice(0, 100)}…</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PlayerBiographies() {
  const [data, setData] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => {
    fetch(`${API}/sports-detail/players`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading player biographies…</div>;

  if (selectedPlayer) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <PlayerDetail
          player={selectedPlayer}
          sportId={selectedSport}
          onBack={() => { setSelectedPlayer(null); setSelectedSport(null); }}
        />
      </div>
    );
  }

  const q = search.toLowerCase();
  const filteredSports = data.sports
    .filter(s => filterSport === 'all' || s.id === filterSport)
    .map(s => ({
      ...s,
      players: s.players?.filter(p => {
        if (genderFilter === 'women' && p.gender !== 'female') return false;
        if (genderFilter === 'men' && p.gender === 'female') return false;
        return !q || p.name.toLowerCase().includes(q) || p.country?.toLowerCase().includes(q) || p.biography?.toLowerCase().includes(q);
      }),
    }))
    .filter(s => s.players?.length > 0);

  const totalPlayers = data.sports.reduce((n, s) => n + (s.players?.length || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-extrabold mb-1">🌟 Greatest Sports Legends</h1>
        <p className="text-gray-300 text-sm">{totalPlayers} biographies across {data.sports.length} sports</p>
      </div>

      <div className="flex gap-2 mb-4">
        {[['all', '⚡ All'], ['men', '🧑 Men'], ['women', '👩 Women']].map(([val, label]) => (
          <button key={val} onClick={() => setGenderFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${genderFilter === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterSport('all')}
          className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${filterSport === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
          All Sports
        </button>
        {data.sports.map(s => {
          const c = SPORT_COLORS[s.id] || defaultColors;
          return (
            <button key={s.id} onClick={() => setFilterSport(s.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${filterSport === s.id ? `${c.badge} text-white border-transparent` : `bg-white dark:bg-gray-800 ${c.border} ${c.text}`}`}>
              {s.emoji} {s.label}
            </button>
          );
        })}
      </div>

      <input
        type="search"
        placeholder="🔍 Search players by name or country…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />

      {filteredSports.map(sport => (
        <SportSection
          key={sport.id}
          sport={sport}
          onSelectPlayer={(sportId, player) => {
            setSelectedSport(sportId);
            setSelectedPlayer(player);
          }}
        />
      ))}

      {filteredSports.length === 0 && (
        <div className="text-center py-12 text-gray-400">No players found for "{search}"</div>
      )}
    </div>
  );
}
