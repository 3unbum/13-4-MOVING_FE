import { requireRole } from "@/lib/auth/guards";

// hasProfile 하드 게이트 없음 — 프로필 없어도 접근 가능. 견적 없을 때(=프로필 없는 경우 포함)
// Figma에 이미 있는 빈 상태 디자인으로 "견적 요청하러 가기" CTA를 보여주고, 프로필 등록
// 유도는 그 목적지인 quotation-requests 페이지의 모달이 담당한다(TODO: 빈 상태 UI 미구현).
export default async function CustomerMyQuotesPage() {
  await requireRole("CUSTOMER", "/customer/login");

  return <div>내 견적 관리 페이지</div>;
}
