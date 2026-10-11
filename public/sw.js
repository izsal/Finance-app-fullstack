// Service Worker for Qwarts Finance PWA
const CACHE_NAME = 'qwarts-finance-v1'

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon.png',
]

// Install event: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed during install:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event: network-first for pages and API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin or non-GET requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return
  }

  // Skip internal auth, API mutate routes, or Next.js development hot-reload
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/_next/webpack-hmr')) {
    return
  }

  // Static files: Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache))
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
    return
  }

  // Navigation / HTML pages: Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/'))
        })
    )
  }
})
