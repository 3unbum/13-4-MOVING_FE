import emptyReview from "@/assets/images/common/empty-review.png";
import Button from "@/components/common/Button";
import Image from "next/image";

interface ReviewsEmptyFallbackProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** 피그마 img/Component/empty — sm 327×484, lg 955×716 */
export default function ReviewsEmptyFallback({
  message,
  actionLabel,
  onAction,
}: ReviewsEmptyFallbackProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="pc:w-[955px] pc:px-45 pc:py-45 flex w-[327px] flex-col items-center justify-center">
        <div className="pc:gap-8 flex w-full flex-col items-center gap-6">
          {/* Frame 2610797: 240×196 클립, 안쪽 에셋 260.6에 grayscale + opacity 50 */}
          <div className="relative h-[196px] w-[240px] overflow-hidden">
            <Image
              src={emptyReview}
              alt=""
              width={1000}
              height={1000}
              className="absolute top-[-16.29px] left-[-11.04px] size-[260.633px] max-w-none opacity-50 grayscale"
            />
          </div>
          <p className="text-16 pc:text-24 text-gray-gray-400 text-center whitespace-nowrap">
            {message}
          </p>
          {actionLabel && onAction ? (
            <>
              {/* 모바일·태블릿: 피그마 empty 327 폭에 버튼이 꽉 참 / PC: 컴팩트 CTA */}
              <div className="pc:hidden w-full">
                <Button size="sm" onClick={onAction}>
                  {actionLabel}
                </Button>
              </div>
              <div className="pc:block hidden w-55">
                <Button size="lg" onClick={onAction}>
                  {actionLabel}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
