import Link from 'next/link';
import {PageHeading} from '@/components/page-heading';
import {publishedContent} from '@/lib/club-content';
export const dynamic='force-dynamic';
export default async function NewsPage(){
 const articles=await publishedContent('NEWS');
 return <div className="shell min-h-[65vh] pb-16"><PageHeading eyebrow="Druk Raven Football Club" title="Latest news" description="Stories, announcements and updates from DRFC."/>
 {articles.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{articles.map(article=><Link href={`/news/${article.slug}`} key={article.id} className="group bg-panel focus-visible:outline-2 focus-visible:outline-red-500">
  {article.imageUrl?<img src={article.imageUrl} alt={article.title} className="aspect-video w-full object-cover"/>:<div className="flex aspect-video items-center justify-center bg-red-950 text-4xl font-black">DRFC NEWS</div>}
  <div className="p-6"><p className="text-xs text-neutral-400">{article.createdAt.toLocaleDateString('en-AU',{timeZone:'Australia/Brisbane'})}</p><h2 className="mt-3 text-2xl font-black group-hover:text-red-400">{article.title}</h2><p className="mt-3 text-sm leading-6 text-neutral-400">{article.summary}</p><span className="mt-6 inline-block text-sm font-bold text-red-400">Read story →</span></div>
 </Link>)}</div>:<p className="py-10 text-neutral-400">Club news will appear here once published.</p>}</div>;
}
