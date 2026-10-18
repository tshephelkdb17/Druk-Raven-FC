import test from 'node:test';
import assert from 'node:assert/strict';
import {matchInput} from '../src/lib/match-validation';
const base={opponent:'Annerley FC',kickoff:'2026-10-17T06:00:00Z',venue:'Brisbane',competition:'Friendly',season:'2026',home:true,finished:false,status:'DRAFT',goalsFor:null,goalsAgainst:null,contributions:[]};
const stat={playerId:'00000000-0000-4000-8000-000000000001',goals:1,assists:0};
test('fixtures cannot carry results; finished games need both scores',()=>{
 assert(matchInput.safeParse(base).success);
 assert(!matchInput.safeParse({...base,goalsFor:1}).success);
 assert(!matchInput.safeParse({...base,finished:true}).success);
 assert(!matchInput.safeParse({...base,contributions:[stat]}).success);
});
test('statistics reject duplicates, negative values and totals above the team score',()=>{
 const result={...base,finished:true,goalsFor:2,goalsAgainst:1,contributions:[stat]};
 assert(matchInput.safeParse(result).success);
 assert(!matchInput.safeParse({...result,contributions:[stat,stat]}).success);
 assert(!matchInput.safeParse({...result,contributions:[{...stat,goals:3}]}).success);
 assert(!matchInput.safeParse({...result,contributions:[{...stat,assists:-1}]}).success);
});
