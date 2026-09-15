import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import MoverProfileForm from "@/components/profile/MoverProfileForm";

// 카드 폭/패딩은 피그마 실측값 그대로:
// - 데스크탑(pc): 1200px 카드(px-10 패딩 포함), rounded-4xl(32px), pt-8 pb-10, gap-12 —
//   내부는 500px 두 컬럼(gap-30)으로 2열 배치, 일반유저 폼과 달리 진짜로 1200px을 꽉 채움
// - 태블릿/모바일: 카드 박스 없음, 327px 고정 폭 컬럼을 가운데 정렬 (일반유저 페이지와 동일 근거,
//   w-81.75 + mx-auto)
export default async function MoverProfileRegisterPage() {
  const account = await requireRole("MOVER", "/mover/login");
  if (account?.hasProfile) redirect("/mover/requests");

  return (
    <div className="pc:items-center pc:px-0 pc:py-15 flex w-full justify-center px-4 pt-4 pb-10">
      <div className="pc:w-300 pc:gap-12 pc:rounded-4xl pc:bg-gray-50 pc:px-10 pc:pt-8 pc:pb-10 pc:shadow-modal flex w-81.75 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="pc:gap-8 flex flex-col gap-4">
            <h1 className="text-18 text-black-black-450 pc:text-32 pc:font-semibold font-bold">
              기사님 프로필 등록
            </h1>
            <p className="text-12 pc:text-20 pc:text-[#525252] text-[#6b6b6b]">
              추가 정보를 입력하여 회원가입을 완료해주세요.
            </p>
          </div>
          <div className="border-line-100 h-px w-full" />
        </div>
        <MoverProfileForm />
      </div>
    </div>
  );
}
