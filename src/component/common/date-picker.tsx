"use client";

import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { DayPicker } from "react-day-picker";
import Image from "next/image";
import clsx from "clsx";
import Button from "./button";
import calendarIcon from "@/assets/icons/calendar-md.svg";
import chevronDownIcon from "@/assets/icons/chevron-down-lg.svg";
import chevronLeftIcon from "@/assets/icons/chevron-left-thin-md.svg";
import chevronRightIcon from "@/assets/icons/chevron-right-thin-md.svg";

interface DatePickerProps {
  /** 선택된 이사 예정일. 아직 선택 전이면 undefined */
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatCaption(date: Date) {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatTriggerLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 오늘 이전 날짜는 선택 불가
function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// 데스크톱/태블릿=sm(팝오버) · 모바일=md(인라인)
const CALENDAR_STYLES = {
  sm: {
    root: "flex flex-col items-center gap-4",
    caption: "flex h-12 w-full items-center justify-between px-3.5",
    captionLabel: "text-18 font-semibold text-black-black-400",
    weekday:
      "flex h-[38px] w-10 items-center justify-center text-13 font-medium text-gray-gray-400",
    day: "flex h-[38px] w-10 items-center justify-center p-0",
    dayButton:
      "flex size-10 items-center justify-center rounded-xl text-14 font-medium text-black-500",
  },
  md: {
    root: "flex flex-col items-center gap-8",
    caption: "flex h-8 items-center justify-center gap-3",
    captionLabel: "text-20 font-semibold text-black-black-400",
    weekday: "flex size-12 items-center justify-center text-16 font-medium text-gray-gray-400",
    day: "flex size-12 items-center justify-center p-0",
    dayButton:
      "flex size-12 items-center justify-center rounded-xl text-16 font-medium text-black-500",
  },
} as const;

// 선택/비활성 날짜는 버튼 자식에 색만 덧입힘
const SELECTED_CLASS = "[&>button]:bg-orange-400 [&>button]:font-semibold [&>button]:text-white";
const MUTED_CLASS = "[&>button]:cursor-not-allowed [&>button]:text-gray-gray-100";

interface CalendarProps {
  size: "sm" | "md";
  month: Date;
  onMonthChange: (month: Date) => void;
  selected?: Date;
  onSelect: (date: Date) => void;
}

function Calendar({ size, month, onMonthChange, selected, onSelect }: CalendarProps) {
  const s = CALENDAR_STYLES[size];
  return (
    <div className={s.root}>
      <div className={s.caption}>
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <Image src={chevronLeftIcon} alt="" className="size-6" />
        </button>
        <p className={s.captionLabel}>{formatCaption(month)}</p>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <Image src={chevronRightIcon} alt="" className="size-6" />
        </button>
      </div>
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={(date) => date && onSelect(date)}
        disabled={isPastDate}
        hideNavigation
        showOutsideDays
        formatters={{ formatWeekdayName: (date) => WEEKDAY_LABELS[date.getDay()] }}
        classNames={{
          month_caption: "sr-only",
          weekdays: "flex",
          weekday: s.weekday,
          week: "flex",
          day: s.day,
          day_button: s.dayButton,
          selected: SELECTED_CLASS,
          outside: MUTED_CLASS,
          disabled: MUTED_CLASS,
        }}
      />
    </div>
  );
}

// 데스크톱/태블릿: 트리거+팝오버(선택완료 버튼 내장) · 모바일: 인라인(확정은 페이지 쪽 버튼)
export default function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value ?? new Date());

  return (
    <div className={clsx("relative", className)}>
      <div className="tablet:block hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center gap-2 rounded-xl border-2 border-orange-400 bg-gray-50 py-4 pr-3 pl-5"
        >
          <Image src={calendarIcon} alt="" className="size-6" />
          <span className="text-16 text-black-black-400 flex-1 text-left font-medium">
            {value ? formatTriggerLabel(value) : "이사 예정일을 선택해주세요"}
          </span>
          <Image src={chevronDownIcon} alt="" className="size-9" />
        </button>
        {open && (
          <div className="border-gray-gray-100 absolute top-[calc(100%+16px)] left-0 z-[var(--z-datepicker)] flex w-[400px] flex-col items-center gap-4 rounded-2xl border bg-white px-4 pt-5 pb-7 shadow-[2px_2px_10px_0px_rgba(224,224,224,0.2)]">
            <Calendar
              size="sm"
              month={month}
              onMonthChange={setMonth}
              selected={value}
              onSelect={onChange}
            />
            <Button variant="solid" size="sm" disabled={!value} onClick={() => setOpen(false)}>
              선택완료
            </Button>
          </div>
        )}
      </div>

      <div className="tablet:hidden">
        <Calendar
          size="md"
          month={month}
          onMonthChange={setMonth}
          selected={value}
          onSelect={onChange}
        />
      </div>
    </div>
  );
}
