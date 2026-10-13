"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useId, useRef, useState } from "react";
import emptyCharacter from "@/assets/images/common/empty-review.png";
import Button from "@/components/common/Button";
import Sort from "@/components/common/Sort";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import MoverEstimateList from "@/components/mover/MoverEstimateList";
import ExtraChargeModal, { EXTRA_CHARGE_MIN_AMOUNT } from "@/components/quote/ExtraChargeModal";
import Toast from "@/components/common/Toast";
import CardRequestSkeleton from "@/components/skeleton/CardRequestSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
import {
  useConfirmedEstimates,
  usePayMoverEstimates,
  useRejectedEstimates,
  useProposeExtraCharge,
  useUpdateExtraCharge,
  useRequestPayment,
} from "@/hooks/useMoverEstimates";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { cn } from "@/lib/utils/cn";
import { formatMonthLabel, recentMonths, type DateLocale } from "@/lib/utils/date";
import type { EstimateExtraCharge, PaymentStageFilter } from "@/lib/services/estimate-service";
import type { MoverEstimate, MoverEstimateSort } from "@/lib/services/mover-estimate-service";

/** 토스트 노출 시간 — QuoteDetailClient와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

export type QuoteTab = "confirmed" | "rejected" | "payPending" | "payHistory";

/**
 * 빈 목록 화면 — 받은 요청과 같은 `img/Component/empty`입니다.
 *
 * 리뷰·찜·받은 요청이 이미 각자 구현 중이라 여기도 따로 둡니다.
 * 나중에 `components/common/`으로 올리면 넷이 공유할 수 있습니다.
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="pc:w-[955px] pc:gap-8 flex w-81.75 flex-col items-center gap-6">
        {/* 240×196 클립 안에 260.633 원본을 음수 위치로 밀어 넣습니다 */}
        <div className="relative h-49 w-60 overflow-hidden">
          <Image
            src={emptyCharacter}
            alt=""
            width={1000}
            height={1000}
            className="absolute top-[-16.29px] left-[-11.04px] size-[260.633px] max-w-none opacity-50 grayscale"
          />
        </div>
        <p className="text-16 pc:text-20 text-gray-gray-400 text-center whitespace-nowrap">
          {message}
        </p>
      </div>
    </div>
  );
}

function QuoteError() {
  const t = useTranslations("moverPage");
  return (
    <div className="text-14 text-gray-gray-400 tablet:text-16 flex flex-1 items-center justify-center px-6 py-20">
      {t("estimateLoadFailed")}
    </div>
  );
}

/** 첫 로딩 — MoverEstimateList와 같은 그리드. 반려 카드는 금액 줄이 없다 */
function QuoteLoading({ footer }: { footer: "price" | "none" }) {
  const t = useTranslations("common");

  return (
    <SkeletonStatus
      label={t("loading")}
      className="tablet:gap-8 pc:grid-cols-2 pc:gap-6 grid w-full grid-cols-1 gap-5"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index}>
          <div className="tablet:hidden">
            <CardRequestSkeleton size="sm" footer={footer} />
          </div>
          <div className="tablet:block hidden">
            <CardRequestSkeleton size="lg" footer={footer} />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  );
}

/**
 * 결제 탭 정렬·월별 드롭다운 그림자 — Sort의 기본 그림자보다 진하게 덮어씁니다.
 * Sort의 className은 바깥 래퍼에 붙어서, 안쪽 버튼을 선택자로 지정해야 그림자가 버튼 모양을 따릅니다.
 */
const SORT_SHADOW = "[&>button]:shadow-[4px_4px_5px_0_rgba(170,170,170,0.35)]";

/**
 * "추가 금액 내역" 토글 — 보낸 추가 금액을 접어 두었다가 펼치면 건마다 사유·금액·상태를 보여줍니다.
 *
 * 카드마다 상태 줄이 길게 붙으면 결제 요청 버튼보다 눈에 띄어서, 고객 화면의 "견적 상세"처럼 접어 둡니다.
 * 고객이 아직 응답하지 않은(응답 대기) 건에만 수정 버튼이 있습니다. 보낸 건이 없으면 아무것도 그리지 않습니다.
 */
function ExtraChargeToggle({
  charges,
  onEdit,
}: {
  charges: EstimateExtraCharge[];
  onEdit: (charge: EstimateExtraCharge) => void;
}) {
  const t = useTranslations("moverPage");
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  if (charges.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-14 text-gray-gray-500 flex items-center gap-1 self-start font-semibold"
      >
        {t("extraChargeToggle", { count: charges.length })}
        <span aria-hidden className={cn("transition-transform", isOpen && "rotate-180")}>
          ▾
        </span>
      </button>

      {isOpen && (
        <ul id={panelId} className="flex flex-col gap-3 rounded-2xl bg-gray-100 p-4">
          {charges.map((charge) => (
            <li key={charge.id} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-14 text-black-500 font-semibold wrap-break-word">
                  {charge.reason}
                </p>
                <p className="text-12 text-gray-gray-400 font-medium">
                  {t(
                    charge.status === "PROPOSED"
                      ? "extraStatusProposed"
                      : charge.status === "APPROVED"
                        ? "extraStatusApproved"
                        : "extraStatusRejected",
                    { amount: charge.amount.toLocaleString() }
                  )}
                </p>
              </div>
              {charge.status === "PROPOSED" && (
                <button
                  type="button"
                  className="text-14 text-gray-gray-500 shrink-0 font-semibold underline"
                  onClick={() => onEdit(charge)}
                >
                  {t("extraChargeEdit")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 결제 탭 본문 — 고객의 결제 단계로 가릅니다.
 *
 *   대기 중인 결제  고객이 선수금(확정 후) 또는 잔금(이사 완료 후)을 아직 안 냄
 *   결제 내역       잔금까지 결제 완료
 *
 * 기사님은 결제를 직접 처리하지 않고 고객이 결제했는지만 봅니다. 훅은 조건부로 부를 수
 * 없어서 탭마다 컴포넌트를 따로 두었고, 이 탭이 열렸을 때만 마운트되어 그때 불러옵니다.
 * 목록은 무한 스크롤입니다(고객 결제 탭과 같은 방식).
 */
function PayTabPanel({
  stage,
  onDetailClick,
}: {
  stage: PaymentStageFilter;
  onDetailClick: (estimateId: number) => void;
}) {
  const t = useTranslations("moverPage");
  const tCommon = useTranslations("common");
  const tAuthError = useTranslations("authError");
  // 대기 중인 결제 탭의 정렬 — 최신순이 기본입니다
  const [sort, setSort] = useState<MoverEstimateSort>("latest");
  // 월별 조회 — ""이면 전체, 아니면 "YYYY-MM"
  const [month, setMonth] = useState("");
  const panel = usePayMoverEstimates(stage, sort, month || undefined);
  const locale = useLocale() as DateLocale;
  const [toast, setToast] = useState<string | null>(null);
  const requestPayment = useRequestPayment((error) =>
    setToast(toAuthErrorMessage(error, tAuthError, t("paymentRequestFailed")))
  );
  // 추가 금액을 요청·수정할 대상 — 값이 있을 때만 모달을 띄웁니다(열릴 때 마운트되어 입력이 매번 초기화됩니다).
  // charge가 있으면 그 건을 고치는 수정, 없으면 새 요청입니다
  const [extraTarget, setExtraTarget] = useState<{
    estimate: MoverEstimate;
    charge?: EstimateExtraCharge;
  } | null>(null);
  const proposeExtraCharge = useProposeExtraCharge((error) =>
    setToast(toAuthErrorMessage(error, tAuthError, t("extraChargeFailed")))
  );
  const updateExtraCharge = useUpdateExtraCharge((error) =>
    setToast(toAuthErrorMessage(error, tAuthError, t("extraChargeUpdateFailed")))
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = panel;
  const isPayPending = stage === "DUE";

  // 토스트는 일정 시간 뒤 스스로 사라집니다 (QuoteDetailClient와 같은 방식)
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  // 목록 끝이 보이면 다음 페이지 요청. 새 페이지가 붙은 뒤에도 sentinel이 화면 안이면
  // estimates 길이가 바뀌며 observer가 다시 만들어져 바로 이어서 부릅니다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [panel.estimates.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 정렬·월별 조회는 두 결제 탭이 함께 씁니다 — 기준 날짜만 다릅니다(대기 중인 결제는 이사 완료일, 결제 내역은 결제일).
  // 월별 조회 선택지 — 이번 달부터 거꾸로 12개월. 그보다 오래된 건 "전체"에서 봅니다
  const monthOptions = [
    { value: "", label: t("payMonthAll") },
    ...recentMonths(12).map((value) => ({ value, label: formatMonthLabel(value, locale) })),
  ];

  // 정렬·월을 바꾸면 목록을 새로 받는 동안 스켈레톤이 나오는데, 그동안에도 선택은 남겨 둡니다
  const sortControl = (
    <div className="mb-3 flex flex-wrap justify-end gap-2">
      <Sort
        size="md"
        className={SORT_SHADOW}
        label={t("payMonthLabel")}
        options={monthOptions}
        value={month}
        onChange={setMonth}
      />
      <Sort
        size="md"
        className={SORT_SHADOW}
        label={t("paySortLabel")}
        options={[
          { value: "latest", label: t("paySortLatest") },
          { value: "oldest", label: t("paySortOldest") },
        ]}
        value={sort}
        onChange={(value) => setSort(value as MoverEstimateSort)}
      />
    </div>
  );

  if (panel.error) return <QuoteError />;
  if (panel.isPending)
    return (
      <>
        {sortControl}
        <QuoteLoading footer="price" />
      </>
    );
  if (panel.estimates.length === 0) {
    return (
      <>
        {/* 월을 골랐는데 비면 다시 바꿀 수 있어야 합니다 */}
        {month ? sortControl : null}
        <EmptyState message={isPayPending ? t("noPayPending") : t("noPayHistory")} />
      </>
    );
  }

  return (
    <>
      {sortControl}
      {/* 대기 중인 결제는 카드가 한 줄에 하나이고, 카드 밑에 결제 요청 버튼이 붙습니다 */}
      <MoverEstimateList
        estimates={panel.estimates}
        onDetailClick={onDetailClick}
        showPaidAt={!isPayPending}
        showMovedAt={isPayPending}
        singleColumn={isPayPending}
        renderFooter={
          isPayPending
            ? (estimate) => {
                // 지금 고객이 내야 하는 결제 — 선수금 대기(확정 후)인지 잔금 대기(이사 완료 후)인지
                const isDeposit = estimate.paymentStage === "DEPOSIT_DUE";
                const dueAmount =
                  (isDeposit ? estimate.depositAmount : estimate.balanceAmount) ?? 0;

                return (
                  <div className="flex flex-col gap-3">
                    <p className="text-14 font-semibold text-orange-400">
                      {t(isDeposit ? "depositDueLabel" : "balanceDueLabel", {
                        amount: dueAmount.toLocaleString(),
                      })}
                    </p>

                    {/* 추가 금액 내역은 접어 두고, 펼치면 건마다 상태가 보입니다. 응답 대기 건은 여기서 고칠 수 있습니다 */}
                    <ExtraChargeToggle
                      charges={estimate.extraCharges}
                      onEdit={(charge) => setExtraTarget({ estimate, charge })}
                    />

                    <Button
                      variant="solid"
                      size="sm"
                      // 단계마다 1번만 보낼 수 있어서 보낸 뒤에는 막습니다. 서버도 같은 기준으로 거절합니다
                      disabled={Boolean(estimate.paymentRequestedAt) || requestPayment.isPending}
                      onClick={() => {
                        requestPayment.mutate(estimate.id, {
                          onSuccess: () => setToast(t("paymentRequestSent")),
                        });
                      }}
                    >
                      {estimate.paymentRequestedAt ? t("paymentRequested") : t("requestPayment")}
                    </Button>

                    {/* 추가 금액은 이사가 끝난 뒤(잔금 대기)에만, 남은 한도가 최소 금액 이상일 때 요청할 수 있습니다 */}
                    {!isDeposit && estimate.extraChargeRemaining >= EXTRA_CHARGE_MIN_AMOUNT && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setExtraTarget({ estimate })}
                      >
                        {t("extraChargeRequest")}
                      </Button>
                    )}
                  </div>
                );
              }
            : undefined
        }
      />
      {/* 무한 스크롤 감지 지점 + 다음 페이지 로딩 표시 */}
      <div ref={sentinelRef} className="text-14 text-gray-gray-400 py-6 text-center">
        {isFetchingNextPage ? tCommon("loading") : null}
      </div>
      {extraTarget && (
        <ExtraChargeModal
          // 수정은 이 건의 금액을 한도에 되돌려 놓고 계산합니다 (자기 금액만큼은 다시 쓸 수 있으니까요)
          maxAmount={extraTarget.estimate.extraChargeRemaining + (extraTarget.charge?.amount ?? 0)}
          initial={
            extraTarget.charge
              ? { amount: extraTarget.charge.amount, reason: extraTarget.charge.reason }
              : undefined
          }
          isSubmitting={proposeExtraCharge.isPending || updateExtraCharge.isPending}
          onClose={() => setExtraTarget(null)}
          onSubmit={({ amount, reason }) => {
            const { estimate, charge } = extraTarget;
            // 성공하든 실패하든 모달은 닫습니다 — 실패는 토스트로 알리고, 서버 기준으로 목록을 다시 받습니다
            const options = { onSettled: () => setExtraTarget(null) };

            if (charge) {
              updateExtraCharge.mutate(
                { estimateId: estimate.id, chargeId: charge.id, amount, reason },
                { ...options, onSuccess: () => setToast(t("extraChargeUpdated")) }
              );
            } else {
              proposeExtraCharge.mutate(
                { estimateId: estimate.id, amount, reason },
                { ...options, onSuccess: () => setToast(t("extraChargeSent")) }
              );
            }
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
}

interface MoverMyQuotesTabsProps {
  /** 서버가 `?tab=` 쿼리를 읽어 내려줍니다 */
  initialTab: QuoteTab;
}

/**
 * 내 견적 관리 (페이지 16, 기사님) — 탭 2개.
 *
 * 피그마 `1:9297`(확정 PC) / `1:9531`(반려 PC). 확정 탭에는 고객 견적과 이사완료
 * 카드가 섞여 나옵니다 — 이사완료가 별도 탭이 아니라 확정 안에 들어갑니다.
 *
 * 일반 유저의 "내 견적 관리"(페이지 8)와 이름이 같지만 다른 페이지입니다.
 */
export default function MoverMyQuotesTabs({ initialTab }: MoverMyQuotesTabsProps) {
  const t = useTranslations("moverPage");
  const tQuote = useTranslations("quote");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [tab, setTab] = useState<QuoteTab>(initialTab);
  // 프로필 메뉴의 "결제 내역"처럼 같은 페이지에서 ?tab=만 바뀌어 들어오면 서버가 새 initialTab을 내려주는데,
  // useState 초기값은 한 번만 쓰여서 탭이 그대로 남습니다. 값이 바뀌면 렌더 중에 맞춰 줍니다
  const [syncedInitialTab, setSyncedInitialTab] = useState(initialTab);
  if (initialTab !== syncedInitialTab) {
    setSyncedInitialTab(initialTab);
    setTab(initialTab);
  }

  const confirmed = useConfirmedEstimates();
  const rejected = useRejectedEstimates();

  /**
   * 탭을 URL에도 남깁니다 — 상세에서 뒤로 왔을 때 보던 탭으로 돌아오기 위함입니다.
   * `replace`라 뒤로가기 기록이 탭 전환마다 쌓이지 않고, `scroll: false`로 전환 시
   * 스크롤이 맨 위로 튀지 않게 합니다.
   */
  const changeTab = (next: QuoteTab) => {
    setTab(next);
    router.replace(next === "confirmed" ? "/mover/my-quotes" : `/mover/my-quotes?tab=${next}`, {
      scroll: false,
    });
  };

  const openDetail = (estimateId: number) => router.push(`/mover/my-quotes/${estimateId}`);

  const isPayTab = tab === "payPending" || tab === "payHistory";
  const panel = tab === "confirmed" ? confirmed : rejected;
  const emptyMessage = tab === "confirmed" ? t("noConfirmed") : t("noRejected");

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* 피그마 tab 컴포넌트(1:992)는 sm·md 54 / lg 80이고 패딩이 없습니다.
          TabList 기본 py-2.5가 54를 75로 키웁니다 — 공통 컴포넌트는 두고 여기서 보정합니다. */}
      {/* 탭이 4개라 모바일(<tablet) 폭에는 한 줄에 다 안 들어갑니다 — 줄바꿈 대신 가로로 밀어 보게 합니다.
          overflow를 PC에서는 풀어 둡니다(PC는 탭이 목록 박스 아래로 나와 있어 잘립니다). */}
      <TabList
        aria-label={tQuote("tabsLabel")}
        className="pc:h-20 max-tablet:overflow-x-auto max-tablet:[scrollbar-width:none] py-0"
      >
        <Tab
          id="tab-confirmed"
          controls="panel-confirmed"
          active={tab === "confirmed"}
          onClick={() => changeTab("confirmed")}
        >
          {t("sentQuotes")}
        </Tab>
        <Tab
          id="tab-rejected"
          controls="panel-rejected"
          active={tab === "rejected"}
          onClick={() => changeTab("rejected")}
        >
          {t("rejectedRequests")}
        </Tab>
        <Tab
          id="tab-payPending"
          controls="panel-payPending"
          active={tab === "payPending"}
          onClick={() => changeTab("payPending")}
        >
          {tQuote("tabPayPending")}
        </Tab>
        <Tab
          id="tab-payHistory"
          controls="panel-payHistory"
          active={tab === "payHistory"}
          onClick={() => changeTab("payHistory")}
        >
          {tQuote("tabPayHistory")}
        </Tab>
      </TabList>

      <div className="tablet:px-18 pc:px-10 flex flex-1 flex-col items-center px-6">
        {/* 피그마 여백을 패딩으로 옮기면 1280에서 그리드가 짓눌립니다 —
            max-w + 중앙정렬로 잡습니다 (PC 1200 / 태블릿 588) */}
        <div
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
          // 탭 아래 여백 — 피그마 모바일 24 / 태블릿 32 / PC 55
          className="tablet:max-w-147 tablet:pt-8 pc:max-w-300 pc:pt-13.75 flex w-full max-w-82 flex-1 flex-col pt-6 pb-10"
        >
          {isPayTab ? (
            <PayTabPanel stage={tab === "payPending" ? "DUE" : "PAID"} onDetailClick={openDetail} />
          ) : panel.error ? (
            <QuoteError />
          ) : panel.isPending ? (
            <QuoteLoading footer={tab === "confirmed" ? "price" : "none"} />
          ) : panel.estimates.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <>
              <MoverEstimateList estimates={panel.estimates} onDetailClick={openDetail} />

              {/* 피그마 목록에는 페이지네이션도 t("loadMore")도 없습니다(시안이 4~6건 기준).
                  실제로는 55건인 계정이 있어 12건 뒤가 보이지 않아 넣었습니다.
                  공용 `Pagination`은 `totalPages`가 필요한데 BE가 커서만 주고
                  총 개수를 안 줘서 쓸 수 없습니다. */}
              {panel.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outlined"
                    size="sm"
                    className="w-full max-w-81.75"
                    disabled={panel.isFetchingNextPage}
                    onClick={panel.fetchNextPage}
                  >
                    {panel.isFetchingNextPage ? tCommon("loading") : t("loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
