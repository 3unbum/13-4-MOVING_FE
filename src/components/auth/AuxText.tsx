import type { ReactNode } from "react";

// 모바일 12px(black-100) → 태블릿 이상 20px(black-200)로 크기·색이 함께 바뀌는 보조 텍스트
export default function AuxText({ children }: { children: ReactNode }) {
  return (
    <p className="tablet:text-20 text-black-100 tablet:text-black-200 text-12 flex items-center justify-center gap-1 whitespace-nowrap">
      {children}
    </p>
  );
}
