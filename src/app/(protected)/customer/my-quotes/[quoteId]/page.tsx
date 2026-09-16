import { notFound } from "next/navigation";
import QuoteDetailClient from "@/components/quote/QuoteDetailClient";
import { requireProfile, requireRole } from "@/lib/auth/guards";

export default async function CustomerMyQuoteDetailPage({
  params,
}: PageProps<"/customer/my-quotes/[quoteId]">) {
  const account = await requireRole("CUSTOMER", "/customer/login");
  requireProfile(account, "/customer/profile-register");

  const { quoteId } = await params;
  const estimateId = Number(quoteId);
  // 숫자가 아닌 경로(/my-quotes/abc)는 BE를 부르기 전에 걸러냅니다
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  return <QuoteDetailClient estimateId={estimateId} />;
}
