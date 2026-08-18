"""Chess Tutor: an interactive chess board with AI coaching, plus a PGN game
review mode that steps through a finished game move by move.

Inspired by the chesster-main reference project, rebuilt on this app's
existing conventions: the `chess` library handles board state, move
legality, and PGN parsing (no external engine, Docker, or LangServe
needed), and the ai_tutor module's Claude calling machinery provides
natural-language coaching grounded in the current position.

Stateless by design, like ai_tutor.py's other endpoints: the frontend holds
the current FEN and move history and sends them with each request, so no
game storage is needed here.
"""
from __future__ import annotations

import io

import chess
import chess.pgn

MAX_PGN_CHARS = 20000


def _state(board: chess.Board, last_move_san: str | None = None, last_move_uci: str | None = None) -> dict:
    status = "in_progress"
    winner = None
    if board.is_checkmate():
        status = "checkmate"
        winner = "black" if board.turn == chess.WHITE else "white"
    elif board.is_stalemate():
        status = "stalemate"
    elif board.is_insufficient_material() or board.is_seventyfive_moves() or board.is_fivefold_repetition():
        status = "draw"
    elif board.is_check():
        status = "check"

    return {
        "fen": board.fen(),
        "turn": "white" if board.turn == chess.WHITE else "black",
        "legal_moves": [m.uci() for m in board.legal_moves],
        "last_move_uci": last_move_uci,
        "last_move_san": last_move_san,
        "status": status,
        "winner": winner,
    }


def new_game() -> dict:
    return _state(chess.Board())


def board_state(fen: str) -> dict:
    try:
        board = chess.Board(fen)
    except ValueError as exc:
        raise ValueError("Invalid FEN") from exc
    return _state(board)


def apply_move(fen: str, move_uci: str) -> dict:
    try:
        board = chess.Board(fen)
    except ValueError as exc:
        raise ValueError("Invalid FEN") from exc
    try:
        move = chess.Move.from_uci(move_uci)
    except ValueError as exc:
        raise ValueError("Invalid move format") from exc
    if move not in board.legal_moves:
        raise ValueError("Illegal move")
    san = board.san(move)
    board.push(move)
    return _state(board, last_move_san=san, last_move_uci=move_uci)


def parse_pgn(pgn_text: str) -> list[dict]:
    game = chess.pgn.read_game(io.StringIO(pgn_text[:MAX_PGN_CHARS]))
    if game is None:
        raise ValueError("Could not parse PGN")
    positions = []
    board = game.board()
    ply = 0
    for move in game.mainline_moves():
        san = board.san(move)
        board.push(move)
        ply += 1
        positions.append({
            "ply": ply,
            "move_number": (ply + 1) // 2,
            "color": "white" if ply % 2 == 1 else "black",
            "san": san,
            "fen": board.fen(),
        })
    if not positions:
        raise ValueError("PGN contains no moves")
    return positions
