import clsx from "clsx";

interface InfoItemProps {
  label: string;
  value: string;
  /** 라벨 크기 — 기본 text-14 */
  labelClassName?: string;
  /** 값의 크기·색·굵기 — 카드마다 달라 호출부가 정합니다 */
  valueClassName?: string;
  className?: string;
}

/**
 * 이사 정보 한 쌍(라벨 + 값). Card-list 리뷰 계열이 공유합니다.
 *
 * 값의 스타일이 카드마다 달라 클래스를 호출부에서 받습니다.
 * - 내가 작성한 리뷰: `text-14/13 black-100 medium`
 * - 작성 가능한 리뷰: `text-16/14 black-500 regular`
 *
 * (`MovingInfo`는 `text-16 black-500 semibold`에 화살표 아이콘이 들어가는
 *  별도 컴포넌트입니다. 고객 견적·받은 요청 계열과 리뷰쓰기 모달이 씁니다.)
 *
 * 사용법: <InfoItem label="출발지" value="서울시 중구" valueClassName="text-16 text-black-500" />
 */
export default function InfoItem({
  label,
  value,
  labelClassName = "text-14",
  valueClassName,
  className,
}: InfoItemProps) {
  return (
    <div className={clsx("flex min-w-0 flex-col items-start justify-center", className)}>
      <span className={clsx("text-gray-gray-500", labelClassName)}>{label}</span>
      <span className={clsx("max-w-full truncate", valueClassName)}>{value}</span>
    </div>
  );
}
