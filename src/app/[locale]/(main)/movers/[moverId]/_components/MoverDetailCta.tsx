"use client";

import Image from "next/image";
import likeDefault from "@/assets/icons/like-md-default.svg";
import likeActive from "@/assets/icons/like-md-red-active.svg";
import Button from "@/components/common/Button";
import EtcButton from "@/components/common/EtcButton";
import { cn } from "@/lib/utils/cn";

type MoverDetailCtaProps = {
  nickName: string;
  isFavorited: boolean;
  isTargeted?: boolean;
  isRequestPending?: boolean;
  onRequestQuote: () => void;
  onToggleFavorite: () => void;
  className?: string;
};

export function MoverDetailDesktopCta({
  nickName,
  isFavorited,
  isTargeted = false,
  isRequestPending = false,
  onRequestQuote,
  onToggleFavorite,
  className,
}: MoverDetailCtaProps) {
  const favoriteLabel = isFavorited ? "찜해제하기" : "기사님 찜하기";

  return (
    <div className={cn("flex w-80 flex-col gap-4", className)}>
      <div className="text-18 text-black-black-400 leading-7 font-semibold">
        <p className="w-full max-w-80 break-keep">{nickName} 기사님에게</p>
        <p className="w-[185px]">지정 견적을 요청해보세요!</p>
      </div>
      <Button
        variant="solid"
        size="lg"
        disabled={isTargeted || isRequestPending}
        onClick={onRequestQuote}
      >
        {isTargeted ? "지정 견적 요청 완료" : "지정 견적 요청하기"}
      </Button>
      <button
        type="button"
        aria-pressed={isFavorited}
        aria-label={favoriteLabel}
        onClick={onToggleFavorite}
        className={cn(
          "border-line-200 text-18 flex h-13.5 w-full items-center justify-center gap-2.5 rounded-2xl border bg-white font-semibold text-black",
          "not-disabled:hover:bg-background-200",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        <Image src={isFavorited ? likeActive : likeDefault} alt="" className="size-6 shrink-0" />
        {favoriteLabel}
      </button>
    </div>
  );
}

export function MoverDetailMobileStickyCta({
  isFavorited,
  isTargeted = false,
  isRequestPending = false,
  onRequestQuote,
  onToggleFavorite,
}: Omit<MoverDetailCtaProps, "nickName" | "className">) {
  return (
    <div
      className={cn(
        "pc:hidden border-line-100 fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t bg-white",
        "h-27.5 px-6 py-7",
        "tablet:px-18"
      )}
    >
      <div className="tablet:mx-auto tablet:max-w-150 flex items-center gap-2">
        <EtcButton
          kind="like"
          size="sm"
          active={isFavorited}
          activeColor="red"
          aria-label={isFavorited ? "찜해제하기" : "기사님 찜하기"}
          onClick={onToggleFavorite}
        />
        <div className="min-w-0 flex-1">
          <Button
            variant="solid"
            size="sm"
            disabled={isTargeted || isRequestPending}
            onClick={onRequestQuote}
          >
            {isTargeted ? "지정 견적 요청 완료" : "지정 견적 요청하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
