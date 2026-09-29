import { requireRole } from "@/lib/auth/guards";
import MoverBasicInfoEditPanel from "@/components/profile/MoverBasicInfoEditPanel";

// 피그마 "마이페이지_기본정보 수정_기사님"(#73) 대응. mypage/edit/page.tsx(프로필 수정)와
// 형제 라우트로 분리 — 두 화면이 탭이 아니라 마이페이지(PR #132)의 서로 다른 버튼("기본 정보
// 수정")에서 각각 진입하는 독립 화면이기 때문 (경위는 ../page.tsx 주석 참고).
export default async function MoverBasicInfoEditPage() {
  const account = await requireRole("MOVER", "/mover/login");

  return (
    <div className="pc:items-center pc:px-0 pc:py-15 flex w-full justify-center px-4 pt-4 pb-10">
      {/* 제목-구분선-본문 간격: 피그마 실측 데스크톱 40px 대칭(pc:gap-10, 프로필 수정 화면의 48px과
          다른 값), 모바일/태블릿은 비대칭(제목-구분선 16px, 구분선-본문 20px) — 구분선 자체의
          mb-1(4px)로 비대칭분을 보정한다 */}
      <div className="pc:w-300 pc:gap-10 pc:rounded-4xl pc:bg-gray-50 pc:px-10 pc:pt-8 pc:pb-10 flex w-81.75 flex-col gap-4">
        <h1 className="text-18 text-black-black-450 pc:text-32 pc:font-semibold font-bold">
          기본정보 수정
        </h1>
        <div className="bg-line-100 pc:mb-0 mb-1 h-px w-full" />
        <MoverBasicInfoEditPanel initialAccount={account?.role === "MOVER" ? account : null} />
      </div>
    </div>
  );
}
