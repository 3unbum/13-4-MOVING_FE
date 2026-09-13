import { type ReactNode } from "react";
import { requireRole } from "@/lib/auth/guards";

// 여기선 role만 확인. hasProfile 하드 게이트가 필요한 페이지(내견적/프로필수정)는
// 전체 중 일부라 mover처럼 (with-profile) 그룹으로 묶지 않고, 각 페이지가 직접
// requireProfile()을 호출한다(src/lib/auth/guards.ts). 견적요청도 BE는 requireProfile이지만
// 하드 게이트 대신 페이지 자체에서 모달로 등록을 유도하고, 찜하기·리뷰·프로필등록은
// 프로필 없이도 접근 가능.
export default async function CustomerProtectedLayout({ children }: { children: ReactNode }) {
  await requireRole("CUSTOMER", "/customer/login");

  return <div>{children}</div>;
}
