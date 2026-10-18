'use client';
import {useEffect,useRef,useState} from 'react';

type Kind='news'|'players'|'staff'|'homepage';
type Photo={assetId:string;alt:string;caption:string;url?:string|null};
type Entry={id?:string;slug?:string;name?:string;title?:string;summary?:string;body?:string;biography?:string;number?:number;position?:string;nationality?:string|null;heightCm?:number|null;role?:string;group?:string;sortOrder?:number;status?:string;portraitId?:string|null;imageId?:string|null;videoId?:string|null;imageUrl?:string|null;videoUrl?:string|null;gallery?:Photo[]};
type Api=(path:string,body?:unknown,method?:string)=>Promise<{items?:Entry[];id?:string;status?:string}>;
const labels:Record<Kind,string>={news:'Latest News',players:'Players',staff:'Staff',homepage:'Homepage'};
const slugify=(value:string)=>value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);

function PhotoInput({name,label,existing,video=false}:{name:string;label:string;existing?:string|null;video?:boolean}){
 const [preview,setPreview]=useState<string|null>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 return <div className="space-y-3 border border-white/15 p-4">
  <label className="block text-sm font-bold">{label}<input name={name} type="file" accept={video?'video/mp4':'image/jpeg,image/png,image/webp'} className="mt-3 text-xs" onChange={e=>{const file=e.target.files?.[0];setPreview(file?URL.createObjectURL(file):null)}}/></label>
  {(preview||existing)&&(video?<video controls preload="metadata" src={preview||existing!} className="max-h-48 w-full"/>:<img alt={`${label} preview`} src={preview||existing!} className="h-40 w-full object-contain"/>)}
  <p className="text-xs text-neutral-400">{video?'MP4, up to 50 MB':'JPG, PNG or WebP, up to 10 MB'}. Leave blank to keep the current file.</p>
  {existing&&<label className="flex items-center gap-2 text-xs"><input type="checkbox" name={`${name}Remove`} className="!w-4"/>Remove current file</label>}
 </div>;
}

export function AdminContentStudio({api,upload}:{api:Api;upload:(file:File)=>Promise<string>}){
 const [kind,setKind]=useState<Kind|null>(null);
 return <section className="mb-10 border-b border-white/15 pb-8">
  <h2 className="mb-4 text-2xl font-black">Website content</h2>
  <div className="mb-6 flex flex-wrap gap-2">{(Object.keys(labels) as Kind[]).map(k=><button type="button" key={k} aria-pressed={kind===k} className={`border px-4 py-3 text-sm font-bold ${kind===k?'border-red-600 bg-red-700':'border-white/20 hover:bg-white/10'}`} onClick={()=>setKind(kind===k?null:k)}>{labels[k]}</button>)}</div>
  {kind?<Editor key={kind} kind={kind} api={api} upload={upload}/>:<p className="text-sm text-neutral-400">Choose a section to add, edit or publish content.</p>}
 </section>;
}
function Editor({kind,api,upload}:{kind:Kind;api:Api;upload:(file:File)=>Promise<string>}){
 const [items,setItems]=useState<Entry[]>([]),[entry,setEntry]=useState<Entry>({}),[revision,setRevision]=useState(0);
 const [loadFailed,setLoadFailed]=useState(false);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const alive=useRef(true);
 const person=kind==='players'||kind==='staff';
 useEffect(()=>{alive.current=true;api(`/api/admin/content/${kind}`,undefined,'GET').then(result=>{if(!alive.current)return;const rows=result.items??[];setItems(rows);if(kind==='homepage')setEntry(rows[0]??{});setLoading(false)}).catch(e=>{if(alive.current){setMessage(e.message);setLoadFailed(true);setLoading(false)}});return()=>{alive.current=false}},[kind]);
 function select(id:string){setEntry(items.find(p=>p.id===id)??{});setRevision(n=>n+1);setMessage('')}
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget,fields=new FormData(form);
  const status=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='PUBLISHED'?'PUBLISHED':'DRAFT';
  setBusy(true);setMessage('Saving content and uploading selected files…');
  try{
   const text=(key:string)=>String(fields.get(key)??'').trim();
   async function fileId(name:string,old?:string|null){const file=fields.get(name);if(file instanceof File&&file.size){const allowed=name==='video'?['video/mp4']:['image/jpeg','image/png','image/webp'];if(!allowed.includes(file.type))throw new Error('Use JPG, PNG or WebP images, or an MP4 video');if(file.size>(name==='video'?50:10)*1024*1024)throw new Error(`${name==='video'?'Video':'Image'} exceeds the upload size limit`);return upload(file)}return fields.has(`${name}Remove`)?null:old??null}
   const base={id:entry.id,status,slug:kind==='homepage'?'homepage':text('slug')||slugify(text(person?'name':'title'))};
   let payload:Entry;
   if(person){
    const portraitId=await fileId('portrait',entry.portraitId);
    payload={...base,name:text('name'),biography:text('biography'),portraitId};
    if(kind==='staff')Object.assign(payload,{role:text('role'),group:text('group'),sortOrder:Number(text('sortOrder'))});
    else{
     const gallery:Photo[]=[];
     for(let i=0;i<3;i++){const old=entry.gallery?.[i],assetId=await fileId(`gallery${i}`,old?.assetId);if(assetId)gallery.push({assetId,alt:text(`alt${i}`)||`${text('name')} in action ${i+1}`,caption:text(`caption${i}`)})}
     Object.assign(payload,{number:Number(text('number')),position:text('position'),nationality:text('nationality')||null,heightCm:text('heightCm')?Number(text('heightCm')):null,gallery});
    }
   }else payload={...base,title:text('title'),summary:text('summary'),body:text('body'),imageId:await fileId('image',entry.imageId),videoId:kind==='homepage'?await fileId('video',entry.videoId):null};
   const saved=await api(`/api/admin/content/${kind}`,payload);
   setEntry({...payload,id:saved.id});
   setMessage(status==='PUBLISHED'?'Published. Visitors can now see this content.':'Saved as draft. This content is hidden from visitors.');
   try{const result=await api(`/api/admin/content/${kind}`,undefined,'GET');const rows=result.items??[];setItems(rows);setEntry(rows.find(p=>p.id===saved.id)??{...payload,id:saved.id});setRevision(n=>n+1)}catch{setMessage('Saved successfully. Reload the admin page to refresh the list and image previews.')}
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to save. Please try again.')}
  finally{setBusy(false)}
 }
 if(loadFailed)return <p role="alert" className="border border-red-500/40 p-5 text-sm">{message} Close and reopen this section to retry.</p>;
 if(loading)return <p role="status">Loading {labels[kind].toLowerCase()}…</p>;
 return <div className="bg-panel p-5 sm:p-8">
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">Manage {labels[kind]}</h3>{kind!=='homepage'&&<button type="button" disabled={busy} onClick={()=>select('')} className="border border-white/30 px-4 py-2 text-sm">+ Add new</button>}</div>
  {kind!=='homepage'&&<label className="mb-6 block text-sm">Edit existing<select value={entry.id??''} disabled={busy} onChange={e=>select(e.target.value)} className="mt-2"><option value="">Create new</option>{items.map(p=><option value={p.id} key={p.id}>{p.name??p.title} — {p.status}</option>)}</select></label>}
  <form key={`${entry.id??'new'}-${revision}`} onSubmit={save}>
   <fieldset disabled={busy} className="grid gap-5">
    <label className="text-sm font-bold">{person?'Full name':kind==='homepage'?'Homepage headline':'News headline'}<input name={person?'name':'title'} defaultValue={person?entry.name:entry.title} required minLength={person?2:3} maxLength={person?100:140} className="mt-2"/></label>
    {kind!=='homepage'&&<label className="text-sm">Page address<input name="slug" defaultValue={entry.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} placeholder="Leave blank to generate from the name or title" className="mt-2"/></label>}
    {kind==='players'&&<div className="grid gap-5 sm:grid-cols-2"><label>Shirt number<input name="number" type="number" min={1} max={99} required defaultValue={entry.number} className="mt-2"/></label><label>Position<select name="position" defaultValue={entry.position??'MIDFIELDER'} className="mt-2">{['GOALKEEPER','DEFENDER','MIDFIELDER','FORWARD'].map(p=><option key={p}>{p}</option>)}</select></label><label>Nationality<input name="nationality" maxLength={80} defaultValue={entry.nationality??''} className="mt-2"/></label><label>Height (cm, optional)<input name="heightCm" type="number" min={80} max={250} defaultValue={entry.heightCm??''} className="mt-2"/></label></div>}
    {kind==='staff'&&<div className="grid gap-5 sm:grid-cols-3"><label>Role<input name="role" required minLength={2} maxLength={100} defaultValue={entry.role} className="mt-2"/></label><label>Department<select name="group" defaultValue={entry.group??'COACHING'} className="mt-2">{['EXECUTIVE','COACHING','MEDICAL','KIT'].map(g=><option key={g}>{g}</option>)}</select></label><label>Display order<input name="sortOrder" type="number" min={0} max={1000} defaultValue={entry.sortOrder??0} className="mt-2"/></label></div>}
    {!person&&<label>Short introduction<textarea name="summary" rows={3} maxLength={500} defaultValue={entry.summary} className="mt-2"/></label>}
    <label>{person?'Short biography':kind==='homepage'?'Homepage story / announcement':'Full news article'}<textarea name={person?'biography':'body'} rows={7} maxLength={person?5000:15000} defaultValue={person?entry.biography:entry.body} className="mt-2"/></label>
    <PhotoInput name={person?'portrait':'image'} label={person?'Profile photograph':kind==='homepage'?'Homepage banner image':'News cover image'} existing={entry.imageUrl}/>
    {kind==='homepage'&&<PhotoInput name="video" label="Optional homepage background video" video existing={entry.videoUrl}/>}
    {kind==='players'&&<div><h4 className="mb-4 font-bold">Matchday gallery — up to 3 additional photos</h4><div className="grid gap-4 lg:grid-cols-3">{[0,1,2].map(i=><div key={i} className="space-y-3"><PhotoInput name={`gallery${i}`} label={`Action photo ${i+1}`} existing={entry.gallery?.[i]?.url}/><label className="block text-xs">Image description<input name={`alt${i}`} maxLength={200} defaultValue={entry.gallery?.[i]?.alt} className="mt-2"/></label><label className="block text-xs">Caption<input name={`caption${i}`} maxLength={300} defaultValue={entry.gallery?.[i]?.caption} className="mt-2"/></label></div>)}</div></div>}
    <p className="text-xs leading-6 text-neutral-400">Publish makes your changes visible immediately. Saving an existing published item as a draft hides it from visitors.{kind==='homepage'?' When the homepage is a draft, the original homepage design is shown.':''}</p>
    <div className="flex flex-wrap gap-3"><button type="submit" name="action" value="DRAFT" className="button quiet-button">{busy?'Saving…':'Save as draft'}</button><button type="submit" name="action" value="PUBLISHED" className="button">{busy?'Saving…':'Publish'}</button></div>
   </fieldset>
  </form>
  <p role="status" aria-live="polite" className="mt-5 whitespace-pre-line text-sm">{message}</p>
 </div>;
}
