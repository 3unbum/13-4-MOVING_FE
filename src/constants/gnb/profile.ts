import type { GnbRole } from "@/constants/gnb/nav";

export type GnbProfileAction = "edit" | "favorite" | "review" | "mypage" | "logout";

export interface GnbProfileOption {
  value: GnbProfileAction;
  label: string;
  /** 로그아웃 등 보조 액션 — 하단 구분선 영역 */
  tone?: "default" | "muted";
}

export const CUSTOMER_PROFILE_OPTIONS: GnbProfileOption[] = [
  { value: "edit", label: "프로필 관리" },
  { value: "favorite", label: "찜한 기사님" },
  { value: "review", label: "이사 리뷰" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

export const MOVER_PROFILE_OPTIONS: GnbProfileOption[] = [
  { value: "mypage", label: "마이페이지" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

export const GNB_LOGIN_PATH = "/customer/login";
export const GNB_HOME_PATH = "/";

/** 로그아웃은 라우트가 아니라 액션이라 맵에서 제외 */
export const GNB_PROFILE_PATHS: Record<Exclude<GnbProfileAction, "logout">, string> = {
  edit: "/customer/profile-edit",
  favorite: "/customer/favorites",
  review: "/customer/reviews",
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
