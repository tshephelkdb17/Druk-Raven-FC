import Link from 'next/link';
import {Team} from '@/components/match-team';
import {PageHeading} from '@/components/page-heading';
import {db,isDemo} from '@/lib/db';

export const dynamic='force-dynamic';

export default async function MatchesPage({searchParams}:{searchParams:Promise<{view?:string}>}) {
  const {view}=await searchParams;
  const isResults=view==='results';
  const rows=isDemo()?[]:await db().match.findMany({where:{status:'PUBLISHED',finished:isResults},take:50,orderBy:{kickoff:isResults?'desc':'asc'}});
  return <div className="shell min-h-[65vh]">
    <PageHeading eyebrow="Matches" title={isResults?'Match Results':'Fixtures'} description={isResults?'The latest scores and results.':'Our upcoming matches.'}/>
    {rows.length ? rows.map(m=>{
      const homeName=m.home?'DRFC':m.opponent;
      const awayName=m.home?m.opponent:'DRFC';
      const homeScore=m.home?m.goalsFor:m.goalsAgainst;
      const awayScore=m.home?m.goalsAgainst:m.goalsFor;
      const score=m.finished&&homeScore!==null&&awayScore!==null?`${homeScore} – ${awayScore}`:'vs';
      const card = <article className="mb-4 grid items-center gap-6 bg-panel p-5 sm:p-6 lg:grid-cols-[1fr_2fr_1fr]">
        <p className="kicker text-neutral-400">{m.competition}<span className="mt-2 block">{new Date(m.kickoff).toLocaleDateString('en-AU',{timeZone:'Australia/Brisbane'})}</span></p>
        <h2 className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <Team name={homeName}/>
          <span className="flex flex-col items-center gap-2"><span className="text-2xl font-black tabular-nums text-red-400 sm:text-3xl">{score}</span><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{m.finished?'Full time':'Fixture'}</span></span>
          <Team name={awayName}/>
        </h2>
        <p className="text-center text-sm text-neutral-400 lg:text-right">{m.venue}<span className="mt-2 block text-xs uppercase tracking-widest">{m.home?'Home':'Away'}</span>{m.finished&&<span className="mt-3 block font-bold text-red-400">Goals &amp; assists →</span>}</p>
      </article>;
      return m.finished ? <Link key={m.id} href={`/matches/${m.id}`} className="block transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-red-500" aria-label={`View ${homeName} ${score} ${awayName}: goals and assists`}>{card}</Link> : <div key={m.id}>{card}</div>;
    }):<p className="border-y border-white/10 py-16 text-center text-neutral-500">{isResults?'Match results will appear here once published.':'Fixtures will appear here once announced.'}</p>}
  </div>;
}
