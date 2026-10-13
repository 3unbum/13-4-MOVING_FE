import { routing } from "@/i18n/routing";

/**
 * 언어별 매니페스트 (`/manifest/en.webmanifest` 등).
 * start_url만 언어별이고, id·scope는 "/"로 같아 같은 앱으로 취급됩니다.
 * 확장자(.)가 있는 경로라 proxy의 locale 처리에서 제외됩니다.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ file: `${locale}.webmanifest` }));
}

export const dynamicParams = false;

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = file.replace(/\.webmanifest$/, "");
  const startUrl = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return Response.json(
    {
      name: "Moving",
      short_name: "Moving",
      description: "A matching service connecting moving customers with moving professionals",
      id: "/",
      start_url: startUrl,
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#f9502e",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
