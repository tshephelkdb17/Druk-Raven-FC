'use client';
import {useEffect,useState} from 'react';
type Stat={playerId:string;goals:number;assists:number};
type Match={id?:string;opponent:string;kickoff:string;venue:string;competition:string;season:string;home:boolean;finished:boolean;status:'DRAFT'|'PUBLISHED';goalsFor:number|null;goalsAgainst:number|null;contributions:Stat[]};
type Player={id:string;name:string;number:number};
function fresh():Match{return {opponent:'',kickoff:'',venue:'',competition:'Friendly',season:String(new Date().getFullYear()),home:true,finished:false,status:'DRAFT',goalsFor:null,goalsAgainst:null,contributions:[]}}
function brisbaneTime(iso:string){return new Date(new Date(iso).getTime()+10*3600000).toISOString().slice(0,16)}
export function AdminMatchStudio({api}:{api:(path:string,body?:unknown,method?:string)=>Promise<any>}){
 const [matches,setMatches]=useState<Match[]>([]),[players,setPlayers]=useState<Player[]>([]),[form,setForm]=useState<Match>(fresh),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 async function load(){const data=await api('/api/admin/matches',undefined,'GET');setMatches(data.matches);setPlayers(data.players);setReady(true)}
 useEffect(()=>{load().catch(e=>setMessage(e.message))},[]);
 function edit(m:Match){setForm({...m,kickoff:brisbaneTime(m.kickoff)});setMessage('')}
 function field<K extends keyof Match>(key:K,value:Match[K]){setForm(f=>({...f,[key]:value}))}
 function stat(playerId:string,key:'goals'|'assists',value:number){setForm(f=>{const rows=f.contributions.filter(s=>s.playerId!==playerId);const row={...(f.contributions.find(s=>s.playerId===playerId)??{playerId,goals:0,assists:0}),[key]:value};return {...f,contributions:[...rows,row].filter(s=>s.goals||s.assists)}})}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
 const saved=await api('/api/admin/matches',{...form,kickoff:new Date(form.kickoff+':00+10:00').toISOString(),contributions:form.contributions.map(({playerId,goals,assists})=>({playerId,goals,assists}))});
 edit(saved);await load();setMessage(saved.status==='PUBLISHED'?'Match published. Refresh Matches or Squad to see the changes.':'Draft saved. This match is hidden from the public.');
 }catch(e){setMessage(e instanceof Error?e.message:'Unable to save')}finally{setBusy(false)}}
 return <section className="space-y-6"><h2 className="text-2xl font-bold">Matches & player statistics</h2>
 <p className="text-sm text-neutral-400">Create fixtures, publish results or return a match to draft. All kickoff times below are Brisbane time.</p>
 <p role="status" className="text-sm text-red-300">{message}</p>
 {!ready&&<button className="button" onClick={()=>load().catch(e=>setMessage(e.message))}>Load matches</button>}
 <fieldset disabled={busy||!ready} className="space-y-6">
 <div className="flex flex-wrap gap-3"><button type="button" className="button quiet-button" onClick={()=>{setForm(fresh());setMessage('')}}>New match</button><label className="min-w-0 flex-1 text-sm">Edit an existing match<select value={form.id??''} onChange={e=>{const m=matches.find(m=>m.id===e.target.value);if(m)edit(m);else setForm(fresh())}}><option value="">New match</option>{matches.map(m=><option key={m.id} value={m.id}>{new Date(m.kickoff).toLocaleDateString('en-AU',{timeZone:'Australia/Brisbane'})} · {m.opponent} · {m.status}</option>)}</select></label></div>
 <form onSubmit={save} className="space-y-6 bg-panel p-5">
 <div className="grid gap-5 sm:grid-cols-2">{(['opponent','venue','competition','season'] as const).map(key=><label key={key} className="text-sm capitalize">{key}<input required maxLength={key==='venue'?200:key==='season'?20:100} value={form[key]} onChange={e=>field(key,e.target.value)}/></label>)}
 <label className="text-sm">Kickoff (Brisbane)<input required type="datetime-local" value={form.kickoff} onChange={e=>field('kickoff',e.target.value)}/></label>
 <label className="text-sm">Venue type<select value={form.home?'home':'away'} onChange={e=>field('home',e.target.value==='home')}><option value="home">DRFC home</option><option value="away">DRFC away</option></select></label>
 <label className="text-sm">Match state<select value={form.finished?'finished':'scheduled'} onChange={e=>setForm(f=>({...f,finished:e.target.value==='finished',goalsFor:null,goalsAgainst:null,contributions:[]}))}><option value="scheduled">Scheduled fixture</option><option value="finished">Finished result</option></select></label>
 <label className="text-sm">Visibility<select value={form.status} onChange={e=>field('status',e.target.value as Match['status'])}><option value="DRAFT">Draft — hidden</option><option value="PUBLISHED">Published — public</option></select></label></div>
 {form.finished&&<><div className="grid gap-5 sm:grid-cols-2">{(['goalsFor','goalsAgainst'] as const).map(key=><label className="text-sm" key={key}>{key==='goalsFor'?'DRFC goals':'Opponent goals'}<input type="number" min={0} max={100} required value={form[key]??''} onChange={e=>field(key,e.target.value===''?null:Number(e.target.value))}/></label>)}</div>
 <h3 className="font-bold">Player contributions</h3><p className="text-xs text-neutral-400">Enter goals and assists for this match only. Totals update automatically. Unassigned goals are allowed, for example own goals.</p>
 <div className="max-h-96 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Player</th><th className="p-2">Goals</th><th className="p-2">Assists</th></tr></thead><tbody>{players.map(p=><tr key={p.id} className="border-t border-white/10"><th className="p-2 font-normal">#{p.number} {p.name}</th>{(['goals','assists'] as const).map(key=><td key={key} className="w-24 p-2"><input aria-label={`${p.name} ${key}`} type="number" min={0} max={100} required value={form.contributions.find(s=>s.playerId===p.id)?.[key]??0} onChange={e=>stat(p.id,key,Number(e.target.value))}/></td>)}</tr>)}</tbody></table></div></>}
 <button className="button" disabled={busy}>{busy?'Saving…':form.status==='PUBLISHED'?'Save & publish match':'Save draft'}</button>
 </form></fieldset></section>
}
