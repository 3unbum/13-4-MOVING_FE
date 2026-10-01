"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import Modal, { ModalHeader } from "@/components/common/Modal";

interface ProfileRegisterModalProps {
  open: boolean;
  // 오버레이 클릭·esc·닫기 버튼·"다음에 할게요" 모두 이 핸들러로 처리
  onSkip: () => void;
  onRegister: () => void;
}

export default function ProfileRegisterModal({
  open,
  onSkip,
  onRegister,
}: ProfileRegisterModalProps) {
  const t = useTranslations("auth");
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={onSkip}
      labelledBy={titleId}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-6 pt-8 pb-10"
    >
      <ModalHeader id={titleId} title={t("registerModalTitle")} size="md" onClose={onSkip} />
      <p className="text-18 text-black-300 w-full font-medium">{t("registerModalBody")}</p>
      <div className="flex w-full gap-3">
        <Button variant="outlined" size="lg" onClick={onSkip}>
          {t("registerModalLater")}
        </Button>
        <Button variant="solid" size="lg" onClick={onRegister}>
          {t("registerModalGo")}
        </Button>
      </div>
    </Modal>
  );
}
