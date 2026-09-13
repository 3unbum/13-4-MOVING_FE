import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function MoverProfileRegisterPage() {
  const account = await requireRole("MOVER", "/mover/login");
  if (account?.hasProfile) redirect("/mover/requests");

  return <div>기사님 프로필 등록 페이지</div>;
}
