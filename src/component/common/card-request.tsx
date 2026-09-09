import MoveTypeChip from "@/component/common/chip-move-type";
import type { ServiceCode } from "@/component/common/chip-region";
import MovingInfo from "@/component/common/moving-info";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type CardRequestSize = "sm" | "lg";

interface CardRequestProps extends HTMLAttributes<HTMLElement> {
  size?: CardRequestSize;
  /** 이사 종류 - quotation_request.category */
  category: ServiceCode;
  /** 지정 견적 요청 여부 - targeted_request 조인 결과. 별도 칩으로 나란히 표시 */
  isTargeted?: boolean;
  /** 고객 이름. "고객님"은 컴포넌트가 붙임 */
  customerName: string;
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024년 07월 01일 (월)") */
  movingDate: string;
  /** 칩 줄 오른쪽 끝 — 확정견적 배지, "1시간 전" 등 카드마다 다름 */
  headerRight?: ReactNode;
  /** 구분선 아래 영역 — 견적 금액, 버튼 그룹 등 */
  footer?: ReactNode;
  /** 카드 전체를 덮는 딤 레이어 — 반려/이사완료 카드용 */
  overlay?: ReactNode;
}

/**
 * 고객 정보형 카드(기사님이 보는 화면)의 공통 뼈대.
 * 고객 견적·받은 요청·반려 요청·이사완료 4종이 상단 구조를 그대로 공유하고
 * headerRight / footer / overlay 세 슬롯만 달라집니다.
 *
 * 사용법: <CardRequest size="lg" category="SMALL" isTargeted customerName="김인서" from="서울시 중구" to="경기도 수원시" movingDate="2024년 07월 01일 (월)" footer={...} />
 */
export default function CardRequest({
  size = "sm",
  category,
  isTargeted = false,
  customerName,
  from,
  to,
  movingDate,
  headerRight,
  footer,
  overlay,
  className,
  ...props
}: CardRequestProps) {
  const isLg = size === "lg";

  return (
    <article
      className={clsx(
        "border-line-100 relative flex flex-col items-start border-[0.5px] bg-white",
        "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
        isLg ? "w-147 gap-8 rounded-[20px] px-10 py-8" : "w-82 gap-6 rounded-[20px] px-5 py-6",
        className
      )}
      {...props}
    >
      <div className={clsx("flex w-full flex-col items-start", isLg ? "gap-6" : "gap-4")}>
        {/* headerRight가 있는 카드만 헤더가 34px로 커집니다 (배지·경과시간이 칩보다 높음) */}
        <div
          className={clsx(
            "flex w-full items-center justify-between",
            headerRight ? "min-h-8.5" : "min-h-8"
          )}
        >
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isLg ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isLg ? "md" : "sm"} />}
          </div>
          {headerRight}
        </div>

        <div className="flex w-full flex-col gap-3">
          <p className="text-20 text-black-black-300 flex items-center gap-2 font-semibold whitespace-nowrap">
            <span>{customerName}</span>
            <span>고객님</span>
          </p>
          <hr className="border-line-100 w-full border-t" />
        </div>

        <MovingInfo from={from} to={to} movingDate={movingDate} size={size} />
      </div>

      {footer}

      {overlay}
    </article>
  );
}
