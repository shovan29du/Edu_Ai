import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}${path}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);
  return { data, loading, error };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-6 text-center text-red-700 dark:text-red-300">
      Could not load data: {msg}
    </div>
  );
}

function FunFactBox({ text }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-400 rounded-r-lg px-4 py-2 mt-2 text-sm text-amber-900 dark:text-amber-200">
      ✨ {text}
    </div>
  );
}

function SectionTitle({ children, emoji }) {
  return (
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
      {emoji && <span>{emoji}</span>}{children}
    </h2>
  );
}

function Badge({ children, colour }) {
  const styles = {
    gold: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    silver: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${styles[colour] || styles.blue}`}>
      {children}
    </span>
  );
}

// ─── Football World Cup ───────────────────────────────────────────────────────

function FootballWC() {
  const { data, loading, error } = useApi('/api/sports-detail/football-worldcup');
  const [view, setView] = useState('timeline');

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl p-5 text-white shadow">
        <div className="text-3xl mb-1">🏆</div>
        <h2 className="text-2xl font-extrabold">{data.title}</h2>
        <p className="text-amber-50 text-sm mt-1">{data.description}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span className="bg-white/20 rounded-full px-3 py-1">{data.format}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">Prize: {data.prize}</span>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2">
        {[['timeline','📅 All Editions'],['scorers','⚽ Top Scorers'],['titles','🥇 Most Titles'],['records','📋 Records']].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === k ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'}`}>
            {l}
          </button>
        ))}
      </div>

      {view === 'timeline' && (
        <div className="space-y-3">
          {[...data.editions].reverse().map(ed => (
            <div key={ed.year} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-2xl font-extrabold text-amber-500">{ed.year}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">🌍 {ed.host}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">({ed.teams} teams)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800 dark:text-gray-100">🏆 {ed.winner}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">vs {ed.runner_up} — {ed.final_score}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge colour="gold">🥇 {ed.winner}</Badge>
                <Badge colour="silver">🥈 {ed.runner_up}</Badge>
                {ed.third && <Badge colour="green">🥉 {ed.third}</Badge>}
                <Badge colour="blue">⚽ {ed.top_scorer}</Badge>
              </div>
              <FunFactBox text={ed.fun_fact} />
            </div>
          ))}
        </div>
      )}

      {view === 'scorers' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 dark:bg-amber-950/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-amber-800 dark:text-amber-200">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-amber-800 dark:text-amber-200">Player</th>
                  <th className="px-4 py-3 text-left font-semibold text-amber-800 dark:text-amber-200">Country</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800 dark:text-amber-200 tabular-nums">Goals</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800 dark:text-amber-200">Tournaments</th>
                </tr>
              </thead>
              <tbody>
                {data.all_time_top_scorers.map((p, i) => (
                  <tr key={p.name} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{i === 0 && '🥇 '}{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.country}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums">{p.goals}</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{p.tournaments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'titles' && (
        <div className="grid gap-3">
          {data.most_titles.map((c, i) => (
            <div key={c.country} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex items-center gap-4">
              <div className={`text-3xl font-extrabold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 dark:text-gray-100">{c.country}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.years.map(y => <span key={y} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full">{y}</span>)}
                </div>
              </div>
              <div className="text-3xl font-black text-amber-500">{c.titles}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'records' && (
        <div className="grid gap-3">
          {data.records.map(r => (
            <div key={r.record} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{r.record}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{r.holder}</div>
              <div className="text-amber-600 dark:text-amber-400 font-semibold">{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Football Leagues ─────────────────────────────────────────────────────────

function FootballLeagues() {
  const { data, loading, error } = useApi('/api/sports-detail/football-leagues');
  const [selectedLeague, setSelectedLeague] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const league = selectedLeague ? data.leagues.find(l => l.id === selectedLeague) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5 text-white shadow">
        <div className="text-3xl mb-1">🏟️</div>
        <h2 className="text-2xl font-extrabold">{data.title}</h2>
        <p className="text-green-50 text-sm mt-1">{data.description}</p>
      </div>

      {/* League selector */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedLeague(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedLeague ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30'}`}>
          🌍 All Leagues
        </button>
        {data.leagues.filter(l => l.id !== 'other_leagues').map(l => (
          <button key={l.id} onClick={() => setSelectedLeague(l.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedLeague === l.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30'}`}>
            {l.emoji} {l.name.split(' ').slice(0,2).join(' ')}
          </button>
        ))}
      </div>

      {!league && (
        <div className="grid gap-4">
          {data.leagues.map(l => {
            if (l.id === 'other_leagues') {
              return (
                <div key={l.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{l.emoji}</span>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{l.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{l.description}</p>
                  <div className="grid gap-2">
                    {l.leagues.map(ol => (
                      <div key={ol.name} className="flex gap-3 items-start">
                        <Badge colour="green">{ol.country}</Badge>
                        <div>
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{ol.name}</span>
                          {ol.notable && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ol.notable}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={l.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{l.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{l.name}</h3>
                      <p className="text-xs text-gray-400">{l.country} · Founded {l.founded} · {l.teams} teams</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLeague(l.id)}
                    className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors font-medium">
                    View Clubs →
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{l.description}</p>
                {l.record_champions && (
                  <div className="mt-2"><Badge colour="gold">🏆 Record: {l.record_champions}</Badge></div>
                )}
                {l.el_clasico && <FunFactBox text={l.el_clasico} />}
                {l.anthem && <FunFactBox text={l.anthem} />}
              </div>
            );
          })}
        </div>
      )}

      {league && (
        <div className="space-y-4">
          <button onClick={() => setSelectedLeague(null)}
            className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
            ← Back to all leagues
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{league.emoji}</span>
              <div>
                <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{league.name}</h2>
                <p className="text-sm text-gray-400">{league.country} · Founded {league.founded}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{league.description}</p>
            {league.record_champions && (
              <div className="mt-2"><Badge colour="gold">🏆 {league.record_champions}</Badge></div>
            )}
            {league.el_clasico && <FunFactBox text={league.el_clasico} />}
            {league.anthem && <FunFactBox text={league.anthem} />}
            {league.format && <p className="text-xs text-gray-400 mt-2">Format: {league.format}</p>}
          </div>

          {/* Most titles */}
          {league.most_titles && (
            <div>
              <SectionTitle emoji="🏆">Title Winners</SectionTitle>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 dark:bg-green-950/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-green-800 dark:text-green-200">Club</th>
                      <th className="px-4 py-3 text-right font-semibold text-green-800 dark:text-green-200 tabular-nums">Titles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(league.most_titles || []).sort((a,b) => (b.titles||0)-(a.titles||0)).map((c, i) => (
                      <tr key={c.club || c.club} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'}>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{i===0&&'🏆 '}{c.club}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400 tabular-nums">{c.titles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Famous clubs */}
          {league.famous_clubs && (
            <div>
              <SectionTitle emoji="⚽">Famous Clubs</SectionTitle>
              <div className="grid gap-3">
                {league.famous_clubs.map(club => (
                  <div key={club.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{club.emoji}</span>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{club.name}</span>
                        <span className="ml-2 text-sm text-gray-400 italic">{club.nickname}</span>
                      </div>
                    </div>
                    {club.stadium && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        🏟️ {club.stadium}{club.capacity ? ` (${club.capacity.toLocaleString()} capacity)` : ''}
                      </p>
                    )}
                    <FunFactBox text={club.fun_fact} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Champions League memorable finals */}
          {league.memorable_finals && (
            <div>
              <SectionTitle emoji="⭐">Memorable Finals</SectionTitle>
              <div className="grid gap-3">
                {league.memorable_finals.map(f => (
                  <div key={f.year} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-amber-500 text-lg">{f.year}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{f.final}</span>
                    </div>
                    <FunFactBox text={f.fun_fact} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Records */}
          {league.records && (
            <div>
              <SectionTitle emoji="📋">Records</SectionTitle>
              <div className="grid gap-3">
                {league.records.map(r => (
                  <div key={r.record} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{r.record}</div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{r.holder}</div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Cricket World Cup ────────────────────────────────────────────────────────

function CricketWC() {
  const { data, loading, error } = useApi('/api/sports-detail/cricket-worldcup');
  const [format, setFormat] = useState('odi');
  const [view, setView] = useState('timeline');

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const f = data.formats[format];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-5 text-white shadow">
        <div className="text-3xl mb-1">🏏</div>
        <h2 className="text-2xl font-extrabold">{data.title}</h2>
        <p className="text-blue-50 text-sm mt-1">{data.description}</p>
      </div>

      {/* Format toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setFormat('odi'); setView('timeline'); }}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${format === 'odi' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
          🏏 ODI World Cup
        </button>
        <button onClick={() => { setFormat('t20'); setView('timeline'); }}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${format === 't20' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
          ⚡ T20 World Cup
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
        {f.name} — {f.description}
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2">
        {[['timeline','📅 All Editions'],['titles','🏆 Most Titles'],...(format==='odi' ? [['scorers','🏏 Top Scorers'],['wickets','🎳 Top Wicket-Takers']] : [])].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === k ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>
            {l}
          </button>
        ))}
      </div>

      {view === 'timeline' && (
        <div className="space-y-3">
          {[...f.editions].reverse().map(ed => (
            <div key={ed.year} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-2xl font-extrabold text-blue-500">{ed.year}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">📍 {ed.host}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800 dark:text-gray-100">🏆 {ed.winner}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">vs {ed.runner_up}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge colour="blue">Score: {ed.final_score}</Badge>
                {ed.player_of_tournament && <Badge colour="gold">⭐ {ed.player_of_tournament}</Badge>}
              </div>
              <FunFactBox text={ed.fun_fact} />
            </div>
          ))}
        </div>
      )}

      {view === 'titles' && (
        <div className="grid gap-3">
          {f.most_titles.map((c, i) => (
            <div key={c.country} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex items-center gap-4">
              <div className="text-2xl">{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 dark:text-gray-100">{c.country}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.years.map(y => <span key={y} className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">{y}</span>)}
                </div>
              </div>
              <div className="text-3xl font-black text-blue-500">{c.titles}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'scorers' && f.all_time_top_scorers && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 dark:bg-blue-950/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">#</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">Player</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">Country</th>
                <th className="px-4 py-3 text-right font-semibold text-blue-800 dark:text-blue-200 tabular-nums">Runs</th>
                <th className="px-4 py-3 text-right font-semibold text-blue-800 dark:text-blue-200">Tournaments</th>
              </tr>
            </thead>
            <tbody>
              {f.all_time_top_scorers.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'}>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{i===0&&'🏅 '}{p.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.country}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">{p.runs}</td>
                  <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{p.tournaments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'wickets' && f.all_time_top_wicket_takers && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 dark:bg-blue-950/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">#</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">Player</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 dark:text-blue-200">Country</th>
                <th className="px-4 py-3 text-right font-semibold text-blue-800 dark:text-blue-200 tabular-nums">Wickets</th>
                <th className="px-4 py-3 text-right font-semibold text-blue-800 dark:text-blue-200">Tournaments</th>
              </tr>
            </thead>
            <tbody>
              {f.all_time_top_wicket_takers.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'}>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{i===0&&'🎳 '}{p.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.country}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">{p.wickets}</td>
                  <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{p.tournaments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Cricket Leagues ──────────────────────────────────────────────────────────

function CricketLeagues() {
  const { data, loading, error } = useApi('/api/sports-detail/cricket-leagues');
  const [selected, setSelected] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const league = selected ? data.leagues.find(l => l.id === selected) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow">
        <div className="text-3xl mb-1">🏏</div>
        <h2 className="text-2xl font-extrabold">{data.title}</h2>
        <p className="text-orange-50 text-sm mt-1">{data.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelected(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!selected ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
          🌍 All Leagues
        </button>
        {data.leagues.map(l => (
          <button key={l.id} onClick={() => setSelected(l.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selected === l.id ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/30'}`}>
            {l.emoji} {l.id === 'ipl' ? 'IPL' : l.id === 'bbl' ? 'BBL' : l.id === 'psl' ? 'PSL' : l.id === 'cpl' ? 'CPL' : l.id === 'sa20' ? 'SA20' : l.id === 'the_hundred' ? 'The 100' : 'Test'}
          </button>
        ))}
      </div>

      {!league && (
        <div className="grid gap-4">
          {data.leagues.map(l => (
            <div key={l.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{l.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{l.name}</h3>
                    <p className="text-xs text-gray-400">{l.country} · Founded {l.founded} · {l.format}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(l.id)}
                  className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors font-medium">
                  Explore →
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{l.description}</p>
              {l.fun_facts && l.fun_facts[0] && <FunFactBox text={l.fun_facts[0]} />}
            </div>
          ))}
        </div>
      )}

      {league && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
            ← Back to all leagues
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{league.emoji}</span>
              <div>
                <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{league.name}</h2>
                <p className="text-xs text-gray-400">{league.country} · Founded {league.founded} · {league.format}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{league.description}</p>
            {league.prize_money && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">💰 {league.prize_money}</p>}
            {league.viewership && <p className="text-xs text-gray-400 mt-1">📺 {league.viewership}</p>}
          </div>

          {league.most_titles && (
            <div>
              <SectionTitle emoji="🏆">Title Winners</SectionTitle>
              <div className="grid gap-2">
                {league.most_titles.map((t, i) => (
                  <div key={t.team} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm flex items-center gap-3">
                    <span className="text-xl">{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 dark:text-gray-100">{t.team}</span>
                      {t.years && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.years.map(y => <span key={y} className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs px-2 py-0.5 rounded-full">{y}</span>)}
                        </div>
                      )}
                    </div>
                    <span className="font-black text-orange-500 text-2xl">{t.titles}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {league.records && (
            <div>
              <SectionTitle emoji="📋">Records</SectionTitle>
              <div className="grid gap-3">
                {league.records.map(r => (
                  <div key={r.record} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{r.record}</div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{r.holder}</div>
                    <div className="text-orange-600 dark:text-orange-400 font-semibold">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {league.famous_players && (
            <div>
              <SectionTitle emoji="⭐">Famous Players</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {league.famous_players.map(p => (
                  <span key={p} className="bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800 text-sm px-3 py-1.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}

          {league.fun_facts && (
            <div>
              <SectionTitle emoji="💡">Did You Know?</SectionTitle>
              <div className="space-y-2">
                {league.fun_facts.map((f, i) => <FunFactBox key={i} text={f} />)}
              </div>
            </div>
          )}

          {league.famous_series && (
            <div>
              <SectionTitle emoji="🧢">Famous Test Series</SectionTitle>
              <div className="grid gap-3">
                {league.famous_series.map(s => (
                  <div key={s.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="font-bold text-gray-800 dark:text-gray-100">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.teams} · {s.frequency}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{s.description}</p>
                    {s.fun_fact && <FunFactBox text={s.fun_fact} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tennis ───────────────────────────────────────────────────────────────────

function Tennis() {
  const { data, loading, error } = useApi('/api/sports-detail/tennis');
  const [view, setView] = useState('slams');
  const [selectedSlam, setSelectedSlam] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const slam = selectedSlam ? data.grand_slams.find(s => s.id === selectedSlam) : null;

  const surfaceColour = {
    'Grass': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    'Red clay': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    'Acrylic hard court': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    'Plexicushion hard court': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-2xl p-5 text-white shadow">
        <div className="text-3xl mb-1">🎾</div>
        <h2 className="text-2xl font-extrabold">{data.title}</h2>
        <p className="text-purple-100 text-sm mt-1">{data.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[['slams','🏟️ Grand Slams'],['masters','🎖️ ATP Masters'],['wta','👑 WTA Legends'],['legends','📊 All-Time Slams']].map(([k,l]) => (
          <button key={k} onClick={() => { setView(k); setSelectedSlam(null); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === k ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>
            {l}
          </button>
        ))}
      </div>

      {view === 'slams' && !slam && (
        <div className="grid gap-4">
          {data.grand_slams.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{s.name}</h3>
                    <p className="text-xs text-gray-400">{s.location} · {s.held} · Founded {s.founded}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSlam(s.id)}
                  className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors font-medium">
                  Deep Dive →
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${surfaceColour[s.surface] || 'bg-gray-100 text-gray-700'}`}>
                  🎾 {s.surface}
                </span>
                {s.prize_money && <Badge colour="gold">💰 {s.prize_money}</Badge>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{s.description}</p>
            </div>
          ))}
        </div>
      )}

      {view === 'slams' && slam && (
        <div className="space-y-4">
          <button onClick={() => setSelectedSlam(null)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            ← Back to Grand Slams
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{slam.emoji}</span>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{slam.name}</h2>
                <p className="text-sm text-gray-400">{slam.location}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${surfaceColour[slam.surface] || ''}`}>
                    {slam.surface}
                  </span>
                  <span className="text-xs text-gray-400">Founded {slam.founded} · {slam.held}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{slam.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🎾 Men's Most Titles</h3>
              {slam.men_most_titles.map((p, i) => (
                <div key={p.player} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span>{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{p.player}</div>
                    <div className="text-xs text-gray-400">{p.country}{p.years ? ` · ${p.years}` : ''}</div>
                    {p.fun_fact && <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{p.fun_fact}</p>}
                  </div>
                  <span className="font-black text-purple-500 text-xl tabular-nums">{p.titles}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🎾 Women's Most Titles</h3>
              {slam.women_most_titles.map((p, i) => (
                <div key={p.player} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span>{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{p.player}</div>
                    <div className="text-xs text-gray-400">{p.country}{p.years ? ` · ${p.years}` : ''}</div>
                  </div>
                  <span className="font-black text-purple-500 text-xl tabular-nums">{p.titles}</span>
                </div>
              ))}
            </div>
          </div>

          {slam.traditions && (
            <div>
              <SectionTitle emoji="🎩">Traditions</SectionTitle>
              <div className="flex flex-col gap-2">
                {slam.traditions.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-purple-400 mt-0.5">•</span>{t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {slam.memorable_moments && (
            <div>
              <SectionTitle emoji="⭐">Memorable Moments</SectionTitle>
              <div className="space-y-2">
                {slam.memorable_moments.map((m, i) => <FunFactBox key={i} text={m} />)}
              </div>
            </div>
          )}

          {slam.fun_facts && (
            <div>
              <SectionTitle emoji="💡">Did You Know?</SectionTitle>
              <div className="space-y-2">
                {slam.fun_facts.map((f, i) => <FunFactBox key={i} text={f} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'masters' && (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-sm text-purple-800 dark:text-purple-200 border border-purple-100 dark:border-purple-800">
            {data.atp_masters.description}
          </div>
          <div className="grid gap-3">
            {data.atp_masters.events.map(e => (
              <div key={e.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{e.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">📍 {e.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge colour={e.surface === 'Clay' ? 'red' : e.surface === 'Hard' ? 'blue' : 'green'}>{e.surface}</Badge>
                    {e.nickname && <Badge colour="gold">{e.nickname}</Badge>}
                  </div>
                </div>
                {e.fun_fact && <FunFactBox text={e.fun_fact} />}
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🏆 {data.atp_finals.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{data.atp_finals.location} — {data.atp_finals.description}</p>
            <div className="grid gap-2">
              {data.atp_finals.most_titles.map((p, i) => (
                <div key={p.player} className="flex items-center gap-3">
                  <span className="text-sm">{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}.`}</span>
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{p.player}</span>
                  <span className="font-bold text-purple-500 tabular-nums">{p.titles}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'wta' && (
        <div className="space-y-3">
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-sm text-purple-800 dark:text-purple-200 border border-purple-100 dark:border-purple-800">
            {data.wta_events.description}
          </div>
          {data.wta_events.slams_dominated_by.map((p, i) => (
            <div key={p.player} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{i < 3 ? ['🥇','🥈','🥉'][i] : '🎾'}</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 dark:text-gray-100">{p.player}</div>
                  <div className="text-xs text-gray-400">{p.country}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{p.description}</p>
                </div>
                <div className="text-3xl font-black text-purple-500 tabular-nums">{p.total_slams}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'legends' && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-purple-50 dark:bg-purple-950/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-200">Player</th>
                <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-200">Country</th>
                <th className="px-4 py-3 text-right font-semibold text-purple-800 dark:text-purple-200 tabular-nums">Slams</th>
                <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-200">Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {[...data.legends_by_slams].sort((a,b) => b.total_slams - a.total_slams).map((p, i) => (
                <tr key={p.player} className={i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{i===0&&'👑 '}{p.player}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.country}</td>
                  <td className="px-4 py-3 text-right font-black text-purple-600 dark:text-purple-400 text-lg tabular-nums">{p.total_slams}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{p.breakdown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'football-wc', label: 'Football WC', emoji: '⚽' },
  { id: 'football-leagues', label: 'Football Leagues', emoji: '🏟️' },
  { id: 'cricket-wc', label: 'Cricket WC', emoji: '🏏' },
  { id: 'cricket-leagues', label: 'Cricket Leagues', emoji: '🎰' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
];

export default function SportsTournaments() {
  const [activeTab, setActiveTab] = useState('football-wc');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-amber-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
          >
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'football-wc' && <FootballWC />}
      {activeTab === 'football-leagues' && <FootballLeagues />}
      {activeTab === 'cricket-wc' && <CricketWC />}
      {activeTab === 'cricket-leagues' && <CricketLeagues />}
      {activeTab === 'tennis' && <Tennis />}
    </div>
  );
}
