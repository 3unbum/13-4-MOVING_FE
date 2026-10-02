import Image from "next/image";
import type { ReactNode } from "react";
import chevronDown from "@/assets/icons/chevron-down-md.svg";
import { cn } from "@/lib/utils/cn";

interface AccordionProps {
  question: string;
  children: ReactNode;
  className?: string;
}

/**
 * FAQ용 펼침/접힘 블록입니다.
 *
 * `<details>`·`<summary>`를 씁니다. 직접 만들면 `aria-expanded`·`aria-controls`와
 * 키보드 조작(Enter·Space)을 전부 붙여야 하는데, 브라우저가 이미 제공합니다.
 * 서버 컴포넌트로 둘 수 있어 JS 없이도 동작한다는 이점도 있습니다.
 *
 * `[&::-webkit-details-marker]:hidden`은 사파리의 기본 삼각형 마커를 지웁니다.
 * `list-none`만으로는 사파리에서 남습니다.
 */
export default function Accordion({ question, children, className }: AccordionProps) {
  return (
    <details className={cn("group border-line-100 border-b", className)}>
      <summary
        className={cn(
          "flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <span className="text-16 tablet:text-18 text-black-black-400 font-semibold">
          {question}
        </span>
        <Image
          src={chevronDown}
          alt=""
          className="size-6 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="text-14 tablet:text-16 text-gray-gray-500 pb-5 leading-relaxed font-normal">
        {children}
      </div>
    </details>
  );
}
