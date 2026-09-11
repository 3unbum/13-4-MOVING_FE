import RatingStars from "@/component/common/rating-stars";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardReviewSize = "sm" | "lg";

interface CardReviewProps extends HTMLAttributes<HTMLElement> {
  size?: CardReviewSize;
  /** 마스킹된 작성자 아이딛 (예: "kim****") */
  writer: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024-07-01") */
  createdAt: string;
  rating: number;
  content: string;
}

/** 작성자와 날짜를 나누는 세로 구분선 */
function Divider({ size }: { size: CardReviewSize }) {
  return (
    <span
      aria-hidden
      className={clsx("bg-line-200 w-px shrink-0", size === "lg" ? "h-3.5" : "h-3")}
    />
  );
}

/**
 * 기사님 상세 페이지의 리뷰 목록 행.
 * 테두리・그림자가 없고 세로로 이어 붙는 형태.
 *
 * 폭은 부모가 정함 (`w-full`). Button・Input과 같은 방식.
 *
 * 사용법 : <CardReview size="lg" writer="kim****" createdAt="2024-07-01" rating={5} content="..." />
 */
export default function CardReview({
  size = "sm",
  writer,
  createdAt,
  rating,
  content,
  className,
  ...props
}: CardReviewProps) {
  const isLg = size === "lg";

  return (
    <article
      className={clsx(
        "flex w-full flex-col items-start bg-white",
        isLg ? "gap-6 py-6" : "gap-4 py-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-start gap-2">
        <div className={clsx("flex items-center", isLg ? "gap-3.5" : "gap-3")}>
          <span className={clsx("text-black-black-400", isLg ? "text-18" : "text-14")}>
            {writer}
          </span>
          <Divider size={size} />
          <span className={clsx("text-gray-gray-300", isLg ? "text-18" : "text-14")}>
            {createdAt}
          </span>
        </div>

        <RatingStars rating={rating} />
      </div>

      <p className={clsx("text-black-500 w-full", isLg ? "text-18" : "text-14")}>{content}</p>
    </article>
  );
}
