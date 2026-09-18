import { z } from "zod";
import { PHONE_PATTERN, PASSWORD_PATTERN } from "@/constants/auth/validation";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";

const serviceValues = SERVICE_OPTIONS.map((option) => option.value) as [string, ...string[]];
const regionValues = REGION_OPTIONS.map((option) => option.value) as [string, ...string[]];

// BE customerProfileCreateSchema와 동일한 계약: region은 단일 선택(enum), services는 배열
export const customerProfileSchema = z.object({
  image: z.string().optional(),
  region: z.enum(regionValues, { message: "내가 사는 지역을 선택해주세요" }),
  services: z.array(z.enum(serviceValues)).min(1, "이용 서비스를 1개 이상 선택해주세요"),
});

// BE moverProfileCreateSchema와 동일한 계약: services/regions 둘 다 배열(다중 선택)
export const moverProfileSchema = z.object({
  image: z.string().optional(),
  // trim()을 min(1)보다 먼저 걸어야 공백만 입력한 값(" ")이 통과하지 않는다(PR #135 리뷰,
  // 3unbum/coderabbitai) — 필수 문자열 필드 전부 동일하게 적용
  nickName: z.string().trim().min(1, "별명을 입력해주세요"),
  // register(..., { valueAsNumber: true })로 이미 숫자로 변환된 값이 들어온다는 전제 —
  // z.coerce를 쓰면 useForm 입출력 타입이 갈라져 resolver 타입 에러가 남
  // setValueAs가 빈 입력을 undefined로 보존하므로(0으로 치환 금지) 필수 검증은 여기서 잡힌다
  career: z.number({ message: "경력을 입력해주세요" }).int().min(0, "경력은 0 이상이어야 합니다"),
  bio: z.string().trim().min(1, "한 줄 소개를 입력해주세요"),
  description: z.string().trim().min(1, "상세 설명을 입력해주세요"),
  services: z.array(z.enum(serviceValues)).min(1, "제공 서비스를 1개 이상 선택해주세요"),
  regions: z.array(z.enum(regionValues)).min(1, "서비스 가능 지역을 1개 이상 선택해주세요"),
});

// BE customerProfileUpdateSchema 대응(#72). name/phoneNumber/region/services는 이미 등록된 값을
// 폼에 프리필해서 보여주므로 여기선 상시 필수로 검증(= "비워서 지우기"는 지원하지 않음, PATCH의
// optional은 BE가 부분 수정을 허용한다는 뜻이지 FE가 빈 값을 보낸다는 뜻이 아님).
// 비밀번호만 진짜 선택 입력 — 비워두면 "변경 안 함". newPasswordConfirm은 FE 전용 필드라 BE로는
// 안 보냄(profileService.updateCustomer 호출부에서 제외).
export const customerProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해주세요"),
    phoneNumber: z
      .string()
      .min(1, "전화번호를 입력해주세요")
      .regex(PHONE_PATTERN, "올바른 전화번호 형식이 아닙니다"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .regex(PASSWORD_PATTERN, "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다")
      .optional()
      .or(z.literal("")),
    newPasswordConfirm: z.string().optional(),
    image: z.string().optional(),
    region: z.enum(regionValues, { message: "내가 사는 지역을 선택해주세요" }),
    services: z.array(z.enum(serviceValues)).min(1, "이용 서비스를 1개 이상 선택해주세요"),
  })
  // 비밀번호 세 필드(현재/새/새 확인)는 전부 비었거나 전부 채워졌거나 둘 중 하나여야 한다 —
  // 두 개만 따로 막으면(newPassword만 있으면 currentPassword 필수 / currentPassword만 있으면
  // newPassword 필수) newPasswordConfirm 하나만 입력한 케이스가 빠져나간다: newPassword가
  // 비어있으니 다른 refine은 전부 통과하고, onSubmit에서도 newPassword가 falsy라 비밀번호
  // 필드 전부가 페이로드에서 조용히 빠진 채 이름/전화번호만 수정돼버림(coderabbitai 리뷰, PR #135)
  .refine(
    (data) =>
      (!data.currentPassword && !data.newPassword && !data.newPasswordConfirm) ||
      (!!data.currentPassword && !!data.newPassword && !!data.newPasswordConfirm),
    {
      message: "비밀번호를 변경하려면 세 필드를 모두 입력해주세요",
      path: ["newPassword"],
    }
  )
  // 소셜 로그인 계정(비밀번호 없음)이 새 비밀번호를 시도하는 경우는 여기서 막지 않음 — BE가
  // "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다"로 응답하고, 그 메시지를 submitError로 그대로 노출한다
  .refine((data) => !data.newPassword || data.newPassword === data.newPasswordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["newPasswordConfirm"],
  })
  // 현재 비밀번호와 같은 값으로 "변경"하는 건 의미가 없어 여기서 막는다 — 그동안 BE만 검증하고
  // 있어서 제출 후 서버 왕복 뒤에야 에러가 보였음(#124 리뷰, 다른 두 비밀번호 refine과 동일하게 맞춤)
  .refine((data) => !data.newPassword || data.newPassword !== data.currentPassword, {
    message: "현재 비밀번호와 다른 새 비밀번호를 입력해주세요",
    path: ["newPassword"],
  });

// BE moverProfileUpdateSchema 대응(#73). 기사님 마이페이지는 피그마에서 "프로필 수정"과
// "기본정보 수정"이 별도 프레임(별도 폼)으로 분리돼 있어 — 프로필 필드(별명/경력/한줄소개/상세설명/
// 서비스/지역)는 register와 완전히 동일해서 moverProfileSchema를 그대로 재사용하고, 여기선
// 계정 정보(이름/전화번호/비밀번호)만 다룬다. customerProfileUpdateSchema와 동일하게 이름/전화번호는
// 프리필된 값이라 상시 필수(= "비워서 지우기" 미지원), 비밀번호만 진짜 선택 입력(비워두면 "변경 안 함").
// newPasswordConfirm은 FE 전용 필드라 BE로는 안 보냄(profileService.updateMover 호출부에서 제외).
// 이메일은 BE moverProfileUpdateSchema에 필드 자체가 없어 이 화면에서 수정 불가 — 읽기 전용으로만 노출.
export const moverBasicInfoUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해주세요"),
    phoneNumber: z
      .string()
      .min(1, "전화번호를 입력해주세요")
      .regex(PHONE_PATTERN, "올바른 전화번호 형식이 아닙니다"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .regex(PASSWORD_PATTERN, "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다")
      .optional()
      .or(z.literal("")),
    newPasswordConfirm: z.string().optional(),
  })
  // 비밀번호 세 필드(현재/새/새 확인)는 전부 비었거나 전부 채워졌거나 둘 중 하나여야 한다 —
  // 두 개만 따로 막으면(newPassword만 있으면 currentPassword 필수 / currentPassword만 있으면
  // newPassword 필수) newPasswordConfirm 하나만 입력한 케이스가 빠져나간다: newPassword가
  // 비어있으니 다른 refine은 전부 통과하고, onSubmit에서도 newPassword가 falsy라 비밀번호
  // 필드 전부가 페이로드에서 조용히 빠진 채 이름/전화번호만 수정돼버림(coderabbitai 리뷰, PR #135)
  .refine(
    (data) =>
      (!data.currentPassword && !data.newPassword && !data.newPasswordConfirm) ||
      (!!data.currentPassword && !!data.newPassword && !!data.newPasswordConfirm),
    {
      message: "비밀번호를 변경하려면 세 필드를 모두 입력해주세요",
      path: ["newPassword"],
    }
  )
  // 소셜 로그인 계정(비밀번호 없음)이 새 비밀번호를 시도하는 경우는 여기서 막지 않음 — BE가
  // "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다"로 응답하고, 그 메시지를 submitError로 그대로 노출한다
  .refine((data) => !data.newPassword || data.newPassword === data.newPasswordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["newPasswordConfirm"],
  })
  // 현재 비밀번호와 같은 값으로 "변경"하는 건 의미가 없어 여기서 막는다 — 그동안 BE만 검증하고
  // 있어서 제출 후 서버 왕복 뒤에야 에러가 보였음(#124 리뷰, 다른 두 비밀번호 refine과 동일하게 맞춤)
  .refine((data) => !data.newPassword || data.newPassword !== data.currentPassword, {
    message: "현재 비밀번호와 다른 새 비밀번호를 입력해주세요",
    path: ["newPassword"],
  });

export type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;
export type MoverProfileFormValues = z.infer<typeof moverProfileSchema>;
export type CustomerProfileUpdateFormValues = z.infer<typeof customerProfileUpdateSchema>;
export type MoverBasicInfoUpdateFormValues = z.infer<typeof moverBasicInfoUpdateSchema>;
