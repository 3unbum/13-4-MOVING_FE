// TODO: 견적 요청은 프로필 등록이 필요한 서비스 — 프로필 없는 customer 진입 시 모달로 유도.
// 하드 게이트 아님(리다이렉트 X), 페이지는 그대로 렌더하고 모달만 얹는다.
// - useAuth()로 hasProfile === false 감지 시 모달 오픈
// - 예 → router.push("/customer/profile-register")
"use client";

import AddressSelectModal from "@/components/address/AddressSelectModal";
import Toast from "@/components/common/Toast";
import { SERVICES as MOVE_TYPES } from "@/components/filter/ChipRegion";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError } from "@/lib/utils/api-error";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QuotationRequestMobile from "./_components/QuotationRequestMobile";
import QuotationRequestDesktop from "./_components/QuotationRequestDesktop";

// 모바일/데스크톱이 CSS(hidden/tablet:block)로만 화면 전환되고 항상 같이 마운트돼있어서,
// 이사유형/예정일/출발지/도착지 상태는 여기서 하나로 들고 양쪽에 내려준다 — 안 그러면 화면 크기 바뀔 때 값이 따로 놈.
// 출발지/도착지 모달도 여기서 딱 한 번만 렌더링한다 — Mobile/Desktop이 각자 렌더링하면 둘 다 마운트된 상태라
// 모달도 두 인스턴스가 동시에 열려서 스크롤락 같은 게 꼬인다 (globals.css의 --breakpoint-tablet과 맞춤).
const TABLET_QUERY = "(min-width: 744px)";

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// - 아니오/닫기 → router.back() (진입 전 페이지로)
export default function CustomerQuotationRequestsPage() {
  const router = useRouter();
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const [selected, setSelected] = useState<(typeof MOVE_TYPES)[number]>("SMALL");
  const [date, setDate] = useState<Date>();
  const departure = useAddressSearch();
  const arrival = useAddressSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      router.push("/customer/my-quotes");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "견적 요청에 실패했어요. 다시 시도해주세요."
      );
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
      <AddressSelectModal
        size={isTabletUp ? "md" : "sm"}
        open={departure.isOpen}
        onClose={departure.close}
        title="출발지를 선택해주세요"
        searchValue={departure.searchValue}
        onSearchChange={departure.onSearchChange}
        onSearch={departure.onSearch}
        results={departure.results}
        selectedId={departure.selectedId}
        onSelect={departure.onSelect}
        onConfirm={departure.onConfirm}
      />
      <AddressSelectModal
        size={isTabletUp ? "md" : "sm"}
        open={arrival.isOpen}
        onClose={arrival.close}
        title="도착지를 선택해주세요"
        searchValue={arrival.searchValue}
        onSearchChange={arrival.onSearchChange}
        onSearch={arrival.onSearch}
        results={arrival.results}
        selectedId={arrival.selectedId}
        onSelect={arrival.onSelect}
        onConfirm={arrival.onConfirm}
      />
    </div>
  );
}
