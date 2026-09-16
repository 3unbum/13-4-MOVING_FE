import type { NextConfig } from "next";

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

if (!process.env.NEXT_PUBLIC_S3_IMAGE_HOST) {
  throw new Error("NEXT_PUBLIC_S3_IMAGE_HOST 환경변수가 설정되지 않았습니다.");
}
const S3_IMAGE_HOST = process.env.NEXT_PUBLIC_S3_IMAGE_HOST;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 네트워크를 통한 테스트 서버
  allowedDevOrigins: ["172.30.1.15"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: S3_IMAGE_HOST,
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
