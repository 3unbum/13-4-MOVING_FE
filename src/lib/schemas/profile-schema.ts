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
    // trim()을 min(1)보다 먼저 걸어야 공백만 입력한 값(" ")이 통과하지 않는다(PR #135 리뷰,
    // 3unbum/coderabbitai) — 필수 문자열 필드 전부 동일하게 적용
    nickName: z.string().trim().min(1, t("nickNameRequired")),
    // register(..., { valueAsNumber: true })로 이미 숫자로 변환된 값이 들어온다는 전제 —
    // z.coerce를 쓰면 useForm 입출력 타입이 갈라져 resolver 타입 에러가 남
    // setValueAs가 빈 입력을 undefined로 보존하므로(0으로 치환 금지) 필수 검증은 여기서 잡힌다
    career: z
      .number({ message: t("careerRequired") })
      .int()
      .min(0, t("careerMin")),
    bio: z.string().trim().min(1, t("bioRequired")),
    description: z.string().trim().min(1, t("descriptionRequired")),
    services: z.array(z.enum(serviceValues)).min(1, t("moverServicesRequired")),
    regions: z.array(z.enum(regionValues)).min(1, t("moverRegionsRequired")),
  });

/**
 * 비밀번호 3필드 공통 검증 — 고객·기사님 기본정보 수정이 완전히 같은 규칙을 씁니다.
 *
 * 원래 두 스키마에 똑같은 refine 3개가 복붙돼 있었습니다. 팩토리로 바꾸면서 합쳤습니다.
 * (메시지는 물론 주석까지 동일했습니다)
 */
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
      // newPassword/newPasswordConfirm 중 하나라도 채워졌으면 세 필드 모두 필요하다 — 단,
      // currentPassword만 채워진 경우는 통과시킨다: 브라우저 자동완성이 currentPassword만
      // 미리 채워 넣는 경우가 있어서, 그 상태로 이름/전화번호만 바꾸는 정상적인 제출까지
      // "비밀번호를 변경하려면 세 필드를 모두 입력해주세요"로 막아버리는 문제가 있었다
      // (coderabbitai 리뷰로 처음 추가한 all-or-nothing 버전의 회귀, MunChiho 리뷰, PR #135)
      .refine(
        (data: z.infer<T>) => {
          const hasCurrent = Boolean(data.currentPassword?.trim());
          const hasNew = Boolean(data.newPassword?.trim());
          const hasConfirm = Boolean(data.newPasswordConfirm?.trim());
          if (!hasNew && !hasConfirm) return true;
          return hasCurrent && hasNew && hasConfirm;
        },
        {
          message: t("passwordChangeAllRequired"),
          path: ["newPassword"],
        }
      )
      // 소셜 로그인 계정(비밀번호 없음)이 새 비밀번호를 시도하는 경우는 여기서 막지 않음 — BE가
      // "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다"로 응답하고, 그 메시지를 submitError로 그대로 노출한다
      .refine(
        (data: z.infer<T>) => !data.newPassword || data.newPassword === data.newPasswordConfirm,
        {
          message: t("passwordMismatch"),
          path: ["newPasswordConfirm"],
        }
      )
      // 현재 비밀번호와 같은 값으로 "변경"하는 건 의미가 없어 여기서 막는다 — 그동안 BE만 검증하고
      // 있어서 제출 후 서버 왕복 뒤에야 에러가 보였음(#124 리뷰, 다른 두 비밀번호 refine과 동일하게 맞춤)
      .refine(
        (data: z.infer<T>) => !data.newPassword || data.newPassword !== data.currentPassword,
        {
          message: t("passwordSameAsCurrent"),
          path: ["newPassword"],
        }
      )
  );
}

/** 이름·전화번호·비밀번호 3필드 — 고객 프로필 수정과 기사님 기본정보 수정이 공유합니다 */
const makeAccountFields = (t: ValidationTranslator) => ({
  name: z.string().trim().min(1, t("nameRequired")),
  phoneNumber: z.string().min(1, t("phoneRequired")).regex(PHONE_PATTERN, t("phoneInvalid")),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .regex(PASSWORD_PATTERN, t("passwordPattern"))
    .optional()
    .or(z.literal("")),
  newPasswordConfirm: z.string().optional(),
});

// BE customerProfileUpdateSchema 대응(#72). name/phoneNumber/region/services는 이미 등록된 값을
// 폼에 프리필해서 보여주므로 여기선 상시 필수로 검증(= "비워서 지우기"는 지원하지 않음, PATCH의
// optional은 BE가 부분 수정을 허용한다는 뜻이지 FE가 빈 값을 보낸다는 뜻이 아님).
// 비밀번호만 진짜 선택 입력 — 비워두면 "변경 안 함". newPasswordConfirm은 FE 전용 필드라 BE로는
// 안 보냄(profileService.updateCustomer 호출부에서 제외).
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

// BE moverProfileUpdateSchema 대응(#73). 기사님 마이페이지는 피그마에서 "프로필 수정"과
// "기본정보 수정"이 별도 프레임(별도 폼)으로 분리돼 있어 — 프로필 필드(별명/경력/한줄소개/상세설명/
// 서비스/지역)는 register와 완전히 동일해서 moverProfileSchema를 그대로 재사용하고, 여기선
// 계정 정보(이름/전화번호/비밀번호)만 다룬다. customerProfileUpdateSchema와 동일하게 이름/전화번호는
// 프리필된 값이라 상시 필수(= "비워서 지우기" 미지원), 비밀번호만 진짜 선택 입력(비워두면 "변경 안 함").
// newPasswordConfirm은 FE 전용 필드라 BE로는 안 보냄(profileService.updateMover 호출부에서 제외).
// 이메일은 BE moverProfileUpdateSchema에 필드 자체가 없어 이 화면에서 수정 불가 — 읽기 전용으로만 노출.
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
