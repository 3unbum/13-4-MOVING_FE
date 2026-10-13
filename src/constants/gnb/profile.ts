import type { GnbRole } from "@/constants/gnb/nav";

export type GnbProfileAction = "edit" | "favorite" | "review" | "payment" | "mypage" | "logout";

export interface GnbProfileOption {
  value: GnbProfileAction;
  label: string;
  /** 로그아웃 등 보조 액션 — 하단 구분선 영역 */
  tone?: "default" | "muted";
}

/**
 * ⚠️ `label`은 **번역을 못 쓰는 곳의 폴백**입니다. 화면 표기는
 * `messages/*.json`의 `gnb.menu_items.{value}`를 씁니다 (DropdownProfile 참고).
 */
export const CUSTOMER_PROFILE_OPTIONS: GnbProfileOption[] = [
  { value: "edit", label: "프로필 관리" },
  { value: "favorite", label: "찜한 기사님" },
  { value: "review", label: "이사 리뷰" },
  { value: "payment", label: "결제 내역" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

export const MOVER_PROFILE_OPTIONS: GnbProfileOption[] = [
  { value: "mypage", label: "마이페이지" },
  { value: "payment", label: "결제 내역" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

export const GNB_LOGIN_PATH = "/customer/login";
export const GNB_HOME_PATH = "/";

/** 기사님의 결제 내역 — 기사님 "내 견적 관리"의 결제 내역 탭 */
export const GNB_MOVER_PAYMENT_PATH = "/mover/my-quotes?tab=payHistory";

/** 로그아웃은 라우트가 아니라 액션이라 맵에서 제외 */
export const GNB_PROFILE_PATHS: Record<Exclude<GnbProfileAction, "logout">, string> = {
  edit: "/customer/profile-edit",
  favorite: "/customer/favorites",
  review: "/customer/reviews",
  // 결제 내역은 역할마다 "내 견적 관리"의 결제 내역 탭이라 경로가 다릅니다 — 기사님은 GNB_MOVER_PAYMENT_PATH
  payment: "/customer/my-quotes?tab=payHistory",
  mypage: "/mover/mypage",
};

export function getGnbProfileOptions(role: GnbRole): GnbProfileOption[] {
  return role === "mover" ? MOVER_PROFILE_OPTIONS : CUSTOMER_PROFILE_OPTIONS;
}

export function isGnbProfilePathAction(
  value: string
): value is Exclude<GnbProfileAction, "logout"> {
  return value in GNB_PROFILE_PATHS;
}
