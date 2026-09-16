"use client";

import Image from "next/image";
import { useState } from "react";
import clipLg from "@/assets/icons/clip-lg.svg";
import clipMd from "@/assets/icons/clip-md.svg";
import facebookLg from "@/assets/icons/facebook-lg.svg";
import facebookMd from "@/assets/icons/facebook-md.svg";
import kakao from "@/assets/icons/kakao.svg";
import Toast from "@/components/common/Toast";
import { useKakaoSdk } from "@/hooks/useKakaoSdk";
import { cn } from "@/lib/utils/cn";

/** 토스트 노출 시간 — QuoteDetailClient와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

interface QuoteShareProps {
  /** 피그마: PC "견적서 공유하기" / 모바일 "나만 알긴 아쉬운 기사님인가요?" */
  title: string;
  /** 공유 대상 — 요구사항이 "기사님 상세 페이지 URL"을 공유하도록 정하고 있습니다 */
  moverId: number;
  /** 공유 문구에 들어갈 기사님 별명 */
  moverNickName: string;
  className?: string;
}

/**
 * 공유 버튼 한 칸 — sm 48 / lg 64 (피그마 button/clip·share).
 *
 * 아이콘 에셋이 글리프만이라 배경은 여기서 입힙니다:
 * 클립은 흰 배경 + 테두리, 카카오는 노랑, 페이스북은 주황.
 */
function ShareButton({
  label,
  onClick,
  variant,
  children,
}: {
  label: string;
  onClick: () => void;
  variant: "clip" | "kakao" | "facebook";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "pc:size-16 pc:rounded-2xl flex size-10 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80",
        variant === "clip" && "border-line-200 border bg-white",
        variant === "kakao" && "bg-kakao-yellow",
        variant === "facebook" && "bg-orange-400"
      )}
    >
      {children}
    </button>
  );
}

/**
 * 견적서 공유 — 세 버튼 모두 기사님 상세 페이지 링크를 복사합니다.
 *
 * 공유 대상은 지금 보고 있는 견적 상세가 아니라 **기사님 상세 페이지**입니다.
 * 견적 상세는 로그인이 필요한 데다 BE가 소유권을 검증해서, 링크를 받은 사람은
 * 로그인해도 남의 견적이라 열 수 없습니다. 요구사항도 기사님 상세 URL을
 * 공유하도록 정하고 있습니다("...무빙에서 확인해 보세요! <기사님 상세 페이지 URL>").
 *
 * 카카오는 JS SDK, 페이스북은 sharer를 씁니다. 카카오는 키(`NEXT_PUBLIC_KAKAO_JS_KEY`)가
 * 없거나 SDK 로드에 실패하면, 페이스북은 팝업이 차단되면 링크 복사로 폴백합니다.
 */
export default function QuoteShare({ title, moverId, moverNickName, className }: QuoteShareProps) {
  const [toast, setToast] = useState<string | null>(null);
  const isKakaoReady = useKakaoSdk();

  const shareUrl = () => new URL(`/movers/${moverId}`, window.location.origin).toString();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const copyLink = async (message: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      showToast(message);
    } catch {
      // 클립보드는 https·사용자 제스처 등 조건이 안 맞으면 거부됩니다.
      // 주소창은 견적 상세(로그인 필요)라 안내해봐야 못 여는 링크가 공유됩니다.
      // 공유 대상 URL을 그대로 띄워 직접 복사할 수 있게 합니다.
      showToast(`링크 복사에 실패했어요. ${shareUrl()}`);
    }
  };

  /**
   * 카카오톡 공유. 문구는 요구사항에 정해져 있습니다
   * ("이사를 준비하시나요? OOO 기사님을 추천합니다. 무빙에서 확인해 보세요!").
   *
   * feed가 아니라 text 템플릿을 쓰는 이유는 `imageUrl`이 카카오 서버에서 접근
   * 가능한 공개 URL이어야 하기 때문입니다. 배포 도메인이 정해지면 feed로 바꿀 수 있습니다.
   */
  const shareToKakao = () => {
    const url = shareUrl();
    if (!isKakaoReady || !window.Kakao) {
      // 키가 없거나 SDK 로드 실패 — 링크 복사로 폴백합니다
      void copyLink("링크가 복사되었어요!");
      return;
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: "text",
        text: `이사를 준비하시나요? ${moverNickName} 기사님을 추천합니다. 무빙에서 확인해 보세요!`,
        link: { mobileWebUrl: url, webUrl: url },
        buttonTitle: "기사님 정보 보러가기",
      });
    } catch {
      void copyLink("링크가 복사되었어요!");
    }
  };

  /**
   * 페이스북 공유 — sharer는 앱 등록도 SDK도 필요 없습니다.
   *
   * 미리보기 카드는 페이스북이 공유 URL을 직접 크롤링해 만들기 때문에,
   * 기사님 상세 페이지(#69)에 og 태그가 붙어야 제대로 나옵니다.
   * localhost는 페이스북이 접근할 수 없어 로컬에서는 링크만 보입니다.
   */
  const shareToFacebook = () => {
    const sharer = new URL("https://www.facebook.com/sharer/sharer.php");
    sharer.searchParams.set("u", shareUrl());

    // noopener를 주면 창이 정상적으로 열려도 반환값이 null이라 팝업 차단을 구분할 수
    // 없습니다. 차단된 경우는 옆의 "링크 복사하기" 버튼이 대체 경로가 됩니다.
    window.open(sharer.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-16 text-black-300 pc:text-20 font-semibold">{title}</p>

      <div className="pc:gap-4 flex items-center gap-3">
        <ShareButton
          label="링크 복사하기"
          variant="clip"
          onClick={() => copyLink("링크가 복사되었어요!")}
        >
          <Image src={clipMd} alt="" className="pc:hidden size-6" />
          <Image src={clipLg} alt="" className="pc:block hidden size-9" />
        </ShareButton>

        <ShareButton
          label={isKakaoReady ? "카카오톡으로 공유하기" : "링크 복사하기 (카카오톡 공유는 준비 중)"}
          variant="kakao"
          onClick={shareToKakao}
        >
          <Image src={kakao} alt="" className="pc:size-7 size-6" />
        </ShareButton>

        <ShareButton label="페이스북으로 공유하기" variant="facebook" onClick={shareToFacebook}>
          <Image src={facebookMd} alt="" className="pc:hidden size-6" />
          <Image src={facebookLg} alt="" className="pc:block hidden size-7" />
        </ShareButton>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
