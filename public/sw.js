// GRØNN service worker — deliberately conservative.
//
// What it does:
//   · immutable build assets (/_next/static, icons, fonts) are served
//     cache-first — repeat opens of the installed app paint instantly;
//   · page navigations are ALWAYS network-first with no HTML caching,
//     so the site can never go stale behind a cache;
//   · when the network is gone, navigations fall back to the /offline
//     field-marker page (precached at install).
//
// Bump the version to invalidate everything after a change here.
const VERSION = "gronn26-sw-v1"
const OFFLINE_URL = "/offline"
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

const IMMUTABLE = /^\/(_next\/static|icons)\/|\.(woff2?|ttf)$/

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  // Navigations: network, with the offline page as the only fallback.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL).then((hit) => hit ?? Response.error())
      )
    )
    return
  }

  // Fingerprinted build assets never change under the same URL.
  if (IMMUTABLE.test(url.pathname) && event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ??
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(VERSION).then((cache) => cache.put(event.request, copy))
            }
            return response
          })
      )
    )
  }
})
