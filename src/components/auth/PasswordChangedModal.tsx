"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import Modal, { ModalHeader } from "@/components/common/Modal";

interface PasswordChangedModalProps {
  open: boolean;
  // 닫기(X) · ESC · 바깥 클릭 · 확인 버튼 전부 이 핸들러 하나로 처리 — 변경 후엔
  // 로그인 페이지로 보내야 해서 "모달만 닫히고 남는" 경로가 있으면 안 됨
  onConfirm: () => void;
}

export default function PasswordChangedModal({ open, onConfirm }: PasswordChangedModalProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={onConfirm}
      labelledBy={titleId}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-6 pt-8 pb-10"
    >
      <ModalHeader
        id={titleId}
        title={t("resetPassword.passwordChangedTitle")}
        size="md"
        onClose={onConfirm}
      />
      <Button variant="solid" size="lg" onClick={onConfirm}>
        {tCommon("confirm")}
      </Button>
    </Modal>
  );
}
