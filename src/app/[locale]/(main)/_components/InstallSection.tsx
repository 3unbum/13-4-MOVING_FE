"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { QRCodeSVG } from "qrcode.react";

const noopSubscribe = () => () => {};

/** 표준이 아니라 lib.dom 타입에 없습니다 (Chrome·Edge·삼성 인터넷 계열) */
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

declare global {
  interface Window {
    /** layout.tsx의 beforeInteractive 스크립트가 받아 보관한 설치 이벤트 */
    __installPrompt?: InstallPromptEvent;
  }
}

// 이벤트는 하이드레이션보다 먼저 올 수 있어 컴포넌트에서 직접 듣지 않고 window에 보관된 값을 읽습니다
const INSTALL_PROMPT_CHANGE = "installpromptchange";
const subscribePrompt = (onChange: () => void) => {
  window.addEventListener(INSTALL_PROMPT_CHANGE, onChange);
  return () => window.removeEventListener(INSTALL_PROMPT_CHANGE, onChange);
};
const getPrompt = () => window.__installPrompt ?? null;

/**
 * 랜딩 푸터 위의 "앱으로 설치" 섹션.
 *
 * - PC(≥1280px): QR — 설치는 휴대폰에서 하므로 휴대폰으로 사이트를 열게 합니다.
 * - 태블릿·모바일: 버튼 — 안드로이드는 설치 창을 바로 띄우고, 설치 이벤트가 없는
 *   iOS 사파리 등은 안내 문구를 보여줍니다.
 * - 이미 설치된 앱(standalone)에서는 섹션 자체를 그리지 않습니다.
 */
export default function InstallSection({ siteUrl }: { siteUrl: string }) {
  const t = useTranslations("page");
  const locale = useLocale();
  // 서버 렌더에는 false, 하이드레이션 이후 true — standalone 여부는 브라우저만 압니다
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const promptEvent = useSyncExternalStore(subscribePrompt, getPrompt, () => null);

  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (!ready) return null;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (installed || standalone) return null;
  // iPadOS는 UA가 Mac으로 잡혀서 터치 지원 여부로 같이 거릅니다
  const isIos =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // 설치 이벤트가 없는 iOS는 눌러야 안내가 나오는 대신 처음부터 보여줍니다
  const guideVisible = showGuide || isIos;
  // QR로 열어도 보던 언어로 들어가도록 locale 경로를 붙입니다
  const qrUrl = locale === routing.defaultLocale ? siteUrl : `${siteUrl}/${locale}`;

  const handleInstall = async () => {
    if (!promptEvent) {
      setShowGuide(true);
      return;
    }
    await promptEvent.prompt();
    // 한 번 쓰면 다시 쓸 수 없어 비웁니다
    window.__installPrompt = undefined;
    window.dispatchEvent(new Event(INSTALL_PROMPT_CHANGE));
  };

  return (
    <section className="tablet:py-16 pc:flex-row pc:gap-16 pc:py-20 flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="pc:text-left flex flex-col gap-2">
        <h2 className="text-20 tablet:text-28 text-black-300 font-bold">{t("install_title")}</h2>
        <p className="text-14 tablet:text-16 text-gray-gray-400 font-medium">{t("install_desc")}</p>
      </div>

      <div className="pc:flex hidden flex-col items-center gap-3 rounded-3xl bg-gray-100 p-6">
        <div className="rounded-2xl bg-white p-3">
          <QRCodeSVG value={qrUrl} size={112} />
        </div>
        <p className="text-14 text-gray-gray-400 font-medium">{t("install_qr")}</p>
      </div>

      <div className="pc:hidden flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleInstall}
          className="text-16 rounded-full bg-orange-400 px-6 py-3 font-bold text-white"
        >
          {t("install_app")}
        </button>
        {guideVisible && (
          <p className="text-13 text-gray-gray-400 font-medium">
            {t(isIos ? "install_guide_ios" : "install_guide_other")}
          </p>
        )}
      </div>
    </section>
  );
}
