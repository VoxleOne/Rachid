const CACHE_NAME = "rachid-alpha-v1";
const APP_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",
  "/icon.svg",
  "/src/app.js",
  "/src/demo.js",
  "/src/finance.js",
  "/locales/pt-BR.json",
  "/locales/en-US.json",
  "/locales/es-ES.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) =>
    cached ?? fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    })
  ));
});
