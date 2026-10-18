import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('PostgreSQL enforces exact-three publication, slot uniqueness and transactional replacement',async()=>{
 const db=new PGlite();
 try {
  await db.exec(await readFile('prisma/migrations/202610160001_initial/migration.sql','utf8'));
  await db.exec(await readFile('prisma/migrations/202610160002_invariants/migration.sql','utf8'));
  const player='00000000-0000-4000-8000-000000000010',owner='00000000-0000-4000-8000-000000000099';
  const ids=Array.from({length:5},(_,i)=>`00000000-0000-4000-8000-00000000000${i+1}`);
  for(const [i,id] of ids.entries())await db.query(`INSERT INTO club."MediaAsset" (id,"objectKey","mimeType",bytes,state,"createdBy") VALUES ($1,$2,'image/jpeg',100,'READY',$3)`,[id,`file-${i}.jpg`,owner]);
  await db.query(`INSERT INTO club."Player" (id,slug,name,number,position,"portraitId","updatedAt") VALUES ($1,'player','Player',17,'FORWARD',$2,now())`,[player,ids[0]]);
  await assert.rejects(db.query(`UPDATE club."Player" SET status='PUBLISHED' WHERE id=$1`,[player]),/exactly three/);
  for(const [i,slot] of ['ONE','TWO','THREE'].entries())await db.query(`INSERT INTO club."PlayerGalleryImage" (id,"playerId","assetId",slot,alt) VALUES ($1,$2,$3,$4,'Action')`,[`00000000-0000-4000-8000-00000000002${i}`,player,ids[i+1],slot]);
  await db.query(`UPDATE club."Player" SET status='PUBLISHED' WHERE id=$1`,[player]);
  await assert.rejects(db.query(`DELETE FROM club."PlayerGalleryImage" WHERE "playerId"=$1 AND slot='ONE'`,[player]),/exactly three/);
  await assert.rejects(db.query(`INSERT INTO club."PlayerGalleryImage" (id,"playerId","assetId",slot,alt) VALUES ('00000000-0000-4000-8000-000000000030',$1,$2,'ONE','Action')`,[player,ids[4]]),/unique/);
  await db.transaction(async tx=>{
   await tx.query(`DELETE FROM club."PlayerGalleryImage" WHERE "playerId"=$1 AND slot='ONE'`,[player]);
   await tx.query(`INSERT INTO club."PlayerGalleryImage" (id,"playerId","assetId",slot,alt) VALUES ('00000000-0000-4000-8000-000000000030',$1,$2,'ONE','New action')`,[player,ids[4]]);
  });
  const result=await db.query<{count:number}>(`SELECT count(*)::int AS count FROM club."PlayerGalleryImage" WHERE "playerId"=$1`,[player]);assert.equal(result.rows[0].count,3);
  await assert.rejects(db.query(`UPDATE club."PlayerGalleryImage" SET "assetId"=$1 WHERE "playerId"=$2 AND slot='ONE'`,[ids[0],player]),/additional/);
 }finally{await db.close()}
});
