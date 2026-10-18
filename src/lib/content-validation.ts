import {z} from 'zod';
const slug=z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase letters, numbers and hyphens for the page address');
const status=z.enum(['DRAFT','PUBLISHED']);
const media=z.uuid().nullable().default(null);
const common={id:z.uuid().optional(),slug,name:z.string().trim().min(2).max(100),biography:z.string().trim().max(5000).default(''),portraitId:media,status};
export const playerContentInput=z.object({...common,number:z.number().int().min(1).max(99),position:z.enum(['GOALKEEPER','DEFENDER','MIDFIELDER','FORWARD']),nationality:z.string().trim().max(80).nullable().default(null),heightCm:z.number().int().min(80).max(250).nullable().default(null),gallery:z.array(z.object({assetId:z.uuid(),alt:z.string().trim().min(3).max(200),caption:z.string().trim().max(300).default('')})).max(3).default([])}).superRefine((p,c)=>{
 if(new Set(p.gallery.map(g=>g.assetId)).size!==p.gallery.length)c.addIssue({code:'custom',message:'Choose different gallery photos'});
 if(p.gallery.some(g=>g.assetId===p.portraitId))c.addIssue({code:'custom',message:'Gallery photos must differ from the main portrait'});
});
export const staffContentInput=z.object({...common,role:z.string().trim().min(2).max(100),group:z.enum(['EXECUTIVE','COACHING','MEDICAL','KIT']),sortOrder:z.number().int().min(0).max(1000).default(0)});
export const articleContentInput=z.object({id:z.uuid().optional(),slug,title:z.string().trim().min(3).max(140),summary:z.string().trim().max(500).default(''),body:z.string().trim().max(15000).default(''),imageId:media,videoId:media,status}).superRefine((p,c)=>{
 if(p.status==='PUBLISHED'&&!p.body)c.addIssue({code:'custom',message:'Add the article or homepage story before publishing'});
});
export const contentKind=z.enum(['players','staff','news','homepage']);
