import Link from 'next/link';
import {VideoPlayer} from '@/components/video-player';
import {publishedContent} from '@/lib/club-content';
type Content=Awaited<ReturnType<typeof publishedContent>>[number];
export function ManagedHome({content}:{content:Content}){
 return <><section className="relative min-h-[600px] overflow-hidden bg-panel">
  <div className="absolute inset-0">{content.videoUrl?<VideoPlayer src={content.videoUrl} poster={content.imageUrl??'/images/team_photo1.jpeg'} title="DRFC homepage film" hero/>:<img src={content.imageUrl??'/images/team_photo1.jpeg'} alt="Druk Raven Football Club" className="h-full w-full object-cover"/>}</div>
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20"/>
  <div className="shell pointer-events-none relative py-28"><p className="kicker mb-6 text-red-400">Druk Raven Football Club</p><h1 className="title max-w-4xl break-words text-5xl sm:text-7xl lg:text-8xl">{content.title}</h1><p className="mt-7 max-w-xl whitespace-pre-wrap text-base leading-8 text-neutral-200">{content.summary}</p><div className="pointer-events-auto mt-8 flex w-fit flex-wrap gap-3"><Link href="/squad" className="button">Meet the squad</Link><Link href="/tv" className="button quiet-button">Watch DRFC TV</Link></div></div>
 </section><section className="shell py-16"><p className="kicker mb-5 text-red-400">Inside the club</p><div className="max-w-3xl whitespace-pre-wrap break-words text-lg leading-9 text-neutral-200">{content.body}</div><Link href="/news" className="mt-8 inline-block font-bold text-red-400">Latest club news →</Link></section></>;
}
