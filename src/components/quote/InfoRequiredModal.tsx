"use client";

import { cn } from "@/lib/utils/cn";
import { useId } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import Modal, { ModalHeader } from "@/components/common/Modal";

type InfoRequiredModalSize = "sm" | "md";

interface InfoRequiredModalProps {
  open: boolean;
  onClose: () => void;
  size?: InfoRequiredModalSize;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction: () => void;
}

export default function InfoRequiredModal({
  open,
  onClose,
  size = "md",
  title,
  message,
  actionLabel,
  onAction,
}: InfoRequiredModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const t = useTranslations("quote");

  // 기본 매개변수로는 `t`를 못 씁니다(훅이 함수 본문 안에서만 호출 가능) — 여기서 채웁니다
  const resolvedTitle = title ?? t("targetedTitle");
  const resolvedMessage = message ?? t("targetedMessage");
  const resolvedActionLabel = actionLabel ?? t("targetedAction");

  return (
    <Modal
      open={open}
      onClose={onClose}
      position="center"
      labelledBy={titleId}
      className={cn(
        isMd
          ? "w-152 min-w-152 gap-10 rounded-[32px] px-6 pt-8 pb-10"
          : "w-[292px] min-w-[292px] gap-7.5 rounded-3xl px-4 py-6"
      )}
    >
      <ModalHeader id={titleId} title={resolvedTitle} size={size} onClose={onClose} />
      <p className="text-18 text-black-300 min-h-0 w-full flex-1 overflow-y-auto font-medium">
        {resolvedMessage}
      </p>
      <Button variant="solid" size={isMd ? "lg" : "sm"} className="shrink-0" onClick={onAction}>
        {resolvedActionLabel}
      </Button>
    </Modal>
  );
}
