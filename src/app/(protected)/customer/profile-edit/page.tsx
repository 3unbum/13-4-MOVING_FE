import { requireProfile, requireRole } from "@/lib/auth/guards";
import CustomerProfileEditForm from "@/components/profile/CustomerProfileEditForm";

// 피그마 "프로필수정_일반유저(profile-dropdown menu)" 대응(#72), node 1:10192 실측(2026-09-17 재확인).
// ⚠️ 처음엔 등록 페이지(#71)의 720px 카드를 그대로 재사용했었는데, 실제로는 이 모달이 기사님
// 프로필 등록 모달(1200px, 500px 2열, 컬럼 간격 120px)을 그대로 복붙한 구조였음 — 프레임 이름 자체가
// 아직도 "Modal/기사님 프로필 등록"으로 안 바뀌어 있어서 register 페이지 때와 동일한 함정이었음.
// - 데스크탑(pc): 1200px 카드(px-10/pt-8/pb-10 패딩), 안쪽 1120px을 500px 2열로(간격 120px,
//   MoverProfileForm과 동일한 gap-x-30) — 왼쪽: 이름/이메일/전화번호/비밀번호, 오른쪽: 프로필이미지/서비스/지역
// - 태블릿/모바일: 카드 없이 327px 고정폭 컬럼, 세로 한 줄 (등록 페이지와 동일 근거, w-81.75 + mx-auto)
// account(requireRole 조회 결과)를 그대로 폼 초기값으로 넘김 — /profiles/customer GET과 /auth/me
// 응답 타입이 동일(CustomerAccountResponse)해서 이 페이지에서 별도로 다시 조회하지 않는다.
export default async function CustomerProfileEditPage() {
  const account = await requireRole("CUSTOMER", "/customer/login");
  requireProfile(account, "/customer/profile-register");

  return (
    <div className="pc:items-center pc:px-0 pc:py-15 flex w-full justify-center px-4 pt-4 pb-10">
      <div className="pc:w-300 pc:gap-10 pc:rounded-4xl pc:bg-gray-50 pc:px-10 pc:pt-8 pc:pb-10 flex w-81.75 flex-col gap-8">
        <h1 className="text-18 text-black-black-400 pc:text-32 pc:font-semibold font-bold">
          프로필 수정
        </h1>
        <CustomerProfileEditForm initialAccount={account?.role === "CUSTOMER" ? account : null} />
      </div>
    </div>
  );
}
