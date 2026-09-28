import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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

export default withNextIntl(nextConfig);
