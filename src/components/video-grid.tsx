"use client";
import Link from 'next/link';
import {useState} from 'react';
import {Play,Search} from 'lucide-react';
import {categories,type VideoView} from '@/lib/types';
export function durationLabel(seconds:number){const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}
export function VideoGrid({videos,initialCategory='ALL'}:{videos:VideoView[];initialCategory?:string}){
 const [category,setCategory]=useState(initialCategory),[query,setQuery]=useState('');
 const filtered=videos.filter(v=>(category==='ALL'||v.category===category)&&`${v.title} ${v.description}`.toLowerCase().includes(query.toLowerCase()));
 return <section aria-label="DRFC TV films">
  <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex flex-wrap gap-2" role="group" aria-label="Video category">{['ALL',...categories].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)} className={`px-4 py-3 text-[10px] font-bold tracking-wider ${c===category?'bg-devil':'bg-white/5 hover:bg-white/10'}`}>{c}</button>)}</div><label className="relative md:w-64"><span className="sr-only">Search videos</span><Search size={16} className="absolute left-3 top-3.5 text-neutral-500"/><input className="!pl-10 text-xs" placeholder="Search DRFC TV" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <div data-testid="video-grid" className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-6">{filtered.map(video=><Link href={`/tv/${video.slug}`} key={video.id} className="group photo-hover block">
   <div className="relative aspect-video overflow-hidden bg-neutral-900"><img src={video.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"/><span className="absolute bottom-3 left-3 flex size-8 items-center justify-center bg-devil transition-colors group-hover:bg-white group-hover:text-devil"><Play size={13} fill="currentColor"/></span><span className="absolute bottom-3 right-3 bg-black/70 px-1.5 py-1 font-mono text-[10px]">{durationLabel(video.durationSeconds)}</span></div>
   <p className="kicker mt-4 text-[9px] text-red-400">{video.category}</p><h2 className="mt-2 text-sm font-bold leading-snug sm:text-lg">{video.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{video.description}</p>
  </Link>)}</div>
  {filtered.length===0&&<p role="status" className="border-y border-white/10 py-16 text-center text-neutral-400">No films match this selection.</p>}
 </section>
}
