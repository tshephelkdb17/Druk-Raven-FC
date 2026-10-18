import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getVideoBySlug} from '@/lib/data';
import {VideoPlayer} from '@/components/video-player';
import {embedUrl} from '@/lib/validation';
export const dynamic='force-dynamic';
export default async function FilmPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,v=await getVideoBySlug(slug);if(!v)notFound();return <div className="shell py-10"><Link href="/tv" className="kicker text-red-400">← DRFC TV</Link><div className="mt-7">{v.source==='UPLOAD'&&v.url?<VideoPlayer src={v.url} poster={v.thumbnail} title={v.title}/>:<iframe className="aspect-video w-full" src={embedUrl(v.source,v.providerId)} title={v.title} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}</div><p className="kicker mt-8 text-red-400">DRFC TV / {v.category}</p><h1 className="title mt-4 text-4xl md:text-6xl">{v.title}</h1><p className="mt-6 max-w-3xl text-neutral-400">{v.description}</p></div>}
