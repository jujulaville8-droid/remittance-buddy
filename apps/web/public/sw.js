// Minimal service worker — required for PWA installability on Chrome/Android.
// Network-first with a tiny offline shell so the app icon isn't dead offline.
// Not a caching strategy — add one when you actually want offline reads.

const CACHE = 'rb-shell-v1'
const SHELL = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/')))
  )
})
