"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import movingCar from "@/assets/images/common/moving_car.png";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils/cn";

interface QuoteEmptyStateProps {
  /** 본문 문구 — 줄바꿈은 \n으로 넣습니다 */
  message: string;
  /** 트럭 일러스트 노출 여부 (피그마에 있는 "견적 못 받은 경우"에만 true) */
  showIllustration?: boolean;
  /** CTA 버튼 — 넘기지 않으면 문구만 보여줍니다 */
  action?: { label: string; href: string };
  className?: string;
}

/**
 * 견적 목록이 비었을 때의 공통 화면.
 *
 * 피그마에 있는 건 "요청은 했는데 견적이 0건"인 경우 하나뿐입니다(트럭 + 안내 문구, CTA 없음).
 * "요청 자체가 없는 경우"와 "받았던 견적이 없는 경우"는 시안이 없어 같은 레이아웃에
 * 문구·CTA만 바꿔 씁니다 — 9/11 회의록의 "견적이 없다? → 선택지 보여주면 됨" 기준.
 */
export default function QuoteEmptyState({
  message,
  showIllustration = false,
  action,
  className,
}: QuoteEmptyStateProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        // flex-1로 남은 높이를 채웁니다 — 부모(탭 패널)가 flex 컬럼이라 높이는 거기서 옵니다
        "bg-background-background-100 flex w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-20",
        className
      )}
    >
      {showIllustration && (
        // 피그마 모바일 184 / 태블릿·PC 280. 원본은 560이라 2x까지 선명합니다.
        <Image
          src={movingCar}
          alt=""
          className="tablet:size-70 size-46"
          sizes="(min-width: 744px) 280px, 184px"
        />
      )}

      <p className="text-14 tablet:text-20 text-gray-gray-400 text-center font-medium whitespace-pre-line">
        {message}
      </p>

      {action && (
        <div className="w-full max-w-81.75">
          <Button
            variant="solid"
            size="sm"
            className="tablet:h-15 tablet:text-18"
            onClick={() => router.push(action.href)}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
