import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {db,isDemo} from './db';
import {ZodError} from 'zod';
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export async function requireAdmin(request:Request){
 if(isDemo())throw new HttpError(503,'Admin writes are disabled in design preview. Configure database mode first.');
 const configured=process.env.APP_ORIGIN;if(!configured)throw new HttpError(503,'APP_ORIGIN is not configured');
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(configured).origin)throw new HttpError(403,'Origin not allowed');
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)throw new HttpError(401,'Sign in to continue');
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new HttpError(503,'Authentication is not configured');
 const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await supabase.auth.getUser(token);
 if(error||!data.user)throw new HttpError(401,'Session expired. Sign in again.');
 const admin=await db().admin.findUnique({where:{userId:data.user.id}});
 if(!admin)throw new HttpError(403,'Club administrator access required');
 return data.user;
}
export async function jsonBody(request:Request){
 const text=await request.text();if(text.length>65536)throw new HttpError(413,'Metadata is too large');
 try{return JSON.parse(text)}catch{throw new HttpError(400,'Invalid JSON')}
}
export function apiError(error:unknown){
 if(error instanceof HttpError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});
 if(error instanceof ZodError)return Response.json({error:error.issues.map(i=>i.message).join('; ')},{status:400});
 console.error('DRFC request failed',error instanceof Error?error.name:'unknown');
 return Response.json({error:'The request could not be completed. Please try again.'},{status:500});
}
