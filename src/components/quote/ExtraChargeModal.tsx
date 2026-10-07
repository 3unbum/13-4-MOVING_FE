"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";
import Modal, { ModalHeader } from "@/components/common/Modal";
import { formatPrice, type DateLocale } from "@/lib/utils/date";

interface ExtraChargeModalProps {
  /** 이번에 입력할 수 있는 최대 금액 — 새 요청은 남은 한도(`extraChargeRemaining`), 수정은 남은 한도 + 이 건의 금액입니다 */
  maxAmount: number;
  /** 값이 있으면 수정 모드 — 그 건의 금액·사유로 시작하고 제목·버튼 문구가 바뀝니다 */
  initial?: { amount: number; reason: string };
  /** 요청이 나가는 동안 버튼을 잠급니다 — 연타하면 같은 요청이 두 번 나갑니다 */
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { amount: number; reason: string }) => void;
}

/**
 * BE `extraChargeProposeSchema`와 같은 값입니다 — 여기가 느슨하면 서버가 400을 던지고 사용자는 이유를 모릅니다.
 * 진짜 방어선은 BE이고 여기는 미리 알려주는 쪽입니다. 상한(견적의 20%)은 견적마다 달라 prop으로 받습니다.
 */
/** 기사님 화면이 "남은 한도가 이 금액 미만이면 요청 버튼을 숨기는" 기준으로도 씁니다 */
export const EXTRA_CHARGE_MIN_AMOUNT = 1000;
const MIN_AMOUNT = EXTRA_CHARGE_MIN_AMOUNT;
// 사유는 글자 수 제한 없이 비어 있지만 않으면 됩니다 (왜 추가되는지 한 줄이라도 적게 하려는 최소한)
const MIN_REASON = 1;
const MAX_REASON = 200;
/** 1억 = 9자리. 그 이상은 입력 자체를 막습니다 */
const MAX_AMOUNT_LENGTH = 9;

/**
 * 추가 금액 요청 모달 — 사유를 쓰고, 그 옆에 추가할 금액을 입력합니다.
 *
 * 이사가 끝난 뒤 짐이 늘었거나 작업이 추가돼 견적보다 비용이 더 든 경우, 고객이 납득할 수 있게
 * **왜 추가되는지**를 먼저 적게 합니다. 여러 번 나눠 보낼 수 있고, 고객이 승인한 건만 잔금에 합산됩니다.
 * `initial`을 주면 아직 응답받지 않은 건을 고치는 수정 모드가 됩니다.
 * 입력 상태는 이 모달이 열려 있는 동안만 들고 있습니다(호출부가 열릴 때 마운트하고 닫으면 내립니다).
 */
export default function ExtraChargeModal({
  maxAmount,
  initial,
  isSubmitting,
  onClose,
  onSubmit,
}: ExtraChargeModalProps) {
  const titleId = useId();
  const t = useTranslations("moverPage");
  const locale = useLocale() as DateLocale;
  const [reason, setReason] = useState(initial?.reason ?? "");
  // 입력은 숫자만 남기므로 빈 문자열이면 NaN이 아니라 0이 됩니다
  const [amountText, setAmountText] = useState(initial ? String(initial.amount) : "");

  const amount = Number(amountText || 0);
  const hasAmount = amountText.length > 0;
  const reasonLength = reason.trim().length;

  const isAmountTooLow = hasAmount && amount < MIN_AMOUNT;
  const isAmountTooHigh = hasAmount && amount > maxAmount;
  const isValid =
    amount >= MIN_AMOUNT &&
    amount <= maxAmount &&
    reasonLength >= MIN_REASON &&
    reasonLength <= MAX_REASON;

  return (
    <Modal
      open
      // 요청이 나가는 동안에는 닫히지 않게 합니다 — 닫아도 요청은 취소되지 않아 상태가 어긋납니다
      onClose={isSubmitting ? () => {} : onClose}
      labelledBy={titleId}
      className="tablet:w-152 tablet:min-w-152 tablet:max-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-6 rounded-4xl px-6 pt-8 pb-8"
    >
      <ModalHeader
        id={titleId}
        title={initial ? t("extraChargeEditTitle") : t("extraChargeRequest")}
        size="sm"
        onClose={onClose}
      />

      <p className="text-14 text-gray-gray-500 w-full font-medium">{t("extraChargeHint")}</p>

      {/* 사유를 쓰고 그 옆에 금액 — 좁은 화면에서는 위아래로 쌓습니다 */}
      <div className="tablet:flex-col tablet:items-start flex w-full flex-col gap-4">
        <div className="flex w-full flex-1 flex-col gap-2">
          <label className="text-16 text-black-300 font-semibold">{t("extraReasonLabel")}</label>
          <InputTextArea
            size="sm"
            placeholder={t("extraReasonPlaceholder")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            // 상한을 넘겼을 때만 문구를 띄웁니다
            errorMessage={
              reason.trim().length > MAX_REASON
                ? t("extraReasonTooLong", { max: MAX_REASON })
                : undefined
            }
          />
        </div>

        <div className="tablet:w-52 flex shrink-0 flex-col gap-2">
          <label className="text-16 text-black-300 font-semibold">{t("extraAmountLabel")}</label>
          <InputTextField
            type="text"
            inputMode="numeric"
            size="sm"
            placeholder={t("extraAmountPlaceholder")}
            value={amountText}
            // 숫자만 남기고 자릿수도 자릅니다 — 붙여넣기로 한 번에 들어오는 것도 막습니다
            onChange={(event) =>
              setAmountText(event.target.value.replace(/\D/g, "").slice(0, MAX_AMOUNT_LENGTH))
            }
            errorMessage={
              isAmountTooLow
                ? t("extraAmountMin", { min: formatPrice(MIN_AMOUNT, locale) })
                : isAmountTooHigh
                  ? t("extraAmountTooLarge", { max: formatPrice(maxAmount, locale) })
                  : undefined
            }
          />
          <p className="text-12 text-gray-gray-400 font-medium">
            {t("extraAmountMax", { max: formatPrice(maxAmount, locale) })}
          </p>
        </div>
      </div>

      <Button
        variant="solid"
        size="sm"
        disabled={!isValid || isSubmitting}
        onClick={() => onSubmit({ amount, reason: reason.trim() })}
      >
        {initial ? t("extraChargeEditSubmit") : t("extraSubmit")}
      </Button>
    </Modal>
  );
}
