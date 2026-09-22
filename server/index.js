import http from "node:http";
import { WebSocketServer } from "ws";

const port=Number(process.env.PORT||8787);
const rooms=new Map();
const send=(ws,msg)=>{if(ws.readyState===1)ws.send(JSON.stringify(msg));};
const broadcast=(room,msg,except)=>{for(const p of room.players)if(p.ws!==except)send(p.ws,msg);};

const server=http.createServer((req,res)=>{
  res.writeHead(200,{"content-type":"application/json","access-control-allow-origin":"*"});
  res.end(JSON.stringify({ok:true,service:"REPCLASH realtime",rooms:rooms.size}));
});
const wss=new WebSocketServer({server});

wss.on("connection",ws=>{
  let room=null, player=null;
  ws.on("message",raw=>{
    let msg;try{msg=JSON.parse(raw.toString())}catch{return}
    if(msg.type==="create"){
      const code=String(msg.code||Math.random().toString(36).slice(2,8)).toUpperCase();
      room={code,size:Number(msg.size)||10,players:[]};rooms.set(code,room);
      player={ws,name:String(msg.name||"PLAYER"),color:String(msg.color||"red")};room.players.push(player);
      send(ws,{type:"room-created",code,size:room.size});
      return;
    }
    if(msg.type==="join"){
      const code=String(msg.code||"").toUpperCase(), found=rooms.get(code);
      if(!found){send(ws,{type:"error",message:"ROOM_NOT_FOUND"});return}
      if(found.players.length>=2){send(ws,{type:"error",message:"ROOM_FULL"});return}
      room=found;player={ws,name:String(msg.name||"PLAYER"),color:String(msg.color||"blue")};room.players.push(player);
      send(ws,{type:"joined",code:room.code,size:room.size});
      broadcast(room,{type:"opponent-joined",name:player.name},ws);
      return;
    }
    if(!room)return;
    if(msg.type==="game"){broadcast(room,{type:"game",payload:msg.payload},ws)}
  });
  ws.on("close",()=>{if(!room)return;room.players=room.players.filter(p=>p.ws!==ws);broadcast(room,{type:"opponent-left"});if(!room.players.length)rooms.delete(room.code)});
});
server.listen(port,()=>console.log(`REPCLASH server listening on ${port}`));
