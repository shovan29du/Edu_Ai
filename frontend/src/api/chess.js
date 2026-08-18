async function responseError(res, fallback) {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;
  return `${fallback} (HTTP ${res.status || 'error'})`;
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Chess request failed'));
  return res.json();
}

export const newChessGame = () => post('/api/chess/new-game');
export const getChessState = (fen) => post('/api/chess/state', { fen });
export const makeChessMove = (fen, move) => post('/api/chess/move', { fen, move });
export const explainChessPosition = (fen, moves, levelArgs) =>
  post('/api/chess/explain', { fen, moves, ...levelArgs });
export const askChessQuestion = (fen, moves, question, levelArgs) =>
  post('/api/chess/ask', { fen, moves, question, ...levelArgs });
export const reviewChessPgn = (pgn) => post('/api/chess/review-pgn', { pgn });
