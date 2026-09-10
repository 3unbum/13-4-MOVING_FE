import clsx from "clsx";
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
      className={clsx(
        "z-toast shadow-modal fixed bottom-10 left-1/2 -translate-x-1/2 rounded-2xl bg-orange-200 font-semibold text-orange-400",
        isMd ? "text-16 px-6 py-4" : "text-14 px-4 py-3",
        className
      )}
      {...props}
    >
      {message}
    </div>
  );
}
