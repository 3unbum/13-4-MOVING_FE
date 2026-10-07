"use client";

import Image from "next/image";
import { OG_FALLBACK_IMAGE } from "@/constants/site";
import { useTranslations } from "next-intl";
import clipLg from "@/assets/icons/clip-lg.svg";
import clipMd from "@/assets/icons/clip-md.svg";
import facebookLg from "@/assets/icons/facebook-lg.svg";
import facebookMd from "@/assets/icons/facebook-md.svg";
import kakao from "@/assets/icons/kakao.svg";
import Toast from "@/components/common/Toast";
import { useShare } from "@/hooks/useShare";
import { cn } from "@/lib/utils/cn";

interface QuoteShareProps {
  /** 피그마: PC "견적서 공유하기" / 모바일 "나만 알긴 아쉬운 기사님인가요?" */
  title: string;
  /**
   * 공유할 경로. 화면에 따라 가리키는 대상이 다릅니다.
   *
   * - 고객 견적 상세 → `/customer/my-quotes/123` (본인이면 열립니다)
   * - 기사님 견적 상세 → `/movers/45` (기사님 전용 경로는 받는 사람이 못 엽니다)
   */
  shareUrl: string;
  /**
   * 공유 문구 맥락.
   *
   * 같은 컴포넌트를 고객·기사님이 함께 쓰는데 **누가 누구에게 보내는지**가 다릅니다.
   * 고객은 "받은 견적서", 기사님은 본인 소개라 "추천"이 됩니다
   * (기사님 화면에서 "본인께 받은 견적서"는 말이 안 됩니다).
   */
  variant?: "quote" | "mover";
  /** 공유 문구에 들어갈 기사님 별명 */
  moverNickName: string;
  /** 카카오 카드 썸네일 — 없으면 브랜드 폴백 이미지를 씁니다 */
  moverImage?: string | null;
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
export default function QuoteShare({
  title,
  shareUrl,
  variant = "quote",
  moverNickName,
  moverImage,
  className,
}: QuoteShareProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const isQuote = variant === "quote";

  const { copyLink, shareToKakao, shareToFacebook, isKakaoReady, toast } = useShare({
    url: shareUrl,
    text: isQuote
      ? t("shareQuoteText", { moverName: moverNickName })
      : t("shareText", { moverName: moverNickName }),
    buttonTitle: isQuote ? t("shareQuoteButton") : t("shareButtonTitle"),
    // 카카오 카드 제목·썸네일 — og와 같은 값 (SDK는 og를 읽지 않습니다)
    title: isQuote
      ? t("shareQuoteCardTitle", { moverName: moverNickName })
      : t("shareCardTitle", { moverName: moverNickName }),
    imageUrl: moverImage || OG_FALLBACK_IMAGE,
  });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-16 text-black-300 pc:text-20 font-semibold">{title}</p>

      <div className="pc:gap-4 flex items-center gap-3">
        <ShareButton label={tCommon("copyLink")} variant="clip" onClick={copyLink}>
          <Image src={clipMd} alt="" className="pc:hidden size-6" />
          <Image src={clipLg} alt="" className="pc:block hidden size-9" />
        </ShareButton>

        <ShareButton
          label={isKakaoReady ? tCommon("shareKakao") : t("shareKakaoFallback")}
          variant="kakao"
          onClick={shareToKakao}
        >
          <Image src={kakao} alt="" className="pc:size-7 size-6" />
        </ShareButton>

        <ShareButton label={tCommon("shareFacebook")} variant="facebook" onClick={shareToFacebook}>
          <Image src={facebookMd} alt="" className="pc:hidden size-6" />
          <Image src={facebookLg} alt="" className="pc:block hidden size-7" />
        </ShareButton>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
