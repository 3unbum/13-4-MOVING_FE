"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { authService, type AuthResult, type UserRole } from "@/lib/services/auth-service";
import { phoneSchema, type PhoneFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";

interface OAuthPhoneModalProps {
  open: boolean;
  role: UserRole;
  // 프로필 등록 전 단계라 ProfileRegisterModal과 달리 "다음에"로 건너뛸 수 없다 — 닫으면 가입 자체를 취소한다.
  onCancel: () => void;
  // 부모가 계정 조회·이동까지 처리하므로 Promise를 받는다 — 그걸 기다려야 isSubmitting이 끝까지 유지된다.
  onCompleted: (result: AuthResult) => void | Promise<void>;
}

export default function OAuthPhoneModal({
  open,
  role,
  onCancel,
  onCompleted,
}: OAuthPhoneModalProps) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PhoneFormValues>({ resolver: zodResolver(phoneSchema), mode: "onChange" });

  // oauthSignupToken은 BE가 httpOnly 쿠키로 들고 있어서 여기선 phoneNumber만 보낸다.
  const onSubmit = async (values: PhoneFormValues) => {
    try {
      const result = await authService.oauthSignup(values);
      await onCompleted(result);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "회원가입 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  /**
   * 제출 중 닫기를 막음
   */
  const handleClose = () => {
    if (isSubmitting) return;
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy={titleId}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-6 pt-8 pb-10"
    >
      <ModalHeader id={titleId} title="전화번호를 입력해 주세요" size="md" onClose={handleClose} />
      <p className="text-18 text-black-300 w-full font-medium">
        {role === "MOVER" ? "기사님" : "일반"} 계정 가입을 마치려면 전화번호가 필요해요.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-8" noValidate>
        <FormField
          id="phoneNumber"
          label="전화번호"
          type="tel"
          placeholder="하이픈(-) 없이 숫자만 입력해 주세요"
          autoComplete="tel"
          errorMessage={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
        <AuthSubmitButton disabled={isSubmitting || !isValid} errorMessage={errors.root?.message}>
          가입 완료
        </AuthSubmitButton>
      </form>
    </Modal>
  );
}
