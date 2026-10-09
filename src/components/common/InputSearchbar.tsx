"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import chatIconLg from "@/assets/icons/chat-lg.svg";
import chatIconMd from "@/assets/icons/chat-md.svg";
import searchIconLg from "@/assets/icons/search-lg.svg";
import searchIconMd from "@/assets/icons/search-md.svg";
import xCircleLg from "@/assets/icons/x-circle-lg.svg";
import xCircleMd from "@/assets/icons/x-circle-md.svg";

type InputSearchbarSize = "sm" | "md";
/** default: 기존 검색바만 / withAi: 우측에 AI 진입 버튼*/
type InputSearchbarVariant = "default" | "withAi";

interface InputSearchbarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "onChange" | "type"
> {
  size?: InputSearchbarSize;
  variant?: InputSearchbarVariant;
  value: string;
  onChange: (value: string) => void;
  // 검색 아이콘 클릭 또는 엔터 입력 시 호출 (form submit으로 통일해서 처리)
  onSearch?: (value: string) => void;
  /** variant="withAi"일 때 AI 버튼 클릭 */
  onAiClick?: () => void;
  // 스크린리더용 접근 가능한 이름 (sr-only <label>로 렌더링) — 안 넘기면 placeholder로 대체
  label?: string;
  /** AI 버튼 접근성·표시 라벨 (미지정 시 "AI") */
  aiLabel?: string;
}

// Figma 디자인은 포커스 여부에 따라 좌측 검색 아이콘 <-> 우측 지우기/검색 버튼으로
// 레이아웃 자체가 바뀌는 구조라 "지금 포커스 중인가"만 내부 상태로 둠 —
// 검색어(value)는 부모가 controlled로 관리(검색 API 호출, URL 쿼리 동기화 등에 필요)

// 내부 <form onSubmit>은 이 검색바 자체의 엔터키/버튼 제출 UX 처리용이며,
// 상위 RHF 폼에 필드로 등록되어 함께 제출되는 것을 전제로 하지 않음
export default function InputSearchbar({
  size = "sm",
  variant = "default",
  value,
  onChange,
  onSearch,
  onAiClick,
  aiLabel,
  disabled,
  className,
  id,
  placeholder,
  label,
  onFocus,
  onBlur,
  ...props
}: InputSearchbarProps) {
  const t = useTranslations("common");
  // 호출부가 안 주면 번역된 기본 문구 — label 폴백으로도 쓰여서 비면 안 됩니다
  const placeholderText = placeholder ?? t("searchPlaceholder");
  const [isFocused, setIsFocused] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isMd = size === "md";
  const hasValue = value.length > 0;
  const showAi = variant === "withAi";
  const aiButtonLabel = aiLabel ?? "AI";

  return (
    <div
      className={cn("flex w-full items-center", showAi && (isMd ? "gap-3" : "gap-2"), className)}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (disabled) return;
          onSearch?.(value);
        }}
        className={cn(
          "bg-background-100 flex min-w-0 flex-1 items-center rounded-2xl transition-colors",
          isMd ? "h-16 gap-2 px-6" : "h-13 gap-1.5 px-4",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        {/* 포커스 전: 좌측에 검색 아이콘(장식용) */}
        {!isFocused && (
          <Image
            src={isMd ? searchIconLg : searchIconMd}
            alt=""
            className={cn("shrink-0", isMd ? "size-9" : "size-6")}
          />
        )}
        <label htmlFor={inputId} className="sr-only">
          {label ?? placeholderText}
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
          placeholder={placeholderText}
          className={cn(
            "text-black-400 min-w-0 flex-1 bg-transparent font-normal placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed",
            isMd ? "text-18" : "text-14"
          )}
          {...props}
        />
        {/* 포커스 중: 우측에 지우기(값 있을 때만) + 검색 제출 버튼 */}
        {isFocused && (
          <div className={cn("flex shrink-0 items-center", isMd ? "gap-4" : "gap-3")}>
            {hasValue && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange("")}
                disabled={disabled}
                aria-label={t("clearSearch")}
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
              aria-label={t("search")}
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

      {/* withAi 전용 — 검색 form 밖 + 호버 시 그라데이션 테두리 */}
      {showAi && (
        <button
          type="button"
          onClick={onAiClick}
          disabled={disabled}
          aria-label={aiButtonLabel}
          className={cn(
            "ai-search-entry relative flex shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-100 font-semibold text-orange-500 transition-colors",
            "not-disabled:hover:border-transparent not-disabled:focus-visible:border-transparent",
            "focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-40",
            isMd ? "text-16 h-16 gap-1.5 px-4" : "text-14 h-13 gap-1 px-3"
          )}
        >
          <Image
            src={isMd ? chatIconLg : chatIconMd}
            alt=""
            className={isMd ? "size-7" : "size-5"}
          />
          <span>{aiButtonLabel}</span>
        </button>
      )}
    </div>
  );
}
