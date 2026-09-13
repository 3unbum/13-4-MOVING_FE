import { requireProfile, requireRole } from "@/lib/auth/guards";

export default async function CustomerProfileEditPage() {
  const account = await requireRole("CUSTOMER", "/customer/login");
  requireProfile(account, "/customer/profile-register");

  return <div>프로필 수정 페이지</div>;
}
