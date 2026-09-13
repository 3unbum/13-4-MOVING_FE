import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 프로젝트 폰트 토큰(`globals.css`의 `--text-12` ~ `--text-50`)을 tailwind-merge에 등록한다.
 *
 * 등록하지 않으면 `text-16`(크기)을 Tailwind 기본 스케일(`text-sm` 등)에 없는 값으로 보고
 * `text-white`(색상)와 같은 그룹으로 묶어버려, 한쪽이 지워진다.
 * 실제로 `"text-16 font-semibold text-white"` → `"font-semibold text-white"`가 됐다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["12", "13", "14", "16", "18", "20", "24", "32", "40", "50"] }],
    },
  },
});

/**
 * 조건부 클래스 결합(clsx) + Tailwind 클래스 충돌 해소(tailwind-merge).
 *
 * `clsx`만 쓰면 `w-full`과 `w-[500px]`이 둘 다 살아남아 어느 쪽이 이길지가 CSS 규칙 순서로
 * 결정된다 — 호출부에서 `className`으로 덮어쓰려 해도 무시될 수 있다.
 * `cn`은 뒤에 온 클래스가 앞의 것을 실제로 제거하므로 호출부 오버라이드가 항상 이긴다.
 *
 * 사용: cn("w-full px-4", isActive && "bg-orange-400", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
