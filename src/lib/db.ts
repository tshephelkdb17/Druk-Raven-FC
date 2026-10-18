import 'server-only';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const globalDb = globalThis as unknown as { drfc?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in database mode');
  return globalDb.drfc ??= new PrismaClient({ adapter: new PrismaPg({connectionString:process.env.DATABASE_URL,max:5}) });
}
export const isDemo = () => process.env.DATA_MODE !== 'database';
