import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

type RepEvent = { ok: boolean; reason?: string };
type Props = { enabled: boolean; onRep: (event: RepEvent) => void };

const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";

function angle(a: {x:number;y:number}, b: {x:number;y:number}, c: {x:number;y:number}) {
  const abx=a.x-b.x, aby=a.y-b.y, cbx=c.x-b.x, cby=c.y-b.y;
  const dot=abx*cbx+aby*cby;
  const mag=Math.hypot(abx,aby)*Math.hypot(cbx,cby);
  return mag ? Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI : 180;
}

export function PoseCamera({ enabled, onRep }: Props) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const landmarkerRef=useRef<PoseLandmarker|null>(null);
  const animationRef=useRef<number|undefined>(undefined);
  const phaseRef=useRef<"up"|"down">("up");
  const [status,setStatus]=useState("КАМЕРА ВЫКЛ");
  const [error,setError]=useState<string|null>(null);
  const [rep,setRep]=useState(0);

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach(t=>t.stop());
      streamRef.current=null;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    let cancelled=false;
    (async()=>{
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("NO_CAMERA");
        setStatus("ЗАПРАШИВАЕМ КАМЕРУ");
        const stream=await navigator.mediaDevices.getUserMedia({
          video:{facingMode:"user",width:{ideal:720},height:{ideal:720}}, audio:false
        });
        if(cancelled){stream.getTracks().forEach(t=>t.stop());return;}
        streamRef.current=stream;
        if(videoRef.current){videoRef.current.srcObject=stream; await videoRef.current.play();}
        setStatus("ЗАГРУЗКА POSE AI");
        const vision=await FilesetResolver.forVisionTasks(WASM);
        const lm=await PoseLandmarker.createFromOptions(vision,{
          baseOptions:{modelAssetPath:MODEL,delegate:"GPU"},
          runningMode:"VIDEO",
          numPoses:1,
          minPoseDetectionConfidence:0.5,
          minPosePresenceConfidence:0.5,
          minTrackingConfidence:0.5
        });
        landmarkerRef.current=lm;
        setStatus("AI ГОТОВ — СТАНЬ В КАДР");
        const loop=()=>{
          if(cancelled || !videoRef.current || !landmarkerRef.current) return;
          const now=performance.now();
          const result=landmarkerRef.current.detectForVideo(videoRef.current,now);
          const p=result.landmarks?.[0];
          if(p){
            const lShoulder=p[11], lElbow=p[13], lWrist=p[15], rShoulder=p[12], rElbow=p[14], rWrist=p[16];
            const left=angle(lShoulder,lElbow,lWrist), right=angle(rShoulder,rElbow,rWrist);
            const shoulderY=(lShoulder.y+rShoulder.y)/2;
            const hipY=((p[23]?.y??0)+(p[24]?.y??0))/2;
            const visible=[lShoulder,lElbow,lWrist,rShoulder,rElbow,rWrist].every(x=>x && x.visibility>0.45);
            const bodyLevel=Math.abs(shoulderY-hipY)<0.45;
            const down=Math.min(left,right)<95;
            const up=Math.max(left,right)>155;
            if(visible && bodyLevel){
              if(phaseRef.current==="up" && down) phaseRef.current="down";
              else if(phaseRef.current==="down" && up){
                phaseRef.current="up";
                setRep(v=>v+1);
                onRep({ok:true});
              }
            }
          }
          animationRef.current=requestAnimationFrame(loop);
        };
        animationRef.current=requestAnimationFrame(loop);
      } catch {
        setError("Не удалось запустить камеру/POSE AI. Нужен HTTPS и разрешение камеры.");
        setStatus("AI НЕДОСТУПЕН");
      }
    })();
    return ()=>{
      cancelled=true;
      if(animationRef.current) cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach(t=>t.stop());
      streamRef.current=null;
      landmarkerRef.current?.close();
      landmarkerRef.current=null;
    };
  },[enabled,onRep]);

  return <div className="camera-card">
    <div className="camera-head"><span>POSE AI</span><b>{status}</b></div>
    <div className="camera-wrap">
      <video ref={videoRef} autoPlay muted playsInline />
      {!enabled && <div className="camera-placeholder">📷<br/>Включи камеру перед стартом</div>}
      {enabled && !error && <div className="camera-reps">{rep}<small> REPS</small></div>}
      {error && <div className="camera-error">{error}</div>}
    </div>
    <div className="camera-foot">Считаем переходы вниз → вверх, чтобы не было двойных повторов.</div>
  </div>;
}
