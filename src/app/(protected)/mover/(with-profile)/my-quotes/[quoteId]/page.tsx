import { notFound } from "next/navigation";
import MoverQuoteDetailClient from "@/app/(protected)/mover/(with-profile)/my-quotes/_components/MoverQuoteDetailClient";

// 역할·프로필 가드는 상위 레이아웃((protected)/mover/(with-profile))이 합니다.
export default async function MoverMyQuoteDetailPage({
  params,
}: PageProps<"/mover/my-quotes/[quoteId]">) {
  const { quoteId } = await params;
  const estimateId = Number(quoteId);
  // 숫자가 아닌 경로(/my-quotes/abc)는 BE를 부르기 전에 걸러냅니다
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  return <MoverQuoteDetailClient estimateId={estimateId} />;
}
