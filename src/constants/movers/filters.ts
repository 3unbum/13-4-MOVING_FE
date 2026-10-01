import type { MoverListSort } from "@/lib/services/mover-service";

/** 기사님 찾기 UI·API 공통 상수 */

/** 목록 한 페이지 크기 (BE default 10, max 20) */
export const MOVER_LIST_PAGE_SIZE = 10;

/** PC 사이드바 — BE favorites limit 최대 3 */
export const SIDEBAR_FAVORITE_LIMIT = 3;

/** Filter 서비스 옵션 — value는 UI/프로필용 코드, label은 표시용 */
export const SERVICE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "SMALL", label: "소형이사" },
  { value: "HOME", label: "가정이사" },
  { value: "OFFICE", label: "사무실이사" },
] as const;

/** 지역 더블 컬럼 Filter — BE RegionType 전체 */
export const REGION_COLUMNS: [
  { value: string; label: string }[],
  { value: string; label: string }[],
] = [
  [
    { value: "ALL", label: "전체" },
    { value: "GYEONGGI", label: "경기" },
    { value: "GANGWON", label: "강원" },
    { value: "CHUNGNAM", label: "충남" },
    { value: "DAEJEON", label: "대전" },
    { value: "JEONNAM", label: "전남" },
    { value: "GYEONGBUK", label: "경북" },
    { value: "DAEGU", label: "대구" },
    { value: "BUSAN", label: "부산" },
  ],
  [
    { value: "SEOUL", label: "서울" },
    { value: "INCHEON", label: "인천" },
    { value: "CHUNGBUK", label: "충북" },
    { value: "SEJONG", label: "세종" },
    { value: "JEONBUK", label: "전북" },
    { value: "GWANGJU", label: "광주" },
    { value: "GYEONGNAM", label: "경남" },
    { value: "ULSAN", label: "울산" },
    { value: "JEJU", label: "제주" },
  ],
];

/** value = BE sort 쿼리 enum */
export const SORT_OPTIONS: { value: MoverListSort; label: string }[] = [
  { value: "review", label: "리뷰 많은순" },
  { value: "rating", label: "평점 높은순" },
  { value: "career", label: "경력 높은순" },
  { value: "confirmed", label: "확정 많은순" },
];

/** 초기화 버튼·첫 진입 기본값 */
export const DEFAULT_MOVER_FILTERS = {
  search: "",
  region: "ALL",
  service: "ALL",
  sort: "review" as MoverListSort,
};
