import emptyReview from "@/assets/images/common/empty-review.png";
import Button from "@/components/common/Button";
import Image from "next/image";

interface FavoritesEmptyFallbackProps {
  onFindMovers: () => void;
}

/** 피그마 찜 화면에는 empty 프레임이 없어, 리뷰와 같은 empty 컴포넌트를 재사용한다. */
export default function FavoritesEmptyFallback({ onFindMovers }: FavoritesEmptyFallbackProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="pc:w-[955px] pc:px-45 pc:py-45 flex w-[327px] flex-col items-center justify-center">
        <div className="pc:gap-8 flex w-full flex-col items-center gap-6">
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
            찜한 기사님이 없어요!
          </p>
          <div className="pc:hidden w-full">
            <Button size="sm" onClick={onFindMovers}>
              기사님 찾기
            </Button>
          </div>
          <div className="pc:block hidden w-55">
            <Button size="lg" onClick={onFindMovers}>
              기사님 찾기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
