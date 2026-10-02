import { z } from "zod";
import { PHONE_PATTERN, PASSWORD_PATTERN } from "@/constants/auth/validation";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";
import type { ValidationTranslator } from "@/lib/schemas/auth-schema";

const serviceValues = SERVICE_OPTIONS.map((option) => option.value) as [string, ...string[]];
const regionValues = REGION_OPTIONS.map((option) => option.value) as [string, ...string[]];

// BE customerProfileCreateSchema와 동일한 계약: region은 단일 선택(enum), services는 배열
export const makeCustomerProfileSchema = (t: ValidationTranslator) =>
  z.object({
    image: z.string().optional(),
    region: z.enum(regionValues, { message: t("regionRequired") }),
    services: z.array(z.enum(serviceValues)).min(1, t("customerServicesRequired")),
  });

// BE moverProfileCreateSchema와 동일한 계약: services/regions 둘 다 배열(다중 선택)
export const makeMoverProfileSchema = (t: ValidationTranslator) =>
  z.object({
    image: z.string().optional(),
    // trim()을 min(1)보다 먼저 걸어야 공백만 입력한 값이 통과하지 않는다
    nickName: z.string().trim().min(1, t("nickNameRequired")),
    // valueAsNumber로 이미 숫자 변환된 값이 들어온다는 전제 — z.coerce는 resolver 타입 에러가 남
    career: z
      .number({ message: t("careerRequired") })
      .int()
      .min(0, t("careerMin"))
      .max(60, t("careerMax")),
    bio: z.string().trim().min(1, t("bioRequired")),
    description: z.string().trim().min(1, t("descriptionRequired")),
    services: z.array(z.enum(serviceValues)).min(1, t("moverServicesRequired")),
    regions: z.array(z.enum(regionValues)).min(1, t("moverRegionsRequired")),
  });

// 비밀번호 3필드 공통 검증 — 고객·기사님 기본정보 수정이 동일한 규칙을 공유
interface PasswordFields {
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

function withPasswordRules<T extends z.ZodType<PasswordFields>>(
  schema: T,
  t: ValidationTranslator
) {
  return (
    schema
      // 소셜 로그인 계정(비밀번호 없음)은 BE가 별도 에러 메시지로 응답
      .refine(
        (data: z.infer<T>) => !data.newPassword || data.newPassword === data.newPasswordConfirm,
        {
          message: t("passwordMismatch"),
          path: ["newPasswordConfirm"],
        }
      )
      // 현재 비밀번호와 같은 값으로 변경하는 건 의미가 없어 여기서 막는다
      .refine(
        (data: z.infer<T>) => !data.newPassword || data.newPassword !== data.currentPassword,
        {
          message: t("passwordSameAsCurrent"),
          path: ["newPassword"],
        }
      )
  );
}

// currentPassword는 항상 필수(#157) — 무엇을 바꾸든 재확인 필요.
// newPassword/newPasswordConfirm만 선택 입력(비워두면 "변경 안 함")
const makeAccountFields = (t: ValidationTranslator) => ({
  name: z.string().trim().min(1, t("nameRequired")),
  phoneNumber: z.string().min(1, t("phoneRequired")).regex(PHONE_PATTERN, t("phoneInvalid")),
  currentPassword: z.string().min(1, t("currentPasswordRequired")),
  newPassword: z
    .string()
    .regex(PASSWORD_PATTERN, t("passwordPattern"))
    .optional()
    .or(z.literal("")),
  newPasswordConfirm: z.string().optional(),
});

// BE customerProfileUpdateSchema 대응. name/phoneNumber/region/services는 상시 필수
// (빈 값으로 지우기는 미지원). newPasswordConfirm은 FE 전용 필드라 BE로는 보내지 않는다.
export const makeCustomerProfileUpdateSchema = (t: ValidationTranslator) =>
  withPasswordRules(
    z.object({
      ...makeAccountFields(t),
      image: z.string().optional(),
      region: z.enum(regionValues, { message: t("regionRequired") }),
      services: z.array(z.enum(serviceValues)).min(1, t("customerServicesRequired")),
    }),
    t
  );

// BE moverProfileUpdateSchema 대응. 기사님 마이페이지는 "프로필 수정"과 "기본정보 수정"이
// 별도 화면이라 여기선 계정 정보(이름/전화번호/비밀번호)만 다룬다. 이메일은 BE 스키마에
// 필드가 없어 수정 불가 — 읽기 전용으로만 노출.
export const makeMoverBasicInfoUpdateSchema = (t: ValidationTranslator) =>
  withPasswordRules(z.object(makeAccountFields(t)), t);

export type CustomerProfileFormValues = z.infer<ReturnType<typeof makeCustomerProfileSchema>>;
export type MoverProfileFormValues = z.infer<ReturnType<typeof makeMoverProfileSchema>>;
export type CustomerProfileUpdateFormValues = z.infer<
  ReturnType<typeof makeCustomerProfileUpdateSchema>
>;
export type MoverBasicInfoUpdateFormValues = z.infer<
  ReturnType<typeof makeMoverBasicInfoUpdateSchema>
>;
