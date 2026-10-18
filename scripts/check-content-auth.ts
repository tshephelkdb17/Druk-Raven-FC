import assert from 'node:assert/strict';
import {GET,POST} from '../src/app/api/admin/content/[kind]/route';
process.env.DATA_MODE='database';process.env.APP_ORIGIN='http://localhost:3000';
for(const kind of ['players','staff','news','homepage']){
 const ctx={params:Promise.resolve({kind})};
 assert.equal((await GET(new Request(`http://localhost:3000/api/admin/content/${kind}`),ctx)).status,401);
 assert.equal((await POST(new Request(`http://localhost:3000/api/admin/content/${kind}`,{method:'POST',body:'{}'}),ctx)).status,401);
 assert.equal((await POST(new Request(`http://localhost:3000/api/admin/content/${kind}`,{method:'POST',headers:{origin:'https://other.example'},body:'{}'}),ctx)).status,403);
}
console.log('Content endpoints reject unsigned and cross-origin requests.');
