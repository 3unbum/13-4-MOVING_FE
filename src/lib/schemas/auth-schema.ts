import { z } from "zod";
import {
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
  RESET_CODE_PATTERN,
} from "@/constants/auth/validation";

/**
 * 검증 메시지 번역 함수 — `useTranslations("validation")`의 반환값을 그대로 받습니다.
 *
 * ⚠️ 스키마를 모듈 최상위 상수로 두면 `useTranslations`를 부를 수 없습니다(훅은 컴포넌트
 * 안에서만 호출 가능). 그래서 팩토리 함수로 바꿔 호출부에서 `t`를 주입합니다.
 *
 * 호출부는 반드시 `useMemo`로 감싸세요. 안 그러면 렌더마다 새 스키마가 만들어져
 * `zodResolver`도 매번 교체되고, 입력할 때마다 리렌더되는 폼에서 손해가 큽니다.
 *
 *   const t = useTranslations("validation");
 *   const schema = useMemo(() => makeLoginSchema(t), [t]);
 */
export type ValidationTranslator = (key: string) => string;

const makeEmailField = (t: ValidationTranslator) =>
  z.string().min(1, t("emailRequired")).regex(EMAIL_PATTERN, t("emailInvalid"));

// 새 비밀번호를 정하는 폼(회원가입·비밀번호 재설정)이 같은 규칙을 쓰도록 공유
const makeNewPasswordField = (t: ValidationTranslator) =>
  z.string().min(1, t("passwordRequired")).regex(PASSWORD_PATTERN, t("passwordPattern"));

export const makeLoginSchema = (t: ValidationTranslator) =>
  z.object({
    email: makeEmailField(t),
    // BE 로그인 API 계약과 동일하게 min(1)만 검사
    password: z.string().min(1, t("passwordRequired")),
  });

export type LoginFormValues = z.infer<ReturnType<typeof makeLoginSchema>>;

const makePhoneNumberField = (t: ValidationTranslator) =>
  z.string().min(1, t("phoneRequired")).regex(PHONE_PATTERN, t("phoneInvalid"));

export const makePhoneSchema = (t: ValidationTranslator) =>
  z.object({
    phoneNumber: makePhoneNumberField(t),
  });

export type PhoneFormValues = z.infer<ReturnType<typeof makePhoneSchema>>;

export const makeSignupSchema = (t: ValidationTranslator) =>
  z
    .object({
      name: z.string().min(1, t("nameRequired")),
      email: makeEmailField(t),
      phoneNumber: makePhoneNumberField(t),
      password: makeNewPasswordField(t),
      passwordConfirm: z.string().min(1, t("passwordConfirmRequired")),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("passwordMismatch"),
      path: ["passwordConfirm"],
    });

export type SignupFormValues = z.infer<ReturnType<typeof makeSignupSchema>>;

export const makeFindEmailSchema = (t: ValidationTranslator) =>
  z.object({
    // BE도 앞뒤 공백을 제거한 뒤 비교하므로 공백만 입력한 경우를 미리 막는다
    name: z.string().trim().min(1, t("nameRequired")),
    phoneNumber: makePhoneNumberField(t),
  });

export type FindEmailFormValues = z.infer<ReturnType<typeof makeFindEmailSchema>>;

export const makeResetEmailSchema = (t: ValidationTranslator) =>
  z.object({
    email: makeEmailField(t),
  });

export type ResetEmailFormValues = z.infer<ReturnType<typeof makeResetEmailSchema>>;

export const makeResetCodeSchema = (t: ValidationTranslator) =>
  z.object({
    code: z
      .string()
      .min(1, t("resetCodeRequired"))
      .regex(RESET_CODE_PATTERN, t("resetCodeInvalid")),
  });

export type ResetCodeFormValues = z.infer<ReturnType<typeof makeResetCodeSchema>>;

export const makeNewPasswordSchema = (t: ValidationTranslator) =>
  z
    .object({
      newPassword: makeNewPasswordField(t),
      newPasswordConfirm: z.string().min(1, t("passwordConfirmRequired")),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
      message: t("passwordMismatch"),
      path: ["newPasswordConfirm"],
    });

export type NewPasswordFormValues = z.infer<ReturnType<typeof makeNewPasswordSchema>>;
