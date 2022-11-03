// (A) FILES TO CACHE
const cName = "js-notice",
cFiles = [
  // (A1) STATIC FILES
  "notice-board.html",
  "notice-board.css",
  "notice-board.js",

  // (A2) IMAGES
  "images/cork.jpg",
  "images/favicon.png",
  "images/icon-512.png"
];

// (B) CREATE/INSTALL CACHE
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(cName)
    .then((cache) => { return cache.addAll(cFiles); })
    .catch((err) => { console.error(err) })
  );
});

// (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request)
    .then((res) => { return res || fetch(evt.request); })
  );
});
