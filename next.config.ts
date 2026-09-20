/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
