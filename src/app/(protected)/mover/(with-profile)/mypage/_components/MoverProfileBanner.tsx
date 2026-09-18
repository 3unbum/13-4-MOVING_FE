import Image from "next/image";
import moverProfileBannerLg from "@/assets/images/common/mover-profile-banner-lg.svg";
import moverProfileBannerMd from "@/assets/images/common/mover-profile-banner-md.svg";
import moverProfileBannerSm from "@/assets/images/common/mover-profile-banner-sm.svg";

// 기사님 상세 페이지(MoverDetailClient)와 같은 방식 — breakpoint별 배너를 피그마에서 그대로
export default function MoverProfileBanner() {
  return (
    <div className="tablet:h-39.25 pc:h-45 relative h-30.5 w-full overflow-hidden bg-orange-400">
      <Image
        src={moverProfileBannerSm}
        alt=""
        width={375}
        height={122}
        unoptimized
        priority
        className="tablet:hidden pointer-events-none absolute inset-0 size-full object-cover object-center"
      />
      <Image
        src={moverProfileBannerMd}
        alt=""
        width={744}
        height={157}
        unoptimized
        className="tablet:block pc:hidden pointer-events-none absolute inset-0 hidden size-full object-cover object-center"
      />
      <Image
        src={moverProfileBannerLg}
        alt=""
        width={1920}
        height={180}
        unoptimized
        className="pc:block pointer-events-none absolute inset-0 hidden size-full object-cover object-center"
      />
    </div>
  );
}
