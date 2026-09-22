import type{CellState,TeamColor}from"./types";
export function applyCapture(cells:Map<number,CellState>,index:number,color:TeamColor){
 const n=new Map(cells),c=n.get(index);
 if(c?.owner===color)n.set(index,{owner:color,strength:Math.min(3,c.strength+1)as 1|2|3});
 else if(!c||c.owner===null)n.set(index,{owner:color,strength:1});
 else if(c.strength>1)n.set(index,{owner:c.owner,strength:(c.strength-1)as 1|2});
 else n.set(index,{owner:color,strength:1});
 return n;
}
export function territoryCount(cells:Map<number,CellState>,color:TeamColor){
 let n=0;for(const c of cells.values())if(c.owner===color)n++;return n;
}
export function cellKey(size:number,row:number,col:number){return row*size+col}
