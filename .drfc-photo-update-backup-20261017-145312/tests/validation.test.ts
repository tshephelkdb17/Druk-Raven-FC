import test from 'node:test';
import assert from 'node:assert/strict';
import {providerDetails,embedUrl,galleryInput,videoInput,uploadInput,hasMediaSignature} from '../src/lib/validation';
const ids=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003'];
test('gallery requires exactly three distinct assets',()=>{
 const photos=ids.map(assetId=>({assetId,alt:'Player action',caption:''}));
 assert(galleryInput.safeParse({photos}).success);
 assert(!galleryInput.safeParse({photos:photos.slice(0,2)}).success);
 assert(!galleryInput.safeParse({photos:[...photos,photos[0]]}).success);
 assert(!galleryInput.safeParse({photos:[photos[0],photos[0],photos[2]]}).success);
});
test('embed sources are canonical allowlisted providers, never arbitrary HTML',()=>{
 assert.deepEqual(providerDetails('https://youtu.be/abcdefghijk'),{source:'YOUTUBE',providerId:'abcdefghijk'});
 assert.equal(embedUrl('VIMEO','12345'),'https://player.vimeo.com/video/12345');
 for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=abcdefghijk','http://youtube.com/watch?v=abcdefghijk','https://evil.test/embed/123'])assert.throws(()=>providerDetails(url));
});
test('video requires one source and checked metadata',()=>{
 const base={title:'Club film',description:'Description',durationSeconds:13,category:'CLUB',thumbnailId:ids[0]};
 assert(!videoInput.safeParse(base).success);
 assert(videoInput.safeParse({...base,assetId:ids[1]}).success);
 assert(!videoInput.safeParse({...base,assetId:ids[1],embedLink:'https://youtu.be/abcdefghijk'}).success);
 assert(!uploadInput.safeParse({mimeType:'image/svg+xml',bytes:100}).success);
 assert(!uploadInput.safeParse({mimeType:'video/mp4',bytes:52428801}).success);
 assert(!hasMediaSignature(new TextEncoder().encode('<script>alert(1)</script>'),'video/mp4'));
 assert(hasMediaSignature(new Uint8Array([0,0,0,24,102,116,121,112]),'video/mp4'));
});
