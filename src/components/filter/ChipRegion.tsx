import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipSize = "sm" | "md";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ChipSize;
  selected?: boolean;
}

// BE RegionType과 값 맞춤 (지역 선택 그대로 profile API로 전송)
export type RegionCode =
  | "SEOUL"
  | "GYEONGGI"
  | "INCHEON"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "SEJONG"
  | "DAEJEON"
  | "JEONBUK"
  | "JEONNAM"
  | "GWANGJU"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "DAEGU"
  | "ULSAN"
  | "BUSAN"
  | "JEJU";

export const REGION_LABELS: Record<RegionCode, string> = {
  SEOUL: "서울",
  GYEONGGI: "경기",
  INCHEON: "인천",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  SEJONG: "세종",
  DAEJEON: "대전",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GWANGJU: "광주",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  DAEGU: "대구",
  ULSAN: "울산",
  BUSAN: "부산",
  JEJU: "제주",
};
export const REGIONS = Object.keys(REGION_LABELS) as RegionCode[];

// BE ServiceType과 값 맞춤 (이용 서비스 선택 그대로 profile API로 전송)
export type ServiceCode = "SMALL" | "HOME" | "OFFICE";

export const SERVICE_LABELS: Record<ServiceCode, string> = {
  SMALL: "소형이사",
  HOME: "가정이사",
  OFFICE: "사무실이사",
};
export const SERVICES = Object.keys(SERVICE_LABELS) as ServiceCode[];

// 사용법: <Chip size="md" selected={selected} onClick={() => setSelected(!selected)}>서울</Chip>
export default function Chip({
  children,
  size = "sm",
  selected = false,
  className,
  ...props
}: ChipProps) {
  const isMd = size === "md";
  const weightClass = selected || !isMd ? "font-medium" : "font-normal";

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "self-start rounded-full border whitespace-nowrap",
        isMd ? "text-18 px-5 py-2.5" : "text-14 px-3 py-1.5",
        weightClass,
        selected
          ? "border-orange-400 bg-orange-100 text-orange-400"
          : "bg-background-background-100 text-black-black-400 border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
