import clsx from "clsx";
import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";
import clipIconMd from "@/assets/icons/clip-lg.svg";
import clipIconSm from "@/assets/icons/clip-md.svg";
import facebookIconMd from "@/assets/icons/facebook-lg.svg";
import facebookIconSm from "@/assets/icons/facebook-md.svg";
import kakaoIcon from "@/assets/icons/kakao.svg";
import likeIconMdActive from "@/assets/icons/like-lg-active.svg";
import likeIconMdDefault from "@/assets/icons/like-lg-default.svg";
import likeIconSmActive from "@/assets/icons/like-md-active.svg";
import likeIconSmDefault from "@/assets/icons/like-md-default.svg";

type EtcButtonKind = "like" | "clip" | "share-kakao" | "share-facebook";
type EtcButtonSize = "xs" | "sm" | "md";

// aria-pressed도 Omit으로 막아서 호출부가 직접 못 넘기게 함 — FilterButton과 동일한 이유로,
// 안 막으면 ...props 스프레드가 아래 aria-pressed={active}를 조용히 덮어쓸 수 있음
type EtcButtonBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-pressed"
>;

// like는 Figma에 xs 배리언트가 없어 sm/md만 허용 — kind에 따라 가능한 size를 타입으로 제한
// like는 찜 여부(active)에 따라 아이콘이 달라지므로 active prop 추가
type EtcButtonProps =
  | ({
      kind: "like";
      size?: Extract<EtcButtonSize, "sm" | "md">;
      active?: boolean;
    } & EtcButtonBaseProps)
  | ({
      kind: "clip" | "share-kakao" | "share-facebook";
      size?: EtcButtonSize;
      active?: never;
    } & EtcButtonBaseProps);

// like는 active로 눌림 여부가 바뀌어도 이름(label)은 고정 — 상태는 aria-pressed로만 전달
// (WAI-ARIA toggle button 패턴)
const DEFAULT_ARIA_LABEL: Record<EtcButtonKind, string> = {
  like: "찜하기",
  clip: "링크 복사",
  "share-kakao": "카카오톡 공유",
  "share-facebook": "페이스북 공유",
};

// 컨테이너 크기: xs 40px(radius 8) / sm 54px(radius 16) / md 64px(radius 16) — like는 xs 없음
const CONTAINER_SIZE: Record<EtcButtonSize, string> = {
  xs: "size-10 rounded-lg",
  sm: "size-[54px] rounded-2xl",
  md: "size-16 rounded-2xl",
};

// 사용 예: <EtcButton kind="like" size="md" active={isLiked} onClick={toggleLike} />
//         <EtcButton kind="share-kakao" onClick={shareToKakao} />
export default function EtcButton({
  kind,
  size = "sm",
  className,
  type = "button",
  "aria-label": ariaLabel,
  active,
  ...props
}: EtcButtonProps) {
  // 아이콘 실제 픽셀: xs/sm은 모두 24px, md는 like·clip 36px / kakao·facebook 28px로 Figma 배리언트별 크기가 다름
  const iconSizeClass =
    size !== "md" ? "size-6" : kind === "like" || kind === "clip" ? "size-9" : "size-7";

  return (
    <button
      type={type}
      aria-pressed={kind === "like" ? active : undefined}
      aria-label={ariaLabel ?? DEFAULT_ARIA_LABEL[kind]}
      className={clsx(
        "flex shrink-0 items-center justify-center transition-colors",
        CONTAINER_SIZE[size],
        (kind === "like" || kind === "clip") &&
          "border-line-200 not-disabled:hover:bg-background-200 border bg-gray-50",
        kind === "share-kakao" && "bg-[#fae100] not-disabled:hover:brightness-95",
        kind === "share-facebook" && "bg-orange-400 not-disabled:hover:bg-orange-500",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {kind === "like" && (
        <Image
          src={
            size === "md"
              ? active
                ? likeIconMdActive
                : likeIconMdDefault
              : active
                ? likeIconSmActive
                : likeIconSmDefault
          }
          alt=""
          className={iconSizeClass}
        />
      )}
      {kind === "clip" && (
        <Image src={size === "md" ? clipIconMd : clipIconSm} alt="" className={iconSizeClass} />
      )}
      {kind === "share-kakao" && <Image src={kakaoIcon} alt="" className={iconSizeClass} />}
      {kind === "share-facebook" && (
        <Image
          src={size === "md" ? facebookIconMd : facebookIconSm}
          alt=""
          className={iconSizeClass}
        />
      )}
    </button>
  );
}
