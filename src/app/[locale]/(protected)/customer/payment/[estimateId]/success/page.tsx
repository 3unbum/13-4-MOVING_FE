import { notFound } from "next/navigation";
import PaymentSuccessClient from "@/components/payment/PaymentSuccessClient";
import { requireProfile, requireRole } from "@/lib/auth/guards";

// 토스 결제창이 successUrl 쿼리(paymentKey·orderId·amount)로 돌려보내는 주소입니다.
// 세 값이 모두 있어야 승인을 요청할 수 있어서, 하나라도 없으면 직접 접근한 것으로 보고 404로 막습니다.
export default async function CustomerPaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ estimateId: string }>;
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const account = await requireRole("CUSTOMER", "/customer/login");
  await requireProfile(account, "/customer/profile-register");

  const estimateId = Number((await params).estimateId);
  const { paymentKey, orderId, amount: rawAmount } = await searchParams;
  const amount = Number(rawAmount);

  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();
  if (!paymentKey || !orderId || !Number.isInteger(amount) || amount <= 0) notFound();

  return (
    <PaymentSuccessClient
      estimateId={estimateId}
      paymentKey={paymentKey}
      orderId={orderId}
      amount={amount}
    />
  );
}
