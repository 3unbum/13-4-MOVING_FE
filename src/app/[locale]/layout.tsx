import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import Providers from "./providers";
import GlobalGnb from "@/components/layout/GlobalGnb";
import ChatWidget from "@/components/chat/ChatWidget";
import ServiceWorkerRegister from "@/components/common/ServiceWorkerRegister";
import { OG_FALLBACK_IMAGE } from "@/constants/site";
import { SITE_URL } from "@/constants/site.server";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    // 언어별 start_url을 위해 매니페스트를 locale마다 나눕니다
    manifest: `/manifest/${locale}.webmanifest`,
    ...metadata,
  };
}

const metadata: Metadata = {
  // 상대 경로 og:image를 절대 URL로 바꾸는 기준점입니다. 없으면 공유 미리보기에
  // 이미지가 실리지 않습니다(Next가 경고만 내고 넘어갑니다).
  metadataBase: SITE_URL,
  title: "Moving",
  description: "A matching service connecting moving customers with moving professionals",
  openGraph: {
    title: "Moving",
    description: "A matching service connecting moving customers with moving professionals",
    type: "website",
    images: [OG_FALLBACK_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_FALLBACK_IMAGE],
  },
  // iOS 홈 화면 앱(standalone) 설정. 아이콘은 app/apple-icon.png가 자동 연결됩니다.
  appleWebApp: { capable: true, title: "Moving", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f9502e",
};

/** 빌드 타임에 locale별 페이지를 미리 생성합니다 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * 실질적인 루트 레이아웃 — 위치만 `[locale]` 아래로 옮겼습니다.
 *
 * `<html lang>` 에 locale을 넣으려면 `params.locale` 을 읽어야 하는데,
 * `app/layout.tsx` 는 `[locale]` 세그먼트보다 위라 params에 접근할 수 없습니다.
 *
 * `NextIntlClientProvider` 는 `Providers` **바깥**에 둡니다. 서버 컴포넌트에서
 * 렌더링될 때만 `i18n/request.ts` 설정을 자동으로 상속받기 때문입니다.
 * (`messages` 를 prop으로 넘길 필요가 없습니다)
 */
export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {/* `beforeinstallprompt`는 페이지당 한 번만 오고 하이드레이션보다 먼저 올 수 있습니다.
            컴포넌트가 붙은 뒤에 듣기 시작하면 놓치므로, 가장 먼저 실행되는 스크립트가
            받아서 `window.__installPrompt`에 보관합니다 (InstallSection이 꺼내 씁니다). */}
        <Script id="capture-install-prompt" strategy="beforeInteractive">
          {`window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__installPrompt=e;window.dispatchEvent(new Event("installpromptchange"))})`}
        </Script>
        <NextIntlClientProvider>
          <Providers>
            <GlobalGnb />
            {children}
            <ChatWidget />
            <ServiceWorkerRegister />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
