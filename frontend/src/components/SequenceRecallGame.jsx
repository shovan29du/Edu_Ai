import React, { useEffect, useState } from 'react';
import { sample } from '../utils/gameUtils.js';
import DifficultyPicker from './DifficultyPicker.jsx';
import GameScoreBadge from './GameScoreBadge.jsx';

// Difficulty controls how long the starting sequence is and how fast tiles
// flash — a longer opening sequence and quicker flashes make Hard tougher.
const DIFFICULTY_CONFIG = {
  easy: { startLength: 1, flashMs: 700, gapMs: 350 },
  medium: { startLength: 2, flashMs: 550, gapMs: 250 },
  hard: { startLength: 4, flashMs: 400, gapMs: 150 },
};

export default function SequenceRecallGame({ title, blurb, tiles, onComplete, stats, initialDifficulty }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty || 'medium');
  const [started, setStarted] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | showing | input | gameover
  const [activeTile, setActiveTile] = useState(null);
  const [best, setBest] = useState(0);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (phase !== 'gameover' || reported) return;
    setReported(true);
    if (!onComplete) return;
    onComplete({ score: best, maxScore: null, label: `Longest pattern: ${best} (${difficulty})`, difficulty });
  }, [phase, reported, onComplete, best, difficulty]);

  function playSequence(seq, config) {
    setPhase('showing');
    setUserIndex(0);
    seq.forEach((tileId, i) => {
      const start = i * (config.flashMs + config.gapMs);
      setTimeout(() => setActiveTile(tileId), start);
      setTimeout(() => setActiveTile(null), start + config.flashMs);
    });
    setTimeout(() => setPhase('input'), seq.length * (config.flashMs + config.gapMs) + 150);
  }

  function start() {
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
    const first = Array.from({ length: config.startLength }, () => sample(tiles).id);
    setSequence(first);
    setStarted(true);
    setBest(0);
    setReported(false);
    playSequence(first, config);
  }

  function handleTileClick(tileId) {
    if (phase !== 'input') return;
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
    if (tileId === sequence[userIndex]) {
      const nextIndex = userIndex + 1;
      if (nextIndex === sequence.length) {
        setBest((b) => Math.max(b, sequence.length));
        const extended = [...sequence, sample(tiles).id];
        setSequence(extended);
        setTimeout(() => playSequence(extended, config), 500);
        setPhase('showing');
      } else {
        setUserIndex(nextIndex);
      }
    } else {
      setBest((b) => Math.max(b, sequence.length - 1));
      setPhase('gameover');
    }
  }

  function restart() {
    setStarted(false);
    setPhase('idle');
    setSequence([]);
    setUserIndex(0);
    setActiveTile(null);
  }

  function changeDifficulty(next) {
    setDifficulty(next);
    restart();
  }

  return (
    <section aria-label={`${title} pattern recall game`} className="space-y-3 rounded border p-4 dark:border-gray-700">
      <h3 className="font-semibold">{title}</h3>
      {blurb && <p className="text-sm text-gray-600 dark:text-gray-400">{blurb}</p>}
      <DifficultyPicker value={difficulty} onChange={changeDifficulty} disabled={started} />
      <GameScoreBadge stats={stats} />

      {!started && (
        <button type="button" onClick={start} className="rounded border px-3 py-1 text-sm">
          Start
        </button>
      )}

      {started && phase !== 'gameover' && (
        <div className="space-y-2">
          <p className="text-sm">
            {phase === 'showing' ? 'Watch the pattern…' : `Your turn — repeat the pattern (round ${sequence.length})`}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={phase !== 'input'}
                onClick={() => handleTileClick(tile.id)}
                className={`flex h-16 items-center justify-center rounded border text-lg font-semibold ${tile.className} ${
                  activeTile === tile.id ? 'ring-4 ring-offset-2 ring-black/60 dark:ring-white/60' : ''
                }`}
              >
                {tile.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="space-y-2">
          <p className="font-medium">Game over! Longest pattern remembered: {best}.</p>
          <button type="button" onClick={restart} className="rounded border px-3 py-1 text-sm">
            Play again
          </button>
        </div>
      )}
    </section>
  );
}
