export type CellOwner = "player" | "opponent" | null;

export type GameCell = {
  id: number;
  owner: CellOwner;
};

export type Player = {
  name: string;
  reps: number;
  territory: number;
};