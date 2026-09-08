"use client";

import clsx from "clsx";
import Image from "next/image";
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import visibilityOffIcon from "@/assets/icons/visibility-md-off.svg";
import visibilityOnIcon from "@/assets/icons/visibility-md-on.svg";

type InputTextFieldSize = "sm" | "md";

interface InputTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputTextFieldSize;
  // 있으면 빨간 테두리 + 빨간 문구로 전환 (helperText보다 우선)
  errorMessage?: string;
  // errorMessage가 없을 때만 보여주는 안내 문구 (Figma의 "feedback" 상태)
  helperText?: string;
}

// type="password"일 때만 눈 아이콘으로 마스킹 토글 — 어떤 값을 보여줄지는 부모(RHF)가 관리하고,
// "지금 마스킹을 풀지 말지"는 순수 UI 상태라 컴포넌트 내부 useState로 처리
const InputTextField = forwardRef<HTMLInputElement, InputTextFieldProps>(function InputTextField(
  { size = "sm", errorMessage, helperText, type = "text", className, disabled, ...props },
  ref
) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const isError = Boolean(errorMessage);
  const message = errorMessage ?? helperText;

  return (
    <div className={clsx("flex w-full flex-col", size === "sm" ? "gap-1" : "gap-2", className)}>
      <div
        className={clsx(
          "flex w-full items-center rounded-2xl border bg-gray-50 px-3.5 transition-colors",
          size === "sm" ? "h-[54px]" : "h-16",
          isError
            ? "border-red-200"
            : "border-line-200 hover:bg-background-200 focus-within:border-orange-400 focus-within:bg-gray-50 focus-within:shadow-[0_4px_4px_-1px_rgba(249,80,46,0.2)] hover:border-gray-300",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        <input
          ref={ref}
          type={isPassword && isPasswordVisible ? "text" : type}
          disabled={disabled}
          className={clsx(
            "text-black-400 min-w-0 flex-1 bg-transparent font-normal placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed",
            size === "sm" ? "text-16" : "text-18"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="ml-2 flex shrink-0 items-center justify-center"
          >
            <Image
              src={isPasswordVisible ? visibilityOnIcon : visibilityOffIcon}
              alt=""
              className="size-6"
            />
          </button>
        )}
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

export default InputTextField;
