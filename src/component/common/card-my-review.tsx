import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import MoverName from "@/component/common/mover-name";
import ProfileAvatar from "@/component/common/profile-avatar";
import RatingStars from "@/component/common/rating-stars";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardMyReviewSize = "sm" | "lg";

interface CardMyReviewProps extends HTMLAttributes<HTMLElement> {
  size?: CardMyReviewSize;
  category: ServiceCode;
  /** 지정 견적 요청 여부 - sm에서만 칩으로 표시됨 */
  isTargeted?: boolean;
  nickName: string;
  profileImage?: string | null;
  /** 기사님 한 줄 소개 - lg에서만 표시 */
  description?: string;
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 */
  movingDate: string;
  rating: number;
  content: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024.07.02") - sm에서만 표시 */
  createdAt?: string;
}

/**
 * 이사 정보 한 쌍.
 * `MovingInfo`와 값이 달라(폰트・색・구분선) 이 카드 전용.
 */
function InfoItem({
  label,
  value,
  size,
}: {
  label: string;
  value: string;
  size: CardMyReviewSize;
}) {
  const isLg = size === "lg";

  return (
    <div className="win-w-0 flex flex-col items-start justify-center">
      <span className={clsx("text-gray-gray-500", isLg ? "text-14" : "text-12")}>{label}</span>
      <span
        className={clsx(
          "text-black-100 max-w-full truncate font-medium",
          isLg ? "text-14" : "text-13"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** lg의 세로 구분선 */
function VerticalLine() {
  return <span aria-hidden className="bg-line-200 h-12.5 w-px shrink-0" />;
}

/**
 * 내가 작성한 리뷰 카드.
 * lg는 프로필이 왼쪽 가로 배치, sm은 칩이 위로 가고 프로필이 오른쪽으로 감.
 *
 * 폭은 부모가 정한다. (`w-full`)
 *
 * 사용법 : <CardMyReview size="lg" category="SMALL" nickName="김코드" rating={5} content="..." />
 */
export default function CardMyReview({
  size = "sm",
  category,
  isTargeted = false,
  nickName,
  profileImage,
  description,
  from,
  to,
  movingDate,
  rating,
  content,
  createdAt,
  className,
  ...props
}: CardMyReviewProps) {
  const isLg = size === "lg";

  const cardClass = clsx(
    "border-line-100 flex w-full flex-col border-[0.5px] bg-white",
    "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)",
    "rounded-[20px]",
    isLg ? "gap-5 p-10" : "gap-4 px-5 py-6",
    className
  );

  const review = (
    <div className="flex w-full flex-col items-start gap-3">
      <RatingStars rating={rating} />
      <p className={clsx("text-black-black-400 w-full font-medium", isLg ? "text-18" : "text-16")}>
        {content}
      </p>
    </div>
  );

  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full items-start gap-5">
          <ProfileAvatar src={profileImage} alt={nickName} size="md" />

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

        <div className="flex w-full items-center gap-5">
          <InfoItem label="출발지" value={from} size={size} />
          <VerticalLine />
          <InfoItem label="도착지" value={to} size={size} />
          <VerticalLine />
          <InfoItem label="이사일" value={movingDate} size={size} />
        </div>

        {review}
      </article>
    );
  }

  // sm - 칩이 맨 위, 프로필이 오른쪽
  return (
    <article className={cardClass} {...props}>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <MoveTypeChip variant={category} size="sm" />
          {isTargeted && <MoveTypeChip variant="TARGETED" size="sm" />}
        </div>

        <div className="flex w-full items-center justify-between">
          <MoverName nickName={nickName} size="lg" />
          <ProfileAvatar src={profileImage} alt={nickName} size="sm" />
        </div>
      </div>

      <hr className="border-line-100 w-full border-t" />

      <div className="flex w-full items-center gap-4">
        <InfoItem label="출발지" value={from} size={size} />
        <InfoItem label="도착지" value={to} size={size} />
        <InfoItem label="이사일" value={movingDate} size={size} />
      </div>

      <hr className="border-line-100 w-full border-t" />

      {review}

      {createdAt && (
        <p className="text-12 text-gray-gray-300 flex w-full justify-end gap-1.5">
          <span>작성일</span>
          <span>{createdAt}</span>
        </p>
      )}
    </article>
  );
}
