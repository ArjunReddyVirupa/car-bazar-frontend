const CACHE_NAME = "car-bazar-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  // Don't interfere with API requests.
  if (event.request.url.includes("/api/")) {
    return;
  }
});
