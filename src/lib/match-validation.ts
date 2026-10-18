import {z} from 'zod';
export const matchInput=z.object({
 id:z.uuid().optional(),opponent:z.string().trim().min(2).max(100),
 kickoff:z.iso.datetime({offset:true}),venue:z.string().trim().min(1).max(200),
 competition:z.string().trim().min(1).max(100),season:z.string().trim().min(1).max(20),
 home:z.boolean(),finished:z.boolean(),status:z.enum(['DRAFT','PUBLISHED']),
 goalsFor:z.number().int().min(0).max(100).nullable(),goalsAgainst:z.number().int().min(0).max(100).nullable(),
 contributions:z.array(z.object({playerId:z.uuid(),goals:z.number().int().min(0).max(100),assists:z.number().int().min(0).max(100)})).max(100),
}).superRefine((v,c)=>{
 const error=(message:string)=>c.addIssue({code:'custom',message});
 if(new Set(v.contributions.map(s=>s.playerId)).size!==v.contributions.length)error('Each player can appear only once.');
 if(v.finished&&(v.goalsFor===null||v.goalsAgainst===null))error('Enter both scores for a finished match.');
 if(!v.finished&&(v.goalsFor!==null||v.goalsAgainst!==null||v.contributions.length))error('Only finished matches can have scores or player statistics.');
 if(v.finished&&v.goalsFor!==null&&(v.contributions.reduce((n,s)=>n+s.goals,0)>v.goalsFor||v.contributions.reduce((n,s)=>n+s.assists,0)>v.goalsFor))error('Player goals and assists cannot exceed DRFC goals.');
});
