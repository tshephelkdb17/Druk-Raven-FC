import {db} from '@/lib/db';
import {requireAdmin,jsonBody,apiError,HttpError} from '@/lib/auth';
import {matchInput} from '@/lib/match-validation';
export async function GET(request:Request){try{
 await requireAdmin(request);
 const [matches,players]=await Promise.all([
  db().match.findMany({orderBy:{kickoff:'desc'},take:500,include:{contributions:true}}),
  db().player.findMany({orderBy:{number:'asc'},take:100,select:{id:true,name:true,number:true}})
 ]);
 return Response.json({matches,players},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiError(e)}}
export async function POST(request:Request){try{
 await requireAdmin(request);
 const {id,contributions,...data}=matchInput.parse(await jsonBody(request));
 const result=await db().$transaction(async tx=>{
  if(id){
   const rows=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM club."Match" WHERE id = ${id}::uuid FOR UPDATE`;
   if(!rows.length)throw new HttpError(404,'Match no longer exists. Refresh the list.');
  }
  const count=await tx.player.count({where:{id:{in:contributions.map(s=>s.playerId)}}});
  if(count!==contributions.length)throw new HttpError(422,'A selected player no longer exists. Reload and try again.');
  const match=id?await tx.match.update({where:{id},data}):await tx.match.create({data});
  await tx.playerMatchStat.deleteMany({where:{matchId:match.id}});
  if(contributions.length)await tx.playerMatchStat.createMany({data:contributions.map(s=>({...s,matchId:match.id}))});
  return {...match, contributions};
 });
 return Response.json(result,{status:id?200:201});
}catch(e){return apiError(e)}}
