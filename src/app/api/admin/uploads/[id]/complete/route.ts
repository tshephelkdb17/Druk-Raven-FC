import {db} from '@/lib/db';
import {requireAdmin,apiError,HttpError} from '@/lib/auth';
import {hasMediaSignature} from '@/lib/validation';
import {storageAdmin,bucket} from '@/lib/supabase-server';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await requireAdmin(request),{id}=await params;
 const asset=await db().mediaAsset.findFirst({where:{id,createdBy:user.id}});
 if(!asset)throw new HttpError(404,'Upload not found');
 if(asset.state==='READY')return Response.json({assetId:id,state:'READY'});
 if(asset.state!=='PENDING')throw new HttpError(409,'Upload was rejected. Create a new upload.');
 const storage=storageAdmin().storage.from(bucket());
 const folder=asset.objectKey.substring(0,asset.objectKey.lastIndexOf('/')),filename=asset.objectKey.split('/').at(-1)!;
 const {data:files,error}=await storage.list(folder,{search:filename,limit:10});if(error)throw error;
 const file=files?.find(f=>f.name===filename);if(!file)throw new HttpError(409,'Upload has not finished');
 const validMetadata=Number(file.metadata?.size)===asset.bytes&&file.metadata?.mimetype===asset.mimeType;
 const {data:signed,error:signError}=await storage.createSignedUrl(asset.objectKey,60);if(signError||!signed)throw signError;
 const response=await fetch(signed.signedUrl,{headers:{Range:'bytes=0-511'},signal:AbortSignal.timeout(10000),cache:'no-store'});
 const reader=response.body?.getReader();const first=await reader?.read();await reader?.cancel();
 const valid=validMetadata&&response.ok&&first?.value&&hasMediaSignature(first.value,asset.mimeType);
 await db().mediaAsset.update({where:{id},data:{state:valid?'READY':'REJECTED'}});
 if(!valid){await storage.remove([asset.objectKey]);throw new HttpError(422,'File size, type or signature did not match. Upload an MP4, JPG, PNG or WebP.');}
 return Response.json({assetId:id,state:'READY'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return apiError(e)}}
