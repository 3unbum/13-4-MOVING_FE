import type { ReactNode } from "react";

// 기사님이신가요? / 아직 무빙 회원이 아니신가요? / SNS 계정으로 간편 가입하기 — 모바일 12px(black-100) vs 태블릿·PC 18~20px(black-200)로 크기·색이 함께 바뀜
export default function AuxText({ children }: { children: ReactNode }) {
  return (
    <p className="tablet:text-18 pc:text-20 text-black-100 tablet:text-black-200 text-12 flex items-center justify-center gap-1 whitespace-nowrap">
      {children}
    </p>
  );
}
