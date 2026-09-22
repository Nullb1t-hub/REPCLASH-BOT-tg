import type{CellState,TeamColor}from"./types";
export function canCapture(cells:Map<number,CellState>,index:number,color:TeamColor){
 const c=cells.get(index);
 return !c||c.owner!==color||c.strength<2;
}
export function applyCapture(cells:Map<number,CellState>,index:number,color:TeamColor){
 const n=new Map(cells),c=n.get(index);
 if(c?.owner===color)n.set(index,{owner:color,strength:2});
 else if(!c||c.owner===null)n.set(index,{owner:color,strength:1});
 else if(c.strength>1)n.set(index,{owner:c.owner,strength:1});
 else n.set(index,{owner:color,strength:1});
 return n;
}
export function territoryCount(cells:Map<number,CellState>,color:TeamColor){
 let n=0;for(const c of cells.values())if(c.owner===color)n++;return n;
}
export function cellKey(size:number,row:number,col:number){return row*size+col}
export function cellCoords(size:number,index:number){return{row:Math.floor(index/size),col:index%size}}
