// Shared score/streak persistence for the Game Centre.
//
// All 54+ games vary wildly in how they score a round (X/Y correct, timed
// counts, move-efficiency, longest streak, solved/not-solved…), so instead
// of duplicating "fetch progress, merge, POST" in every engine, each engine
// just calls a single `onComplete(result)` callback with a small, normalized
// shape: { score, maxScore, label, difficulty }.
//   - score:     a number where HIGHER IS ALWAYS BETTER (accuracy count,
//                efficiency %, longest streak, found count, etc.)
//   - maxScore:  optional denominator, used to render "8/10"-style badges
//   - label:     a human-readable description of that attempt
//   - difficulty: optional 'easy' | 'medium' | 'hard'
//
// Everything is stored under the existing generic `/api/progress/{child}`
// endpoint, inside the (currently-unused-by-anything-else) `mastery` bucket,
// namespaced per game as `game:<gameId>` so it merges safely alongside
// lesson/exam progress without colliding with other features.
import { useCallback, useEffect, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress, postProgress } from '../api/progress.js';

export const GAME_KEY_PREFIX = 'game:';
export const DAILY_CHALLENGE_KEY = 'daily-challenge';

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, delta) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return todayKey(d);
}

// Streak counts consecutive completed days, ending today (or ending
// yesterday if today isn't done yet — so the streak doesn't look "broken"
// mid-day before the child has had a chance to play).
export function computeDailyStreak(dates = []) {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const today = todayKey();
  let anchor = set.has(today) ? today : set.has(addDays(today, -1)) ? addDays(today, -1) : null;
  if (!anchor) return 0;
  let streak = 0;
  let cursor = anchor;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function useGameCentreProgress() {
  const { child } = useChild();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return fetchProgress(child)
      .then((data) => setProgress(data))
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [child]);

  useEffect(() => {
    load();
  }, [load]);

  const gameStats = {};
  if (progress?.mastery) {
    for (const [key, value] of Object.entries(progress.mastery)) {
      if (key.startsWith(GAME_KEY_PREFIX)) gameStats[key.slice(GAME_KEY_PREFIX.length)] = value;
    }
  }
  const dailyEntry = progress?.mastery?.[DAILY_CHALLENGE_KEY] || null;
  const dailyStreak = computeDailyStreak(dailyEntry?.dates);
  const dailyCompletedToday = !!dailyEntry?.dates?.includes(todayKey());

  const reportGameResult = useCallback(
    async (gameId, result) => {
      const key = GAME_KEY_PREFIX + gameId;
      const prev = progress?.mastery?.[key] || null;
      const isNewBest = !prev || result.score > prev.best;
      const nextEntry = {
        best: isNewBest ? result.score : prev.best,
        bestMaxScore: isNewBest ? result.maxScore ?? null : prev.bestMaxScore ?? null,
        bestLabel: isNewBest ? result.label ?? null : prev.bestLabel ?? null,
        plays: (prev?.plays || 0) + 1,
        lastScore: result.score,
        lastMaxScore: result.maxScore ?? null,
        lastLabel: result.label ?? null,
        difficulty: result.difficulty ?? prev?.difficulty ?? null,
        updatedAt: new Date().toISOString(),
      };
      setProgress((p) => ({ ...(p || {}), mastery: { ...(p?.mastery || {}), [key]: nextEntry } }));
      try {
        await postProgress(child, { mastery: { [key]: nextEntry } });
      } catch {
        // Best-effort — local state already reflects the result so the UI stays snappy offline.
      }
      return nextEntry;
    },
    [child, progress]
  );

  const recordDailyCompletion = useCallback(async () => {
    const today = todayKey();
    const prevDates = progress?.mastery?.[DAILY_CHALLENGE_KEY]?.dates || [];
    if (prevDates.includes(today)) return progress?.mastery?.[DAILY_CHALLENGE_KEY] || null;
    const dates = [...prevDates, today].slice(-365);
    const nextEntry = { dates, streak: computeDailyStreak(dates), lastCompletedDate: today };
    setProgress((p) => ({
      ...(p || {}),
      mastery: { ...(p?.mastery || {}), [DAILY_CHALLENGE_KEY]: nextEntry },
    }));
    try {
      await postProgress(child, { mastery: { [DAILY_CHALLENGE_KEY]: nextEntry } });
    } catch {
      // Best-effort.
    }
    return nextEntry;
  }, [child, progress]);

  return {
    loading,
    gameStats,
    dailyStreak,
    dailyCompletedToday,
    reportGameResult,
    recordDailyCompletion,
  };
}
