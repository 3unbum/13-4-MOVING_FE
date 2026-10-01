import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 알림 SSE 프록시.
 *
 * `/api/:path*` rewrite로 넘기면 Next가 응답을 모았다가 한 번에 내려
 * `notification` 이벤트가 끊겨서 도착합니다. 파일 라우트가 rewrite보다
 * 우선하므로 여기서 바디를 그대로 흘려보냅니다.
 */
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/api/notifications/stream`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        accept: "text/event-stream",
      },
      cache: "no-store",
    });
  } catch {
    return new Response(null, { status: 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (upstream.ok) {
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    headers.set("X-Accel-Buffering", "no");
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
