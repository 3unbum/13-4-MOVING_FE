import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import InfoItem from "@/component/common/info-item";
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
    "flex w-full flex-col bg-white",
    "shadow-[inset_0_0_0_0.5px_var(--color-line-100),-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
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

        <div className="flex w-full items-center gap-5">
          <InfoItem
            label="출발지"
            value={from}
            labelClassName={isLg ? "text-14" : "text-12 leading-[18px]"}
            valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
          />
          <VerticalLine />
          <InfoItem
            label="도착지"
            value={to}
            labelClassName={isLg ? "text-14" : "text-12 leading-[18px]"}
            valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
          />
          <VerticalLine />
          <InfoItem
            label="이사일"
            value={movingDate}
            labelClassName={isLg ? "text-14" : "text-12"}
            valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
          />
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
          <MoverName nickName={nickName} size="lg" stacked />
          <ProfileAvatar src={profileImage} alt={nickName} size="50" />
        </div>
      </div>

      <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />

      <div className="flex w-full items-center gap-4">
        <InfoItem
          label="출발지"
          value={from}
          labelClassName={isLg ? "text-14" : "text-12 leading-[18px]"}
          valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
        />
        <InfoItem
          label="도착지"
          value={to}
          labelClassName={isLg ? "text-14" : "text-12 leading-[18px]"}
          valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
        />
        <InfoItem
          label="이사일"
          value={movingDate}
          labelClassName={isLg ? "text-14" : "text-12 leading-[18px]"}
          valueClassName={clsx("text-black-100 font-medium", isLg ? "text-14" : "text-13")}
        />
      </div>

      <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />

      {review}

      {createdAt && (
        <p className="text-12 text-gray-gray-300 flex w-full justify-end gap-1.5 leading-4.5">
          <span>작성일</span>
          <span>{createdAt}</span>
        </p>
      )}
    </article>
  );
}
