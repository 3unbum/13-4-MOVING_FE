"use client";

import Button from "@/components/common/Button";
import { useTranslations } from "next-intl";
import Modal from "@/components/common/Modal";

interface RequireProfileModalProps {
  open: boolean;
  /** 예 — 프로필 등록 페이지로 */
  onConfirm: () => void;
  /** 아니오 — 견적 요청 페이지에서 나감 */
  onCancel: () => void;
}

// 이 페이지 전용 — 프로필 없는 customer용 필수 선택 모달.
// ESC/바깥 클릭으로 못 닫게 Modal의 onClose를 no-op으로 넘긴다 — 오직 예/아니오 버튼만 동작한다.
export default function RequireProfileModal({
  open,
  onConfirm,
  onCancel,
}: RequireProfileModalProps) {
  const t = useTranslations("request");
  return (
    <Modal
      labelledBy="require-profile-modal-title"
      open={open}
      onClose={() => {}}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-4 py-8"
    >
      <p
        id="require-profile-modal-title"
        className="text-32 text-black-300 w-full text-center font-bold"
      >
        {t("profileModalTitle")}
      </p>
      <p className="text-24 text-gray-gray-400 w-full text-center font-semibold">
        {t("profileModalBody")}
      </p>
      <div className="flex w-full gap-3 p-4">
        <Button variant="outlined" size="md" onClick={onCancel}>
          {t("no")}
        </Button>
        <Button variant="solid" size="md" onClick={onConfirm}>
          {t("yes")}
        </Button>
      </div>
    </Modal>
  );
}
