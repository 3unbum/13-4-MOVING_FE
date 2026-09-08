"use client";

import clsx from "clsx";
import Image from "next/image";
import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import searchIconLg from "@/assets/icons/search-lg.svg";
import searchIconMd from "@/assets/icons/search-md.svg";
import xCircleLg from "@/assets/icons/x-circle-lg.svg";
import xCircleMd from "@/assets/icons/x-circle-md.svg";

type InputSearchbarSize = "sm" | "md";

interface InputSearchbarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "onChange" | "type"
> {
  size?: InputSearchbarSize;
  value: string;
  onChange: (value: string) => void;
  // 검색 아이콘 클릭 또는 엔터 입력 시 호출 (form submit으로 통일해서 처리)
  onSearch?: (value: string) => void;
}

// Figma 디자인은 포커스 여부에 따라 좌측 검색 아이콘 <-> 우측 지우기/검색 버튼으로
// 레이아웃 자체가 바뀌는 구조라 "지금 포커스 중인가"만 내부 상태로 둠 —
// 검색어(value)는 부모가 controlled로 관리(검색 API 호출, URL 쿼리 동기화 등에 필요)

// 내부 <form onSubmit>은 이 검색바 자체의 엔터키/버튼 제출 UX 처리용이며,
// 상위 RHF 폼에 필드로 등록되어 함께 제출되는 것을 전제로 하지 않음
export default function InputSearchbar({
  size = "sm",
  value,
  onChange,
  onSearch,
  disabled,
  className,
  id,
  placeholder = "텍스트를 입력해 주세요.",
  onFocus,
  onBlur,
  ...props
}: InputSearchbarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isMd = size === "md";
  const hasValue = value.length > 0;

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        onSearch?.(value);
      }}
      className={clsx(
        "bg-background-100 flex w-full items-center rounded-2xl transition-colors",
        isMd ? "h-16 gap-2 px-6" : "h-13 gap-1.5 px-4",
        disabled && "cursor-not-allowed opacity-40",
        className
      )}
    >
      {/* 포커스 전: 좌측에 검색 아이콘(장식용) */}
      {!isFocused && (
        <Image
          src={isMd ? searchIconLg : searchIconMd}
          alt=""
          className={clsx("shrink-0", isMd ? "size-9" : "size-6")}
        />
      )}
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          "text-black-400 min-w-0 flex-1 bg-transparent font-normal placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed",
          isMd ? "text-18" : "text-14"
        )}
        {...props}
      />
      {/* 포커스 중: 우측에 지우기(값 있을 때만) + 검색 제출 버튼 */}
      {isFocused && (
        <div className={clsx("flex shrink-0 items-center", isMd ? "gap-4" : "gap-3")}>
          {hasValue && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange("")}
              disabled={disabled}
              aria-label="검색어 지우기"
              className="flex shrink-0 items-center justify-center"
            >
              <Image
                src={isMd ? xCircleLg : xCircleMd}
                alt=""
                className={isMd ? "size-9" : "size-6"}
              />
            </button>
          )}
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            aria-label="검색"
            className="flex shrink-0 items-center justify-center"
          >
            <Image
              src={isMd ? searchIconLg : searchIconMd}
              alt=""
              className={isMd ? "size-9" : "size-6"}
            />
          </button>
        </div>
      )}
    </form>
  );
}
