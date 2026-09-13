// TODO: 견적 요청은 프로필 등록이 필요한 서비스 — 프로필 없는 customer 진입 시 모달로 유도.
// 하드 게이트 아님(리다이렉트 X), 페이지는 그대로 렌더하고 모달만 얹는다.
// - useAuth()로 hasProfile === false 감지 시 모달 오픈
// - 예 → router.push("/customer/profile-register")
// - 아니오/닫기 → router.back() (진입 전 페이지로)
export default function CustomerQuotationRequestsPage() {
  return <div>견적 요청 페이지</div>;
}
