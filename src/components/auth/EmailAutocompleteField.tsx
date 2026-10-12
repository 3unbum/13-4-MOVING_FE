"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { useController, type Control } from "react-hook-form";
import FormField from "@/components/auth/FormField";
import { findEmailSuggestions } from "@/lib/auth/email-suggestions";
import type { SignupFormValues } from "@/lib/schemas/auth-schema";
import { cn } from "@/lib/utils/cn";

interface EmailAutocompleteFieldProps {
  id: string;
  control: Control<SignupFormValues>;
  label: string;
  placeholder?: string;
  errorMessage?: string;
  // 이메일 인증 진행 중 잠금 — 목록을 띄우면 고르는 것으로 잠금이 우회되므로 함께 막는다
  readOnly?: boolean;
}

/**
 * 회원가입 이메일 입력칸 + `@` 뒤 도메인 추천 목록 (WAI-ARIA combobox 패턴).
 *
 * 계속 타이핑해야 하므로 포커스는 입력칸에 두고, 하이라이트만 aria-activedescendant로 옮긴다.
 * 고른 값을 페이지마다 setValue로 넣지 않도록 useController로 RHF에 직접 연결한다.
 */
export default function EmailAutocompleteField({
  id,
  control,
  label,
  placeholder,
  errorMessage,
  readOnly = false,
}: EmailAutocompleteFieldProps) {
  // field를 통째로 쓰면 안의 ref 때문에 React 컴파일러 린트가 field 전체를 ref로 보고 렌더 중 접근을 막는다
  const {
    field: { name, value, onChange, onBlur, ref },
  } = useController({ control, name: "email" });
  const [isOpen, setIsOpen] = useState(false);
  // -1은 하이라이트 없음 — 열자마자 Enter 한 번에 원치 않는 도메인이 채워지지 않게 한다
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const suggestions = readOnly ? [] : findEmailSuggestions(value ?? "");
  const isExpanded = isOpen && suggestions.length > 0;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const selectSuggestion = (email: string) => {
    // mode: "onChange"라 onChange만으로 재검증까지 된다
    onChange(email);
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter는 "조합 완료"라 선택으로 처리하면 안 된다
    if (!isExpanded || event.nativeEvent.isComposing) return;

    switch (event.key) {
      case "ArrowDown":
        // 기본 동작(커서를 줄 끝으로 이동)을 막는다
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        if (activeIndex < 0) return;
        // 고르는 Enter가 폼 제출로 이어지지 않게 막는다
        event.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
        break;
      case "Escape":
        close();
        break;
    }
  };

  return (
    <FormField
      id={id}
      label={label}
      type="email"
      placeholder={placeholder}
      autoComplete="email"
      errorMessage={errorMessage}
      readOnly={readOnly}
      name={name}
      ref={ref}
      // 처음엔 값이 undefined라 그대로 넘기면 비제어→제어 전환 경고가 난다
      value={value ?? ""}
      onChange={(event) => {
        onChange(event);
        setIsOpen(true);
        setActiveIndex(-1);
      }}
      onFocus={() => setIsOpen(true)}
      onBlur={() => {
        onBlur();
        close();
      }}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={isExpanded}
      aria-controls={isExpanded ? listId : undefined}
      aria-activedescendant={isExpanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      dropdown={
        isExpanded ? (
          // top-13.5 = InputTextField sm 박스 높이(54px) — 에러 문구를 덮고 입력 박스 바로 아래에 붙인다
          <ul
            id={listId}
            role="listbox"
            className="border-line-100 absolute top-13.5 left-0 z-[var(--z-filter-dropdown)] mt-1 flex w-full flex-col overflow-hidden rounded-2xl border bg-gray-50 shadow-[4px_4px_10px_0_rgba(220,220,220,0.3)]"
          >
            {suggestions.map((email, index) => (
              <li
                key={email}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown 기본 동작(포커스 이동)을 막아야 blur로 목록이 닫히기 전에 click이 처리된다
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(email)}
                className={cn(
                  "text-black-black-400 text-14 tablet:text-16 cursor-pointer truncate px-3.5 py-2.5 font-medium",
                  index === activeIndex && "bg-background-200"
                )}
              >
                {email}
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  );
}
