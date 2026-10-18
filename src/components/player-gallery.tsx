"use client";
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Expand,X,ImagePlus} from 'lucide-react';
import type {GalleryPhoto} from '@/lib/types';
export function PlayerGallery({photos,name}:{photos:GalleryPhoto[];name:string}){
 const dialog=useRef<HTMLDialogElement>(null),[index,setIndex]=useState(0);
 const open=(i:number)=>{setIndex(i);dialog.current?.showModal()};
 const move=(direction:number)=>setIndex(i=>(i+direction+photos.length)%photos.length);
 return <section className="py-16" aria-label={`${name} matchday gallery`}><p className="kicker mb-4 text-red-400">Behind the lens</p><h2 className="title mb-8 text-4xl sm:text-6xl">Matchday gallery</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{[0,1,2].map(i=>photos[i]?<button key={photos[i].id} onClick={()=>open(i)} aria-label={`Open gallery photo ${i+1}: ${photos[i].alt}`} className="photo-hover group relative aspect-[4/5] overflow-hidden bg-panel"><img src={photos[i].url} alt={photos[i].alt} loading="lazy" className="h-full w-full object-cover"/><span className="absolute bottom-4 right-4 bg-black/70 p-3"><Expand size={18}/></span></button>:<div key={i} className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-panel text-neutral-600"><ImagePlus size={32}/><span className="kicker">Photo {i+1} · Coming soon</span></div>)}</div>
 <dialog ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current?.close()}} onKeyDown={e=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)}} aria-label={`${name} gallery viewer`}>
 {photos[index]&&<div className="relative p-4 sm:p-6"><button autoFocus onClick={()=>dialog.current?.close()} aria-label="Close gallery" className="absolute right-5 top-5 z-10 bg-black/70 p-3"><X/></button><img src={photos[index].url} alt={photos[index].alt} className="max-h-[70vh] max-w-[85vw] object-contain"/><div className="mt-4 flex items-center justify-between gap-6"><button onClick={()=>move(-1)} aria-label="Previous photo" className="p-3"><ArrowLeft/></button><div className="text-center"><p className="text-sm">{photos[index].caption}</p><p className="mt-1 text-xs text-neutral-500">{index+1} / {photos.length}</p></div><button onClick={()=>move(1)} aria-label="Next photo" className="p-3"><ArrowRight/></button></div></div>}
 </dialog></section>
}
