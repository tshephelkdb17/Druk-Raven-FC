import {db} from '@/lib/db';
import {requireAdmin,apiError,HttpError} from '@/lib/auth';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await requireAdmin(request);const {id}=await params;
 await db().$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM club."Player" WHERE id=${id}::uuid FOR UPDATE`;
  const p=await tx.player.findUnique({where:{id},include:{portrait:true,gallery:{include:{asset:true}}}});
  if(!p)throw new HttpError(404,'Player not found');
  if((p.portrait&&(p.portrait.state!=='READY'||!p.portrait.mimeType.startsWith('image/')))||p.gallery.length>3||p.gallery.some(g=>g.asset.state!=='READY'||!g.asset.mimeType.startsWith('image/')||g.assetId===p.portraitId))throw new HttpError(422,'Any supplied photos must be ready images; gallery photos must differ from the portrait');
  await tx.player.update({where:{id},data:{status:'PUBLISHED'}});
 });return Response.json({published:true});
 }catch(e){return apiError(e)}}
