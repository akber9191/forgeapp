
// Version-controlled cache name with timestamp for automatic updates
const CACHE_VERSION = '1.2.0';
const CACHE_NAME = `forge-v${CACHE_VERSION}-${new Date().getTime()}`;
const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;

// Critical resources to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Network timeout for network-first strategy
const NETWORK_TIMEOUT = 3000;

// Install event - cache critical resources immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(urlsToCache);
      }),
      caches.open(RUNTIME_CACHE)
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Don't auto-skip waiting - let the user decide when to update
      // self.skipWaiting() will be called via message from PWAInstall component
    }).catch((error) => {
      console.error('Service Worker: Installation failed:', error);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        // Delete old caches
        ...cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
        // Take control of all clients immediately
        self.clients.claim()
      ]);
    }).then(() => {
      console.log('Service Worker: Activation complete');
      // Notify clients about the update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// Network-first strategy with cache fallback
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    // Try network first with timeout
    const networkResponse = await Promise.race([
      fetch(request.clone()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', error);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request, return the cached root
    if (request.mode === 'navigate') {
      const rootCache = await caches.open(STATIC_CACHE);
      return rootCache.match('/') || new Response('App offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to fetch:', request.url, error);
    throw error;
  }
}

// Fetch event - route requests based on type
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Use cache-first for static assets (JS, CSS, images)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Use network-first for API calls and HTML pages
  event.respondWith(networkFirstStrategy(event.request));
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'SW_VERSION',
      version: CACHE_VERSION
    });
  }
});
