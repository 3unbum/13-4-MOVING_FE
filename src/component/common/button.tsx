import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "solid" | "outlined";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // solid: 배경을 채운 primary CTA / outlined: 테두리만 있는 보조 CTA — 크기·형태가 같아 한 컴포넌트로 관리
  variant?: ButtonVariant;
  // size는 화면 크기가 아니라 사용 맥락(모달/폼/랜딩 CTA 등)에 맞춰 호출부가 명시적으로 sm/md지정
  size?: ButtonSize;
  // 라벨 뒤에 붙는 아이콘 — 없으면 텍스트만 있는 버튼
  icon?: ReactNode;
  children: ReactNode;
}

// 버튼은 항상 w-full(부모 폭에 꽉 참) — 부모가 폭을 제어해야 함
// - 화면 전체 폭 CTA로 쓰려면 부모에 padding만 주고 별도 width 지정 X
// - 특정 폭으로 고정하려면 부모(래퍼)에 w-[Npx] 또는 max-w-* 지정

// 사용 예: <Button variant="outlined" size="md" onClick={handleSubmit}>견적 요청하기</Button>
export default function Button({
  variant = "solid",
  size = "sm",
  icon,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "flex w-full items-center justify-center px-4 font-semibold transition-colors",
        size === "sm" ? "text-16 h-[54px] gap-1 rounded-xl" : "text-18 h-[60px] gap-2 rounded-2xl",
        variant === "solid"
          ? "bg-orange-400 text-white not-disabled:hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-gray-300"
          : "border border-orange-400 bg-gray-50 text-orange-400 shadow-[4px_4px_10px_0px_rgba(195,217,242,0.2)] not-disabled:hover:bg-orange-100 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-500",
        className
      )}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}
