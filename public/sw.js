const CACHE='drfc-shell-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/offline.html','/icon.svg'])));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('drfc-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
// Do not persist admin pages, API responses, tokens, private media or stale rosters.
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.mode==='navigate'&&url.origin===self.location.origin&&!url.pathname.startsWith('/admin')&&!url.pathname.startsWith('/api'))event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')))});
