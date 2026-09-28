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
        source: "/api/:path*",
        destination: "http://3.34.7.94/api/:path*",
      },
    ];
  },
};

// 기본 경로(src/i18n/request.ts)를 쓰므로 인자가 없습니다.
// rewrites 등 위 설정은 그대로 유지된 채 i18n 처리만 얹힙니다.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
