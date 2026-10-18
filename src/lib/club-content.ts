import 'server-only';
import {db,isDemo} from '@/lib/db';
import {assetUrl} from '@/lib/supabase-server';
export async function publishedContent(kind:'NEWS'|'HOME',slug?:string){
 if(isDemo())return [];
 const rows=await db().clubContent.findMany({where:{kind,status:'PUBLISHED',...(slug?{slug}:{})},orderBy:{createdAt:'desc'},take:kind==='HOME'?1:60,include:{image:true,video:true}});
 return Promise.all(rows.map(async ({image,video,...p})=>({...p,imageUrl:await assetUrl(image),videoUrl:await assetUrl(video)})));
}
