export type RoomMessage =
  | { type:"create"; name:string; color:string; size:number }
  | { type:"join"; code:string; name:string; color:string }
  | { type:"game"; payload:unknown };

export function getSocketUrl() {
  const configured=import.meta.env.VITE_WS_URL as string|undefined;
  if(configured) return configured;
  return location.protocol==="https:" ? `wss://${location.host}` : `ws://${location.host}`;
}
