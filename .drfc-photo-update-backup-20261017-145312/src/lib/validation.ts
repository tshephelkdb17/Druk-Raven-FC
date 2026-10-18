import {z} from 'zod';
export const uploadInput=z.object({mimeType:z.enum(['video/mp4','image/jpeg','image/png','image/webp']),bytes:z.number().int().min(1).max(50*1024*1024)}).superRefine((v,c)=>{if(v.mimeType.startsWith('image/')&&v.bytes>10*1024*1024)c.addIssue({code:'custom',message:'Images must be 10 MB or smaller'})});
export function providerDetails(input:string):{source:'YOUTUBE'|'VIMEO';providerId:string}{
 const u=new URL(input);if(u.protocol!=='https:'||u.username||u.password||u.port)throw new Error('Use a supported HTTPS video link');
 const host=u.hostname.toLowerCase();
 if(['youtube.com','www.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)){
  const id=host==='youtu.be'?u.pathname.slice(1):u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.split('/')[2];
  if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id))return {source:'YOUTUBE',providerId:id};
 }
 if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)){
  const id=u.pathname.split('/').filter(Boolean).at(-1);if(id&&/^\d{1,12}$/.test(id))return {source:'VIMEO',providerId:id};
 }
 throw new Error('Use a YouTube or Vimeo video link');
}
export function embedUrl(source:string,id:string|null):string{
 if(source==='YOUTUBE'&&id&&/^[a-zA-Z0-9_-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;
 if(source==='VIMEO'&&id&&/^\d{1,12}$/.test(id))return `https://player.vimeo.com/video/${id}`;
 throw new Error('Invalid embed source');
}
export const videoInput=z.object({title:z.string().trim().min(3).max(140),description:z.string().trim().min(1).max(3000),category:z.enum(['HIGHLIGHTS','TRAINING','INTERVIEWS','CLUB']),durationSeconds:z.number().int().positive().max(86400),thumbnailId:z.uuid(),assetId:z.uuid().optional(),embedLink:z.string().max(2048).optional(),publish:z.boolean().default(false)}).superRefine((v,c)=>{
 if(Boolean(v.assetId)===Boolean(v.embedLink))c.addIssue({code:'custom',message:'Choose exactly one source: uploaded video OR embed link'});
 if(v.embedLink){try{providerDetails(v.embedLink)}catch{c.addIssue({code:'custom',message:'Only valid YouTube or Vimeo HTTPS links are supported'})}}
});
export const galleryInput=z.object({photos:z.array(z.object({assetId:z.uuid(),alt:z.string().trim().min(3).max(200),caption:z.string().trim().max(300)})).length(3)}).refine(v=>new Set(v.photos.map(p=>p.assetId)).size===3,'Three distinct gallery images are required');
export function hasMediaSignature(bytes:Uint8Array,mime:string){
 if(mime==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==='image/png')return [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const text=new TextDecoder('ascii');
 if(mime==='image/webp')return text.decode(bytes.slice(0,4))==='RIFF'&&text.decode(bytes.slice(8,12))==='WEBP';
 if(mime==='video/mp4')return text.decode(bytes.slice(4,8))==='ftyp';
 return false;
}
