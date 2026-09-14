import type { ReactNode } from "react";

// 모바일은 흰 배경 전체, 태블릿·PC는 주황 배경 위 둥근 카드
export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="tablet:bg-orange-400 tablet:py-16 flex flex-1 flex-col items-center justify-center bg-white px-6 py-10">
      <div className="tablet:max-w-130 tablet:gap-11 tablet:rounded-[32px] tablet:bg-gray-50 tablet:px-10 tablet:py-11 pc:max-w-185 pc:gap-12 pc:rounded-[40px] pc:px-12.5 pc:py-12 flex w-full max-w-100 flex-col items-center gap-10">
        {children}
      </div>
    </main>
  );
}
