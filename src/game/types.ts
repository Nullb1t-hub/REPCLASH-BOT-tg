export type TeamColor="red"|"blue"|"green"|"pink"|"orange";
export type BoardSize=100|1000|10000|100000;
export type Exercise="pushup"|"squat";
export type CellOwner=TeamColor|null;
export type CellState={owner:CellOwner;strength:0|1|2|3};
export type Player={name:string;reps:number;territory:number};
export const TEAM_COLORS:Record<TeamColor,string>={red:"#ff3b30",blue:"#3b82f6",green:"#22c55e",pink:"#ec4899",orange:"#ff7a00"};
export const BOARD_SIZES:BoardSize[]=[100,1000,10000,100000];
