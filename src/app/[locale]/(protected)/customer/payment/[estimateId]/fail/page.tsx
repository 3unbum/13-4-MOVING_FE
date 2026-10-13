import { notFound } from "next/navigation";
import PaymentFailClient from "@/components/payment/PaymentFailClient";
import { requireProfile, requireRole } from "@/lib/auth/guards";

// 토스 결제창이 failUrl 쿼리(code·message·orderId)로 돌려보내는 주소입니다.
export default async function CustomerPaymentFailPage({
  params,
  searchParams,
}: {
  params: Promise<{ estimateId: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const account = await requireRole("CUSTOMER", "/customer/login");
  await requireProfile(account, "/customer/profile-register");

  const estimateId = Number((await params).estimateId);
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  const { code } = await searchParams;

  return <PaymentFailClient estimateId={estimateId} code={code} />;
}
