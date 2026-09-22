export type TeamColor = "red" | "blue" | "green" | "pink" | "orange";
export type BoardSize = 10 | 100 | 1000;
export type PlayerId = "player" | "opponent";
export type CellState = { owner: TeamColor | null; strength: 0 | 1 | 2 | 3 };

export const TEAM_COLORS: Record<TeamColor, string> = {
  red: "#ff3b30",
  blue: "#3b82f6",
  green: "#22c55e",
  pink: "#ec4899",
  orange: "#f97316"
};

export const BOARD_SIZES: BoardSize[] = [10, 100, 1000];
