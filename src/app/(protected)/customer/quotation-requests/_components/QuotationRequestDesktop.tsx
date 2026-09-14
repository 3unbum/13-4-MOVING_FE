"use client";

import Button from "@/components/common/Button";
import DatePicker from "@/components/common/DatePicker";
import InputTextField from "@/components/common/InputTextfield";
import SelectCard from "@/components/common/SelectCard";
import { SERVICES as MOVE_TYPES } from "@/components/filter/ChipRegion";
import type { AddressSearchController } from "@/hooks/useAddressSearch";
import { useEffect, useRef } from "react";

interface QuotationRequestDesktopProps {
  selected: (typeof MOVE_TYPES)[number];
  onSelectedChange: (value: (typeof MOVE_TYPES)[number]) => void;
  date: Date | undefined;
  onDateChange: (value: Date | undefined) => void;
  departure: AddressSearchController;
  arrival: AddressSearchController;
  canSubmit: boolean;
  onSubmit: () => void;
}

export default function QuotationRequestDesktop({
  selected,
  onSelectedChange,
  date,
  onDateChange,
  departure,
  arrival,
  canSubmit,
  onSubmit,
}: QuotationRequestDesktopProps) {
  const departureDetailRef = useRef<HTMLInputElement>(null);
  const arrivalDetailRef = useRef<HTMLInputElement>(null);

  // 주소 선택이 끝나면 상세주소 입력창으로 바로 포커스 이동
  useEffect(() => {
    if (departure.value) departureDetailRef.current?.focus();
  }, [departure.value]);
  useEffect(() => {
    if (arrival.value) arrivalDetailRef.current?.focus();
  }, [arrival.value]);

  return (
    <div className="pc:px-11.75 tablet:px-10 tablet:block tablet:pb-12.25 tablet:pt-19.75 hidden rounded-[40px] bg-white pt-22.25 pb-26.75">
      <header className="flex flex-col items-center gap-2">
        <p className="text-24 text-black-500 font-bold">이사 유형, 예정일과 지역을 선택해주세요</p>
        <p className="text-16 text-gray-gray-400 font-normal">
          견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)
        </p>
      </header>
      <main className="tablet:mt-16 mt-20 flex flex-col">
        <p className="text-18 text-black-300 font-bold">이사 유형</p>
        <section className="tablet:pb-12 mt-4 flex flex-row gap-4 pb-16">
          {MOVE_TYPES.map((type) => (
            <SelectCard
              key={type}
              variant={type}
              size="md"
              selected={selected === type}
              onClick={() => onSelectedChange(type)}
            />
          ))}
        </section>
        <div className="flex justify-between pb-8">
          <p className="text-18 text-black-300 shrink-0 font-bold whitespace-nowrap">이사 예정일</p>
          <div>
            <DatePicker value={date} onChange={onDateChange} />
          </div>
        </div>
        <hr className="border-line-100 tablet:w-155 mx-auto h-px w-176.25 pb-8" />
        <section className="flex justify-between">
          <p className="text-18 text-black-300 shrink-0 font-bold whitespace-nowrap">이사 지역</p>
          <div className="tablet:flex-col tablet:w-100 flex w-130 shrink-0 flex-row gap-4">
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-16 text-black-black-400 shrink-0 font-medium whitespace-nowrap">
                출발지
              </p>
              <Button
                variant="outlined"
                size="sm"
                className="justify-start px-6 py-4 whitespace-nowrap"
                onClick={departure.open}
              >
                {departure.value?.roadAddress ?? "출발지 선택하기"}
              </Button>
              {departure.value && (
                <button
                  type="button"
                  onClick={departure.open}
                  className="text-12 text-black-100 self-end font-medium whitespace-nowrap underline"
                >
                  수정하기
                </button>
              )}
              {departure.value && (
                <InputTextField
                  ref={departureDetailRef}
                  size="sm"
                  value={departure.detail}
                  onChange={(event) => departure.onDetailChange(event.target.value)}
                  placeholder="상세 주소를 입력하세요 (동·호수 등)"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-16 text-black-black-400 shrink-0 font-medium whitespace-nowrap">
                도착지
              </p>
              <Button
                variant="outlined"
                size="sm"
                className="justify-start px-6 py-4 whitespace-nowrap"
                onClick={arrival.open}
              >
                {arrival.value?.roadAddress ?? "도착지 선택하기"}
              </Button>
              {arrival.value && (
                <button
                  type="button"
                  onClick={arrival.open}
                  className="text-12 text-black-100 self-end font-medium whitespace-nowrap underline"
                >
                  수정하기
                </button>
              )}
              {arrival.value && (
                <InputTextField
                  ref={arrivalDetailRef}
                  size="sm"
                  value={arrival.detail}
                  onChange={(event) => arrival.onDetailChange(event.target.value)}
                  placeholder="상세 주소를 입력하세요 (동·호수 등)"
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <div className="pc:hidden tablet:mt-14.25 tablet:flex tablet:justify-end">
        <div className="w-50">
          <Button variant="solid" size="lg" disabled={!canSubmit} onClick={onSubmit}>
            견적 요청하기
          </Button>
        </div>
      </div>
    </div>
  );
}
