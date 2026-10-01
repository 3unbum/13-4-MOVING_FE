import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
// v11부터 `withSentryConfig`는 메인이 아니라 `/config` 서브패스에 있습니다.
import { withSentryConfig } from "@sentry/nextjs/config";

// JSDoc 주석 대신 실제 타입을 붙입니다 — withNextIntl()에 넘기려면
// 추론이 아니라 NextConfig로 확정돼 있어야 합니다.
const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.30.1.25"],
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // 백엔드 주소는 환경마다 다릅니다(로컬 3001 / 배포 EC2).
        // `NEXT_PUBLIC_API_URL`은 서버 컴포넌트에서도 쓰고 있어(movers/[moverId],
        // find-my-account) 같은 값을 공유합니다.
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

// 기본 경로(src/i18n/request.ts)를 쓰므로 인자가 없습니다.
// rewrites 등 위 설정은 그대로 유지된 채 i18n 처리만 얹힙니다.
const withNextIntl = createNextIntlPlugin();

// Sentry가 가장 바깥입니다 — 빌드 산출물에 소스맵을 붙이는 단계라
// i18n 플러그인이 적용된 최종 설정을 받아야 합니다.
export default withSentryConfig(withNextIntl(nextConfig), {
  // 빌드 로그를 조용하게 둡니다(CI 출력이 길어지는 걸 막습니다).
  silent: true,

  // 소스맵 업로드는 하지 않습니다. 조직/프로젝트 슬러그와 인증 토큰이 필요한데,
  // 토큰을 CI·Vercel에 넣어야 해서 지금 범위를 넘습니다.
  // 업로드가 없으면 스택 트레이스가 난독화된 채로 보이지만, 에러 수집 자체는 됩니다.
  sourcemaps: { disable: true },

  // 광고 차단기가 Sentry 도메인 요청을 막으면 에러가 아예 수집되지 않습니다.
  // 이 경로로 우리 서버를 거쳐 보내면 차단을 우회합니다.
  // ⚠️ `proxy.ts` 매처에서 제외해야 합니다 — i18n이 가로채면 404가 됩니다.
  tunnelRoute: "/sentry-tunnel",
});
