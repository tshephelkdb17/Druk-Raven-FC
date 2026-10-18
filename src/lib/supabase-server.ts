import 'server-only';
import {createClient} from '@supabase/supabase-js';
export const bucket = () => process.env.SUPABASE_MEDIA_BUCKET || 'drfc-media';
export function storageAdmin() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server storage is not configured');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function assetUrl(asset: {objectKey:string;state:string}|null):Promise<string|null> {
  if (!asset || asset.state!=='READY') return null;
  const {data,error}=await storageAdmin().storage.from(bucket()).createSignedUrl(asset.objectKey,900);
  if(error) throw error;
  return data.signedUrl;
}
