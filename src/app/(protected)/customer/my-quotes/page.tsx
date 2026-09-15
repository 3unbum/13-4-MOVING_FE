import MyQuotesTabs from "@/components/quote/MyQuotesTabs";
import { requireRole } from "@/lib/auth/guards";

// hasProfile 하드 게이트 없음 — 프로필 없어도 접근 가능. 견적 없을 때(=프로필 없는 경우 포함)
// 빈 상태 UI로 "견적 요청하러 가기" CTA를 보여주고, 프로필 등록 유도는 그 목적지인
// quotation-requests 페이지의 모달이 담당한다.
export default async function CustomerMyQuotesPage() {
  await requireRole("CUSTOMER", "/customer/login");

  return <MyQuotesTabs />;
}
