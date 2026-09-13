import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function CustomerProfileRegisterPage() {
  const account = await requireRole("CUSTOMER", "/customer/login");
  if (account?.hasProfile) redirect("/");

  return <div>일반유저 프로필 등록 페이지</div>;
}
