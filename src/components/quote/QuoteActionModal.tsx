"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import Toast from "@/components/common/Toast";
import type { ServiceCode } from "@/components/filter/ChipRegion";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";
import Modal, { ModalHeader } from "@/components/common/Modal";
import MovingInfo from "@/components/quote/MovingInfo";
import { formatPrice, type DateLocale } from "@/lib/utils/date";

type QuoteActionVariant = "send" | "reject";
type QuoteActionSize = "sm" | "md";

interface QuoteActionModalProps {
  open: boolean;
  onClose: () => void;
  // send: 견적 보내기 / reject: 반려요청
  variant: QuoteActionVariant;
  size?: QuoteActionSize;
  /**
   * 기본은 size를 따릅니다(md 가운데 / sm 바닥). 태블릿처럼 폭은 sm인데 가운데 떠야 하는
   * 화면이 있어 따로 지정할 수 있게 열어둡니다 — 받은 요청 모달이 그렇습니다.
   */
  position?: "center" | "bottom";
  /** 전송 중이면 버튼을 잠급니다 — 연타하면 POST가 그만큼 나갑니다 */
  isSubmitting?: boolean;
  category: ServiceCode;
  // 지정 견적 여부. 이 모달은 지정 견적 전용이라 기본값 true
  isTargeted?: boolean;
  customerName: string;
  fromAddress: string;
  toAddress: string;
  /**
   * 전체 주소와 상세 주소·우편번호 — 견적가를 정하려면 동·호수(엘리베이터·층)가 필요합니다.
   * 위 `fromAddress`·`toAddress`는 "서울 강남구"까지 줄인 값이라 따로 받습니다.
   */
  fullFromAddress?: string;
  fullToAddress?: string;
  fromDetailAddress?: string;
  fromPostalCode?: string;
  toDetailAddress?: string;
  toPostalCode?: string;
  movingDate: string;
  price?: string;
  onPriceChange?: (value: string) => void;
  comment?: string;
  onCommentChange?: (value: string) => void;
  reason?: string;
  onReasonChange?: (value: string) => void;
  onSubmit: () => void;
}

/**
 * BE `estimate.schema.ts`와 같은 값입니다 — 여기가 느슨하면 서버가 400을 던지고
 * 사용자는 이유를 모른 채 실패합니다. 진짜 방어선은 BE이고 여기는 미리 알려주는 쪽입니다.
 */
const MIN_PRICE = 10000;
/**
 * 상한이 없으면 Postgres `Int`(2^31-1)를 넘겨 DB가 "integer out of range"로 터집니다.
 * BE `estimate.schema.ts`와 같은 값입니다 (1차 QA-16).
 */
const MAX_PRICE = 100_000_000;
/** 주소 복사 토스트 노출 시간 — useShare와 같은 값입니다 */
const ADDRESS_TOAST_MS = 3000;

/** 1억 = 9자리. 그 이상은 입력 자체를 막습니다 */
const MAX_PRICE_LENGTH = String(MAX_PRICE).length;
const MIN_COMMENT = 10;
const MAX_COMMENT = 200;

// 견적 보내기 / 반려요청 모달
/**
 * 모달 안의 전체 주소 — 펼침 없이 바로 보여주고 한 번에 복사합니다.
 *
 * 견적 상세는 공간이 좁아 접었다 펴는 패널을 쓰지만, 모달은 주소를 보며 금액을
 * 정하는 화면이라 **처음부터 펼쳐두는 쪽**이 낫습니다. 좁은 모달(sm 327px)에서
 * 떠 있는 패널은 폭을 어떻게 잡아도 잘리거나 글자가 쪼개졌습니다.
 */
function AddressRow({
  label,
  address,
  detailAddress,
  postalCode,
  onCopy,
}: {
  label: string;
  address: string;
  detailAddress?: string;
  postalCode?: string;
  onCopy: (value: string) => void;
}) {
  const t = useTranslations("quote");
  const detail = detailAddress?.trim();
  const full = [address, detail].filter(Boolean).join(" ");

  return (
    // 라벨·주소·복사를 한 줄에 둡니다. 두 줄로 나누면 모달 높이가 64px 늘어
    // PC에서 스크롤이 생깁니다(본문이 flex-1 + overflow-y-auto라 민감합니다).
    <div className="flex w-full items-baseline gap-3">
      <span className="text-14 text-gray-gray-500 shrink-0">{label}</span>
      <p className="text-14 text-black-black-400 min-w-0 flex-1 font-medium">
        {full}
        {postalCode && <span className="text-gray-gray-400 ml-1.5">({postalCode})</span>}
      </p>
      <button
        type="button"
        onClick={() => onCopy(full)}
        aria-label={`${label} ${t("copy")}`}
        className="text-12 text-primary-orange-300 hover:text-primary-orange-400 shrink-0 cursor-pointer font-semibold"
      >
        {t("copy")}
      </button>
    </div>
  );
}

export default function QuoteActionModal({
  open,
  onClose,
  variant,
  size = "md",
  position,
  isSubmitting = false,
  category,
  isTargeted = true,
  customerName,
  fromAddress,
  toAddress,
  fullFromAddress,
  fullToAddress,
  fromDetailAddress,
  fromPostalCode,
  toDetailAddress,
  toPostalCode,
  movingDate,
  price = "",
  onPriceChange,
  comment = "",
  onCommentChange,
  reason = "",
  onReasonChange,
  onSubmit,
}: QuoteActionModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const resolvedPosition = position ?? (isMd ? "center" : "bottom");
  const isSend = variant === "send";
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const [addressToast, setAddressToast] = useState<string | null>(null);

  // 주소 복사 — 토스트는 일정 시간 뒤 스스로 사라집니다 (useShare와 같은 방식)
  useEffect(() => {
    if (!addressToast) return;

    const timer = setTimeout(() => setAddressToast(null), ADDRESS_TOAST_MS);
    return () => clearTimeout(timer);
  }, [addressToast]);

  const copyAddress = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setAddressToast(t("addressCopied"));
    } catch {
      // 클립보드는 https·사용자 제스처 조건이 안 맞으면 거부됩니다.
      // 주소는 화면에 그대로 떠 있으니 복사만 실패했다고 알립니다.
      setAddressToast(t("addressCopyFailed"));
    }
  };
  const locale = useLocale() as DateLocale;

  const title = isSend ? t("sendQuote") : t("rejectRequest");
  const honorific = t("customerHonorific");

  /** 10자 미만은 입력 중일 수 있어 조용히 두고, 상한을 넘겼을 때만 문구를 띄웁니다 */
  const commentError = (value: string) =>
    value.trim().length > MAX_COMMENT ? t("commentTooLong", { max: MAX_COMMENT }) : undefined;
  // 입력은 숫자만 남기므로 빈 문자열이면 NaN이 아니라 0이 됩니다
  const priceValue = Number(price.trim() || 0);
  const hasPrice = price.trim().length > 0;
  const isPriceTooLow = hasPrice && priceValue < MIN_PRICE;
  const isPriceTooHigh = hasPrice && priceValue > MAX_PRICE;
  const commentLength = (isSend ? comment : reason).trim().length;

  const isValid = isSend
    ? priceValue >= MIN_PRICE &&
      priceValue <= MAX_PRICE &&
      commentLength >= MIN_COMMENT &&
      commentLength <= MAX_COMMENT
    : commentLength >= MIN_COMMENT && commentLength <= MAX_COMMENT;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        position={resolvedPosition}
        labelledBy={titleId}
        className={cn(
          "px-6 pt-8 pb-10",
          isMd ? "w-152 min-w-152 gap-10" : "w-93.75 min-w-93.75 gap-6.5",
          // 바닥에 붙을 때만 위쪽만 둥글게 — 가운데 뜨면 네 모서리를 다 돌립니다
          resolvedPosition === "bottom" ? "rounded-t-[32px]" : "rounded-[32px]"
        )}
      >
        <ModalHeader id={titleId} title={title} size={size} onClose={onClose} />

        {/* 본문·상단블록 gap은 variant와 무관하게 size로만 갈립니다
          (피그마 PC 32/20 · 모바일 20/16 — 견적·반려 4개 노드 모두 동일) */}
        <div
          className={cn(
            // overflow-x-hidden — 펼친 주소 패널이 순간적으로 가로 스크롤을 만들지 않게 합니다
            "flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto",
            isMd ? "gap-8" : "gap-5"
          )}
        >
          <div className={cn("flex w-full flex-col items-start", isMd ? "gap-5" : "gap-4")}>
            <div className="flex items-center gap-2">
              <MoveTypeChip variant={category} size={isMd ? "md" : "sm"} />
              {isTargeted && <MoveTypeChip variant="TARGETED" size={isMd ? "md" : "sm"} />}
            </div>

            {/* 이름과 "고객님" 사이 8 — 카드(`CardRequest`)와 같은 값입니다 */}
            <p className="text-20 text-black-300 flex w-full min-w-0 items-center gap-2 font-semibold">
              <span className="min-w-0 truncate">{customerName}</span>
              {/* 영어에는 대응하는 경칭이 없어 빈 문자열입니다 — 빈 span이 gap을 벌리지 않도록 막습니다 */}
              {honorific && <span className="shrink-0">{honorific}</span>}
            </p>

            <MovingInfo
              from={fromAddress}
              to={toAddress}
              movingDate={movingDate}
              size={isMd ? "lg" : "sm"}
              variant="modal"
              // 바로 아래에 전체 주소를 따로 보여줘 여기선 이사일만 냅니다
              hideAddresses={Boolean(fullFromAddress && fullToAddress)}
            />

            {/* 위 MovingInfo는 "서울 강남구"까지만 보여줍니다. 견적가를 정하려면
              동·호수가 필요해서 전체 주소를 펼쳐 볼 수 있게 덧붙입니다. */}
            {fullFromAddress && fullToAddress && (
              <div className="flex w-full flex-col gap-2">
                <AddressRow
                  label={tCommon("from")}
                  address={fullFromAddress}
                  detailAddress={fromDetailAddress}
                  postalCode={fromPostalCode}
                  onCopy={copyAddress}
                />
                <AddressRow
                  label={tCommon("to")}
                  address={fullToAddress}
                  detailAddress={toDetailAddress}
                  postalCode={toPostalCode}
                  onCopy={copyAddress}
                />
              </div>
            )}

            {/* 구분선은 PC·모바일 모두 있습니다 (피그마 `1:10684` / `1:10738`) */}
            <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />
          </div>

          <div className="flex w-full flex-col items-start gap-4">
            {isSend ? (
              <>
                <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                  {t("pricePrompt")}
                </p>
                <InputTextField
                  type="text"
                  inputMode="numeric"
                  size={isMd ? "md" : "sm"}
                  // 피그마는 높이 54 + 폰트 18인데 컴포넌트 md는 높이 64라, 높이만 덮습니다
                  className={isMd ? "[&>div]:h-[54px]" : undefined}
                  placeholder={t("pricePlaceholder")}
                  value={price}
                  // 숫자만 남기고 자릿수도 자릅니다 — 붙여넣기로 한 번에 들어오는 것도 막습니다
                  onChange={(event) =>
                    onPriceChange?.(
                      event.target.value.replace(/\D/g, "").slice(0, MAX_PRICE_LENGTH)
                    )
                  }
                  errorMessage={
                    isPriceTooLow
                      ? t("priceMin", { price: formatPrice(MIN_PRICE, locale) })
                      : isPriceTooHigh
                        ? t("priceMax", { price: formatPrice(MAX_PRICE, locale) })
                        : undefined
                  }
                />
                <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                  {t("commentPrompt")}
                </p>
                <InputTextArea
                  size={isMd ? "md" : "sm"}
                  placeholder={t("commentPlaceholder")}
                  value={comment}
                  onChange={(event) => onCommentChange?.(event.target.value)}
                  errorMessage={commentError(comment)}
                />
              </>
            ) : (
              <>
                <p className={cn("text-black-300 font-semibold", isMd ? "text-20" : "text-16")}>
                  {t("rejectReasonPrompt")}
                </p>
                <InputTextArea
                  size={isMd ? "md" : "sm"}
                  placeholder={t("commentPlaceholder")}
                  value={reason}
                  onChange={(event) => onReasonChange?.(event.target.value)}
                  errorMessage={commentError(reason)}
                />
              </>
            )}
          </div>
        </div>

        <Button
          variant="solid"
          size={isMd ? "lg" : "sm"}
          className="shrink-0"
          disabled={!isValid || isSubmitting}
          onClick={onSubmit}
        >
          {isSend ? t("sendQuote") : t("reject")}
        </Button>
      </Modal>

      {addressToast && <Toast message={addressToast} />}
    </>
  );
}
