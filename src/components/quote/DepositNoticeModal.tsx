"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

interface DepositNoticeModalProps {
  open: boolean;
  /** 견적 금액의 10% — 표시용 값입니다(`calcDepositPreview`). 실제 금액은 BE가 확정 때 정합니다 */
  depositAmount: number;
  /** 확정 요청 중이면 버튼을 잠급니다 — 연타하면 확정이 두 번 나갑니다 */
  isSubmitting: boolean;
  onClose: () => void;
  /** "확정하고 결제하기" — 여기서 비로소 견적이 확정됩니다 */
  onConfirm: () => void;
}

/**
 * 견적 확정 전에 선수금을 알려주는 안내 모달.
 *
 * 확정하면 바로 결제 화면으로 넘어가는데, 금액과 기한을 모른 채 돈 이야기가 나오면 당황스럽습니다.
 * 그래서 확정 버튼을 누르면 먼저 이 모달로 선수금(견적의 10%), 결제 기한(48시간), 잔금이 언제인지
 * 알려주고, 동의해야 확정합니다. 확정 이후에는 결제 화면으로 이어집니다.
 */
export default function DepositNoticeModal({
  open,
  depositAmount,
  isSubmitting,
  onClose,
  onConfirm,
}: DepositNoticeModalProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");

  return (
    <Modal
      labelledBy="deposit-notice-title"
      open={open}
      // 확정 요청이 나가는 동안에는 닫히지 않게 합니다 — 닫아도 요청은 취소되지 않아 상태가 어긋납니다
      onClose={isSubmitting ? () => {} : onClose}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-6 rounded-4xl px-6 py-8"
    >
      <p
        id="deposit-notice-title"
        className="tablet:text-32 text-24 text-black-300 w-full text-center font-bold"
      >
        {t("depositNoticeTitle")}
      </p>

      <div className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4">
        <span className="text-16 text-gray-gray-400 font-semibold">{t("depositDue")}</span>
        <span className="tablet:text-24 text-20 text-black-500 font-bold">
          {tCommon("price", { amount: depositAmount.toLocaleString() })}
        </span>
      </div>

      <ul className="text-16 tablet:text-18 text-gray-gray-400 flex w-full flex-col gap-2 font-medium">
        <li>{t("depositNoticeDeadline")}</li>
        <li>{t("depositNoticeEffect")}</li>
        <li>{t("depositNoticeBalance")}</li>
      </ul>

      <div className="flex w-full gap-3">
        <Button variant="outlined" size="md" onClick={onClose} disabled={isSubmitting}>
          {tCommon("cancel")}
        </Button>
        <Button variant="solid" size="md" onClick={onConfirm} disabled={isSubmitting}>
          {t("depositNoticeConfirm")}
        </Button>
      </div>
    </Modal>
  );
}
