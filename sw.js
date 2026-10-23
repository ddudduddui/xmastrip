/* 오프라인용 서비스워커 — 비행기·로밍 끊김에서도 앱이 열리게 한다.
   일정이 바뀌면 VERSION 만 올려서 다시 배포하면 된다. */

const VERSION = '2026-10-23a';
const SHELL = 'shell-' + VERSION;   // 앱 본체
const TILES = 'tiles-v1';           // 지도 타일 (버전 올려도 지우지 않는다)
const TILE_MAX = 800;               // 타일 보관 상한

/* 없으면 앱이 안 열리는 것들 */
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'vendor/leaflet.css',
  'vendor/leaflet.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      // 하나라도 실패하면 설치가 통째로 깨지므로 개별로 넣는다
      .then((c) => Promise.all(
        PRECACHE.map((u) => c.add(u).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('shell-') && k !== SHELL)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* 타일 캐시가 무한정 커지지 않게 오래된 것부터 버린다 */
async function trimTiles() {
  const c = await caches.open(TILES);
  const keys = await c.keys();
  if (keys.length <= TILE_MAX) return;
  await Promise.all(keys.slice(0, keys.length - TILE_MAX).map((k) => c.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* 환율 API — 가로채지 않는다. 실패하면 앱이 내장값으로 알아서 넘어간다 */
  if (url.hostname === 'api.frankfurter.dev') return;

  /* 지도 타일 — 캐시 우선. 한 번 본 범위는 오프라인에서도 보인다 */
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith((async () => {
      const c = await caches.open(TILES);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          c.put(req, res.clone());
          trimTiles();
        }
        return res;
      } catch (_) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  /* 우리 사이트 밖(구글지도 링크 등)은 건드리지 않는다 */
  if (url.origin !== self.location.origin) return;

  /* 페이지 — 네트워크 우선, 끊기면 캐시.
     온라인이면 항상 최신 일정을 보고, 오프라인이면 마지막 판이 열린다 */
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(SHELL);
        c.put('index.html', res.clone());
        return res;
      } catch (_) {
        const c = await caches.open(SHELL);
        return (await c.match('index.html'))
            || (await c.match('./'))
            || new Response('오프라인입니다. 네트워크가 있을 때 한 번 열어 두세요.',
                            { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  /* 나머지 정적 파일 — 캐시 우선 */
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.status === 200) c.put(req, res.clone());
      return res;
    } catch (_) {
      return new Response('', { status: 504 });
    }
  })());
});
