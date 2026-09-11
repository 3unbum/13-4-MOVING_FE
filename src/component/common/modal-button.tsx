import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ModalButtonVariant = "solid" | "outlined";

interface ModalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ModalButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
}

// 모달 전용 버튼 — md 높이만 64px (Button.tsx의 md는 60px, 모달 밖에서 쓰는 값과 달라 별도 컴포넌트로 분리)
export default function ModalButton({
  variant = "solid",
  icon,
  children,
  className,
  type = "button",
  ...props
}: ModalButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "text-18 flex h-16 w-full items-center justify-center gap-2 rounded-2xl px-4 font-semibold transition-colors",
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
