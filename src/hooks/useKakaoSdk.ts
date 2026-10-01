"use client";

import { useEffect, useState } from "react";

/** Kakao JavaScript SDK — 필요한 메서드만 선언합니다 */
interface KakaoSdk {
  init: (jsKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: Record<string, unknown>) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const SDK_VERSION = "2.8.3";
const SDK_SRC = `https://t1.kakaocdn.net/kakao_js_sdk/${SDK_VERSION}/kakao.min.js`;
// 카카오 공식 다운로드 페이지 기준 무결성 값. 버전을 올리면 함께 갱신해야 합니다.
const SDK_INTEGRITY = "sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy";
const SCRIPT_ID = "kakao-js-sdk";

/**
 * 카카오 JS SDK를 필요한 화면에서만 불러옵니다.
 *
 * 전역 레이아웃에 두면 공유를 쓰지 않는 페이지도 87KB를 받게 되어 훅으로 뺐습니다.
 * `NEXT_PUBLIC_KAKAO_JS_KEY`가 없으면 아무것도 하지 않고 `false`를 돌려주므로,
 * 호출부는 링크 복사 등으로 폴백할 수 있습니다.
 *
 * ⚠️ 주소 검색용 `KAKAO_REST_API_KEY`와는 다른 키입니다. SDK는 JavaScript 키만
 * 받습니다. 콘솔에서 [플랫폼 > Web 도메인 등록]과 [카카오톡 공유 활성화]도 필요합니다.
 */
export function useKakaoSdk() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!jsKey) return;

    const init = () => {
      if (!window.Kakao) return;
      // 페이지를 오갈 때 스크립트가 남아 있어도 init은 한 번만 호출해야 합니다
      if (!window.Kakao.isInitialized()) window.Kakao.init(jsKey);
      setIsReady(window.Kakao.isInitialized());
    };

    // 실패한 스크립트를 남겨두면 다음 마운트가 이미 끝난 load를 기다리다 영영 멈춥니다.
    // 지우고 나가야 네트워크가 복구됐을 때 다시 시도할 수 있습니다.
    const fail = (script: HTMLScriptElement) => {
      script.remove();
      setIsReady(false);
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.Kakao) {
        init();
        return;
      }
      // 아직 받는 중 — 끝나면 init, 실패하면 태그를 치웁니다
      const onLoad = () => (window.Kakao ? init() : fail(existing));
      const onError = () => fail(existing);
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SDK_SRC;
    script.integrity = SDK_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.async = true;
    // SRI 불일치는 error로 오지만, 일부 브라우저는 load 후 전역이 비어 있기도 합니다
    const onLoad = () => (window.Kakao ? init() : fail(script));
    const onError = () => fail(script);
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  return isReady;
}
