import { requireRole } from "@/lib/auth/guards";
import MoverProfileEditPanel from "@/components/profile/MoverProfileEditPanel";

// 피그마 "마이페이지_프로필 수정_기사님"(#73) 대응. 처음엔 /mover/mypage 하나에 탭으로
// 프로필 수정/기본정보 수정을 같이 넣으려 했으나(2026-09-17 1차 구현), 피그마 원본을 다시
// 확인한 결과 둘은 탭이 아니라 완전히 분리된 화면이고, PR #132(이슈 #122, 민수님)의 메인
// 마이페이지 화면에 "내 프로필 수정"/"기본 정보 수정" 버튼 두 개가 각각 이 화면들로 이동시키는
// 구조였음이 확인돼(2026-09-17 2차 확인) 탭을 걷어내고 라우트를 분리했다 — 기본정보 수정은
// /mover/mypage/edit/basic-info로 분리. PR #132의 두 버튼(MoverProfileEditButtons.tsx)은
// 지금 둘 다 임시로 /mover/requests를 가리키는 TEMP_DESTINATION 상태 — 두 PR이 머지되면
// "내 프로필 수정" 버튼은 이 경로로, "기본 정보 수정" 버튼은 /mover/mypage/edit/basic-info로
// 바꿔주는 후속 작업이 필요하다.
//
// (with-profile) 레이아웃이 이미 requireRole+hasProfile 하드게이트를 걸어주지만, 폼 초기값으로
// 쓸 계정 데이터 자체가 필요해서 여기서 한 번 더 호출한다 — guards.ts는 쿠키 기반 조회라 가볍고,
// profile-edit/page.tsx(customer)도 같은 이유로 requireRole을 다시 부른다.
//
// 카드 폭/패딩은 프로필 등록 페이지(mover/profile-register)와 동일한 실측값 재사용 — 두 폼 다
// 그 등록 모달(1200px, 500px 2열, 컬럼 간격 120px)을 그대로 이어받는 레이아웃이라서다.
export default async function MoverProfileEditPage() {
  const account = await requireRole("MOVER", "/mover/login");

  return (
    <div className="pc:items-center pc:px-0 pc:py-15 flex w-full justify-center px-4 pt-4 pb-10">
      {/* 제목-구분선-본문 간격: 피그마 실측 데스크톱 48px 대칭(pc:gap-12), 모바일/태블릿은 비대칭
          (제목-구분선 16px, 구분선-본문 20px) — 구분선 자체의 mb-1(4px)로 비대칭분을 보정한다 */}
      <div className="pc:w-300 pc:gap-12 pc:rounded-4xl pc:bg-gray-50 pc:px-10 pc:pt-8 pc:pb-10 flex w-81.75 flex-col gap-4">
        <h1 className="text-18 text-black-black-450 pc:text-32 pc:font-semibold font-bold">
          프로필 수정
        </h1>
        <div className="bg-line-100 pc:mb-0 mb-1 h-px w-full" />
        <MoverProfileEditPanel initialAccount={account?.role === "MOVER" ? account : null} />
      </div>
    </div>
  );
}
