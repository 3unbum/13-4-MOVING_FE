import logoMark from "@/assets/icons/logo-mark-sm.svg";
import clsx from "clsx";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type MoverNameSize = "sm" | "md" | "lg" | "xl";

interface MoverNameProps extends HTMLAttributes<HTMLDivElement> {
  nickName: string;
  /** sm·md 14 / lg 16 / xl 18(bold) */
  size?: MoverNameSize;
  /** 견적내역 카드 lg처럼 로고 없이 이름만 쓰는 곳이 있습니다 */
  showLogo?: boolean;
  /** 로고를 이름 위에 세로로 배치 — 리뷰 카드 sm (피그마 1:12520) */
  stacked?: boolean;
}

// xl은 "내가 작성한 리뷰" lg에서만 씁니다 (피그마 1:12482 — 유일하게 bold)
const SIZE_CLASS: Record<MoverNameSize, string> = {
  sm: "text-14 font-semibold",
  md: "text-14 font-semibold",
  lg: "text-16 font-semibold",
  xl: "text-18 font-bold",
};

// 사용법: <MoverName nickName="김코드" size="lg" />
export default function MoverName({
  nickName,
  size = "sm",
  showLogo = true,
  stacked = false,
  className,
  ...props
}: MoverNameProps) {
  return (
    <div
      className={clsx("flex gap-1", stacked ? "flex-col items-start" : "items-center", className)}
      {...props}
    >
      {showLogo && <Image src={logoMark} alt="" className="h-5.75 w-5 shrink-0" />}
      <span
        className={clsx(
          "text-black-300 flex items-center gap-1 whitespace-nowrap",
          SIZE_CLASS[size]
        )}
      >
        <span>{nickName}</span>
        <span>기사님</span>
      </span>
    </div>
  );
}
