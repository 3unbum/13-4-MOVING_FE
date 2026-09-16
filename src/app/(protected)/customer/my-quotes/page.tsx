import MyQuotesTabs from "@/components/quote/MyQuotesTabs";
import { requireRole } from "@/lib/auth/guards";

// hasProfile 하드 게이트 없음 — 프로필 없어도 접근 가능. 견적 없을 때(=프로필 없는 경우 포함)
// 빈 상태 UI로 "견적 요청하러 가기" CTA를 보여주고, 프로필 등록 유도는 그 목적지인
// quotation-requests 페이지의 모달이 담당한다.
//
// 탭은 URL 쿼리(?tab=past)로 들고 있다. 상세 페이지에서 뒤로 가면 보던 탭으로 돌아와야
// 하는데, useState로만 두면 항상 첫 탭으로 초기화된다. 여기서 읽어 초기값으로 내려주면
// useSearchParams(+Suspense 경계)를 쓰지 않아도 된다.
export default async function CustomerMyQuotesPage({
  searchParams,
}: PageProps<"/customer/my-quotes">) {
  await requireRole("CUSTOMER", "/customer/login");

  const { tab } = await searchParams;

  return <MyQuotesTabs initialTab={tab === "past" ? "past" : "pending"} />;
}
