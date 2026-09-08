"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type InputTextAreaSize = "sm" | "md";

interface InputTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // sm: 327px 컨텍스트(모바일 폼) / md: 560px 컨텍스트(태블릿·PC 폼) — 실제 폭은 w-full, 부모가 제어
  size?: InputTextAreaSize;
  // 있으면 빨간 테두리 + 빨간 문구로 전환 (helperText보다 우선) — input-textfield와 동일 패턴
  errorMessage?: string;
  // errorMessage가 없을 때만 보여주는 안내 문구
  helperText?: string;
}

// 최소 글자 수 등 검증 로직은 컴포넌트 책임이 아니라 폼(RHF)이 errorMessage로 내려주는 값에 따름
const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(function InputTextArea(
  { size = "md", errorMessage, helperText, className, disabled, ...props },
  ref
) {
  const isError = Boolean(errorMessage);
  const message = errorMessage ?? helperText;

  return (
    <div className={clsx("flex w-full flex-col gap-2", className)}>
      <div
        className={clsx(
          "h-40 w-full overflow-hidden rounded-2xl border bg-gray-50 transition-colors",
          isError ? "border-red-200" : "border-line-200 focus-within:border-orange-400",
          disabled && "opacity-40"
        )}
      >
        <textarea
          ref={ref}
          disabled={disabled}
          className={clsx(
            "text-black-400 h-full w-full resize-none bg-transparent py-3.5 font-normal placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed",
            "[&::-webkit-scrollbar]:w-1.25 [&::-webkit-scrollbar-thumb]:cursor-default [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-3 [&::-webkit-scrollbar-track]:bg-transparent",
            size === "sm" ? "text-16 px-4" : "text-18 px-6"
          )}
          {...props}
        />
      </div>
      {message && (
        <p
          className={clsx(
            "font-medium",
            size === "sm" ? "text-13" : "text-16",
            isError ? "text-red-200" : "text-gray-400"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
});

export default InputTextArea;
