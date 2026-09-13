import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { findMyAccount } from "@/lib/auth/find-my-account";
import type { AccountResponse } from "@/lib/services/auth-service";

/**
 * 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하면 자기 role의 홈으로 보낸다.
 * mover는 프로필 하드 게이트가 있어 hasProfile false면 등록 페이지로 보낸다.
 */
function homePathFor(account: AccountResponse) {
  if (account.role === "CUSTOMER") {
    return "/";
  }
  return account.hasProfile ? "/mover/requests" : "/mover/profile-register";
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const account = await findMyAccount();
  if (account) {
    redirect(homePathFor(account));
  }

  return <>{children}</>;
}
