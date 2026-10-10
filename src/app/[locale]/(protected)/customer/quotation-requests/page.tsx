"use client";

import AddressSelectModal from "@/components/address/AddressSelectModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Toast from "@/components/common/Toast";
import { SERVICES as MOVE_TYPES } from "@/components/filter/ChipRegion";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError } from "@/lib/utils/api-error";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { myQuotesKeys } from "@/hooks/useMyQuotes";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import QuotationRequestMobile from "./_components/QuotationRequestMobile";
import QuotationRequestDesktop from "./_components/QuotationRequestDesktop";
import ActiveRequestModal from "./_components/ActiveRequestModal";
import RequireProfileModal from "./_components/RequireProfileModal";

// 모바일/데스크톱이 CSS(hidden/tablet:block)로만 화면 전환되고 항상 같이 마운트돼있어서,
// 이사유형/예정일/출발지/도착지 상태는 여기서 하나로 들고 양쪽에 내려준다 — 안 그러면 화면 크기 바뀔 때 값이 따로 놈.
// 출발지/도착지 모달도 여기서 딱 한 번만 렌더링한다 — Mobile/Desktop이 각자 렌더링하면 둘 다 마운트된 상태라
// 모달도 두 인스턴스가 동시에 열려서 스크롤락 같은 게 꼬인다 (globals.css의 --breakpoint-tablet과 맞춤).
const TABLET_QUERY = "(min-width: 744px)";

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CustomerQuotationRequestsPage() {
  const t = useTranslations("request");
  const tAuthError = useTranslations("authError");
  const router = useRouter();
  const { account, isLoading: isAuthLoading } = useAuth();
  // 하드 게이트 아님(리다이렉트 X) — 페이지는 그대로 렌더하고 모달만 얹는다.
  // 예(등록하러 가기) → 프로필 등록 페이지, 아니오/닫기 → 진입 전 페이지로.
  const showProfileModal = !isAuthLoading && account?.hasProfile === false;
  const queryClient = useQueryClient();
  // 진입하자마자 활성 요청이 있으면 모달로 막는다. 프로필 없는 계정은 PROFILE_REQUIRED라 조회하지 않는다.
  const { data: activeRequest } = useQuery({
    queryKey: myQuotesKeys.activeRequestByAuth(account?.userId ?? null),
    queryFn: () => quotationRequestService.getActive(),
    enabled: account?.hasProfile === true,
  });
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const [selected, setSelected] = useState<(typeof MOVE_TYPES)[number]>("SMALL");
  const [date, setDate] = useState<Date>();
  const departure = useAddressSearch();
  const arrival = useAddressSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 진입 시 조회가 낡았을 때(다른 탭에서 요청 등) 제출에서 BE가 막으면 같은 모달을 띄운다
  const [isActiveBlocked, setIsActiveBlocked] = useState(false);
  const showActiveModal = Boolean(activeRequest) || isActiveBlocked;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    Boolean(selected) &&
    Boolean(date) &&
    Boolean(departure.value) &&
    departure.detail.trim().length > 0 &&
    Boolean(arrival.value) &&
    arrival.detail.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !date || !departure.value || !arrival.value || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await quotationRequestService.create({
        category: selected,
        movingDate: formatDate(date),
        from: {
          postalCode: departure.value.zipCode,
          region: departure.value.region,
          address: departure.value.roadAddress,
          detailAddress: departure.detail,
        },
        to: {
          postalCode: arrival.value.zipCode,
          region: arrival.value.region,
          address: arrival.value.roadAddress,
          detailAddress: arrival.detail,
        },
      });
      // 낡은 "활성 요청 없음"을 캐시에서 지운다. invalidate하면 이 페이지가 바로 refetch해 이동 전에
      // ActiveRequestModal이 뜨고, 표시만 하면 내 견적이 캐시된 null로 "요청 없음"을 잠깐 보여준다
      queryClient.removeQueries({ queryKey: myQuotesKeys.activeRequest });
      router.push("/customer/my-quotes");
    } catch (error) {
      if (error instanceof ApiError && error.code === "ACTIVE_REQUEST_EXISTS") {
        setIsActiveBlocked(true);
        return;
      }
      setErrorMessage(toAuthErrorMessage(error, tAuthError, t("submitFailed")));
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={
        "pc:pt-10 pc:pb-19 pc:bg-background-background-100 tablet:bg-background-background-100 tablet:py-9.25 tablet:px-2.75"
      }
    >
      <div className="pc:max-w-223.5 tablet:max-w-175 mx-auto w-full">
        <QuotationRequestMobile
          selected={selected}
          onSelectedChange={setSelected}
          date={date}
          onDateChange={setDate}
          departure={departure}
          arrival={arrival}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
        <QuotationRequestDesktop
          selected={selected}
          onSelectedChange={setSelected}
          date={date}
          onDateChange={setDate}
          departure={departure}
          arrival={arrival}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
      {errorMessage && <Toast message={errorMessage} />}
      <RequireProfileModal
        open={showProfileModal}
        onConfirm={() => router.push("/customer/profile-register")}
        onCancel={() => {
          // 직접 진입(북마크·새 탭)이면 돌아갈 곳이 없어 빈 화면이 된다 — 랜딩으로 보낸다
          if (window.history.length > 1) router.back();
          else router.replace("/");
        }}
      />
      <ActiveRequestModal
        open={showActiveModal}
        onConfirm={() => router.push("/customer/my-quotes")}
      />
      <AddressSelectModal
        size={isTabletUp ? "md" : "sm"}
        open={departure.isOpen}
        onClose={departure.close}
        title={t("selectFromAddress")}
        searchValue={departure.searchValue}
        onSearchChange={departure.onSearchChange}
        onSearch={departure.onSearch}
        results={departure.results}
        hasMore={departure.hasMore}
        onLoadMore={departure.onLoadMore}
        selectedId={departure.selectedId}
        onSelect={departure.onSelect}
        onConfirm={departure.onConfirm}
      />
      <AddressSelectModal
        size={isTabletUp ? "md" : "sm"}
        open={arrival.isOpen}
        onClose={arrival.close}
        title={t("selectToAddress")}
        searchValue={arrival.searchValue}
        onSearchChange={arrival.onSearchChange}
        onSearch={arrival.onSearch}
        results={arrival.results}
        hasMore={arrival.hasMore}
        onLoadMore={arrival.onLoadMore}
        selectedId={arrival.selectedId}
        onSelect={arrival.onSelect}
        onConfirm={arrival.onConfirm}
      />
    </div>
  );
}
