"use client";

import clsx from "clsx";
import { useId } from "react";
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
  title = "지정 견적 요청하기",
  message = "일반 견적 요청을 먼저 진행해 주세요.",
  actionLabel = "일반 견적 요청 하기",
  onAction,
}: InfoRequiredModalProps) {
  const titleId = useId();
  const isMd = size === "md";

  return (
    <Modal
      open={open}
      onClose={onClose}
      position="center"
      labelledBy={titleId}
      className={clsx(
        isMd
          ? "w-152 min-w-152 gap-10 rounded-[32px] px-6 pt-8 pb-10"
          : "w-[292px] min-w-[292px] gap-7.5 rounded-3xl px-4 py-6"
      )}
    >
      <ModalHeader id={titleId} title={title} size={size} onClose={onClose} />
      <p className="text-18 text-black-300 min-h-0 w-full flex-1 overflow-y-auto font-medium">
        {message}
      </p>
      <Button variant="solid" size={isMd ? "lg" : "sm"} className="shrink-0" onClick={onAction}>
        {actionLabel}
      </Button>
    </Modal>
  );
}
