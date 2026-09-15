import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import CustomerProfileForm from "@/components/profile/CustomerProfileForm";

// 카드 폭/패딩/라운드는 피그마 실측값 그대로:
// - 데스크탑(pc): 폭 720px 카드(px-10 패딩 포함, 안쪽 콘텐츠는 640px), rounded-4xl(32px), pt-6 pb-10, gap-10
//   ※ 피그마 원본 프레임 자체는 1200px인데 실제 내용물(타이틀/버튼)은 전부 640px로 가운데 정렬되어 있어
//   기사님 폼 모달을 복붙하고 리사이즈를 안 한 것으로 보임 — 의도대로 640 콘텐츠 기준으로 구현
// - 태블릿/모바일: 카드 박스 없음(배경/라운드/쉐도우 없이 페이지에 자연스럽게 녹아듦),
//   327px 고정 폭 컬럼을 가운데 정렬 — 피그마 태블릿 프레임은 744px 폭에 pl-209/pr-209라는
//   큰 비대칭 패딩으로 이 327px을 만들어내는데(744-209-208=327), 그 패딩 값 자체를 그대로
//   박아두면 정확히 744px일 때만 맞고 다른 태블릿 폭에서는 깨지므로, 결과가 같은
//   "327px 고정폭 가운데 정렬"로 구현함(w-81.75 + mx-auto)
export default async function CustomerProfileRegisterPage() {
  const account = await requireRole("CUSTOMER", "/customer/login");
  if (account?.hasProfile) redirect("/");

  return (
    <div className="pc:items-center pc:px-0 pc:py-15 flex w-full justify-center px-4 pt-4 pb-10">
      <div className="pc:w-180 pc:gap-10 pc:rounded-4xl pc:bg-gray-50 pc:px-10 pc:pt-6 pc:pb-10 pc:shadow-modal flex w-81.75 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="pc:gap-7 flex flex-col gap-4">
            <h1 className="text-18 text-black-black-400 pc:text-32 pc:font-semibold font-bold">
              프로필 등록
            </h1>
            <p className="text-12 text-black-100 pc:text-20 pc:text-black-200">
              추가 정보를 입력하여 회원가입을 완료해주세요.
            </p>
          </div>
          <div className="border-line-100 h-px w-full" />
        </div>
        <CustomerProfileForm />
      </div>
    </div>
  );
}
