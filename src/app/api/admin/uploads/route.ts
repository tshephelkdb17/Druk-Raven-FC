import {randomUUID} from 'node:crypto';
import {db} from '@/lib/db';
import {requireAdmin,jsonBody,apiError} from '@/lib/auth';
import {uploadInput} from '@/lib/validation';
import {storageAdmin,bucket} from '@/lib/supabase-server';
export const runtime='nodejs';
export async function POST(request:Request){try{
 const user=await requireAdmin(request),input=uploadInput.parse(await jsonBody(request));
 const ext=({'video/mp4':'mp4','image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as const)[input.mimeType];
 const objectKey=`${user.id}/${randomUUID()}.${ext}`;
 const {data,error}=await storageAdmin().storage.from(bucket()).createSignedUploadUrl(objectKey,{upsert:false});
 if(error)throw error;
 const asset=await db().mediaAsset.create({data:{objectKey,mimeType:input.mimeType,bytes:input.bytes,createdBy:user.id}});
 return Response.json({assetId:asset.id,path:objectKey,token:data.token,bucket:bucket()},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(e){return apiError(e)}}
