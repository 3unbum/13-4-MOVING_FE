"use client";

import { useEffect, useState } from "react";
import { useKakaoSdk } from "@/hooks/useKakaoSdk";

/** 토스트 노출 시간 — QuoteDetailClient와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

const COPY_SUCCESS_MESSAGE = "링크가 복사되었어요!";

interface UseShareParams {
  /** 공유할 경로 또는 절대 URL (예: `/movers/12`) */
  url: string;
  /** 카카오 메시지 본문 */
  text: string;
  /** 카카오 메시지 버튼 라벨 */
  buttonTitle: string;
}

/**
 * 공유 동작 — 카카오톡 / 페이스북 / 링크 복사.
 *
 * 요구사항상 공유가 필요한 화면이 셋(기사님 찾기·기사님 상세·견적 상세)인데
 * 버튼 배치가 화면마다 달라, 동작만 훅으로 빼고 UI는 호출부가 만듭니다.
 *
 * 공유 문구·대상 URL도 호출부가 정합니다. 요구사항 문구는 같지만
 * 대상(기사님)이 화면마다 다르기 때문입니다.
 */
export function useShare({ url, text, buttonTitle }: UseShareParams) {
  const [toast, setToast] = useState<string | null>(null);
  const isKakaoReady = useKakaoSdk();

  // 토스트는 일정 시간 뒤 스스로 사라집니다
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  /** 상대 경로를 받아도 공유에는 절대 URL이 필요합니다 */
  const toAbsoluteUrl = () => new URL(url, window.location.origin).toString();

  const copyLink = async () => {
    const shareUrl = toAbsoluteUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast(COPY_SUCCESS_MESSAGE);
    } catch {
      // 클립보드는 https·사용자 제스처 등 조건이 안 맞으면 거부됩니다.
      // 지금 보고 있는 주소가 공유 대상과 다를 수 있어("주소창에서 복사"가 틀린 안내가 됨)
      // 공유할 URL을 그대로 띄워 직접 복사할 수 있게 합니다.
      setToast(`링크 복사에 실패했어요. ${shareUrl}`);
    }
  };

  /**
   * 카카오톡 공유.
   *
   * `feed`가 아니라 `text` 템플릿을 쓰는 이유는 `imageUrl`이 카카오 서버에서
   * 접근 가능한 공개 URL이어야 하기 때문입니다. 배포 도메인이 정해지면 바꿀 수 있습니다.
   *
   * 키(`NEXT_PUBLIC_KAKAO_JS_KEY`)가 없거나 SDK 로드에 실패하면 링크 복사로
   * 폴백합니다 — 키를 아직 넣지 않은 팀원 환경에서도 화면이 깨지지 않습니다.
   */
  const shareToKakao = () => {
    if (!isKakaoReady || !window.Kakao) {
      void copyLink();
      return;
    }

    const shareUrl = toAbsoluteUrl();

    try {
      window.Kakao.Share.sendDefault({
        objectType: "text",
        text,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        buttonTitle,
      });
    } catch {
      void copyLink();
    }
  };

  /**
   * 페이스북 공유 — sharer는 앱 등록도 SDK도 필요 없습니다.
   *
   * 미리보기 카드는 페이스북이 공유 URL을 직접 크롤링해 만들기 때문에,
   * 대상 페이지에 og 태그가 붙어야 제대로 나옵니다. localhost는 페이스북이
   * 접근할 수 없어 로컬에서는 링크만 보입니다.
   */
  const shareToFacebook = () => {
    const sharer = new URL("https://www.facebook.com/sharer/sharer.php");
    sharer.searchParams.set("u", toAbsoluteUrl());

    // noopener를 주면 창이 정상적으로 열려도 반환값이 null이라 팝업 차단을 구분할 수
    // 없습니다(HTML 표준). 차단된 경우는 호출부의 링크 복사 버튼이 대체 경로입니다.
    window.open(sharer.toString(), "_blank", "noopener,noreferrer");
  };

  return {
    copyLink,
    shareToKakao,
    shareToFacebook,
    /** 카카오 SDK 준비 여부 — 버튼 라벨을 실제 동작에 맞추는 데 씁니다 */
    isKakaoReady,
    /** 표시할 토스트 메시지 (없으면 null) */
    toast,
  };
}
