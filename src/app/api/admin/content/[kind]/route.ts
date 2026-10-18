import {db} from '@/lib/db';
import {requireAdmin,jsonBody,apiError,HttpError} from '@/lib/auth';
import {assetUrl} from '@/lib/supabase-server';
import {contentKind,playerContentInput,staffContentInput,articleContentInput} from '@/lib/content-validation';
export const runtime='nodejs';
type Context={params:Promise<{kind:string}>};
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request,{params}:Context){try{
 await requireAdmin(request);
 const kind=contentKind.parse((await params).kind);
 if(kind==='players'){
  const rows=await db().player.findMany({orderBy:{number:'asc'},take:200,include:{portrait:true,gallery:{include:{asset:true},orderBy:{slot:'asc'}}}});
  return Response.json({items:await Promise.all(rows.map(async ({portrait,gallery,...p})=>({...p,imageUrl:await assetUrl(portrait),gallery:await Promise.all(gallery.map(async ({asset,...g})=>({...g,url:await assetUrl(asset)})))})))},{headers});
 }
 if(kind==='staff'){
  const rows=await db().staff.findMany({orderBy:[{sortOrder:'asc'},{name:'asc'}],take:200,include:{portrait:true}});
  return Response.json({items:await Promise.all(rows.map(async ({portrait,...p})=>({...p,imageUrl:await assetUrl(portrait)})))},{headers});
 }
 const rows=await db().clubContent.findMany({where:{kind:kind==='news'?'NEWS':'HOME'},orderBy:{updatedAt:'desc'},take:200,include:{image:true,video:true}});
 return Response.json({items:await Promise.all(rows.map(async ({image,video,...p})=>({...p,imageUrl:await assetUrl(image),videoUrl:await assetUrl(video)})))},{headers});
 }catch(e){return apiError(e)}}
export async function POST(request:Request,{params}:Context){try{
 await requireAdmin(request);
 const kind=contentKind.parse((await params).kind),body=await jsonBody(request);
 const result=await db().$transaction(async tx=>{
  async function checkImage(id:string|null){if(id&&!await tx.mediaAsset.findFirst({where:{id,state:'READY',mimeType:{startsWith:'image/'}}}))throw new HttpError(422,'Complete the image upload before saving');}
  if(kind==='players'){
   const {id,gallery,...data}=playerContentInput.parse(body);
   if(id){const rows=await tx.$queryRaw<{id:string}[]>`SELECT id FROM club."Player" WHERE id=${id}::uuid FOR UPDATE`;if(!rows.length)throw new HttpError(404,'Player not found');}
   await checkImage(data.portraitId);
   for(const photo of gallery)await checkImage(photo.assetId);
   const saved=id?await tx.player.update({where:{id},data}):await tx.player.create({data});
   await tx.playerGalleryImage.deleteMany({where:{playerId:saved.id}});
   if(gallery.length)await tx.playerGalleryImage.createMany({data:gallery.map((g,i)=>({...g,playerId:saved.id,slot:(['ONE','TWO','THREE'] as const)[i]}))});
   return saved;
  }
  if(kind==='staff'){
   const {id,...data}=staffContentInput.parse(body);await checkImage(data.portraitId);
   return id?tx.staff.update({where:{id},data}):tx.staff.create({data});
  }
  const {id,...data}=articleContentInput.parse(body);await checkImage(data.imageId);
  if(kind==='news'&&data.videoId)throw new HttpError(422,'Use DRFC TV for news videos');
  if(data.videoId&&!await tx.mediaAsset.findFirst({where:{id:data.videoId,state:'READY',mimeType:'video/mp4'}}))throw new HttpError(422,'Complete the MP4 upload before saving');
  const entryKind=kind==='news'?'NEWS':'HOME';
  const content={...data,kind:entryKind,slug:entryKind==='HOME'?'homepage':data.slug};
  if(id){const existing=await tx.clubContent.findFirst({where:{id,kind:entryKind}});if(!existing)throw new HttpError(404,'Content not found');return tx.clubContent.update({where:{id},data:content});}
  return tx.clubContent.create({data:content});
 });
 return Response.json({id:result.id,status:result.status},{headers});
 }catch(e){
  const code=(e as {code?:string})?.code;
  if(code==='P2002')return Response.json({error:'That page address or shirt number is already used. Choose a different one.'},{status:409,headers});
  if(code==='P2025')return Response.json({error:'This record no longer exists. Reload the list.'},{status:404,headers});
  return apiError(e);
 }}
