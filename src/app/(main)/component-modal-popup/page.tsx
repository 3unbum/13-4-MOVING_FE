"use client";

import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import AddressSelectModal, {
  type AddressSelectResult,
} from "@/components/address/AddressSelectModal";
import FilterModal from "@/components/filter/FilterModal";
import InfoRequiredModal from "@/components/quote/InfoRequiredModal";
import QuoteActionModal from "@/components/quote/QuoteActionModal";
import ReviewWriteModal from "@/components/review/ReviewWriteModal";
import Toast from "@/components/common/Toast";
import type { ServiceCode } from "@/components/filter/ChipRegion";

const MOCK_RESULTS: AddressSelectResult[] = [
  {
    id: "04538-세종대로-110",
    zipCode: "04538",
    roadAddress: "서울 중구 세종대로 110",
    lotAddress: "서울 중구 태평로1가 31",
  },
  {
    id: "13529-판교역로-235",
    zipCode: "13529",
    roadAddress: "경기 성남시 분당구 판교역로 235",
    lotAddress: "경기 성남시 분당구 삼평동 683",
  },
];

type ModalKey =
  | "address-sm"
  | "address-md"
  | "send-sm"
  | "send-md"
  | "reject-sm"
  | "reject-md"
  | "info-sm"
  | "info-md"
  | "filter"
  | "review-sm"
  | "review-md";

export default function Page() {
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [toastToken, setToastToken] = useState<number | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [selectedId, setSelectedId] = useState<string>();

  const [category] = useState<ServiceCode>("SMALL");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");

  const [moveType, setMoveType] = useState<ServiceCode>();
  const [isTargetedOnly, setIsTargetedOnly] = useState(false);
  const [isServiceAreaOnly, setIsServiceAreaOnly] = useState(false);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (toastToken == null) return;
    const timer = setTimeout(() => setToastToken(null), 2000);
    return () => clearTimeout(timer);
  }, [toastToken]);

  const close = () => setOpenModal(null);

  return (
    <div className="bg-background-background-100 flex flex-col gap-4 p-6">
      <h1 className="text-16 text-gray-gray-400">배송지 선택 모달</h1>
      <section className="flex gap-3">
        <Button size="sm" className="w-40" onClick={() => setOpenModal("address-sm")}>
          address · sm
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("address-md")}>
          address · md
        </Button>
      </section>

      <h2 className="text-16 text-gray-gray-400">견적 보내기 / 반려요청 모달</h2>
      <section className="flex flex-wrap gap-3">
        <Button size="sm" className="w-40" onClick={() => setOpenModal("send-sm")}>
          견적보내기 · sm
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("send-md")}>
          견적보내기 · md
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("reject-sm")}>
          반려요청 · sm
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("reject-md")}>
          반려요청 · md
        </Button>
      </section>

      <h3 className="text-16 text-gray-gray-400">일반 요청 필요 모달</h3>
      <section className="flex gap-3">
        <Button size="sm" className="w-40" onClick={() => setOpenModal("info-sm")}>
          info · sm
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("info-md")}>
          info · md
        </Button>
      </section>

      <h3 className="text-16 text-gray-gray-400">필터 바텀시트</h3>
      <section className="flex gap-3">
        <Button size="sm" className="w-40" onClick={() => setOpenModal("filter")}>
          filter
        </Button>
      </section>

      <h3 className="text-16 text-gray-gray-400">리뷰 쓰기 모달</h3>
      <section className="flex gap-3">
        <Button size="sm" className="w-40" onClick={() => setOpenModal("review-sm")}>
          review · sm
        </Button>
        <Button size="sm" className="w-40" onClick={() => setOpenModal("review-md")}>
          review · md
        </Button>
      </section>

      <h3 className="text-16 text-gray-gray-400">토스트 팝업</h3>
      <section className="flex gap-3">
        <Button size="sm" className="w-40" onClick={() => setToastToken(Date.now())}>
          toast 띄우기
        </Button>
      </section>

      <AddressSelectModal
        open={openModal === "address-sm" || openModal === "address-md"}
        onClose={close}
        size={openModal === "address-sm" ? "sm" : "md"}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setSelectedId(undefined);
        }}
        results={searchValue ? MOCK_RESULTS : []}
        selectedId={selectedId}
        onSelect={(result) => setSelectedId(result.id)}
        onConfirm={close}
      />

      <QuoteActionModal
        open={openModal === "send-sm" || openModal === "send-md"}
        onClose={close}
        variant="send"
        size={openModal === "send-sm" ? "sm" : "md"}
        category={category}
        customerName="김인서"
        fromAddress="서울시 중구"
        toAddress="경기도 수원시"
        movingDate="2024.07.01 (월)"
        price={price}
        onPriceChange={setPrice}
        comment={comment}
        onCommentChange={setComment}
        onSubmit={close}
      />

      <QuoteActionModal
        open={openModal === "reject-sm" || openModal === "reject-md"}
        onClose={close}
        variant="reject"
        size={openModal === "reject-sm" ? "sm" : "md"}
        category={category}
        customerName="김인서"
        fromAddress="서울시 중구"
        toAddress="경기도 수원시"
        movingDate="2024.07.01 (월)"
        reason={reason}
        onReasonChange={setReason}
        onSubmit={close}
      />

      <InfoRequiredModal
        open={openModal === "info-sm" || openModal === "info-md"}
        onClose={close}
        size={openModal === "info-sm" ? "sm" : "md"}
        onAction={close}
      />

      <FilterModal
        open={openModal === "filter"}
        onClose={close}
        moveType={moveType}
        onMoveTypeChange={setMoveType}
        isTargetedOnly={isTargetedOnly}
        onTargetedOnlyChange={setIsTargetedOnly}
        isServiceAreaOnly={isServiceAreaOnly}
        onServiceAreaOnlyChange={setIsServiceAreaOnly}
        onApply={close}
      />

      <ReviewWriteModal
        open={openModal === "review-sm" || openModal === "review-md"}
        onClose={close}
        size={openModal === "review-sm" ? "sm" : "md"}
        category={category}
        moverNickName="김코드"
        fromAddress="서울시 중구"
        toAddress="경기도 수원시"
        movingDate="2024.07.01 (월)"
        rating={rating}
        onRatingChange={setRating}
        review={review}
        onReviewChange={setReview}
        onSubmit={close}
      />

      {toastToken != null && <Toast message="링크가 복사되었어요" />}
    </div>
  );
}
