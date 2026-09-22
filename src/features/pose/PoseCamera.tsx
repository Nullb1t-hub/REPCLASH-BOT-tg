import{useEffect,useRef,useState}from"react";
import{FilesetResolver,PoseLandmarker}from"@mediapipe/tasks-vision";
import type{Exercise}from"../../game/types";
type RepEvent={ok:boolean;reason?:string};
type Props={enabled:boolean;exercise:Exercise;onRep:(event:RepEvent)=>void};
const MODEL="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
function angle(a:{x:number;y:number},b:{x:number;y:number},c:{x:number;y:number}){const abx=a.x-b.x,aby=a.y-b.y,cbx=c.x-b.x,cby=c.y-b.y,dot=abx*cbx+aby*cby,mag=Math.hypot(abx,aby)*Math.hypot(cbx,cby);return mag?Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI:180}
export function PoseCamera({enabled,exercise,onRep}:Props){
 const videoRef=useRef<HTMLVideoElement>(null),streamRef=useRef<MediaStream|null>(null),landmarkerRef=useRef<PoseLandmarker|null>(null),animationRef=useRef<number|undefined>(undefined),onRepRef=useRef(onRep),exerciseRef=useRef(exercise),phaseRef=useRef<"up"|"down">("up"),lastRepRef=useRef(0);
 const[status,setStatus]=useState("КАМЕРА ГОТОВА"),[error,setError]=useState<string|null>(null),[rep,setRep]=useState(0),[hint,setHint]=useState("Встань так, чтобы всё тело было в кадре");
 useEffect(()=>{onRepRef.current=onRep},[onRep]);
 useEffect(()=>{exerciseRef.current=exercise;phaseRef.current="up"},[exercise]);
 useEffect(()=>{
  if(!enabled){if(animationRef.current)cancelAnimationFrame(animationRef.current);streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;return}
  let cancelled=false;
  (async()=>{try{
   setError(null);setStatus("ЗАПУСК КАМЕРЫ");if(!navigator.mediaDevices?.getUserMedia)throw new Error("NO_CAMERA");
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:720}},audio:false});
   if(cancelled){stream.getTracks().forEach(t=>t.stop());return}
   streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}
   setStatus("ЗАГРУЗКА AI");const vision=await FilesetResolver.forVisionTasks(WASM);
   const lm=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MODEL,delegate:"GPU"},runningMode:"VIDEO",numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55});
   if(cancelled){lm.close();return}landmarkerRef.current=lm;setStatus("AI ГОТОВ");
   const loop=()=>{if(cancelled||!videoRef.current||!landmarkerRef.current)return;const result=landmarkerRef.current.detectForVideo(videoRef.current,performance.now()),p=result.landmarks?.[0];
    if(p){const ls=p[11],le=p[13],lw=p[15],rs=p[12],re=p[14],rw=p[16],lh=p[23],rh=p[24],lk=p[25],rk=p[26],la=p[27],ra=p[28];
     if(exerciseRef.current==="pushup"){const l=angle(ls,le,lw),r=angle(rs,re,rw),shoulderY=(ls.y+rs.y)/2,hipY=(lh.y+rh.y)/2,body=Math.abs(shoulderY-hipY)<.28,visible=[ls,le,lw,rs,re,rw,lh,rh].every(x=>x?.visibility>.45),down=Math.min(l,r)<92,up=Math.max(l,r)>158;
      if(!visible||!body)setHint("Выровняй корпус и держи плечи, локти и кисти в кадре");else if(phaseRef.current==="up"&&down){phaseRef.current="down";setHint("Глубже…")}else if(phaseRef.current==="down"&&up){phaseRef.current="up";setRep(v=>v+1);lastRepRef.current=Date.now();setHint("ЧИСТОЙ REP ✓");onRepRef.current({ok:true})}else if(Date.now()-lastRepRef.current>1200)setHint("Отжимание: вниз → вверх");
     }else{const l=angle(lh,lk,la),r=angle(rh,rk,ra),visible=[lh,lk,la,rh,rk,ra].every(x=>x?.visibility>.45),down=Math.min(l,r)<100,up=Math.max(l,r)>158;
      if(!visible)setHint("Покажи бёдра, колени и стопы");else if(phaseRef.current==="up"&&down){phaseRef.current="down";setHint("Ниже…")}else if(phaseRef.current==="down"&&up){phaseRef.current="up";setRep(v=>v+1);lastRepRef.current=Date.now();setHint("ЧИСТЫЙ REP ✓");onRepRef.current({ok:true})}else if(Date.now()-lastRepRef.current>1200)setHint("Приседание: вниз → вверх")}
    }else setHint("Я тебя не вижу — отойди чуть дальше");animationRef.current=requestAnimationFrame(loop)};
   animationRef.current=requestAnimationFrame(loop)
  }catch{if(!cancelled){setError("Камера не запустилась. Разреши доступ к камере один раз и проверь HTTPS.");setStatus("ОШИБКА КАМЕРЫ")}}})();
  return()=>{cancelled=true;if(animationRef.current)cancelAnimationFrame(animationRef.current);streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;landmarkerRef.current?.close();landmarkerRef.current=null}
 },[enabled]);
 return <div className="camera-card"><div className="camera-head"><div><span className="eyebrow">REPCLASH AI</span><b>{exercise==="pushup"?"ОТЖИМАНИЯ":"ПРИСЕДАНИЯ"}</b></div><span className={"ai-dot "+(error?"bad":"")}>● {status}</span></div><div className="camera-wrap"><video ref={videoRef} autoPlay muted playsInline/><div className="camera-overlay"/><div className="camera-reps"><small>REPS</small><strong>{rep}</strong></div>{error&&<div className="camera-error">{error}</div>}</div><div className="camera-hint">{hint}</div><div className="camera-foot">AI считает только переход «вниз → вверх».</div></div>
}
