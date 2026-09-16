"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/common/Button";
import ProfileImageUpload from "@/components/common/ProfileImageUpload";
import Toast from "@/components/common/Toast";
import Chip from "@/components/filter/ChipRegion";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";
import {
  customerProfileSchema,
  type CustomerProfileFormValues,
} from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import { cn } from "@/lib/utils/cn";

// 피그마 "프로필 등록_일반유저" 대응 — image(선택) / services(다중) / region(단일).
// region이 단일 선택인 건 BE customerProfileCreateSchema 계약 때문 — 칩 UI는 services와
// 똑같이 생겼지만 region 쪽은 한 번에 하나만 켜지는 라디오처럼 동작한다.
// 칩 크기는 피그마 그대로(모바일·태블릿 sm / 데스크탑엔 md 크기를 오버라이드) — filter/ChipRegion 재사용.
// 간격: 피그마에서 [구분선-이미지-구분선-서비스-구분선-지역] 묶음은 20px(pc 32px) 리듬이고,
// 그 묶음 전체와 버튼 사이는 별도로 32px(pc 56px) — 그래서 필드 묶음과 버튼을 감싸는 div를 분리함.
export default function CustomerProfileForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | undefined>();
  // ProfileImageUpload가 서버 업로드 중일 때는 제출을 막아야 함 — onChange가 업로드 완료 후에만
  // 호출되므로, 업로드 중 제출하면 새 이미지 URL이 반영되기 전에 폼이 전송될 수 있다
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: { image: undefined, region: undefined, services: [] },
  });

  // watch()는 리렌더마다 새 함수 참조를 반환해 React Compiler가 메모이제이션을 못 함(lint 경고) —
  // useWatch는 구독 기반이라 이 문제가 없음 (은범님 리뷰 코멘트)
  const selectedServices = useWatch({ control, name: "services" });
  const selectedRegion = useWatch({ control, name: "region" });

  function toggleService(value: string) {
    const next = selectedServices.includes(value)
      ? selectedServices.filter((service) => service !== value)
      : [...selectedServices, value];
    setValue("services", next, { shouldValidate: true });
  }

  async function onSubmit(values: CustomerProfileFormValues) {
    setSubmitError(undefined);
    try {
      await profileService.registerCustomer(values);
      router.push("/");
    } catch {
      setSubmitError("프로필 등록에 실패했어요. 잠시 후 다시 시도해주세요");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pc:gap-14 flex w-full flex-col gap-8">
      <div className="pc:gap-8 flex flex-col gap-5">
        <div className="bg-line-100 h-px w-full" />

        <div className="flex flex-col gap-4">
          <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
            프로필 이미지
          </span>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ProfileImageUpload
                value={field.value}
                onChange={field.onChange}
                onUploadingChange={setIsImageUploading}
              />
            )}
          />
        </div>

        <div className="bg-line-100 h-px w-full" />

        <div className="flex flex-col gap-6">
          <div className="pc:gap-1 flex flex-col gap-2">
            <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
              이용 서비스
            </span>
            <p className="text-12 text-black-100 pc:text-16">
              이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
            </p>
          </div>
          <div className="pc:gap-3 flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((option) => {
              const selected = selectedServices.includes(option.value);
              return (
                <Chip
                  key={option.value}
                  size="sm"
                  selected={selected}
                  onClick={() => toggleService(option.value)}
                  className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                >
                  {option.label}
                </Chip>
              );
            })}
          </div>
          {errors.services && (
            <p className="text-13 font-medium text-red-200">{errors.services.message}</p>
          )}
        </div>

        <div className="bg-line-100 h-px w-full" />

        <div className="flex flex-col gap-6">
          <div className="pc:gap-1 flex flex-col gap-2">
            <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
              내가 사는 지역
            </span>
            <p className="text-12 text-black-100 pc:text-16">
              내가 사는 지역은 언제든 수정 가능해요!
            </p>
          </div>
          <div className="pc:gap-3.5 flex flex-wrap gap-2">
            {REGION_OPTIONS.map((option) => {
              const selected = selectedRegion === option.value;
              return (
                <Chip
                  key={option.value}
                  size="sm"
                  selected={selected}
                  onClick={() => setValue("region", option.value, { shouldValidate: true })}
                  className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                >
                  {option.label}
                </Chip>
              );
            })}
          </div>
          {errors.region && (
            <p className="text-13 font-medium text-red-200">{errors.region.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="sm"
        className="pc:h-15 pc:gap-2 pc:rounded-2xl pc:text-18"
        disabled={isSubmitting || isImageUploading}
      >
        {isSubmitting ? "등록 중..." : "시작하기"}
      </Button>

      {submitError && <Toast message={submitError} />}
    </form>
  );
}
