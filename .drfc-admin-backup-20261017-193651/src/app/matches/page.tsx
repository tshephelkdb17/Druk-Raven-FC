import Image from 'next/image';
import {PageHeading} from '@/components/page-heading';
import {db,isDemo} from '@/lib/db';

export const dynamic='force-dynamic';

const badges: Record<string,string> = {
  drfc: '/images/drfc_logo.jpeg',
  annerley: '/images/annerleyfc.jpg',
  annerleyfc: '/images/annerleyfc.jpg',
  southsudan: '/images/southsudanfc.jpeg',
  southsudanfc: '/images/southsudanfc.jpeg',
};

function Team({name}:{name:string}) {
  const badge = badges[name.toLowerCase().replace(/[^a-z0-9]/g,'')];
  return <div className="flex min-w-0 flex-col items-center gap-3 text-center">
    {badge ? <Image src={badge} alt="" width={64} height={64} className="h-14 w-14 bg-white object-contain p-1 sm:h-16 sm:w-16"/> :
      <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center border border-white/20 text-lg font-bold text-neutral-400">{name.split(/\s+/).map(word=>word[0]).join('').slice(0,3)}</span>}
    <span className="text-sm font-bold sm:text-lg">{name}</span>
  </div>;
}

export default async function MatchesPage() {
  const rows=isDemo()?[]:await db().match.findMany({take:50,orderBy:{kickoff:'desc'}});
  return <div className="shell min-h-[65vh]">
    <PageHeading eyebrow="First team" title="Match centre" description="The next challenge. The latest result."/>
    {rows.length ? rows.map(m=>{
      const homeName=m.home?'DRFC':m.opponent;
      const awayName=m.home?m.opponent:'DRFC';
      const homeScore=m.home?m.goalsFor:m.goalsAgainst;
      const awayScore=m.home?m.goalsAgainst:m.goalsFor;
      const score=m.finished&&homeScore!==null&&awayScore!==null?`${homeScore} – ${awayScore}`:'vs';
      return <article key={m.id} className="mb-4 grid items-center gap-6 bg-panel p-5 sm:p-6 lg:grid-cols-[1fr_2fr_1fr]">
        <p className="kicker text-neutral-400">{m.competition}<span className="mt-2 block">{new Date(m.kickoff).toLocaleDateString('en-AU',{timeZone:'Australia/Brisbane'})}</span></p>
        <h2 className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <Team name={homeName}/>
          <span className="flex flex-col items-center gap-2"><span className="text-2xl font-black tabular-nums text-red-400 sm:text-3xl">{score}</span><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{m.finished?'Full time':'Fixture'}</span></span>
          <Team name={awayName}/>
        </h2>
        <p className="text-center text-sm text-neutral-400 lg:text-right">{m.venue}<span className="mt-2 block text-xs uppercase tracking-widest">{m.home?'Home':'Away'}</span></p>
      </article>;
    }):<p className="border-y border-white/10 py-16 text-center text-neutral-500">Fixtures and results will appear here once announced.</p>}
  </div>;
}
