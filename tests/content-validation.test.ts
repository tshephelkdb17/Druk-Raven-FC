import test from 'node:test';
import assert from 'node:assert/strict';
import {playerContentInput,staffContentInput,articleContentInput} from '../src/lib/content-validation';
const id='00000000-0000-4000-8000-000000000001';
const player={name:'Test Player',slug:'test-player',number:8,position:'MIDFIELDER',status:'PUBLISHED'};
test('profile supports optional photos but rejects duplicate or portrait gallery assets',()=>{
 assert(playerContentInput.safeParse(player).success);
 const photo={assetId:id,alt:'Player action'};
 assert(!playerContentInput.safeParse({...player,portraitId:id,gallery:[photo]}).success);
 assert(!playerContentInput.safeParse({...player,gallery:[photo,photo]}).success);
 assert(!playerContentInput.safeParse({...player,number:0}).success);
});
test('publication requires article content and a safe slug; staff requires role and group',()=>{
 const article={slug:'club-news',title:'Club news',status:'DRAFT'};
 assert(articleContentInput.safeParse(article).success);
 assert(!articleContentInput.safeParse({...article,status:'PUBLISHED'}).success);
 assert(articleContentInput.safeParse({...article,status:'PUBLISHED',body:'Our club update'}).success);
 assert(!articleContentInput.safeParse({...article,slug:'../admin'}).success);
 assert(!staffContentInput.safeParse({name:'Coach',slug:'coach',status:'PUBLISHED'}).success);
});
