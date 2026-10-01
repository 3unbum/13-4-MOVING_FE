"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { authService, type AuthResult, type UserRole } from "@/lib/services/auth-service";
import { makePhoneSchema, type PhoneFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";

interface OAuthPhoneModalProps {
  open: boolean;
  role: UserRole;
  // 프로필 등록 전 단계라 ProfileRegisterModal과 달리 "다음에"로 건너뛸 수 없다 — 닫으면 가입 자체를 취소한다.
  onCancel: () => void;
  // 이걸 await해야 이동이 끝날 때까지 isSubmitting이 유지된다.
  onCompleted: (result: AuthResult) => void | Promise<void>;
}

export default function OAuthPhoneModal({
  open,
  role,
  onCancel,
  onCompleted,
}: OAuthPhoneModalProps) {
  const titleId = useId();
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const tValidation = useTranslations("validation");
  // 매 렌더마다 새 스키마가 생기면 zodResolver도 교체돼 폼이 불필요하게 다시 만들어집니다
  const schema = useMemo(() => makePhoneSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PhoneFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  // oauthSignupToken은 BE가 httpOnly 쿠키로 들고 있어서 여기선 phoneNumber만 보낸다.
  const onSubmit = async (values: PhoneFormValues) => {
    try {
      const result = await authService.oauthSignup(values);
      await onCompleted(result);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("signupFailed");
      setError("root", { message });
    }
  };

  // 서버에서 만들어진 계정은 되돌릴 수 없어, 제출 중엔 취소한 것처럼 보이게 두지 않는다.
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
      <ModalHeader id={titleId} title={t("phoneModalTitle")} size="md" onClose={handleClose} />
      <p className="text-18 text-black-300 w-full font-medium">
        {/* 조사·어순이 언어마다 달라 역할별 문장을 통째로 둡니다 */}
        {t(role === "MOVER" ? "phoneModalBodyMover" : "phoneModalBodyCustomer")}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-8" noValidate>
        <FormField
          id="phoneNumber"
          label={tp("phone")}
          type="tel"
          placeholder={tp("phonePlaceholder")}
          autoComplete="tel"
          errorMessage={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
        <AuthSubmitButton disabled={isSubmitting || !isValid} errorMessage={errors.root?.message}>
          {t("signupComplete")}
        </AuthSubmitButton>
      </form>
    </Modal>
  );
}
