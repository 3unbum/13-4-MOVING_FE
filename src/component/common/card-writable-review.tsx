import Button from "@/component/common/button";
import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import InfoItem from "@/component/common/info-item";
import MoverName from "@/component/common/mover-name";
import ProfileAvatar from "@/component/common/profile-avatar";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardWritableReviewSize = "sm" | "md" | "lg";

interface CardWritableReviewProps extends HTMLAttributes<HTMLElement> {
  size?: CardWritableReviewSize;
  category: ServiceCode;
  /** 지정 견적 요청 여부 — sm에서만 칩으로 표시됩니다 */
  isTargeted?: boolean;
  nickName: string;
  profileImage?: string | null;
  /** 기사님 한 줄 소개 */
  description?: string;
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 */
  movingDate: string;
  price: number;
  /** 이미 리뷰를 썼거나 작성 기간이 지나면 버튼이 비활성화됩니다 */
  disabled?: boolean;
  onWriteClick?: () => void;
}

/** lg·md의 세로 구분선 */
function VerticalLine() {
  return <span aria-hidden className="bg-line-200 h-12.5 w-px shrink-0" />;
}

/**
 * 작성 가능한 리뷰 카드.
 * 사이즈별로 프로필 크기(100/80/64)와 금액 위치가 다릅니다.
 * - lg: 금액이 우측 상단, 버튼 160px
 * - md: 금액이 이사 정보와 같은 줄, 버튼 w-full
 * - sm: 칩이 맨 위, 금액이 구분선 아래, 버튼 w-full
 *
 * 피그마의 `sort=disabled`는 별도 레이아웃이 아니라 **버튼 상태**입니다.
 * 기존 Button의 `disabled:bg-gray-300`이 피그마 `#D9D9D9`와 같습니다.
 *
 * **폭은 부모가 정합니다** (`w-full`).
 *
 * 사용법: <CardWritableReview size="lg" category="SMALL" nickName="김코드" price={180000} />
 */
export default function CardWritableReview({
  size = "sm",
  category,
  isTargeted = false,
  nickName,
  profileImage,
  description,
  from,
  to,
  movingDate,
  price,
  disabled = false,
  onWriteClick,
  className,
  ...props
}: CardWritableReviewProps) {
  const isLg = size === "lg";
  const isMd = size === "md";
  const isSm = size === "sm";

  const cardClass = clsx(
    "border-line-100 flex w-full flex-col border-[0.5px] bg-white",
    "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
    "rounded-[20px]",
    isLg && "gap-6 px-10 py-8",
    isMd && "gap-10 p-8",
    isSm && "gap-5 px-5 py-6",
    className
  );

  // 이사 정보 값 — lg·md는 16, sm은 14. 셋 다 regular
  const infoValueClass = clsx("text-black-500", isSm ? "text-14" : "text-16");

  const writeButton = (
    <Button variant="solid" size="sm" disabled={disabled} onClick={onWriteClick}>
      리뷰 작성하기
    </Button>
  );

  /* ── lg (1120px) ─────────────────────────────────── */
  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full items-end gap-6">
          <ProfileAvatar src={profileImage} alt={nickName} size="100" />

          <div className="flex min-w-0 flex-1 items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              <div className="flex w-full flex-col items-start justify-center">
                <MoverName nickName={nickName} size="xl" />
                {description && (
                  <p className="text-14 text-gray-gray-500 w-full truncate">{description}</p>
                )}
              </div>
              <MoveTypeChip variant={category} size="md" />
            </div>

            <div className="flex w-40 shrink-0 flex-col items-end">
              <span className="text-16 text-gray-gray-500 font-medium">견적 금액</span>
              <span className="text-24 text-black-black-400 font-bold whitespace-nowrap">
                {price.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5">
            <InfoItem label="출발지" value={from} valueClassName={infoValueClass} />
            <VerticalLine />
            <InfoItem label="도착지" value={to} valueClassName={infoValueClass} />
            <VerticalLine />
            <InfoItem label="이사일" value={movingDate} valueClassName={infoValueClass} />
          </div>
          <div className="w-40 shrink-0">{writeButton}</div>
        </div>
      </article>
    );
  }

  /* ── md (600px) ──────────────────────────────────── */
  if (isMd) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full flex-col gap-7">
          <div className="flex w-full items-start gap-5">
            <ProfileAvatar src={profileImage} alt={nickName} size="80" />

            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              <div className="flex w-full flex-col items-start justify-center">
                <MoverName nickName={nickName} size="xl" />
                {description && (
                  <p className="text-14 text-gray-gray-500 w-full truncate">{description}</p>
                )}
              </div>
              <MoveTypeChip variant={category} size="sm" />
            </div>
          </div>

          {/* md는 금액이 이사 정보와 같은 줄입니다 */}
          <div className="flex w-full items-center gap-4">
            <InfoItem label="출발지" value={from} valueClassName={infoValueClass} />
            <InfoItem label="도착지" value={to} valueClassName={infoValueClass} />
            <VerticalLine />
            <InfoItem label="이사일" value={movingDate} valueClassName={infoValueClass} />
            <VerticalLine />
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-14 text-gray-gray-500">견적금액</span>
              <span className="text-18 text-black-black-400 font-bold whitespace-nowrap">
                {price.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {writeButton}
      </article>
    );
  }

  /* ── sm (327px) ──────────────────────────────────── */
  return (
    <article className={cardClass} {...props}>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <MoveTypeChip variant={category} size="sm" />
          {isTargeted && <MoveTypeChip variant="TARGETED" size="sm" />}
        </div>

        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <MoverName nickName={nickName} size="lg" />
            {description && (
              <p className="text-12 text-gray-gray-500 w-full truncate">{description}</p>
            )}
          </div>
          <ProfileAvatar src={profileImage} alt={nickName} size="64" />
        </div>
      </div>

      {/* sm은 이사 정보가 2행 (출발지·도착지 / 이사일) */}
      <div className="flex w-full flex-col items-start justify-center gap-4">
        <div className="flex w-full items-center gap-4">
          <InfoItem label="출발지" value={from} valueClassName={infoValueClass} />
          <InfoItem label="도착지" value={to} valueClassName={infoValueClass} />
        </div>
        <InfoItem label="이사일" value={movingDate} valueClassName={infoValueClass} />
      </div>

      <div className="border-line-200 flex h-11.75 w-full items-end justify-between border-t">
        <span className="text-14 text-gray-gray-300 font-medium">견적 금액</span>
        <span className="text-18 text-black-black-400 font-bold whitespace-nowrap">
          {price.toLocaleString()}원
        </span>
      </div>

      {writeButton}
    </article>
  );
}
