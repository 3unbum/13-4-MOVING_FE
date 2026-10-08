import { notFound } from "next/navigation";
import PaymentClient from "@/components/payment/PaymentClient";
import { requireProfile, requireRole } from "@/lib/auth/guards";

export default async function CustomerPaymentPage({
  params,
}: {
  params: Promise<{ estimateId: string }>;
}) {
  const account = await requireRole("CUSTOMER", "/customer/login");
  await requireProfile(account, "/customer/profile-register");

  const estimateId = Number((await params).estimateId);
  // 숫자가 아닌 경로(/payment/abc)는 BE를 부르기 전에 걸러냅니다
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  return <PaymentClient estimateId={estimateId} />;
}
