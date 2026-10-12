// 설치 가능 조건을 채우는 최소 서비스워커입니다.
// 해시가 붙어 내용이 바뀌지 않는 `/_next/static/*`의 GET만 캐시합니다.
// ⚠️ `/api`(쿠키 인증), SSE(`/api/notifications/stream`), 페이지(HTML), 비GET 요청은
//    절대 가로채지 않습니다 — 캐시하면 로그아웃 후에도 이전 사용자 데이터가 보이고
//    배포 후 옛 화면이 남습니다.
const CACHE = "static-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/_next/static/")) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      if (hit) return hit;
      const res = await fetch(request);
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
  );
});
