import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  // 마스코트 이미지(둘 다 있어야 렌더링) — customer: avatartion_md/lg, mover: car-sm/md
  mascotTabletSrc?: StaticImageData;
  mascotPcSrc?: StaticImageData;
}

// overflow-x-clip: mascot가 삐져나가 생기는 가로 스크롤만 막음(overflow-hidden은 세로축도 auto로 승격시켜 이중 스크롤 유발)
// 배경은 main이 아닌 fixed 레이어: 폼이 길어져도 항상 뷰포트 전체를 덮기 위함
export default function AuthCard({ children, mascotTabletSrc, mascotPcSrc }: AuthCardProps) {
  return (
    <>
      <div className="tablet:bg-orange-400 tablet:block fixed inset-0 -z-10 hidden" aria-hidden />
      <main className="tablet:bg-transparent tablet:py-16 flex flex-1 flex-col items-center justify-center overflow-x-clip bg-white px-6 py-10">
        <div className="tablet:max-w-160 tablet:gap-12 tablet:rounded-[40px] tablet:bg-gray-50 tablet:px-10 tablet:py-17 pc:max-w-185 pc:px-12.5 pc:py-12 relative flex w-full max-w-100 flex-col items-center gap-10">
          {children}
          {mascotTabletSrc && mascotPcSrc && (
            <>
              {/* 좌표는 Figma 실측값, object-contain+left-bottom 정렬로 에셋 비율 차이 잘림 방지. 모바일엔 없음 */}
              <Image
                src={mascotTabletSrc}
                alt=""
                className="tablet:block pc:hidden pointer-events-none absolute top-186 left-125.75 hidden h-61.5 w-60 object-contain object-left-bottom"
              />
              <Image
                src={mascotPcSrc}
                alt=""
                className="pc:block pointer-events-none absolute top-134 left-170 hidden h-98 w-95.5 object-contain object-left-bottom"
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
