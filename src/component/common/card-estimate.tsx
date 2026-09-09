import likeDefault from "@/assets/icons/like-md-default.svg";
import likeRedActive from "@/assets/icons/like-md-red-active.svg";
import Button from "@/component/common/button";
import {
  ConfirmedBadge,
  PendingBadge,
  PriceFooter,
  PriceInline,
} from "@/component/common/card-parts";
import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import MoverMeta from "@/component/common/mover-meta";
import MoverName from "@/component/common/mover-name";
import ProfileAvatar from "@/component/common/profile-avatar";
import clsx from "clsx";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type CardSize = "sm" | "lg";

/** 기사님 정보형 카드가 공통으로 받는 값 */
interface MoverInfo {
  nickName: string;
  profileImage?: string | null;
  rating: number;
  reviewCount: number;
  career: number;
  confirmedCount: number;
  favoriteCount: number;
}

/**
 * 찜 하트 + 개수 (표시 전용).
 * 견적내역 lg만 빈 하트 + 검정 숫자이고, 나머지는 빨간 하트 + 회색 숫자입니다.
 */
function FavoriteCount({ count, filled }: { count: number; filled: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-0.5">
      <Image src={filled ? likeRedActive : likeDefault} alt="" className="size-6 shrink-0" />
      <span className={clsx("text-14", filled ? "text-gray-gray-500" : "text-black-500")}>
        {count}
      </span>
    </div>
  );
}

/**
 * 테두리 박스 안에 들어가는 기사님 정보 블록.
 * 견적내역·대기중인 내역이 공유합니다.
 */
function MoverBox({
  size,
  nickName,
  profileImage,
  rating,
  reviewCount,
  career,
  confirmedCount,
  favoriteCount,
  bordered = true,
  showLogo = true,
  favoriteFilled = true,
}: MoverInfo & {
  size: CardSize;
  bordered?: boolean;
  /** 견적내역 lg만 로고 없이 이름을 씁니다 */
  showLogo?: boolean;
  /** 견적내역 lg만 빈 하트입니다 */
  favoriteFilled?: boolean;
}) {
  const isLg = size === "lg";

  return (
    <div
      className={clsx(
        "flex w-full items-end gap-3",
        bordered && "rounded-xl border border-gray-300 py-3 pr-5 pl-3"
      )}
    >
      <ProfileAvatar src={profileImage} alt={nickName} size="sm" />

      <div className={clsx("flex min-w-px flex-1 flex-col items-start", isLg ? "gap-2" : "gap-1")}>
        <div className="flex w-full items-center justify-between">
          <MoverName nickName={nickName} size={isLg ? "lg" : "sm"} showLogo={showLogo} />
          <FavoriteCount count={favoriteCount} filled={favoriteFilled} />
        </div>
        <MoverMeta
          rating={rating}
          reviewCount={reviewCount}
          career={career}
          confirmedCount={confirmedCount}
        />
      </div>
    </div>
  );
}

/* ── 견적내역 (1:12824 / 1:12907) ─────────────────────────────── */

interface CardEstimateHistoryProps extends HTMLAttributes<HTMLElement>, MoverInfo {
  size?: CardSize;
  category: ServiceCode;
  isTargeted?: boolean;
  /** 기사님 한 줄 소개 */
  title: string;
  price: number;
  /** 확정된 견적이면 "확정견적" 배지가 붙습니다 */
  isConfirmed?: boolean;
}

/**
 * 견적내역 카드. 목록 안의 행이라 테두리·그림자가 없고,
 * 기사님 정보만 별도 테두리 박스에 들어갑니다.
 *
 * 사용법: <CardEstimateHistory size="lg" category="OFFICE" title="..." nickName="김코드" price={180000} isConfirmed />
 */
export function CardEstimateHistory({
  size = "sm",
  category,
  isTargeted = false,
  title,
  price,
  isConfirmed = false,
  className,
  nickName,
  profileImage,
  rating,
  reviewCount,
  career,
  confirmedCount,
  favoriteCount,
  ...props
}: CardEstimateHistoryProps) {
  const isLg = size === "lg";
  const mover = {
    nickName,
    profileImage,
    rating,
    reviewCount,
    career,
    confirmedCount,
    favoriteCount,
  };

  return (
    <article
      className={clsx(
        "flex flex-col items-end bg-white py-5",
        isLg ? "w-165 px-2" : "w-81.75",
        className
      )}
      {...props}
    >
      <div className={clsx("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
        <div className={clsx("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isLg ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isLg ? "md" : "sm"} />}
          </div>

          <div className="flex w-full flex-col gap-4">
            {/* lg는 제목 줄 오른쪽에 배지, sm은 금액 줄 왼쪽에 배지 */}
            <div
              className={clsx(
                "flex w-full",
                isLg ? "items-center justify-between" : "flex-col items-start"
              )}
            >
              <p
                className={clsx(
                  "text-black-black-300 font-semibold whitespace-nowrap",
                  isLg ? "text-18" : "text-16"
                )}
              >
                {title}
              </p>
              {isLg && (isConfirmed ? <ConfirmedBadge /> : <PendingBadge />)}
            </div>

            {/* lg만 로고 없이 text-16 + 빈 하트입니다 (피그마 1:12824) */}
            <MoverBox size={size} showLogo={!isLg} favoriteFilled={!isLg} {...mover} />
          </div>
        </div>

        <div
          className={clsx("flex h-8 w-full items-center", isLg ? "justify-end" : "justify-between")}
        >
          {!isLg && (isConfirmed ? <ConfirmedBadge /> : <PendingBadge />)}
          <PriceInline price={price} size={size} />
        </div>
      </div>
    </article>
  );
}

/* ── 대기중인 내역 (510:43164 / 510:43215) ────────────────────── */

interface CardPendingHistoryProps extends HTMLAttributes<HTMLElement>, MoverInfo {
  size?: CardSize;
  category: ServiceCode;
  isTargeted?: boolean;
  title: string;
  price: number;
  onDetailClick?: () => void;
  onConfirmClick?: () => void;
}

/**
 * 대기중인 내역 카드. 견적내역과 달리 카드 테두리·그림자가 있고
 * "견적대기" 배지 + 견적 금액 + 버튼 2개가 붙습니다.
 *
 * 사용법: <CardPendingHistory size="lg" category="SMALL" title="..." nickName="김코드" price={180000} />
 */
export function CardPendingHistory({
  size = "sm",
  category,
  isTargeted = false,
  title,
  price,
  onDetailClick,
  onConfirmClick,
  className,
  nickName,
  profileImage,
  rating,
  reviewCount,
  career,
  confirmedCount,
  favoriteCount,
  ...props
}: CardPendingHistoryProps) {
  const isLg = size === "lg";
  const mover = {
    nickName,
    profileImage,
    rating,
    reviewCount,
    career,
    confirmedCount,
    favoriteCount,
  };

  return (
    <article
      className={clsx(
        "border-line-100 flex flex-col items-start border-[0.5px] bg-white",
        "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
        isLg
          ? "w-139.5 gap-10 rounded-[20px] px-10 py-8"
          : "w-81.75 gap-7 rounded-[20px] px-5 py-6",
        className
      )}
      {...props}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <div className={clsx("flex w-full flex-col items-start", isLg ? "gap-6" : "gap-4")}>
          <div
            className={clsx(
              "flex w-full items-center justify-between",
              isLg ? "min-h-8.5" : "min-h-6.5"
            )}
          >
            <div className="flex items-center gap-2">
              <MoveTypeChip variant={category} size={isLg ? "md" : "sm"} />
              {isTargeted && <MoveTypeChip variant="TARGETED" size={isLg ? "md" : "sm"} />}
            </div>
            <PendingBadge />
          </div>

          <div className="flex w-full flex-col gap-7.5">
            <p className="text-16 text-black-black-300 font-semibold whitespace-nowrap">{title}</p>
            <MoverBox size={size} bordered={false} {...mover} />
          </div>
        </div>

        <PriceFooter price={price} size={size} />
      </div>

      {/* lg는 [상세보기][견적 확정하기] 가로, sm은 [견적 확정하기][상세보기] 세로 — 순서가 반대입니다 */}
      <div className={clsx("flex w-full gap-2.75", !isLg && "flex-col")}>
        {isLg ? (
          <>
            <Button variant="outlined" size="sm" onClick={onDetailClick}>
              상세보기
            </Button>
            <Button variant="solid" size="sm" onClick={onConfirmClick}>
              견적 확정하기
            </Button>
          </>
        ) : (
          <>
            <Button variant="solid" size="sm" onClick={onConfirmClick}>
              견적 확정하기
            </Button>
            <Button variant="outlined" size="sm" onClick={onDetailClick}>
              상세보기
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
