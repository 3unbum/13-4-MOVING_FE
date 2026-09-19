import Button from "@/components/common/Button";
import {
  ConfirmedBadge,
  FavoriteCount,
  PendingBadge,
  RejectedBadge,
  PriceFooter,
  PriceInline,
} from "@/components/common/CardParts";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import type { ServiceCode } from "@/components/filter/ChipRegion";
import MoverMeta from "@/components/mover/MoverMeta";
import MoverName from "@/components/mover/MoverName";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { cn } from "@/lib/utils/cn";
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
  compact = false,
}: MoverInfo & {
  size: CardSize;
  bordered?: boolean;
  /** 견적내역 lg만 로고 없이 이름을 씁니다 */
  showLogo?: boolean;
  /** 견적내역 lg만 빈 하트입니다 */
  favoriteFilled?: boolean;
  /**
   * 이름·간격이 카드마다 다릅니다.
   *   견적내역 lg (`I1:11693;1:12842`)  이름 26(text-18) / 간격 8
   *   대기중인내역 lg (`I510:43373;510:43176`) 이름 24(text-16) / 간격 4
   */
  compact?: boolean;
}) {
  const isLg = size === "lg";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3",
        // 테두리를 border로 그리면 위아래 1px씩 높이를 밀어 피그마(80)보다 82가 됩니다.
        // inset 그림자는 레이아웃을 차지하지 않습니다 (#51에서 카드 폭 어긋남을 같은 방식으로 해결).
        bordered
          ? "rounded-xl py-3 pr-5 pl-3 shadow-[inset_0_0_0_1px_var(--color-gray-300)]"
          : // 테두리가 없어도 피그마 박스(`510:44550;510:43224` h=82)는 상하 여백을 갖습니다 —
            // 내용 50 + 위 12 + 아래 20.
            "pt-3 pb-5"
      )}
    >
      <ProfileAvatar src={profileImage} alt={nickName} size="50" />

      <div
        className={cn(
          "flex min-w-px flex-1 flex-col items-start",
          isLg && !compact ? "gap-2" : "gap-1"
        )}
      >
        <div className="flex w-full items-center justify-between">
          <MoverName
            nickName={nickName}
            size={isLg && !compact ? "lg" : "sm"}
            showLogo={showLogo}
          />
          <FavoriteCount
            count={favoriteCount}
            isFavorited={favoriteFilled}
            countClassName={favoriteFilled ? "text-gray-gray-500" : "text-black-500"}
          />
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

/** 확정 > 반려 > 대기 순으로 하나만 보여줍니다 */
function StatusBadge({ isConfirmed, isRejected }: { isConfirmed: boolean; isRejected: boolean }) {
  if (isConfirmed) return <ConfirmedBadge />;
  if (isRejected) return <RejectedBadge />;
  return <PendingBadge />;
}

/* ── 견적내역 (1:12824 / 1:12907) ─────────────────────────────── */

interface CardEstimateHistoryProps extends HTMLAttributes<HTMLElement>, MoverInfo {
  size?: CardSize;
  category: ServiceCode;
  isTargeted?: boolean;
  /** 기사님 한 줄 소개 */
  title: string;
  /** 반려(REJECTED) 견적은 금액이 없어 null이 옵니다 */
  price: number | null;
  /** 확정된 견적이면 "확정견적" 배지가 붙습니다 */
  isConfirmed?: boolean;
  /** 기사님이 반려한 견적 — "견적대기" 대신 "반려됨"으로 표시합니다 (QA-9) */
  isRejected?: boolean;
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
  isRejected = false,
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
      className={cn("flex flex-col items-end bg-white py-5", "w-full", isLg && "px-2", className)}
      {...props}
    >
      <div className={cn("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
        <div className={cn("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isLg ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isLg ? "md" : "sm"} />}
          </div>

          <div className="flex w-full flex-col gap-4">
            {/* lg는 제목 줄 오른쪽에 배지, sm은 금액 줄 왼쪽에 배지 */}
            <div
              className={cn(
                "flex w-full",
                isLg ? "items-center justify-between" : "flex-col items-start"
              )}
            >
              {/* 한 줄 소개는 길이가 가변이라 잘라냅니다.
                  피그마는 고정 텍스트라 nowrap이지만, 그대로 두면 배지를 밀어내고 카드를 넘칩니다.
                  min-w-0이 있어야 flex 안에서 축소됩니다. */}
              <p
                className={cn(
                  "text-black-black-300 w-full min-w-0 truncate font-semibold",
                  isLg ? "text-18" : "text-16"
                )}
              >
                {title}
              </p>
              {isLg && <StatusBadge isConfirmed={isConfirmed} isRejected={isRejected} />}
            </div>

            {/* lg만 로고 없이 text-16 + 빈 하트입니다 (피그마 1:12824) */}
            <MoverBox size={size} showLogo={!isLg} favoriteFilled={!isLg} {...mover} />
          </div>
        </div>

        <div
          className={cn("flex h-8 w-full items-center", isLg ? "justify-end" : "justify-between")}
        >
          {!isLg && <StatusBadge isConfirmed={isConfirmed} isRejected={isRejected} />}
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
      className={cn(
        "flex flex-col items-start bg-white",
        "shadow-[inset_0_0_0_0.5px_var(--color-line-100),-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
        "w-full",
        isLg ? "gap-10 rounded-[20px] px-10 py-8" : "gap-7 rounded-[20px] px-5 py-6",
        className
      )}
      {...props}
    >
      {/* 상단 블록과 금액줄 사이 — 모바일 8 / 태블릿·PC 12
          (`510:44550` 154→162 / `510:43373` 170→182). 카드가 태블릿부터 lg라 tablet: 기준입니다. */}
      <div className="tablet:gap-3 flex w-full flex-col items-start gap-2">
        <div className={cn("flex w-full flex-col items-start", isLg ? "gap-6" : "gap-4")}>
          <div
            className={cn(
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

          {/* 제목과 기사님 정보 사이는 4px입니다 (피그마 `510:44550` 제목 h26 → 박스 y30) */}
          <div className="flex w-full flex-col gap-1">
            <p
              className={cn(
                "text-black-black-300 w-full min-w-0 truncate font-semibold",
                isLg ? "text-18" : "text-16"
              )}
            >
              {title}
            </p>
            <MoverBox size={size} bordered={false} compact {...mover} />
          </div>
        </div>

        <PriceFooter price={price} size={size} />
      </div>

      {/* lg는 [상세보기][견적 확정하기] 가로, sm은 [견적 확정하기][상세보기] 세로 — 순서가 반대입니다 */}
      <div className={cn("flex w-full gap-2.75", !isLg && "flex-col")}>
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
