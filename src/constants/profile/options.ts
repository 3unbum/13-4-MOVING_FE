// BE ServiceType/RegionType과 값 맞춤 (프로필 등록/수정 API에 그대로 전송)
export const SERVICE_OPTIONS = [
  { value: "SMALL", label: "소형이사" },
  { value: "HOME", label: "가정이사" },
  { value: "OFFICE", label: "사무실이사" },
] as const;

// 서버 enum 순서(RegionType) 그대로 — 피그마 칩 배치(5 / 5 / 5 / 2)와 동일한 순서
export const REGION_OPTIONS = [
  { value: "SEOUL", label: "서울" },
  { value: "GYEONGGI", label: "경기" },
  { value: "INCHEON", label: "인천" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "SEJONG", label: "세종" },
  { value: "DAEJEON", label: "대전" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GWANGJU", label: "광주" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "DAEGU", label: "대구" },
  { value: "ULSAN", label: "울산" },
  { value: "BUSAN", label: "부산" },
  { value: "JEJU", label: "제주" },
] as const;

export type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"];
export type RegionValue = (typeof REGION_OPTIONS)[number]["value"];
