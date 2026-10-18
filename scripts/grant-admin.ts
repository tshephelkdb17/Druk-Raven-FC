import 'dotenv/config';
import {PrismaClient} from '../src/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {z} from 'zod';
const userId=z.uuid().parse(process.argv[2]);
if(!process.env.DIRECT_URL)throw new Error('DIRECT_URL is required');
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DIRECT_URL})});
try{await prisma.admin.upsert({where:{userId},create:{userId},update:{}});console.log('Granted DRFC admin membership to supplied Supabase Auth UUID.')}finally{await prisma.$disconnect()}
