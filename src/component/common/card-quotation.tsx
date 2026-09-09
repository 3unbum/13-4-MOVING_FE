import writingIcon from "@/assets/icons/writing-md.svg";
import Button from "@/component/common/button";
import {
  CardOverlay,
  ConfirmedBadge,
  ElapsedTime,
  PriceFooter,
} from "@/component/common/card-parts";
import CardRequest from "@/component/common/card-request";
import type { ServiceCode } from "@/component/common/chip-region";
import clsx from "clsx";
import Image from "next/image";

type CardSize = "sm" | "lg";

/** 4종이 공통으로 받는 견적 요청 정보 */
interface RequestBase {
  size?: CardSize;
  category: ServiceCode;
  isTargeted?: boolean;
  customerName: string;
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024년 07월 01일 (월)") */
  movingDate: string;
  className?: string;
}

/** 견적 보내기 버튼 — 라벨 뒤에 writing 아이콘이 붙습니다 */
function SendEstimateButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="solid"
      size="sm"
      onClick={onClick}
      icon={<Image src={writingIcon} alt="" className="size-6 shrink-0" />}
    >
      견적 보내기
    </Button>
  );
}

/* ── 고객 견적 (1:13429 / 1:13460) ────────────────────────────── */

interface CardCustomerQuotationProps extends RequestBase {
  price: number;
  /** 확정된 견적이면 우측 상단에 "확정견적" 배지가 보입니다 */
  isConfirmed?: boolean;
}

// 사용법: <CardCustomerQuotation size="lg" category="SMALL" customerName="김인서" price={180000} isConfirmed />
export function CardCustomerQuotation({
  size = "sm",
  price,
  isConfirmed = false,
  ...rest
}: CardCustomerQuotationProps) {
  return (
    <CardRequest
      size={size}
      headerRight={<ConfirmedBadge visible={isConfirmed} />}
      footer={<PriceFooter price={price} size={size} />}
      {...rest}
    />
  );
}

/* ── 받은 요청 (1:13236 / 1:13267) ────────────────────────────── */

interface CardReceivedRequestProps extends RequestBase {
  /** 표시용으로 이미 포맷된 경과 시간 (예: "1시간 전") */
  elapsedTime: string;
  onSendEstimate?: () => void;
  onReject?: () => void;
}

// 사용법: <CardReceivedRequest size="lg" category="SMALL" customerName="김인서" elapsedTime="1시간 전" />
export function CardReceivedRequest({
  size = "sm",
  elapsedTime,
  onSendEstimate,
  onReject,
  ...rest
}: CardReceivedRequestProps) {
  const isLg = size === "lg";

  // lg는 [반려하기][견적 보내기] 가로, sm은 [견적 보내기][반려하기] 세로 — 순서가 반대입니다
  const rejectButton = (
    <Button variant="outlined" size="sm" onClick={onReject}>
      반려하기
    </Button>
  );
  const sendButton = <SendEstimateButton onClick={onSendEstimate} />;

  return (
    <CardRequest
      size={size}
      headerRight={<ElapsedTime>{elapsedTime}</ElapsedTime>}
      footer={
        <div className={clsx("flex w-full", isLg ? "gap-2.75" : "flex-col gap-2.75")}>
          {isLg ? (
            <>
              {rejectButton}
              {sendButton}
            </>
          ) : (
            <>
              {sendButton}
              {rejectButton}
            </>
          )}
        </div>
      }
      {...rest}
    />
  );
}

/* ── 반려 요청 (1:13370 / 1:13399) ────────────────────────────── */

// 사용법: <CardRejectedRequest size="lg" category="SMALL" customerName="김인서" />
export function CardRejectedRequest({ size = "sm", ...rest }: RequestBase) {
  return (
    <CardRequest size={size} overlay={<CardOverlay message="반려된 요청이에요" />} {...rest} />
  );
}

/* ── 이사완료 (1:13299 / 1:13334) ─────────────────────────────── */

interface CardCompletedProps extends RequestBase {
  price: number;
  isConfirmed?: boolean;
  onDetailClick?: () => void;
}

// 사용법: <CardCompleted size="lg" category="SMALL" customerName="김인서" price={180000} />
export function CardCompleted({
  size = "sm",
  price,
  isConfirmed = false,
  onDetailClick,
  ...rest
}: CardCompletedProps) {
  return (
    <CardRequest
      size={size}
      /* 고객 견적과 달리 default에는 배지 자리 자체가 없습니다 (피그마 1:13299) */
      headerRight={isConfirmed ? <ConfirmedBadge /> : undefined}
      footer={<PriceFooter price={price} size={size} />}
      overlay={
        <CardOverlay message="이사 완료된 견적이에요">
          {/* 오버레이 위에서는 흰 배경 대신 orange-100입니다 (피그마 1:13333) */}
          <Button
            variant="outlined"
            size="sm"
            onClick={onDetailClick}
            className="bg-orange-100 not-disabled:hover:bg-orange-200"
          >
            견적 상세보기
          </Button>
        </CardOverlay>
      }
      {...rest}
    />
  );
}
