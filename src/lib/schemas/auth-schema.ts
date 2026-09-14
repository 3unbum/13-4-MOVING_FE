import { z } from "zod";
import { EMAIL_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN } from "@/constants/auth/validation";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해 주세요")
    .regex(EMAIL_PATTERN, "올바른 이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요")
    // 회원가입 규칙과 동일한 형식 검사(피그마 디자인 기준). BE loginSchema는 이 규칙을 강제하지 않음(min(1)만 검사).
    .regex(PASSWORD_PATTERN, "비밀번호가 올바르지 않습니다."),
});

export type CustomerLoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(1, "이름을 입력해 주세요"),
    email: z
      .string()
      .min(1, "이메일을 입력해 주세요")
      .regex(EMAIL_PATTERN, "올바른 이메일 형식이 아닙니다."),
    phoneNumber: z
      .string()
      .min(1, "전화번호를 입력해 주세요")
      .regex(PHONE_PATTERN, "올바른 전화번호 형식이 아닙니다."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해 주세요")
      .regex(PASSWORD_PATTERN, "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다."),
    passwordConfirm: z.string().min(1, "비밀번호 다시 한번 입력해 주세요"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type CustomerSignupFormValues = z.infer<typeof signupSchema>;
