import type { HTMLAttributes } from "react";
import likeActive from "@/assets/icons/like-md-red-active.svg";
import likeDefault from "@/assets/icons/like-md-default.svg";
import CheckboxButton from "@/component/common/checkbox-button";
import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import MoverMeta from "@/component/common/mover-meta";
import MoverName from "@/component/common/mover-name";
import ProfileAvatar from "@/component/common/profile-avatar";
import clsx from "clsx";
import Image from "next/image";

type CardMoverSize = "sm" | "md" | "lg";

interface CardMoverProps extends HTMLAttributes<HTMLElement> {
  size?: CardMoverSize;
  /** 이사 종류 - quotation_request.category */
  category: ServiceCode;
  /** 지정 견젹 요청 여부 - targeted_request 조인 결과. 별도 칩으로 나란히 표시. */
  isTargeted?: boolean;
  /** 기사님 한 줄 소개 (제목) */
  title: string;
  /** 상세 설명. sm에서는 표시하지 않음 */
  description?: string;
  nickName: string;
  profileImage?: string | null;
  rating: number;
  reviewCount: number;
  career: number;
  confirmedCount: number;
  favoriteCount: number;
  isFavorited?: boolean;
  /** lg에서만 노출되는 선택 체크박스 */
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onFavoriteClick?: () => void;
  className?: string;
}

/** 찜 하트 + 개수. onClick이 없으면 표시 전용 */
function FavoriteCount({
  count,
  isFavorited = false,
  showCount = true,
  onClick,
}: {
  count: number;
  isFavorited?: boolean;
  showCount?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Image src={isFavorited ? likeActive : likeDefault} alt="" className="size-6 shrink-0" />
      {showCount && <span className="text-14 text-gray-gray-500">{count}</span>}
    </>
  );

  // 핸들러가 없으면 불필요한 버튼 시맨틱을 만들지 않음
  if (!onClick) {
    return <div className="flex shrink-0 items-center justify-center gap-0.5">{content}</div>;
  }

  return (
    <button
      type="button"
      aria-label="찜하기"
      aria-pressed={isFavorited}
      onClick={onClick}
      className="flex shrink-0 cursor-pointer items-center justify-center gap-0.5"
    >
      {content}
    </button>
  );
}

// 사용법: <CardMover size="lg" category="SMALL" isTargeted title="..." nickName="김코드" ... />
export default function CardMover({
  size = "md",
  category,
  isTargeted = false,
  title,
  description,
  nickName,
  profileImage,
  rating,
  reviewCount,
  career,
  confirmedCount,
  favoriteCount,
  isFavorited = false,
  selectable = false,
  selected = false,
  onSelectChange,
  onFavoriteClick,
  className,
  ...props
}: CardMoverProps) {
  const isLg = size === "lg";
  const isMd = size === "md";

  const cardClass = clsx(
    "border-line-100 flex flex-col border-[0.5px] bg-white",
    "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
    isLg ? "w-300 rounded-[20px] px-7 py-6" : "w-81.75 rounded-2xl p-5",
    isMd && "gap-2",
    className
  );

  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full flex-col items-start gap-3">
          <div className="flex h-8.5 w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <MoveTypeChip variant={category} size="md" />
              {isTargeted && <MoveTypeChip variant="TARGETED" size="md" />}
            </div>
            {selectable && (
              <CheckboxButton
                shape="square"
                aria-label={`${nickName} 기사님 선택`}
                checked={selected}
                onChange={(e) => onSelectChange?.(e.target.checked)}
              />
            )}
          </div>

          <div className="flex w-full items-start gap-5">
            <ProfileAvatar src={profileImage} alt={nickName} size="lg" />

            <div className="flex min-w-px flex-1 flex-col gap-5 self-stretch py-1">
              <div className="flex w-full flex-col">
                <p className="text-20 text-black-black-300 font-semibold">{title}</p>
                {description && (
                  <p className="text-14 text-gray-gray-500 truncate">{description}</p>
                )}
              </div>

              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col gap-1">
                  <MoverName nickName={nickName} size="lg" />
                  <MoverMeta
                    rating={rating}
                    reviewCount={reviewCount}
                    career={career}
                    confirmedCount={confirmedCount}
                  />
                </div>
                <FavoriteCount
                  count={favoriteCount}
                  isFavorited={isFavorited}
                  onClick={onFavoriteClick}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (isMd) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex items-center gap-2">
          <MoveTypeChip variant={category} size="sm" />
          {isTargeted && <MoveTypeChip variant="TARGETED" size="sm" />}
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col">
            <p className="text-16 text-black-black-300 font-semibold">{title}</p>
            {description && (
              <p className="text-13 text-gray-gray-500 truncate font-medium">{description}</p>
            )}
          </div>

          <hr className="border-line-100 w-full border-t" />

          <div className="flex w-full items-center gap-2">
            <ProfileAvatar src={profileImage} alt={nickName} size="sm" />

            <div className="flex flex-col gap-1">
              <div className="flex w-53.75 items-center justify-between">
                <MoverName nickName={nickName} size="md" />
                <FavoriteCount
                  count={favoriteCount}
                  isFavorited={isFavorited}
                  onClick={onFavoriteClick}
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
        </div>
      </article>
    );
  }

  // sm
  return (
    <article className={clsx(cardClass, "items-end")} {...props}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <MoveTypeChip variant={category} size="sm" />
          {isTargeted && <MoveTypeChip variant="TARGETED" size="sm" />}
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          <p className="text-16 text-black-black-300 w-full font-semibold">{title}</p>

          <div className="flex w-full items-center gap-2">
            <ProfileAvatar src={profileImage} alt={nickName} size="sm" />

            <div className="flex min-w-px flex-1 flex-col gap-1">
              <div className="flex w-full items-center gap-1">
                <MoverName nickName={nickName} size="sm" />
                <FavoriteCount
                  count={favoriteCount}
                  isFavorited={isFavorited}
                  onClick={onFavoriteClick}
                  showCount={false}
                />
              </div>
              <MoverMeta
                rating={rating}
                reviewCount={reviewCount}
                career={career}
                confirmedCount={confirmedCount}
                className="gap-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
