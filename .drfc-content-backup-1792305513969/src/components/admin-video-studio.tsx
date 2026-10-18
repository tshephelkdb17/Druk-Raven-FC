"use client";
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {useState,useRef} from 'react';
import {UploadCloud,Film,ImagePlus,LockKeyhole} from 'lucide-react';
import {AdminMatchStudio} from './admin-match-studio';
import {categories} from '@/lib/types';
export function AdminVideoStudio({demo}:{demo:boolean}){
 const [tab,setTab]=useState<'videos'|'matches'>('matches');
 const client=useRef<SupabaseClient|null>(null);
 const [session,setSession]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[mode,setMode]=useState<'file'|'embed'>('file');
 const video=useRef<HTMLInputElement>(null),thumb=useRef<HTMLInputElement>(null);
 function supabase(){if(!client.current){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error('Configure Supabase before signing in');client.current=createClient(url,key,{auth:{persistSession:false}})}return client.current}
 async function api(path:string,body?:unknown,method='POST'){const {data}=await supabase().auth.getSession();if(!data.session)throw new Error('Sign in first');const response=await fetch(path,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:method==='GET'?undefined:JSON.stringify(body??{})});const result=await response.json();if(!response.ok)throw new Error(result.error??'Request failed');return result}
 async function upload(file:File){const signed=await api('/api/admin/uploads',{mimeType:file.type,bytes:file.size});const {error}=await supabase().storage.from(signed.bucket).uploadToSignedUrl(signed.path,signed.token,file,{contentType:file.type});if(error)throw error;await api(`/api/admin/uploads/${signed.assetId}/complete`);return signed.assetId as string}
 async function login(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');try{const fields=new FormData(event.currentTarget);const {error}=await supabase().auth.signInWithPassword({email:String(fields.get('email')),password:String(fields.get('password'))});if(error)throw error;setSession(true);setMessage('Signed in. Administrator access is checked by the server on every request.')}catch(e){setMessage(e instanceof Error?e.message:'Unable to sign in')}finally{setBusy(false)}}
 async function save(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget;const fields=new FormData(form);setBusy(true);setMessage('Uploading media…');try{
  const thumbnail=thumb.current?.files?.[0];if(!thumbnail)throw new Error('Choose a thumbnail image');
  const thumbnailId=await upload(thumbnail);let assetId:string|undefined;
  if(mode==='file'){const file=video.current?.files?.[0];if(!file)throw new Error('Choose an MP4 video');assetId=await upload(file)}
  const result=await api('/api/admin/videos',{title:fields.get('title'),description:fields.get('description'),category:fields.get('category'),durationSeconds:Number(fields.get('duration')),thumbnailId,assetId,embedLink:mode==='embed'?String(fields.get('embed')):undefined,publish:fields.get('publish')==='on'});
  setMessage(result.status==='PUBLISHED'?`Published. View it at /tv/${result.slug}`:'Draft saved.');form.reset();
 }catch(e){setMessage(e instanceof Error?e.message:'Unable to save')}finally{setBusy(false)}}
 return <div
          className={
            session
              ? "w-full"
              : "mx-auto w-full max-w-xl"
          }
        ><div>
 {!demo&&!session&&<form onSubmit={login} className="mb-8 grid gap-4 bg-panel p-6 sm:grid-cols-2"><h2 className="col-span-full flex items-center gap-3 font-bold"><LockKeyhole size={18}/>Administrator sign-in</h2><label className="text-xs">Email<input name="email" type="email" autoComplete="username" required className="mt-2"/></label><label className="text-xs">Password<input name="password" type="password" autoComplete="current-password" required className="mt-2"/></label><button disabled={busy} className="button sm:col-span-2">Sign in</button></form>}
 {session&&<button className="mb-5 text-xs underline" onClick={async()=>{await supabase().auth.signOut();setSession(false)}}>Sign out</button>}
 {session&&<div className="mb-6 flex flex-wrap gap-3"><button className="button quiet-button" onClick={()=>setTab('matches')}>Matches & statistics</button><button className="button quiet-button" onClick={()=>setTab('videos')}>DRFC TV</button></div>}
 {session&&tab==='matches'&&<AdminMatchStudio api={api}/>}
 <div hidden={!session || tab !== 'videos'}><form onSubmit={save} className="space-y-6"><fieldset disabled={demo||!session||busy} className="space-y-6"><div className="grid gap-6 md:grid-cols-2"><div className="border border-dashed border-neutral-700 bg-panel p-6"><UploadCloud className="mb-4 text-red-400"/><label className="text-sm font-bold">Video source<select value={mode} onChange={e=>setMode(e.target.value as 'file'|'embed')} className="mt-3 text-sm"><option value="file">Upload MP4 (up to 50 MB)</option><option value="embed">YouTube / Vimeo link</option></select></label>{mode==='file'?<input ref={video} type="file" accept="video/mp4" required className="mt-5 text-xs"/>:<label className="mt-5 text-xs">Video link<input name="embed" type="url" required placeholder="https://www.youtube.com/watch?v=…" className="mt-2"/></label>}</div><div className="border border-dashed border-neutral-700 bg-panel p-6"><ImagePlus className="mb-4 text-red-400"/><label className="text-sm font-bold">Custom thumbnail<input ref={thumb} type="file" accept="image/jpeg,image/png,image/webp" required className="mt-3 text-xs"/></label><p className="mt-3 text-xs text-neutral-500">16:9 recommended · JPG, PNG or WebP · up to 10 MB</p></div></div>
 <label className="text-xs font-bold">Title<input name="title" required minLength={3} maxLength={140} placeholder="Name your film" className="mt-2"/></label><label className="text-xs font-bold">Description<textarea name="description" required maxLength={3000} rows={4} className="mt-2"/></label><div className="grid gap-6 sm:grid-cols-2"><label className="text-xs font-bold">Category<select name="category" className="mt-2">{categories.map(c=><option key={c}>{c}</option>)}</select></label><label className="text-xs font-bold">Duration (seconds)<input type="number" name="duration" min={1} max={86400} required className="mt-2"/></label></div><label className="flex items-center gap-3 text-sm"><input name="publish" type="checkbox" className="!w-4"/>Publish immediately</label><button disabled={busy} className="button">{busy?'Saving…':'Save video'}</button></fieldset></form>
 </div><p role="status" aria-live="polite" className="mt-6 text-sm leading-6 text-neutral-300">{message}</p></div></div>
}