// Enhanced Service Worker for Islamic Dataset Interface PWA
// Advanced caching strategies, background sync, and performance optimization

const VERSION = "v2.2.0";
const CACHE_NAME = `islamic-dataset-${VERSION}`;
const STATIC_CACHE = `islamic-dataset-static-${VERSION}`;
const DYNAMIC_CACHE = `islamic-dataset-dynamic-${VERSION}`;
const IMAGE_CACHE = `islamic-dataset-images-${VERSION}`;
const API_CACHE = `islamic-dataset-api-${VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Files to cache immediately (critical resources)
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/src/assets/media-5000790.svg",
  "/src/styles/critical.css",
];

// Route-based caching rules
const CACHE_RULES = [
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  {
    pattern: /\.(?:js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: STATIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 50,
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 30,
  },
  {
    pattern: /\/$/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 20,
  },
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log(`Service Worker ${VERSION}: Installing...`);

  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      }),
      // Initialize other caches
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE),
      caches.open(DYNAMIC_CACHE),
    ])
      .then(() => {
        console.log("Service Worker: Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`Service Worker ${VERSION}: Activating...`);

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.includes("islamic-dataset") &&
              !cacheName.includes(VERSION)
            ) {
              console.log(`Service Worker: Deleting old cache ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ])
      .then(() => {
        console.log("Service Worker: Activation complete");
      })
      .catch((error) => {
        console.error("Service Worker: Activation failed", error);
      })
  );
});

// Enhanced fetch event with multiple caching strategies
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);

  // Find matching cache rule
  const rule = CACHE_RULES.find((rule) => rule.pattern.test(url.pathname));

  if (rule) {
    event.respondWith(handleRequest(event.request, rule));
  } else {
    // Default strategy for unmatched routes
    event.respondWith(
      handleRequest(event.request, {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cache: DYNAMIC_CACHE,
        maxAge: 24 * 60 * 60 * 1000,
        maxEntries: 20,
      })
    );
  }
});

// Handle requests based on caching strategy
async function handleRequest(request, rule) {
  switch (rule.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, rule);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, rule);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, rule);
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    default:
      return networkFirst(request, rule);
  }
}

// Cache First Strategy
async function cacheFirst(request, rule) {
  const cache = await caches.open(rule.cache);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse, rule.maxAge)) {
    console.log(`Cache hit: ${request.url}`);
    return cachedResponse;
  }

  try {
    console.log(`Cache miss, fetching: ${request.url}`);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone before caching
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      await cleanupCache(rule.cache, rule.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log(`Network failed, serving cached version: ${request.url}`);
    // Return cached version even if expired
    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request, rule) {
  try {
    console.log(`Network first: ${request.url}`);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(rule.cache);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      await cleanupCache(rule.cache, rule.maxEntries);
    }

    return networkResponse;
  } catch (error) {
    console.log(`Network failed, checking cache: ${request.url}`);
    const cache = await caches.open(rule.cache);
    const cachedResponse = await cache.match(request);

    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, rule) {
  const cache = await caches.open(rule.cache);
  const cachedResponse = await cache.match(request);

  // Always try to fetch in background
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
        await cleanupCache(rule.cache, rule.maxEntries);
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, that's okay for this strategy
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    console.log(`Serving cached, updating in background: ${request.url}`);
    return cachedResponse;
  }

  // No cached version, wait for network
  console.log(`No cache, waiting for network: ${request.url}`);
  return fetchPromise;
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get("date");
  if (!dateHeader) return false;

  const cacheDate = new Date(dateHeader);
  const now = new Date();

  return now.getTime() - cacheDate.getTime() > maxAge;
}

// Clean up cache to respect maxEntries
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
    console.log(`Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
  }
}

// Background Sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Sync any pending data
    console.log("Performing background sync...");

    // Example: Sync favorites, user data, etc.
    const pendingRequests = await getPendingRequests();

    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
        console.log("Synced:", request.url);
      } catch (error) {
        console.error("Sync failed for:", request.url, error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Utility functions for background sync
async function getPendingRequests() {
  // Implementation would depend on how you store pending requests
  // Could use IndexedDB or localStorage
  return [];
}

async function removePendingRequest(id) {
  // Remove synced request from storage
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_CACHE_STATS") {
    getCacheStats().then((stats) => {
      event.ports[0].postMessage(stats);
    });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Get cache statistics
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};

  for (const cacheName of cacheNames) {
    if (cacheName.includes("islamic-dataset")) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = keys.length;
    }
  }

  return stats;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName.includes("islamic-dataset")) {
        return caches.delete(cacheName);
      }
    })
  );
}

// Performance monitoring
self.addEventListener("fetch", (event) => {
  // Performance timing
  const startTime = performance.now();

  event.respondWith(
    handleRequest(event.request, findCacheRule(event.request)).then(
      (response) => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log slow responses
        if (duration > 1000) {
          console.warn(
            `Slow response (${duration.toFixed(2)}ms):`,
            event.request.url
          );
        }

        return response;
      }
    )
  );
});

// Find cache rule for request
function findCacheRule(request) {
  const url = new URL(request.url);
  return (
    CACHE_RULES.find((rule) => rule.pattern.test(url.pathname)) || {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      cache: DYNAMIC_CACHE,
      maxAge: 24 * 60 * 60 * 1000,
      maxEntries: 20,
    }
  );
}

// Handle SKIP_WAITING message from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Normal activation without aggressive claiming
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Only delete caches that don't match current version
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !name.includes(VERSION))
          .map((name) => {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          })
      );
      console.log("SW activated");
    })()
  );
});

console.log(
  `Enhanced Service Worker ${VERSION} loaded with advanced caching strategies`
);
