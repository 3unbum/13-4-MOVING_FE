import { requireProfile, requireRole } from "@/lib/auth/guards";

export default async function CustomerMyQuoteDetailPage() {
  const account = await requireRole("CUSTOMER", "/customer/login");
  requireProfile(account, "/customer/profile-register");

  return <div>받은 견적 상세 페이지</div>;
}
