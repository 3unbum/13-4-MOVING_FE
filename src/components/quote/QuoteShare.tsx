"use client";

import Image from "next/image";
import { useState } from "react";
import clipLg from "@/assets/icons/clip-lg.svg";
import clipMd from "@/assets/icons/clip-md.svg";
import facebookLg from "@/assets/icons/facebook-lg.svg";
import facebookMd from "@/assets/icons/facebook-md.svg";
import kakao from "@/assets/icons/kakao.svg";
import Toast from "@/components/common/Toast";
import { cn } from "@/lib/utils/cn";

interface QuoteShareProps {
  /** 피그마: PC "견적서 공유하기" / 모바일 "나만 알긴 아쉬운 기사님인가요?" */
  title: string;
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
 * 견적서 공유 — 링크 복사 / 카카오 / 페이스북.
 *
 * 링크 복사만 실제 동작합니다. 카카오는 JS SDK 앱키가, 페이스북은 앱 등록이 필요해
 * MVP 범위 밖입니다(API 명세의 공유 통계도 심화 이월). UI는 피그마대로 두고
 * 두 버튼은 공유 URL을 클립보드로 복사하는 동작으로 대체합니다.
 */
export default function QuoteShare({ title, className }: QuoteShareProps) {
  const [toast, setToast] = useState<string | null>(null);

  const copyLink = async (message: string) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast(message);
    } catch {
      // 클립보드는 https·사용자 제스처 등 조건이 안 맞으면 거부됩니다
      setToast("링크 복사에 실패했어요. 주소창에서 복사해 주세요.");
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-16 text-black-300 pc:text-20 font-semibold">{title}</p>

      <div className="pc:gap-5 flex items-center gap-3">
        <ShareButton
          label="링크 복사하기"
          variant="clip"
          onClick={() => copyLink("링크가 복사되었어요!")}
        >
          <Image src={clipMd} alt="" className="pc:hidden size-6" />
          <Image src={clipLg} alt="" className="pc:block hidden size-9" />
        </ShareButton>

        {/* TODO: 카카오 JS SDK 연동 — 앱키 발급 후. 지금은 링크 복사로 대체 */}
        <ShareButton
          label="카카오톡으로 공유하기"
          variant="kakao"
          onClick={() => copyLink("링크가 복사되었어요!")}
        >
          <Image src={kakao} alt="" className="pc:size-7 size-6" />
        </ShareButton>

        {/* TODO: 페이스북 공유 — 앱 등록 후. 지금은 링크 복사로 대체 */}
        <ShareButton
          label="페이스북으로 공유하기"
          variant="facebook"
          onClick={() => copyLink("링크가 복사되었어요!")}
        >
          <Image src={facebookMd} alt="" className="pc:hidden size-6" />
          <Image src={facebookLg} alt="" className="pc:block hidden size-7" />
        </ShareButton>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
