"use client";

import Button from "@/components/common/Button";
import { useTranslations } from "next-intl";
import Modal from "@/components/common/Modal";

interface ActiveRequestModalProps {
  open: boolean;
  /** 내 견적 페이지로 */
  onConfirm: () => void;
}

// 이미 활성 견적 요청이 있을 때(BE ACTIVE_REQUEST_EXISTS) 뜨는 안내 모달.
// 제출해도 같은 에러가 나므로 닫기 없이 내 견적으로 보내는 버튼만 둔다.
export default function ActiveRequestModal({ open, onConfirm }: ActiveRequestModalProps) {
  const t = useTranslations("request");
  return (
    <Modal
      labelledBy="active-request-modal-title"
      open={open}
      onClose={() => {}}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-4 py-8"
    >
      <p
        id="active-request-modal-title"
        className="text-32 text-black-300 w-full text-center font-bold"
      >
        {t("activeModalTitle")}
      </p>
      <p className="text-24 text-gray-gray-400 w-full text-center font-semibold whitespace-pre-line">
        {t("activeModalBody")}
      </p>
      <div className="flex w-full gap-3 p-4">
        <Button variant="solid" size="md" onClick={onConfirm}>
          {t("activeModalConfirm")}
        </Button>
      </div>
    </Modal>
  );
}
