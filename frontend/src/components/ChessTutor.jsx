import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import LevelSelector from './LevelSelector.jsx';
import ReadAloudButton from './ReadAloudButton.jsx';
import {
  askChessQuestion,
  explainChessPosition,
  getChessState,
  makeChessMove,
  newChessGame,
  reviewChessPgn,
} from '../api/chess.js';

const PIECE_GLYPHS = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function fenToBoard(fen) {
  const placement = (fen || '').split(' ')[0] || '';
  const board = {};
  placement.split('/').forEach((rankStr, rIdx) => {
    const rank = 8 - rIdx;
    let file = 0;
    for (const ch of rankStr) {
      if (/\d/.test(ch)) {
        file += Number(ch);
      } else {
        board[`${FILES[file]}${rank}`] = ch;
        file += 1;
      }
    }
  });
  return board;
}

const STATUS_LABELS = {
  in_progress: '',
  check: 'Check!',
  checkmate: 'Checkmate!',
  stalemate: 'Stalemate — draw.',
  draw: 'Draw.',
};

export default function ChessTutor({ level: initialLevel = '1' }) {
  const [mode, setMode] = useState('play');
  const [level, setLevel] = useState(initialLevel);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 p-4 text-white">
        <h2 className="text-xl font-bold">♟️ Chess Tutor</h2>
        <p className="text-sm opacity-90">Play a game or review a finished one, with an AI coach explaining ideas along the way.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode('play')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            mode === 'play' ? 'bg-slate-800 text-white' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          ♜ Play
        </button>
        <button
          onClick={() => setMode('review')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            mode === 'review' ? 'bg-slate-800 text-white' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          📜 Game Review
        </button>
        <div className="ml-auto">
          <LevelSelector level={level} onChange={setLevel} />
        </div>
      </div>

      {mode === 'play' ? <PlayMode level={level} /> : <ReviewMode level={level} />}
    </div>
  );
}

function Board({ fen, legalMoves = [], onMove, selectable = true }) {
  const board = fenToBoard(fen);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [fen]);

  function handleSquareClick(square) {
    if (!selectable) return;
    if (!selected) {
      const hasMoveFromHere = legalMoves.some((m) => m.startsWith(square));
      if (hasMoveFromHere) setSelected(square);
      return;
    }
    if (selected === square) {
      setSelected(null);
      return;
    }
    const candidates = legalMoves.filter((m) => m.startsWith(selected) && m.slice(2, 4) === square);
    if (candidates.length > 0) {
      const move = candidates.find((m) => m.endsWith('q')) || candidates[0];
      onMove(move);
      setSelected(null);
      return;
    }
    const hasMoveFromHere = legalMoves.some((m) => m.startsWith(square));
    setSelected(hasMoveFromHere ? square : null);
  }

  const destinationSquares = selected
    ? new Set(legalMoves.filter((m) => m.startsWith(selected)).map((m) => m.slice(2, 4)))
    : new Set();

  return (
    <div className="inline-block border-4 border-slate-800">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((rIdx) => {
        const rank = 8 - rIdx;
        return (
          <div key={rank} className="flex">
            {FILES.map((file, fIdx) => {
              const square = `${file}${rank}`;
              const piece = board[square];
              const isLight = (fIdx + rank) % 2 === 0;
              const isSelected = selected === square;
              const isDestination = destinationSquares.has(square);
              return (
                <button
                  type="button"
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  aria-label={`Square ${square}${piece ? `, ${piece}` : ''}`}
                  className={`flex h-10 w-10 items-center justify-center text-2xl sm:h-12 sm:w-12 ${
                    isLight ? 'bg-amber-100' : 'bg-amber-700'
                  } ${isSelected ? 'ring-4 ring-inset ring-blue-500' : ''} ${
                    isDestination ? 'ring-4 ring-inset ring-green-500' : ''
                  }`}
                >
                  {piece ? PIECE_GLYPHS[piece] : ''}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CoachPanel({ fen, movesSan, level }) {
  const [explanation, setExplanation] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExplain() {
    setLoading(true);
    setError('');
    try {
      const data = await explainChessPosition(fen, movesSan, { level });
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await askChessQuestion(fen, movesSan, question, { level });
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border p-4 dark:border-gray-700">
      <h3 className="font-semibold">🧑‍🏫 AI Coach</h3>
      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Thinking…' : 'Explain this position'}
      </button>
      {explanation && (
        <div className="space-y-1">
          <ReadAloudButton text={explanation} />
          <p className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm dark:bg-gray-800">{explanation}</p>
        </div>
      )}
      <form onSubmit={handleAsk} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this position…"
          className="min-w-0 flex-1 rounded border px-2 py-1 dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
      {answer && (
        <div className="space-y-1">
          <ReadAloudButton text={answer} />
          <p className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm dark:bg-gray-800">{answer}</p>
        </div>
      )}
    </div>
  );
}

function PlayMode({ level }) {
  const [game, setGame] = useState(null);
  const [movesSan, setMovesSan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function startNewGame() {
    setLoading(true);
    setError('');
    newChessGame()
      .then((data) => {
        setGame(data);
        setMovesSan([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMove(uci) {
    setError('');
    try {
      const data = await makeChessMove(game.fen, uci);
      setGame(data);
      setMovesSan((history) => [...history, data.last_move_san]);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading || !game) return <LoadingSpinner />;

  const gameOver = ['checkmate', 'stalemate', 'draw'].includes(game.status);

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <div className="space-y-3">
        <Board fen={game.fen} legalMoves={game.legal_moves} onMove={handleMove} selectable={!gameOver} />
        <p className="text-sm font-medium">
          {gameOver ? STATUS_LABELS[game.status] : `${game.turn === 'white' ? 'White' : 'Black'} to move${game.status === 'check' ? ' — check!' : ''}`}
        </p>
        <button
          type="button"
          onClick={startNewGame}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          New game
        </button>
        {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {movesSan.length > 0 && (
          <div className="rounded-xl border p-3 text-sm dark:border-gray-700">
            <h4 className="mb-1 font-semibold">Moves</h4>
            <p className="text-gray-600 dark:text-gray-300">{movesSan.join(' ')}</p>
          </div>
        )}
      </div>
      <CoachPanel fen={game.fen} movesSan={movesSan} level={level} />
    </div>
  );
}

function ReviewMode({ level }) {
  const [pgn, setPgn] = useState('');
  const [positions, setPositions] = useState(null);
  const [ply, setPly] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLoad(event) {
    event.preventDefault();
    if (!pgn.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await reviewChessPgn(pgn);
      setPositions(data.positions);
      setPly(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const currentFen = positions ? (ply === 0 ? startFen : positions[ply - 1].fen) : startFen;
  const movesSan = positions ? positions.slice(0, ply).map((p) => p.san) : [];

  return (
    <div className="space-y-4">
      <form onSubmit={handleLoad} className="space-y-2 rounded-xl border p-4 dark:border-gray-700">
        <label className="text-sm font-medium">Paste a PGN game</label>
        <textarea
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          rows={4}
          placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 ..."
          className="w-full rounded border p-2 text-sm dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={loading || !pgn.trim()}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load game'}
        </button>
      </form>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {positions && (
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <div className="space-y-3">
            <Board fen={currentFen} legalMoves={[]} onMove={() => {}} selectable={false} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPly((p) => Math.max(0, p - 1))}
                disabled={ply === 0}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                ← Prev
              </button>
              <span className="text-sm">
                {ply === 0 ? 'Start' : `Move ${ply}: ${positions[ply - 1].san}`}
              </span>
              <button
                type="button"
                onClick={() => setPly((p) => Math.min(positions.length, p + 1))}
                disabled={ply === positions.length}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
          <CoachPanel fen={currentFen} movesSan={movesSan} level={level} />
        </div>
      )}
    </div>
  );
}
