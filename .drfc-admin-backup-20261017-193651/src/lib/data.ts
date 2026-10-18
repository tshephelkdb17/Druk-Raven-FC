import 'server-only';
import {cache} from 'react';
import {db,isDemo} from './db';
import {assetUrl} from './supabase-server';
import {demoPlayers,demoStaff,demoVideos} from './demo';
import type {PlayerView,StaffView,VideoView} from './types';
export const getPlayers=cache(async ():Promise<PlayerView[]>=>{
  if(isDemo()) return demoPlayers;
  const rows=await db().player.findMany({where:{status:'PUBLISHED'},orderBy:{number:'asc'},take:100,
    include:{portrait:true,gallery:{include:{asset:true},orderBy:{slot:'asc'}},contributions:{where:{match:{finished:true}}}}});
  return Promise.all(rows.map(async p=>({id:p.id,slug:p.slug,name:p.name,number:p.number,position:p.position,
    portrait:await assetUrl(p.portrait),biography:p.biography,nationality:p.nationality,heightCm:p.heightCm,dateOfBirth:p.dateOfBirth?.toISOString()??null,
    goals:p.contributions.reduce((n,s)=>n+s.goals,0),assists:p.contributions.reduce((n,s)=>n+s.assists,0),
    gallery:await Promise.all(p.gallery.map(async g=>({id:g.id,url:(await assetUrl(g.asset))!,alt:g.alt,caption:g.caption}))) }))); });
export const getStaff=cache(async ():Promise<StaffView[]>=>{
  if(isDemo()) return demoStaff;
  const rows=await db().staff.findMany({where:{status:'PUBLISHED'},orderBy:[{group:'asc'},{sortOrder:'asc'}],take:100,include:{portrait:true}});
  return Promise.all(rows.map(async p=>({id:p.id,slug:p.slug,name:p.name,role:p.role,group:p.group,biography:p.biography,portrait:await assetUrl(p.portrait)}))); });
export const getVideos=cache(async ():Promise<VideoView[]>=>{
  if(isDemo()) return demoVideos;
  const rows=await db().video.findMany({where:{status:'PUBLISHED'},orderBy:[{publishedAt:'desc'},{id:'desc'}],take:48,include:{asset:true,thumbnail:true}});
  return Promise.all(rows.map(async v=>({id:v.id,slug:v.slug,title:v.title,description:v.description,category:v.category,source:v.source,providerId:v.providerId,
    durationSeconds:v.durationSeconds,thumbnail:(await assetUrl(v.thumbnail))!,url:await assetUrl(v.asset)}))); });

export const getVideoBySlug=cache(async (slug:string):Promise<VideoView|null>=>{
 if(isDemo())return demoVideos.find(v=>v.slug===slug)??null;
 const v=await db().video.findFirst({where:{slug,status:'PUBLISHED'},include:{asset:true,thumbnail:true}});
 if(!v)return null;
 return {id:v.id,slug:v.slug,title:v.title,description:v.description,category:v.category,source:v.source,providerId:v.providerId,durationSeconds:v.durationSeconds,thumbnail:(await assetUrl(v.thumbnail))!,url:await assetUrl(v.asset)};
});
