"use client";
import Button from "@/components/common/Button";
import { useTranslations } from "next-intl";
import SelectCard from "@/components/common/SelectCard";
import DatePicker from "@/components/common/DatePicker";
import InputTextField from "@/components/common/InputTextfield";
import { SERVICES as MOVE_TYPES } from "@/components/filter/ChipRegion";
import type { AddressSearchController } from "@/hooks/useAddressSearch";
import { useEffect, useRef, useState } from "react";
import StepProgressBar from "./StepProgressBar";

const TOTAL_STEPS = 3;

interface QuotationRequestMobileProps {
  selected: (typeof MOVE_TYPES)[number];
  onSelectedChange: (value: (typeof MOVE_TYPES)[number]) => void;
  date: Date | undefined;
  onDateChange: (value: Date | undefined) => void;
  departure: AddressSearchController;
  arrival: AddressSearchController;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function QuotationRequestMobile({
  selected,
  onSelectedChange,
  date,
  onDateChange,
  departure,
  arrival,
  canSubmit,
  isSubmitting,
  onSubmit,
}: QuotationRequestMobileProps) {
  const t = useTranslations("request");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState(1);
  const departureDetailRef = useRef<HTMLInputElement>(null);
  const arrivalDetailRef = useRef<HTMLInputElement>(null);

  // 주소 선택이 끝나면 상세주소 입력창으로 바로 포커스 이동
  useEffect(() => {
    if (departure.value) departureDetailRef.current?.focus();
  }, [departure.value]);
  useEffect(() => {
    if (arrival.value) arrivalDetailRef.current?.focus();
  }, [arrival.value]);

  const goPrev = () => setStep((prev) => Math.max(prev - 1, 1));
  const goNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const isLastStep = step === TOTAL_STEPS;
  // 스텝별로 그 스텝에서 채워야 하는 값만 검사 — 2단계는 날짜, 마지막 단계는 전체(canSubmit) + 중복 제출 방지
  const isNextDisabled = step === 2 ? !date : isLastStep ? !canSubmit || isSubmitting : false;

  return (
    <div className="tablet:hidden mt-9 mb-8.5 bg-white px-6">
      <header className="flex flex-col gap-2">
        <StepProgressBar totalSteps={TOTAL_STEPS} currentStep={step} />
        <article className="flex flex-col items-center">
          <p className="text-20 text-black-500 font-bold">{t(`step${step}Title`)}</p>
          <p className="text-14 text-gray-gray-400 font-normal">{t("stepSubtitle")}</p>
        </article>
      </header>
      <main>
        {step === 1 && (
          <section className="mt-6.5 flex flex-col items-center gap-4 px-6">
            {MOVE_TYPES.map((type) => (
              <SelectCard
                key={type}
                variant={type}
                size="sm"
                selected={selected === type}
                onClick={() => onSelectedChange(type)}
              />
            ))}
          </section>
        )}
        {step === 2 && (
          <section className="mt-17.5 mb-32 flex justify-center">
            <DatePicker value={date} onChange={onDateChange} />
          </section>
        )}
        {step === 3 && (
          <section className="mt-6 mb-65 flex flex-col gap-6">
            <div>
              <p className="text-16 text-black-black-400 mb-3 font-medium">{tCommon("from")}</p>
              <Button
                variant="outlined"
                size="sm"
                className="justify-start px-6 py-4"
                onClick={departure.open}
              >
                {departure.value?.roadAddress ?? t("selectFrom")}
              </Button>
              {departure.value && (
                <button
                  type="button"
                  onClick={departure.open}
                  className="text-12 text-black-100 mt-2 block w-full text-right font-medium underline"
                >
                  {t("edit")}
                </button>
              )}
              {departure.value && (
                <InputTextField
                  ref={departureDetailRef}
                  size="sm"
                  className="mt-3"
                  value={departure.detail}
                  onChange={(event) => departure.onDetailChange(event.target.value)}
                  placeholder={t("detailAddressPlaceholder")}
                />
              )}
            </div>
            <div>
              <p className="text-16 text-black-black-400 mb-3 font-medium">{tCommon("to")}</p>
              <Button
                variant="outlined"
                size="sm"
                className="justify-start px-6 py-4"
                onClick={arrival.open}
              >
                {arrival.value?.roadAddress ?? t("selectTo")}
              </Button>
              {arrival.value && (
                <button
                  type="button"
                  onClick={arrival.open}
                  className="text-12 text-black-100 mt-2 block w-full text-right font-medium underline"
                >
                  {t("edit")}
                </button>
              )}
              {arrival.value && (
                <InputTextField
                  ref={arrivalDetailRef}
                  size="sm"
                  className="mt-3"
                  value={arrival.detail}
                  onChange={(event) => arrival.onDetailChange(event.target.value)}
                  placeholder={t("detailAddressPlaceholder")}
                />
              )}
            </div>
          </section>
        )}
      </main>
      <footer>
        <div
          className={`flex gap-2 align-middle ${step === 1 ? "px-auto mt-3 justify-end px-6" : step === 2 ? "mx-auto w-89" : "w-full"}`}
        >
          {step > 1 && (
            <Button variant="outlined" className="px-6 py-4" onClick={goPrev}>
              {t("prev")}
            </Button>
          )}
          <Button
            className={`${step === 1 ? "w-39.5" : "p-4"}`}
            onClick={isLastStep ? onSubmit : goNext}
            disabled={isNextDisabled}
          >
            {isLastStep ? t("submit") : t("next")}
          </Button>
        </div>
      </footer>
    </div>
  );
}
