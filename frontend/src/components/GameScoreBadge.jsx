import React from 'react';

// Small "Best: 8/10 · Played 3x" pill shown on game picker cards and inside
// each engine's own end screen. Renders nothing until a game has been played.
export default function GameScoreBadge({ stats, className = '' }) {
  if (!stats || stats.plays == null) return null;
  const bestText = stats.bestMaxScore != null ? `${stats.best}/${stats.bestMaxScore}` : `${stats.best}`;
  return (
    <p className={`text-xs text-amber-600 dark:text-amber-400 ${className}`}>
      🏅 Best: {bestText} · Played {stats.plays}×
    </p>
  );
}
