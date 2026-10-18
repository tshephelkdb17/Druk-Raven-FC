import {db} from '@/lib/db';
import {requireAdmin,jsonBody,apiError,HttpError} from '@/lib/auth';
import {galleryInput} from '@/lib/validation';
export const runtime='nodejs';
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await requireAdmin(request);const {id}=await params,input=galleryInput.parse(await jsonBody(request));
 await db().$transaction(async tx=>{
  // Serialize edits/publication for this player before replacing the three slots.
  const rows=await tx.$queryRaw<{id:string}[]>`SELECT id FROM club."Player" WHERE id=${id}::uuid FOR UPDATE`;
  if(!rows.length)throw new HttpError(404,'Player not found');
  const player=await tx.player.findUniqueOrThrow({where:{id}});
  if(input.photos.some(p=>p.assetId===player.portraitId))throw new HttpError(422,'Gallery photos must be additional to the primary portrait');
  const assets=await tx.mediaAsset.findMany({where:{id:{in:input.photos.map(p=>p.assetId)},state:'READY',mimeType:{startsWith:'image/'}}});
  if(assets.length!==3)throw new HttpError(422,'Three completed image uploads are required');
  await tx.playerGalleryImage.deleteMany({where:{playerId:id}});
  await tx.playerGalleryImage.createMany({data:input.photos.map((p,i)=>({...p,playerId:id,slot:(['ONE','TWO','THREE'] as const)[i]}))});
 });return Response.json({saved:true,count:3});
 }catch(e){return apiError(e)}}
