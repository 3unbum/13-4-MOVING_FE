import starActive from "@/assets/icons/star-sm-active.svg";
import starDefault from "@/assets/icons/star-sm-default.svg";
import clsx from "clsx";
import Image from "next/image";

const MAX_RATING = 5;

interface RatingStarsProps {
  /** 0~5. 소수점은 반올림해서 채운 별 개수를 정한다 */
  rating: number;
  className?: string;
}

/**
 * 별점 표시 (별 5개). 리뷰 카드 계열이 공유.
 *
 * 피그마는 별을 gap 없이 붙여 놓음. (20px x 5 = 100px).
 * 별점 입력(클릭)은 모달 담당자 몫이라 여기서는 표시 전용.
 *
 * 사용법 : <RatingStars rating={5} />
 */
export default function RatingStars({ rating, className }: RatingStarsProps) {
  const filled = Math.round(rating);

  return (
    <div
      className={clsx("flex items-start", className)}
      role="img"
      aria-label={`별점 ${rating}점 (5점 만점)`}
    >
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <Image
          key={i}
          src={i < filled ? starActive : starDefault}
          alt=""
          className="size-5 shrink-0"
        />
      ))}
    </div>
  );
}
