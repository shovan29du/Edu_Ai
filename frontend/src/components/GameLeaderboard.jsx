import React, { useEffect, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress } from '../api/progress.js';
import { GAME_KEY_PREFIX } from '../hooks/useGameCentreProgress.js';

const MEDALS = ['🥇', '🥈', '🥉'];

// Cross-sibling leaderboard for a single game, built from the existing
// multi-profile /api/users list plus each profile's saved game score
// (from useGameCentreProgress, stored under progress.mastery["game:<id>"]).
export default function GameLeaderboard({ gameId, gameTitle, onClose }) {
  const { child } = useChild();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/users')
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then(async (data) => {
        const users = data?.users || [];
        const results = await Promise.all(
          users.map(async (u) => {
            try {
              const progress = await fetchProgress(u.name);
              return { name: u.name, stats: progress?.mastery?.[GAME_KEY_PREFIX + gameId] || null };
            } catch {
              return { name: u.name, stats: null };
            }
          })
        );
        if (!cancelled) setRows(results);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const played = (rows || [])
    .filter((r) => r.stats)
    .sort((a, b) => b.stats.best - a.stats.best);
  const notPlayed = (rows || []).filter((r) => !r.stats);

  return (
    <div
      role="dialog"
      aria-label={`${gameTitle} leaderboard`}
      className="space-y-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-gray-800"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-amber-800 dark:text-amber-200">🏆 Leaderboard — {gameTitle}</h4>
        <button type="button" onClick={onClose} className="text-sm text-blue-600 hover:underline">
          Close
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading scores…</p>}

      {!loading && played.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No one has played this game yet — be the first!</p>
      )}

      {!loading && played.length > 0 && (
        <ol className="space-y-1">
          {played.map((r, i) => (
            <li
              key={r.name}
              className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                r.name === child ? 'bg-amber-200 font-semibold dark:bg-amber-900' : ''
              }`}
            >
              <span>
                {MEDALS[i] || `#${i + 1}`} {r.name}
              </span>
              <span>{r.stats.bestMaxScore != null ? `${r.stats.best}/${r.stats.bestMaxScore}` : r.stats.bestLabel || r.stats.best}</span>
            </li>
          ))}
        </ol>
      )}

      {!loading && notPlayed.length > 0 && (
        <p className="text-xs text-gray-400">Not played yet: {notPlayed.map((r) => r.name).join(', ')}</p>
      )}
    </div>
  );
}
