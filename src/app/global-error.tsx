"use client";

/**
 * ⚠️ **이 파일만 다국어에서 제외합니다** (팀 결정 2026-09-30).
 *
 * `[locale]` 세그먼트 밖이라 라우트 params로 locale을 받을 수 없고, `global-error`는
 * 루트 레이아웃을 **대체**하므로 `[locale]/layout.tsx`의 `NextIntlClientProvider`가
 * 걸리지 않습니다. `useTranslations`를 부르면 "No intl context found"로 터집니다.
 * `"use client"`라 `getTranslations`도 못 씁니다.
 *
 * 앱 전체가 죽었을 때만 보이는 화면이라 한국어로 두고, `lang="ko"`도 그대로 둡니다.
 * 굳이 다국어로 하려면 메시지 JSON을 직접 번들에 넣어야 해서 비용 대비 이득이 없습니다.
 */

import logo from "@/assets/images/common/logo-icon-text-lg.svg";
import errorIcon from "@/assets/images/common/profile-icon-md.png";
import Image from "next/image";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <div className="flex min-h-screen flex-col items-center justify-center gap-7 text-center">
          <Image src={logo} alt="무빙" className="h-auto w-40" />
          <Image src={errorIcon} alt="" className="h-auto w-60" />
          <div className="flex flex-col gap-3">
            <h1 className="text-50 font-bold text-orange-400">오류</h1>
            <p className="text-24 font-normal text-gray-500">
              문제가 발생했어요
              <br />
              잠시 후 다시 시도해주세요
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="text-16 tablet:h-13 pc:h-14 flex h-12 w-40 items-center justify-center rounded-xl bg-orange-400 font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
