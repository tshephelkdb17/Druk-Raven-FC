import {randomUUID} from 'node:crypto';
import {db} from '@/lib/db';
import {requireAdmin,jsonBody,apiError,HttpError} from '@/lib/auth';
import {providerDetails,videoInput} from '@/lib/validation';
export const runtime='nodejs';
export async function GET(request:Request){try{await requireAdmin(request);const videos=await db().video.findMany({take:50,orderBy:{createdAt:'desc'},select:{id:true,title:true,status:true,slug:true,category:true}});return Response.json({videos},{headers:{'Cache-Control':'no-store'}})}catch(e){return apiError(e)}}
export async function POST(request:Request){try{
 const user=await requireAdmin(request),input=videoInput.parse(await jsonBody(request));
 const assets=await db().mediaAsset.findMany({where:{id:{in:[input.thumbnailId,...(input.assetId?[input.assetId]:[])]},state:'READY'}});
 if(!assets.some(a=>a.id===input.thumbnailId&&a.mimeType.startsWith('image/')))throw new HttpError(422,'A completed image upload is required for the thumbnail');
 if(input.assetId&&!assets.some(a=>a.id===input.assetId&&a.mimeType==='video/mp4'))throw new HttpError(422,'A completed MP4 upload is required');
 const provider=input.embedLink?providerDetails(input.embedLink):{source:'UPLOAD' as const,providerId:null};
 const slug=`${input.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'film'}-${randomUUID().slice(0,8)}`;
 const video=await db().video.create({data:{slug,title:input.title,description:input.description,category:input.category,durationSeconds:input.durationSeconds,thumbnailId:input.thumbnailId,assetId:input.assetId??null,...provider,createdBy:user.id,status:input.publish?'PUBLISHED':'DRAFT',publishedAt:input.publish?new Date():null}});
 return Response.json({id:video.id,slug:video.slug,status:video.status},{status:201});
 }catch(e){return apiError(e)}}
