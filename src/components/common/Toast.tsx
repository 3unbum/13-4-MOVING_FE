import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type ToastSize = "sm" | "md";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  size?: ToastSize;
}

// 안내 토스트. 닫기는 호출부에서 setTimeout으로 처리.
export default function Toast({ message, size = "sm", className, ...props }: ToastProps) {
  const isMd = size === "md";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // GNB(54px / PC 88px) 아래 16px. 피그마 toast-popup은 화면 상단 넓은 바.
        "z-toast shadow-modal pc:top-[104px] fixed top-[70px] left-1/2 -translate-x-1/2 bg-orange-200 text-left font-semibold text-orange-400",
        isMd
          ? "text-18 pc:w-[1200px] w-[calc(100%-48px)] rounded-2xl px-8 py-5"
          : "text-16 tablet:w-[640px] w-[calc(100%-48px)] rounded-xl px-6 py-3.5",
        className
      )}
      {...props}
    >
      {message}
    </div>
  );
}
