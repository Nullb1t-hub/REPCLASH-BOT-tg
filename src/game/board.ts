import type { GameCell } from "./types";

export const BOARD_SIZE = 10;

export function createBoard(): GameCell[] {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, id) => ({
    id,
    owner: null
  }));
}

export function captureCells(board: GameCell[], owner: "player" | "opponent", amount: number): GameCell[] {
  const next = board.map((cell) => ({ ...cell }));
  let left = Math.max(0, amount);

  for (let i = 0; i < next.length && left > 0; i += 1) {
    if (next[i].owner !== owner) {
      next[i].owner = owner;
      left -= 1;
    }
  }

  return next;
}