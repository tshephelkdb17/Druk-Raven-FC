import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('content migration preserves existing records and enforces homepage uniqueness and media references',async()=>{
 const pg=new PGlite();
 try{
 for(const name of ['202610160001_initial','202610160002_invariants','202610170001_optional_player_photos'])await pg.exec(await readFile(`prisma/migrations/${name}/migration.sql`,'utf8'));
 await pg.exec(`INSERT INTO club."Player" (id,slug,name,number,position,"updatedAt") VALUES ('00000000-0000-4000-8000-000000000001','existing-player','Existing Player',8,'MIDFIELDER',NOW())`);
 await pg.exec(await readFile('prisma/migrations/202610180001_club_content/migration.sql','utf8'));
 assert.equal((await pg.query('SELECT * FROM club."Player"')).rows.length,1);
 await pg.exec(`INSERT INTO club."ClubContent" (id,kind,slug,title,"updatedAt") VALUES ('00000000-0000-4000-8000-000000000002','HOME','homepage','New home',NOW())`);
 assert.equal((await pg.query(`SELECT * FROM club."ClubContent" WHERE status='PUBLISHED'`)).rows.length,0);
 await pg.exec(`UPDATE club."ClubContent" SET status='PUBLISHED'`);
 assert.equal((await pg.query(`SELECT * FROM club."ClubContent" WHERE status='PUBLISHED'`)).rows.length,1);
 await assert.rejects(pg.exec(`INSERT INTO club."ClubContent" (id,kind,slug,title,"updatedAt") VALUES ('00000000-0000-4000-8000-000000000003','HOME','homepage','Duplicate',NOW())`));
 await assert.rejects(pg.exec(`UPDATE club."ClubContent" SET "imageId"='00000000-0000-4000-8000-000000000099'`));
 }finally{await pg.close()}
});
