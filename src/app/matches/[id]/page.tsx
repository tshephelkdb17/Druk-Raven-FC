import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Team} from '@/components/match-team';
import {PageHeading} from '@/components/page-heading';
import {db,isDemo} from '@/lib/db';

export const dynamic='force-dynamic';

export default async function MatchDetailsPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(isDemo() || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const match=await db().match.findFirst({
    where:{id,status:'PUBLISHED',finished:true},
    include:{contributions:{
      where:{OR:[{goals:{gt:0}},{assists:{gt:0}}]},
      include:{player:{select:{name:true,number:true}}},
      orderBy:{player:{number:'asc'}},
    }},
  });
  if(!match) notFound();
  const homeName=match.home?'DRFC':match.opponent;
  const awayName=match.home?match.opponent:'DRFC';
  const homeScore=match.home?match.goalsFor:match.goalsAgainst;
  const awayScore=match.home?match.goalsAgainst:match.goalsFor;
  return <main className="shell min-h-[65vh] pb-16">
    <Link href="/matches?view=results" className="mt-8 inline-block text-sm font-bold text-neutral-300 hover:text-white">← All match results</Link>
    <PageHeading eyebrow={match.competition} title="Match result" description={`${new Date(match.kickoff).toLocaleDateString('en-AU',{timeZone:'Australia/Brisbane'})} · ${match.venue}`}/>
    <section aria-label={`${homeName} versus ${awayName}`} className="border-t-2 border-devil bg-panel px-4 py-10 sm:px-10">
      <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        <Team name={homeName}/>
        <div className="text-center"><p className="text-4xl font-black tabular-nums text-red-400 sm:text-6xl">{homeScore??'–'} – {awayScore??'–'}</p><p className="mt-3 text-xs font-bold uppercase tracking-widest text-neutral-400">Full time</p></div>
        <Team name={awayName}/>
      </div>
    </section>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {(['goals','assists'] as const).map(kind=>{
        const entries=match.contributions.filter(row=>row[kind]>0).sort((a,b)=>b[kind]-a[kind]);
        return <section key={kind} className="bg-panel p-6" aria-labelledby={`${kind}-heading`}>
          <h2 id={`${kind}-heading`} className="border-b border-white/10 pb-5 text-2xl font-black uppercase">DRFC {kind==='goals'?'goalscorers':'assists'}</h2>
          {entries.length?<ul className="divide-y divide-white/10">{entries.map(row=><li key={row.playerId} className="flex items-center gap-4 py-5">
            <span className="w-10 text-2xl font-black text-neutral-500">{row.player.number}</span>
            <span className="flex-1 font-bold">{row.player.name}</span>
            <span className="text-right"><strong className="text-2xl text-red-400">{row[kind]}</strong><span className="ml-2 text-xs text-neutral-400">{kind==='goals'?(row[kind]===1?'goal':'goals'):(row[kind]===1?'assist':'assists')}</span></span>
          </li>)}</ul>:<p className="py-8 text-neutral-400">No {kind==='goals'?'goalscorers':'assists'} recorded for this match yet.</p>}
        </section>;
      })}
    </div>
  </main>;
}
