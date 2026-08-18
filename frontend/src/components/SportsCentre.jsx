import React, { useState, useEffect } from 'react';

const API = '/api/sports';

function LoadingDots() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function QuizSection({ quiz, sportColour }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const score = submitted ? quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0) : 0;

  const handleSubmit = () => {
    if (Object.keys(answers).length < quiz.length) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="mt-6 rounded-2xl border-2 p-5" style={{ borderColor: sportColour, backgroundColor: sportColour + '0d' }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: sportColour }}>
        🧠 Quick Quiz
      </h3>

      {submitted && (
        <div className={`mb-4 rounded-xl p-4 text-center font-bold text-lg ${score === quiz.length ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : score >= quiz.length / 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
          {score === quiz.length ? '🏆 Perfect score! Amazing!' : score >= quiz.length / 2 ? `👏 Well done! ${score}/${quiz.length} correct!` : `📚 Keep practising! ${score}/${quiz.length} correct`}
        </div>
      )}

      <div className="space-y-5">
        {quiz.map((q, qi) => (
          <div key={qi} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
              <span className="font-bold" style={{ color: sportColour }}>Q{qi + 1}. </span>{q.q}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                let cls = 'rounded-lg border-2 px-3 py-2 text-sm font-medium cursor-pointer transition-all ';
                if (submitted) {
                  if (oi === q.answer) cls += 'border-green-500 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                  else if (answers[qi] === oi) cls += 'border-red-400 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                  else cls += 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400';
                } else {
                  if (answers[qi] === oi) cls += 'text-white';
                  else cls += 'border-gray-200 bg-gray-50 text-gray-700 hover:border-opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200';
                }

                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={cls}
                    style={answers[qi] === oi && !submitted ? { backgroundColor: sportColour, borderColor: sportColour } : {}}
                  >
                    <span className="font-bold mr-1">{String.fromCharCode(65 + oi)}.</span> {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.length}
            className="px-6 py-2.5 rounded-full font-bold text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: sportColour }}
          >
            Submit Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-full font-bold text-white bg-gray-500 hover:bg-gray-600 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

function SportDetail({ sport, onBack }) {
  const colour = sport.colour || '#3b82f6';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${colour}, ${colour}cc)` }}>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-white/80 hover:text-white text-sm font-semibold transition-colors"
        >
          ← Back to all sports
        </button>
        <div className="flex items-center gap-4">
          <span className="text-7xl drop-shadow-lg">{sport.emoji}</span>
          <div>
            <h2 className="text-3xl font-extrabold drop-shadow">{sport.label}</h2>
            <p className="text-white/90 text-lg mt-1">{sport.description}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {sport.origin && (
                <span className="bg-white/20 rounded-full px-3 py-1">📍 Origin: {sport.origin}</span>
              )}
              {sport.players_per_team && (
                <span className="bg-white/20 rounded-full px-3 py-1">👥 {sport.players_per_team} players per team</span>
              )}
              {sport.olympic_event && (
                <span className="bg-yellow-400/30 rounded-full px-3 py-1">🥇 Olympic Sport</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      {sport.fun_facts && sport.fun_facts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>💡</span> Fun Facts
          </h3>
          <div className="flex flex-wrap gap-3">
            {sport.fun_facts.map((fact, i) => (
              <div key={i} className="rounded-xl px-4 py-2 text-sm font-medium text-white shadow" style={{ backgroundColor: colour }}>
                {fact}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitions */}
      {sport.competitions && sport.competitions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>🏆</span> Major Competitions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sport.competitions.map((comp, i) => (
              <div
                key={i}
                className="rounded-xl border-2 p-4 bg-white dark:bg-gray-800 shadow-sm"
                style={{ borderColor: colour + '60' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{comp.name}</p>
                    {comp.frequency && <p className="text-xs font-semibold mt-0.5" style={{ color: colour }}>{comp.frequency}</p>}
                    {comp.location && <p className="text-xs text-gray-500 dark:text-gray-400">📍 {comp.location}</p>}
                    {comp.current_champion && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Current champion: <strong>{comp.current_champion}</strong></p>}
                    {comp.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{comp.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legends */}
      {sport.legends && sport.legends.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>⭐</span> Legends of the Sport
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sport.legends.map((legend, i) => (
              <div
                key={i}
                className="rounded-xl p-4 shadow-sm border-l-4"
                style={{ borderColor: colour, backgroundColor: colour + '10' }}
              >
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{legend.name}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: colour }}>🌍 {legend.country}</p>
                {legend.years_active && <p className="text-xs text-gray-500 dark:text-gray-400">⏱ {legend.years_active}</p>}
                {legend.fun_fact && <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">"{legend.fun_fact}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Records (Athletics) */}
      {sport.world_records && sport.world_records.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>⚡</span> World Records
          </h3>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: colour + '40' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-left" style={{ backgroundColor: colour }}>
                  <th className="px-4 py-2 font-bold">Event</th>
                  <th className="px-4 py-2 font-bold">Record</th>
                  <th className="px-4 py-2 font-bold">Athlete</th>
                  <th className="px-4 py-2 font-bold">Country</th>
                  <th className="px-4 py-2 font-bold">Year</th>
                </tr>
              </thead>
              <tbody>
                {sport.world_records.map((wr, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'dark:bg-gray-750'} style={i % 2 !== 0 ? { backgroundColor: colour + '08' } : {}}>
                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-100">{wr.event}</td>
                    <td className="px-4 py-2 font-bold" style={{ color: colour }}>{wr.record}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{wr.holder}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{wr.country}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{wr.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events list (Athletics) */}
      {sport.events && sport.events.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>📋</span> Events
          </h3>
          <div className="flex flex-wrap gap-2">
            {sport.events.map((ev, i) => (
              <span key={i} className="text-sm rounded-full px-3 py-1 font-medium border" style={{ borderColor: colour, color: colour }}>
                {ev}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strokes (Swimming) */}
      {sport.strokes && sport.strokes.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>🏊</span> Strokes
          </h3>
          <div className="flex flex-wrap gap-2">
            {sport.strokes.map((s, i) => (
              <span key={i} className="text-sm rounded-full px-3 py-1 font-medium text-white" style={{ backgroundColor: colour }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disciplines (Gymnastics) */}
      {sport.disciplines && sport.disciplines.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>🤸</span> Disciplines
          </h3>
          <div className="flex flex-wrap gap-2">
            {sport.disciplines.map((d, i) => (
              <span key={i} className="text-sm rounded-full px-3 py-1 font-medium text-white" style={{ backgroundColor: colour }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Olympic Medal Leaders (Olympics special) */}
      {sport.most_decorated_athletes && sport.most_decorated_athletes.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>🥇</span> Most Decorated Olympic Athletes
          </h3>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: colour + '40' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-left" style={{ backgroundColor: colour }}>
                  <th className="px-4 py-2 font-bold">Athlete</th>
                  <th className="px-4 py-2 font-bold">Country</th>
                  <th className="px-4 py-2 font-bold">Sport</th>
                  <th className="px-4 py-2 font-bold">Gold</th>
                  <th className="px-4 py-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {sport.most_decorated_athletes.map((a, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : ''} style={i % 2 !== 0 ? { backgroundColor: colour + '08' } : {}}>
                    <td className="px-4 py-2 font-bold text-gray-800 dark:text-gray-100">{a.name}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{a.country}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{a.sport}</td>
                    <td className="px-4 py-2 font-bold" style={{ color: colour }}>🥇 {a.gold}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{a.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz */}
      <QuizSection quiz={sport.quiz} sportColour={colour} />
    </div>
  );
}

export default function SportsCentre() {
  const [overview, setOverview] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [sportDetail, setSportDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [olympicOnly, setOlympicOnly] = useState(false);

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(data => { setOverview(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedSport) return;
    setDetailLoading(true);
    setSportDetail(null);
    fetch(`${API}/${selectedSport}`)
      .then(r => r.json())
      .then(data => { setSportDetail(data); setDetailLoading(false); })
      .catch(e => { setError(e.message); setDetailLoading(false); });
  }, [selectedSport]);

  if (loading) return <LoadingDots />;
  if (error) return (
    <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-red-300">
      <p className="font-bold">Could not load Sports Centre</p>
      <p className="text-sm mt-1">{error}</p>
    </div>
  );

  if (selectedSport) {
    return (
      <div>
        {detailLoading && <LoadingDots />}
        {sportDetail && (
          <SportDetail
            sport={sportDetail}
            onBack={() => { setSelectedSport(null); setSportDetail(null); }}
          />
        )}
      </div>
    );
  }

  const sports = (overview?.sports || []).filter(s => {
    const matchesSearch = !search || s.label.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchesOlympic = !olympicOnly || s.olympic_event;
    return matchesSearch && matchesOlympic;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)' }}>
        <div className="relative p-8 text-white">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">🏅</span>
                <span className="text-5xl">⚽</span>
                <span className="text-5xl">🏊</span>
                <span className="text-5xl">🎾</span>
                <span className="text-5xl">🏀</span>
              </div>
              <h1 className="text-4xl font-extrabold drop-shadow-lg">Sports Centre</h1>
              <p className="text-white/90 text-lg mt-1 max-w-xl">{overview?.description}</p>
            </div>
          </div>
          {/* Olympic rings decoration */}
          <div className="mt-4 flex gap-1 opacity-60 text-2xl">
            <span style={{ color: '#0081C8' }}>⭕</span>
            <span style={{ color: '#FCB131' }}>⭕</span>
            <span style={{ color: '#000000' }}>⭕</span>
            <span style={{ color: '#00A651' }}>⭕</span>
            <span style={{ color: '#EE334E' }}>⭕</span>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sports..."
            className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:text-white"
          />
        </div>
        <button
          onClick={() => setOlympicOnly(false)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${!olympicOnly ? 'bg-amber-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}
        >
          All Sports ({overview?.sports?.length || 0})
        </button>
        <button
          onClick={() => setOlympicOnly(true)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${olympicOnly ? 'bg-amber-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}
        >
          🥇 Olympic Sports ({overview?.sports?.filter(s => s.olympic_event)?.length || 0})
        </button>
      </div>

      {/* Sports Grid */}
      {sports.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold">No sports found for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className="group relative rounded-2xl p-5 text-left shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 bg-white dark:bg-gray-800"
              style={{ borderColor: sport.colour + '60' }}
            >
              {/* Coloured top strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: sport.colour }} />

              <div className="flex items-start gap-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">{sport.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 dark:text-gray-100 truncate" style={{ color: sport.colour }}>
                    {sport.label}
                  </p>
                  {sport.olympic_event && (
                    <span className="inline-block text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full px-2 py-0.5 font-semibold mt-0.5">
                      🥇 Olympic
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                {sport.description}
              </p>

              {sport.players_per_team && (
                <p className="text-xs mt-2 font-semibold" style={{ color: sport.colour }}>
                  👥 {sport.players_per_team === 1 ? 'Individual sport' : `${sport.players_per_team} per team`}
                </p>
              )}

              <div
                className="mt-3 text-xs font-bold text-center rounded-full py-1 text-white transition-opacity"
                style={{ backgroundColor: sport.colour }}
              >
                Explore →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
