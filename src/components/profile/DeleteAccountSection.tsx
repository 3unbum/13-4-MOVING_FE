"use client";

import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import InputTextField from "@/components/common/InputTextfield";
import Modal, { ModalHeader } from "@/components/common/Modal";
import Toast from "@/components/common/Toast";
import { isProfileEditVerificationRequiredError } from "@/hooks/useProfileEditVerified";
import { useRouter } from "@/i18n/navigation";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { useAuth } from "@/providers/AuthProvider";

interface DeleteAccountSectionProps {
  // 프로필 수정 진입 인증 후 30분이 지나 BE가 403으로 거절하면 부모가 인증 화면을 다시 띄운다
  onVerificationRequired: () => void;
}

interface DeleteAccountFormValues {
  phrase: string;
}

// 프로필 수정(일반 유저) / 기본정보 수정(기사님) 화면 하단의 회원 탈퇴. 진입 시 이메일 인증을
// 이미 거쳤으므로 비밀번호는 다시 받지 않고, 확인 문구 입력으로 실수 탈퇴만 막는다.
// 모달이 포털 없이 그 자리에 렌더링되므로 수정 폼(<form>) 바깥에 둬야 폼이 중첩되지 않는다.
export default function DeleteAccountSection({
  onVerificationRequired,
}: DeleteAccountSectionProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tAuthError = useTranslations("authError");
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DeleteAccountFormValues>({ defaultValues: { phrase: "" } });

  // 확인 문구는 언어마다 달라 번역 파일에서 가져온다. 공백·대소문자까지 그대로 입력해야 통과 —
  // 일부러 번거롭게 해서 신중하게 누르도록 하는 장치라 느슨하게 비교하지 않는다.
  const confirmPhrase = t("deleteAccountConfirmPhrase");
  const phrase = useWatch({ control, name: "phrase" });
  const isPhraseMatched = phrase === confirmPhrase;

  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => setErrorMessage(undefined), 3000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  function openModal() {
    reset();
    setIsOpen(true);
  }

  // 요청이 나간 뒤엔 결과와 상관없이 닫힌 것처럼 보이면 안 되므로 제출 중에는 닫지 않는다
  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
  }

  async function onSubmit() {
    try {
      await deleteAccount();
      router.replace("/");
    } catch (error) {
      setIsOpen(false);
      if (isProfileEditVerificationRequiredError(error)) {
        onVerificationRequired();
        return;
      }
      // 409(확정된 이사·미결제 견적·동시 요청)는 계정이 그대로 남아 있으니 이유만 알려준다
      setErrorMessage(toAuthErrorMessage(error, tAuthError, t("deleteAccountFailed")));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-14 pc:text-16 self-end text-gray-400 underline underline-offset-4"
      >
        {t("deleteAccount")}
      </button>

      <Modal
        open={isOpen}
        onClose={closeModal}
        labelledBy={titleId}
        className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-8 rounded-4xl px-6 pt-8 pb-10"
      >
        <ModalHeader id={titleId} title={t("deleteAccount")} size="md" onClose={closeModal} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-8" noValidate>
          <div className="flex flex-col gap-4">
            <p className="text-16 text-black-300 pc:text-18 font-medium">
              {t("deleteAccountDescription")}
            </p>
            <p className="text-16 pc:text-18 font-semibold text-orange-400">{confirmPhrase}</p>
            <InputTextField
              label={t("deleteAccountDescription")}
              placeholder={confirmPhrase}
              // 모바일 키보드가 첫 글자를 대문자로 바꾸거나 자동완성 뒤에 공백을 붙이면
              // 정확히 일치하지 않아 버튼이 안 켜진다 — 키보드 보정을 끈다
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              {...register("phrase")}
            />
          </div>
          <div className="flex w-full gap-2">
            <Button type="button" variant="outlined" onClick={closeModal}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={!isPhraseMatched || isSubmitting}>
              {isSubmitting ? t("deleteAccountSubmitting") : t("deleteAccountSubmit")}
            </Button>
          </div>
        </form>
      </Modal>

      {errorMessage && <Toast message={errorMessage} />}
    </>
  );
}
