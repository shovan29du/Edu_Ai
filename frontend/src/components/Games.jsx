import React, { useState } from 'react';
import PhonicsMatchGame from './PhonicsMatchGame.jsx';
import QuizSprintGame from './QuizSprintGame.jsx';
import MemoryMatchGame from './MemoryMatchGame.jsx';
import SequenceRecallGame from './SequenceRecallGame.jsx';
import MathSprintGame from './MathSprintGame.jsx';
import WordScrambleGame from './WordScrambleGame.jsx';
import MCRoundsGame from './MCRoundsGame.jsx';
import SudokuLiteGame from './SudokuLiteGame.jsx';
import ReactionGame from './ReactionGame.jsx';
import GameScoreBadge from './GameScoreBadge.jsx';
import GameLeaderboard from './GameLeaderboard.jsx';
import { CATEGORIES, GAMES, gamesByCategory, TOTAL_GAMES, dailyChallenge } from '../data/gameCentreData.js';
import { useGameCentreProgress } from '../hooks/useGameCentreProgress.js';

const EXTERNAL_COMPONENTS = {
  PhonicsMatchGame,
  QuizSprintGame,
};

// Engines that accept a difficulty tier (see each engine's own DIFFICULTY_CONFIG).
const DIFFICULTY_ENGINES = new Set(['memory', 'sequence', 'mathsprint', 'sudoku', 'reaction']);

function renderGame(game, grade, { onComplete, stats, initialDifficulty }) {
  switch (game.engine) {
    case 'memory':
      return (
        <MemoryMatchGame
          title={game.data.title}
          blurb={game.data.blurb}
          pairs={game.data.pairs}
          onComplete={onComplete}
          stats={stats}
          initialDifficulty={initialDifficulty}
        />
      );
    case 'sequence':
      return (
        <SequenceRecallGame
          title={game.data.title}
          blurb={game.data.blurb}
          tiles={game.data.tiles}
          onComplete={onComplete}
          stats={stats}
          initialDifficulty={initialDifficulty}
        />
      );
    case 'mathsprint':
      return (
        <MathSprintGame
          title={game.data.title}
          blurb={game.data.blurb}
          generate={game.data.generate}
          onComplete={onComplete}
          stats={stats}
          initialDifficulty={initialDifficulty}
        />
      );
    case 'scramble':
      return (
        <WordScrambleGame
          title={game.data.title}
          blurb={game.data.blurb}
          words={game.data.words}
          onComplete={onComplete}
          stats={stats}
        />
      );
    case 'mc':
      return (
        <MCRoundsGame
          title={game.data.title}
          blurb={game.data.blurb}
          rounds={game.data.rounds}
          onComplete={onComplete}
          stats={stats}
        />
      );
    case 'sudoku':
      return (
        <SudokuLiteGame
          title={game.data.title}
          blurb={game.data.blurb}
          size={game.data.size}
          puzzle={game.data.puzzle}
          solution={game.data.solution}
          onComplete={onComplete}
          stats={stats}
          initialDifficulty={initialDifficulty}
        />
      );
    case 'reaction':
      return (
        <ReactionGame
          title={game.data.title}
          blurb={game.data.blurb}
          target={game.data.target}
          distractorPool={game.data.distractorPool}
          gridSize={game.data.gridSize}
          onComplete={onComplete}
          stats={stats}
          initialDifficulty={initialDifficulty}
        />
      );
    case 'external': {
      const Component = EXTERNAL_COMPONENTS[game.data.component];
      if (!Component) return null;
      return game.data.component === 'QuizSprintGame' ? (
        <Component grade={grade} onComplete={onComplete} stats={stats} />
      ) : (
        <Component onComplete={onComplete} stats={stats} />
      );
    }
    default:
      return null;
  }
}

// Unique colour palette for each category
const CATEGORY_COLORS = {
  memory:    { from: 'from-purple-50', to: 'to-violet-100', border: 'border-purple-200', dark: 'dark:border-purple-900' },
  sequence:  { from: 'from-blue-50',   to: 'to-sky-100',    border: 'border-blue-200',   dark: 'dark:border-blue-900' },
  mathsprint:{ from: 'from-green-50',  to: 'to-emerald-100',border: 'border-green-200',  dark: 'dark:border-green-900' },
  scramble:  { from: 'from-amber-50',  to: 'to-yellow-100', border: 'border-amber-200',  dark: 'dark:border-amber-900' },
  logicgrid: { from: 'from-indigo-50', to: 'to-blue-100',   border: 'border-indigo-200', dark: 'dark:border-indigo-900' },
  oddoneout: { from: 'from-rose-50',   to: 'to-pink-100',   border: 'border-rose-200',   dark: 'dark:border-rose-900' },
  numseq:    { from: 'from-cyan-50',   to: 'to-teal-100',   border: 'border-cyan-200',   dark: 'dark:border-cyan-900' },
  sudoku:    { from: 'from-teal-50',   to: 'to-cyan-100',   border: 'border-teal-200',   dark: 'dark:border-teal-900' },
  vocab:     { from: 'from-orange-50', to: 'to-amber-100',  border: 'border-orange-200', dark: 'dark:border-orange-900' },
  spatial:   { from: 'from-violet-50', to: 'to-purple-100', border: 'border-violet-200', dark: 'dark:border-violet-900' },
  reaction:  { from: 'from-red-50',    to: 'to-rose-100',   border: 'border-red-200',    dark: 'dark:border-red-900' },
  classic:   { from: 'from-pink-50',   to: 'to-fuchsia-100',border: 'border-pink-200',   dark: 'dark:border-pink-900' },
};
function catColors(id) {
  return CATEGORY_COLORS[id] || { from: 'from-blue-50', to: 'to-sky-50', border: 'border-blue-200', dark: 'dark:border-blue-900' };
}

export default function Games({ grade }) {
  const [categoryId, setCategoryId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { gameStats, reportGameResult, dailyStreak, dailyCompletedToday, recordDailyCompletion } =
    useGameCentreProgress();

  const category = CATEGORIES.find((c) => c.id === categoryId) || null;
  const game = GAMES.find((g) => g.id === gameId) || null;
  const daily = dailyChallenge();
  const dailyCategory = CATEGORIES.find((c) => c.id === daily.game.categoryId) || null;
  const dailySupportsDifficulty = DIFFICULTY_ENGINES.has(daily.game.engine);

  async function handleGameComplete(playedGame, result) {
    await reportGameResult(playedGame.id, result);
    if (playedGame.id === daily.game.id) {
      await recordDailyCompletion();
    }
  }

  function playDailyChallenge() {
    setCategoryId(daily.game.categoryId);
    setGameId(daily.game.id);
    setShowLeaderboard(false);
  }

  function goBackToCentre() {
    setCategoryId(null);
    setGameId(null);
    setShowLeaderboard(false);
  }

  function goBackToCategory() {
    setGameId(null);
    setShowLeaderboard(false);
  }

  // ── Single game view ──────────────────────────────────────────────────
  if (game) {
    const isDailyGame = game.id === daily.game.id;
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={goBackToCategory} className="text-sm text-blue-600 hover:underline">
            ← Back to {category ? category.label : 'Game Centre'}
          </button>
          <button
            type="button"
            onClick={() => setShowLeaderboard((v) => !v)}
            className="text-sm text-amber-600 hover:underline"
          >
            🏆 Leaderboard
          </button>
        </div>
        {isDailyGame && (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            ⭐ Today's Daily Challenge{dailySupportsDifficulty ? ` — ${daily.difficulty} difficulty` : ''}
          </p>
        )}
        {showLeaderboard && (
          <GameLeaderboard gameId={game.id} gameTitle={game.title} onClose={() => setShowLeaderboard(false)} />
        )}
        {renderGame(game, grade, {
          onComplete: (result) => handleGameComplete(game, result),
          stats: gameStats[game.id],
          initialDifficulty: isDailyGame ? daily.difficulty : undefined,
        })}
      </div>
    );
  }

  // ── Category view: list of games within a category ──────────────────
  if (category) {
    const games = gamesByCategory(category.id);
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button type="button" onClick={goBackToCentre} className="text-sm text-blue-600 hover:underline">
          ← All Categories
        </button>
        <h2 className="text-2xl font-bold">
          {category.emoji} {category.label}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{category.desc}</p>
        <p className="text-xs text-gray-400">
          {games.length} game{games.length !== 1 ? 's' : ''} in this category
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {games.map((g) => {
            const cc = catColors(category.id);
            return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGameId(g.id)}
              className={`text-left rounded-xl border-2 ${cc.border} ${cc.dark} bg-gradient-to-br ${cc.from} ${cc.to} dark:from-gray-800 dark:to-gray-900 p-4 hover:shadow-lg transition-shadow`}
            >
              <p className="text-2xl mb-1">{g.emoji}</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{g.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{g.blurb}</p>
              <GameScoreBadge stats={gameStats[g.id]} className="mt-1" />
            </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Top-level picker: all categories ─────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">🎮 Game Centre</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Brain-development games and puzzles — {TOTAL_GAMES} games across {CATEGORIES.length} categories.
      </p>

      <section
        aria-label="Daily Challenge"
        className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 p-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-amber-800 dark:text-amber-200">⭐ Daily Challenge</h2>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">🔥 {dailyStreak}-day streak</span>
        </div>
        <p className="text-sm">
          {dailyCategory?.emoji} <span className="font-medium">{daily.game.title}</span>
          {dailySupportsDifficulty ? ` (${daily.difficulty} difficulty)` : ''}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{daily.game.blurb}</p>
        {dailyCompletedToday ? (
          <p className="text-sm text-green-600 dark:text-green-400">✅ Completed today — come back tomorrow for a new one!</p>
        ) : (
          <button
            type="button"
            onClick={playDailyChallenge}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Play Daily Challenge
          </button>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const count = gamesByCategory(cat.id).length;
          const cc = catColors(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`text-left rounded-xl border-2 ${cc.border} ${cc.dark} bg-gradient-to-br ${cc.from} ${cc.to} dark:from-gray-800 dark:to-gray-900 p-5 hover:shadow-lg transition-shadow`}
            >
              <p className="text-3xl mb-2">{cat.emoji}</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{cat.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.desc}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {count} game{count !== 1 ? 's' : ''}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
