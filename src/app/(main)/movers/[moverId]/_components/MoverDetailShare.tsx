"use client";

import EtcButton from "@/components/common/EtcButton";
import { cn } from "@/lib/utils/cn";

type MoverDetailShareProps = {
  /** PC 사이드바는 md 아이콘, 본문 인라인은 xs */
  size?: "xs" | "md";
  onCopyLink: () => void;
  onShareKakao: () => void;
  onShareFacebook: () => void;
  className?: string;
};

/** 공유 영역 — PC gap 제목-아이콘 22 / 아이콘 간격 16 (Figma 1:5261) */
export default function MoverDetailShare({
  size = "xs",
  onCopyLink,
  onShareKakao,
  onShareFacebook,
  className,
}: MoverDetailShareProps) {
  const isMd = size === "md";

  return (
    <div className={cn("flex flex-col", isMd ? "gap-5.5" : "gap-3", className)}>
      <p
        className={cn(
          "text-black-black-400 font-semibold",
          isMd ? "text-20 leading-8" : "text-16 leading-8"
        )}
      >
        나만 알기엔 아쉬운 기사님인가요?
      </p>
      <div className={cn("flex items-center", isMd ? "gap-4" : "gap-3")}>
        <EtcButton kind="clip" size={size} onClick={onCopyLink} />
        <EtcButton kind="share-kakao" size={size} onClick={onShareKakao} />
        <EtcButton kind="share-facebook" size={size} onClick={onShareFacebook} />
      </div>
    </div>
  );
}
