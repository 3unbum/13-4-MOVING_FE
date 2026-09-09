"use client";

import { useState } from "react";
import { CardEstimateHistory, CardPendingHistory } from "@/component/common/card-estimate";
import CardMover from "@/component/common/card-mover";
import {
  CardCompleted,
  CardCustomerQuotation,
  CardReceivedRequest,
  CardRejectedRequest,
} from "@/component/common/card-quotation";

const MOCK = {
  category: "SMALL",
  title: "고객님의 물품을 안전하게 운송해 드립니다.",
  description: "이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
  nickName: "김코드",
  rating: 5.0,
  reviewCount: 178,
  career: 7,
  confirmedCount: 334,
  favoriteCount: 136,
} as const;

/** 고객 정보형(A계열) 카드가 공통으로 쓰는 견적 요청 정보 */
const REQUEST = {
  category: "SMALL",
  isTargeted: true,
  customerName: "김인서",
  from: "서울시 중구",
  to: "경기도 수원시",
  movingDate: "2024년 07월 01일 (월)",
} as const;

/** 기사님 정보형(B계열) 카드가 공통으로 쓰는 기사님 정보 */
const MOVER = {
  title: "고객님의 물품을 안전하게 운송해 드립니다.",
  nickName: "김코드",
  rating: 5.0,
  reviewCount: 178,
  career: 7,
  confirmedCount: 334,
  favoriteCount: 136,
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-14 font-semibold text-gray-500">{title}</h2>
      <div className="flex flex-wrap items-start gap-5">{children}</div>
    </section>
  );
}

export default function CardListPage() {
  const [selected, setSelected] = useState(false);
  const [favorited, setFavorited] = useState(true);

  return (
    <div className="flex flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">기사님 찾기 / lg (1200px)</h2>
        <CardMover
          size="lg"
          {...MOCK}
          isFavorited={favorited}
          onFavoriteClick={() => setFavorited((prev) => !prev)}
        />
        <CardMover
          size="lg"
          {...MOCK}
          isFavorited={favorited}
          onFavoriteClick={() => setFavorited((prev) => !prev)}
          selectable
          selected={selected}
          onSelectChange={setSelected}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">기사님 찾기 / md (327px)</h2>
        <CardMover
          size="md"
          {...MOCK}
          isFavorited={favorited}
          onFavoriteClick={() => setFavorited((prev) => !prev)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">기사님 찾기 / sm (327px)</h2>
        <CardMover
          size="sm"
          {...MOCK}
          isFavorited={favorited}
          onFavoriteClick={() => setFavorited((prev) => !prev)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">이사 유형 variant</h2>
        <div className="flex flex-wrap gap-3">
          <CardMover size="md" {...MOCK} category="HOME" />
          <CardMover size="md" {...MOCK} category="OFFICE" />
          <CardMover size="md" {...MOCK} isTargeted />
        </div>
      </section>

      <Section title="고객 견적 / lg 588px · sm 328px (default · 확정견적)">
        <CardCustomerQuotation size="lg" {...REQUEST} price={180000} />
        <CardCustomerQuotation size="lg" {...REQUEST} price={180000} isConfirmed />
        <CardCustomerQuotation {...REQUEST} price={180000} />
        <CardCustomerQuotation {...REQUEST} price={180000} isConfirmed />
      </Section>

      <Section title="받은 요청 / lg 588px · sm 328px">
        <CardReceivedRequest size="lg" {...REQUEST} elapsedTime="1시간 전" />
        <CardReceivedRequest {...REQUEST} elapsedTime="1시간 전" />
      </Section>

      <Section title="반려 요청 / lg 588px · sm 328px">
        <CardRejectedRequest size="lg" {...REQUEST} />
        <CardRejectedRequest {...REQUEST} />
      </Section>

      <Section title="이사완료 / lg 588px · sm 328px (default · 확정견적)">
        <CardCompleted size="lg" {...REQUEST} price={180000} />
        <CardCompleted size="lg" {...REQUEST} price={180000} isConfirmed />
        <CardCompleted {...REQUEST} price={180000} />
        <CardCompleted {...REQUEST} price={180000} isConfirmed />
      </Section>

      <Section title="견적내역 / lg 660px · sm 327px (테두리 없음 — 목록 행)">
        <CardEstimateHistory size="lg" category="OFFICE" isTargeted {...MOVER} price={180000} />
        <CardEstimateHistory
          size="lg"
          category="OFFICE"
          isTargeted
          {...MOVER}
          price={180000}
          isConfirmed
        />
        <CardEstimateHistory category="OFFICE" isTargeted {...MOVER} price={180000} />
        <CardEstimateHistory category="OFFICE" isTargeted {...MOVER} price={180000} isConfirmed />
      </Section>

      <Section title="대기중인 내역 / lg 558px · sm 327px">
        <CardPendingHistory size="lg" category="SMALL" isTargeted {...MOVER} price={180000} />
        <CardPendingHistory category="SMALL" isTargeted {...MOVER} price={180000} />
      </Section>
    </div>
  );
}
