// Service Worker for Sumupper PWA
const CACHE_NAME = 'sumupper-v1';
const DYNAMIC_CACHE = 'sumupper-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/archive',
  '/manifest.json',
  '/styles/globals.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome extensions and other non-http(s) requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request)
      .then((cached) => {
        // Return cached version if available
        if (cached) {
          return cached;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cache the new response for future use
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/offline.html');
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Lesson Available';
  const options = {
    body: data.body || 'Check out the latest lesson',
    icon: '/icons/web-app-manifest-192x192.png',
    badge: '/icons/icon1.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'View Lesson',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-lessons') {
    event.waitUntil(syncLessons());
  }
});

async function syncLessons() {
  try {
    // Fetch latest lessons when back online
    const response = await fetch('/api/public/weeks?start=' + new Date().toISOString().split('T')[0]);
    const data = await response.json();
    
    // Update cache
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put('/api/public/weeks', new Response(JSON.stringify(data)));
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}