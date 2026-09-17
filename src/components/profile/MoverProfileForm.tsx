"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/common/Button";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";
import ProfileImageUpload from "@/components/common/ProfileImageUpload";
import Toast from "@/components/common/Toast";
import Chip from "@/components/filter/ChipRegion";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";
import { moverProfileSchema, type MoverProfileFormValues } from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

// 피그마 라벨(text-16 semibold, 필수 항목은 주황 *)이 InputTextField/InputTextArea의
// label prop(sr-only)만으로는 화면에 안 보여서 직접 그려줌 — 접근성용 label은 그대로 두고
// 시각적 라벨을 별도로 얹는 방식
function FieldLabel({ children, required = true }: { children: string; required?: boolean }) {
  return (
    <span className="text-16 text-black-black-300 pc:text-20 font-semibold">
      {children}
      {required && <span className="text-orange-400"> *</span>}
    </span>
  );
}

// 피그마 "프로필 등록_기사님" 대응 — 일반 유저 폼보다 필드가 많고, region도
// services와 마찬가지로 다중 선택(regions 배열)이라는 게 일반 유저 폼과의 핵심 차이.
// 데스크탑(pc)에서는 피그마 카드가 2열(왼쪽: 이미지·별명·경력·한줄소개 / 오른쪽: 상세설명·서비스·지역)
// 이라 pc:grid로 나눔 — 모바일·태블릿은 세로 한 줄.
export default function MoverProfileForm() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [submitError, setSubmitError] = useState<string | undefined>();
  // ProfileImageUpload가 서버 업로드 중일 때는 제출을 막아야 함 — onChange가 업로드 완료 후에만
  // 호출되므로, 업로드 중 제출하면 새 이미지 URL이 반영되기 전에 폼이 전송될 수 있다
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MoverProfileFormValues>({
    resolver: zodResolver(moverProfileSchema),
    defaultValues: {
      image: undefined,
      nickName: "",
      bio: "",
      description: "",
      services: [],
      regions: [],
    },
  });

  // watch()는 리렌더마다 새 함수 참조를 반환해 React Compiler가 메모이제이션을 못 함(lint 경고) —
  // useWatch는 구독 기반이라 이 문제가 없음 (은범님 리뷰 코멘트)
  const selectedServices = useWatch({ control, name: "services" });
  const selectedRegions = useWatch({ control, name: "regions" });

  function toggle(field: "services" | "regions", value: string) {
    const current = field === "services" ? selectedServices : selectedRegions;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setValue(field, next, { shouldValidate: true });
  }

  async function onSubmit(values: MoverProfileFormValues) {
    setSubmitError(undefined);
    try {
      await profileService.registerMover(values);
      // 등록 자체는 끝났으니 refetch 실패를 등록 실패로 취급하지 않는다 —
      // 계정 캐시가 못 갱신되면 이후 새로고침 때 맞춰진다. (#123 CustomerProfileForm과 동일 패턴)
      await refetch().catch(() => {});
      router.push("/mover/requests");
    } catch {
      setSubmitError("프로필 등록에 실패했어요. 잠시 후 다시 시도해주세요");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pc:gap-12 flex w-full flex-col gap-6">
      <div className="pc:grid pc:grid-cols-2 pc:items-start pc:gap-x-30 pc:gap-y-8 flex flex-col gap-5">
        <div className="pc:gap-8 flex flex-col gap-5">
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

          <div className="flex flex-col gap-4">
            <FieldLabel>별명</FieldLabel>
            <InputTextField
              label="별명"
              placeholder="사이트에 노출될 별명을 입력해 주세요"
              size="sm"
              className="pc:[&_input]:text-18"
              errorMessage={errors.nickName?.message}
              {...register("nickName")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>경력</FieldLabel>
            <InputTextField
              label="경력"
              type="text"
              inputMode="numeric"
              placeholder="기사님의 경력을 입력해 주세요"
              size="sm"
              className="pc:[&_input]:text-18"
              errorMessage={errors.career?.message}
              // inputMode="numeric"은 키패드 힌트일 뿐 실제 입력을 막지 않음 — "1년"처럼 문자가
              // 섞이거나, "1e5"처럼 Number()가 그대로 통과시켜버리는(=100000, int().min(0) 우회) 값이
              // 들어올 수 있어 입력 단계에서 숫자 이외 문자를 바로 제거해야 함 (은범님 리뷰 코멘트)
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              {...register("career", {
                setValueAs: (v) => {
                  if (v == null || (typeof v === "string" && v.trim() === "")) {
                    return undefined;
                  }
                  const number = Number(v);
                  return Number.isNaN(number) ? undefined : number;
                },
              })}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>한 줄 소개</FieldLabel>
            <InputTextField
              label="한 줄 소개"
              placeholder="한 줄 소개를 입력해 주세요"
              size="sm"
              className="pc:[&_input]:text-18"
              errorMessage={errors.bio?.message}
              {...register("bio")}
            />
          </div>
        </div>

        <div className="bg-line-100 pc:hidden h-px w-full" />

        <div className="pc:gap-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FieldLabel>상세 설명</FieldLabel>
            <InputTextArea
              label="상세 설명"
              placeholder="상세 내용을 입력해 주세요"
              size="sm"
              className="pc:[&_textarea]:px-6 pc:[&_textarea]:text-18"
              errorMessage={errors.description?.message}
              {...register("description")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>제공 서비스</FieldLabel>
            <div className="pc:gap-3 flex flex-wrap gap-1.5">
              {SERVICE_OPTIONS.map((option) => {
                const selected = selectedServices.includes(option.value);
                return (
                  <Chip
                    key={option.value}
                    size="sm"
                    selected={selected}
                    onClick={() => toggle("services", option.value)}
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

          <div className="flex flex-col gap-4">
            <FieldLabel>서비스 가능 지역</FieldLabel>
            <div className="pc:gap-3.5 flex flex-wrap gap-2">
              {REGION_OPTIONS.map((option) => {
                const selected = selectedRegions.includes(option.value);
                return (
                  <Chip
                    key={option.value}
                    size="sm"
                    selected={selected}
                    onClick={() => toggle("regions", option.value)}
                    className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            {errors.regions && (
              <p className="text-13 font-medium text-red-200">{errors.regions.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pc:w-125 pc:self-end w-full">
        <Button
          type="submit"
          size="sm"
          className="pc:h-15 pc:gap-2 pc:rounded-2xl pc:text-18"
          disabled={isSubmitting || isImageUploading}
        >
          {isSubmitting ? "등록 중..." : "시작하기"}
        </Button>
      </div>

      {submitError && <Toast message={submitError} />}
    </form>
  );
}
