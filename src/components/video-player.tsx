"use client";
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,Volume2,VolumeX} from 'lucide-react';
export function VideoPlayer({src,poster,hero=false,title}:{src:string;poster:string;hero?:boolean;title:string}){
 const ref=useRef<HTMLVideoElement>(null),userPaused=useRef(false),visible=useRef(false),manual=useRef(false);
 const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(true),[failed,setFailed]=useState(false);
 useEffect(()=>{const v=ref.current;if(!v)return;const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{if(visible.current&&!document.hidden&&!userPaused.current&&(!motion.matches||manual.current)){void v.play().catch(()=>setPlaying(false))}else v.pause()};
 const io=new IntersectionObserver(([e])=>{visible.current=e.isIntersecting&&e.intersectionRatio>=.25;sync()},{threshold:[0,.25]});io.observe(v);
 document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
 return()=>{io.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);v.pause()}},[src]);
 const toggle=()=>{const v=ref.current;if(!v)return;if(v.paused){userPaused.current=false;manual.current=true;void v.play().catch(()=>setPlaying(false))}else{userPaused.current=true;v.pause()}};
 return <div className={`relative bg-black ${hero?'h-full':'aspect-video'}`}>
  <video ref={ref} poster={poster} playsInline muted={muted} loop={hero} preload="metadata" controls={!hero} aria-label={title}
   onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)} className={`h-full w-full ${hero?'object-cover':'object-contain'}`}><source src={src} type="video/mp4"/>{src==='/videos/club-film.mp4'&&<source src="/videos/club-film.webm" type="video/webm"/>}Your browser does not support this video.</video>
  {hero&&<div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 bg-black/70"><button disabled={failed} onClick={toggle} aria-label={playing?'Pause video':'Play video'} className="p-3">{playing?<Pause size={18}/>:<Play size={18}/>}</button><button onClick={()=>setMuted(!muted)} aria-label={muted?'Unmute video':'Mute video'} className="p-3">{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button></div>}
  {failed&&<p role="status" className="absolute bottom-20 right-5 bg-black p-3 text-xs">Video unavailable. Please try again later.</p>}
 </div>
}
