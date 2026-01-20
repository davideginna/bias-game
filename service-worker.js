/**
 * Service Worker for Bias PWA
 * Enables offline functionality and app installation
 */

const CACHE_NAME = 'bias-v1.2.1';
const STATIC_CACHE = 'bias-static-v1.2.1';
const DYNAMIC_CACHE = 'bias-dynamic-v1.2.1';

// Files to cache for offline use
const STATIC_FILES = [
  './',
  './index.html',
  './css/main.css',
  './css/mobile.css',
  './js/main.js',
  './js/config.js',
  './js/modules/firebase-manager.js',
  './js/modules/room-manager.js',
  './js/modules/card-manager.js',
  './js/modules/game-logic.js',
  './js/modules/ui-controller.js',
  './js/modules/audio-manager.js',
  './data/dilemmas.json',
  './image/logo.png',
  './image/favicon.ico',
  './image/favicon-32x32.png',
  './image/favicon-16x16.png',
  './image/apple-touch-icon.png',
  './manifest.json',
  './firebase-var.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Firebase Realtime Database requests (always need network)
  if (url.hostname.includes('firebasedatabase.app')) {
    return;
  }

  // Skip Firebase Auth and other dynamic Firebase services
  if (url.hostname.includes('firebase') && !url.pathname.includes('.js')) {
    return;
  }

  // Cache-first strategy for static files
  if (STATIC_FILES.some(file => url.pathname.endsWith(file) || url.pathname === file)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              return caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
                });
            });
        })
        .catch(() => {
          // Return offline page if available
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
    );
    return;
  }

  // Network-first strategy for Firebase scripts and other external resources
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
  );
});

// Message event - for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
