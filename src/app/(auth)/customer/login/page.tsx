// TODO: 로그인 성공 후 리다이렉트 — hasProfile true면 로그인 전 마지막 페이지가 기사님찾기(/movers)였으면 그리로, 랜딩(/)이었으면 /customer/my-quotes로.
// "마지막 페이지" 판별은 document.referrer(SPA 라우팅에서 안 바뀜)나 sessionStorage(effect 순서 레이스 위험) 말고
// 로그인 버튼에 ?redirect= 쿼리파라미터 실어 넘기는 방식 추천.
export default function CustomerLoginPage() {
  return <div>일반유저 로그인 페이지</div>;
}
