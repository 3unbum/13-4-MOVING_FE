"use client";

import { useState } from "react";
import { CardEstimateHistory, CardPendingHistory } from "@/component/common/card-estimate";
import CardMover from "@/component/common/card-mover";
import CardMyReview from "@/component/common/card-my-review";
import CardReview from "@/component/common/card-review";
import CardWritableReview from "@/component/common/card-writable-review";
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

/** 리뷰 카드용 목업 */
const REVIEW = {
  writer: "kim****",
  createdAt: "2024-07-01",
  rating: 5,
  content:
    "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요~~ 나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!! 비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
} as const;

/** 내가 작성한 리뷰 카드용 목업 */
const MY_REVIEW = {
  category: "SMALL",
  nickName: "김코드",
  description: "이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
  from: "서울시 중구",
  to: "경기도 수원시",
  movingDate: "2024년 07월 01일",
  rating: 5,
  content:
    "처음 견적 받아봤는데, 엄청 친절하시고 꼼꼼하세요! 귀찮게 이것저것 물어봤는데 잘 알려주셨습니다. 원룸 이사는 믿고 맡기세요! :) 곧 이사 앞두고 있는 지인분께 추천드릴 예정입니다!",
  createdAt: "2024.07.02",
} as const;

/** 작성 가능한 리뷰 카드용 목업 */
const WRITABLE = {
  category: "SMALL",
  nickName: "김코드",
  description: "이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
  from: "서울시 중구",
  to: "경기도 수원시",
  movingDate: "2024년 07월 01일 (월)",
  price: 180000,
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-14 font-semibold text-gray-500">{title}</h2>
      <div className="flex flex-wrap items-start gap-5">{children}</div>
    </section>
  );
}

/**
 * 카드는 폭을 갖지 않습니다(`w-full`). 부모가 정합니다.
 * 실제 페이지에서는 같은 카드가 여러 폭으로 쓰여서(견적내역 327/544/660 등)
 * 이 확인 페이지에서도 래퍼로 폭을 지정합니다.
 */
function W({ px, children }: { px: number; children: React.ReactNode }) {
  return <div style={{ width: px }}>{children}</div>;
}

export default function CardListPage() {
  const [selected, setSelected] = useState(false);
  const [favorited, setFavorited] = useState(true);

  const fav = {
    isFavorited: favorited,
    onFavoriteClick: () => setFavorited((prev) => !prev),
  };

  return (
    <div className="flex flex-col gap-8 p-10">
      <Section title="기사님 찾기 / lg — 1200 · 820 · 600px">
        <W px={1200}>
          <CardMover size="lg" {...MOCK} {...fav} />
        </W>
        <W px={1200}>
          <CardMover
            size="lg"
            {...MOCK}
            {...fav}
            selectable
            selected={selected}
            onSelectChange={setSelected}
          />
        </W>
        <W px={820}>
          <CardMover size="lg" {...MOCK} {...fav} />
        </W>
      </Section>

      <Section title="기사님 찾기 / md · sm — 327px">
        <W px={327}>
          <CardMover size="md" {...MOCK} {...fav} />
        </W>
        <W px={327}>
          <CardMover size="sm" {...MOCK} {...fav} />
        </W>
      </Section>

      <Section title="이사 유형 variant">
        <W px={327}>
          <CardMover size="md" {...MOCK} category="HOME" />
        </W>
        <W px={327}>
          <CardMover size="md" {...MOCK} category="OFFICE" />
        </W>
        <W px={327}>
          <CardMover size="md" {...MOCK} isTargeted />
        </W>
      </Section>

      <Section title="고객 견적 / lg 588 · sm 328 (default · 확정견적)">
        <W px={588}>
          <CardCustomerQuotation size="lg" {...REQUEST} price={180000} />
        </W>
        <W px={588}>
          <CardCustomerQuotation size="lg" {...REQUEST} price={180000} isConfirmed />
        </W>
        <W px={328}>
          <CardCustomerQuotation {...REQUEST} price={180000} />
        </W>
        <W px={328}>
          <CardCustomerQuotation {...REQUEST} price={180000} isConfirmed />
        </W>
      </Section>

      <Section title="받은 요청 / lg 588 · 600 · sm 328">
        <W px={588}>
          <CardReceivedRequest size="lg" {...REQUEST} elapsedTime="1시간 전" />
        </W>
        <W px={600}>
          <CardReceivedRequest size="lg" {...REQUEST} elapsedTime="1시간 전" />
        </W>
        <W px={328}>
          <CardReceivedRequest {...REQUEST} elapsedTime="1시간 전" />
        </W>
      </Section>

      <Section title="반려 요청 / lg 588 · sm 328">
        <W px={588}>
          <CardRejectedRequest size="lg" {...REQUEST} />
        </W>
        <W px={328}>
          <CardRejectedRequest {...REQUEST} />
        </W>
      </Section>

      <Section title="이사완료 / lg 588 · sm 328 (default · 확정견적)">
        <W px={588}>
          <CardCompleted size="lg" {...REQUEST} price={180000} />
        </W>
        <W px={588}>
          <CardCompleted size="lg" {...REQUEST} price={180000} isConfirmed />
        </W>
        <W px={328}>
          <CardCompleted {...REQUEST} price={180000} />
        </W>
        <W px={328}>
          <CardCompleted {...REQUEST} price={180000} isConfirmed />
        </W>
      </Section>

      <Section title="견적내역 / lg 660 · 544 · sm 327 (테두리 없음 — 목록 행)">
        <W px={660}>
          <CardEstimateHistory size="lg" category="OFFICE" isTargeted {...MOVER} price={180000} />
        </W>
        <W px={660}>
          <CardEstimateHistory
            size="lg"
            category="OFFICE"
            isTargeted
            {...MOVER}
            price={180000}
            isConfirmed
          />
        </W>
        <W px={544}>
          <CardEstimateHistory size="lg" category="OFFICE" isTargeted {...MOVER} price={180000} />
        </W>
        <W px={327}>
          <CardEstimateHistory category="OFFICE" isTargeted {...MOVER} price={180000} />
        </W>
        <W px={327}>
          <CardEstimateHistory category="OFFICE" isTargeted {...MOVER} price={180000} isConfirmed />
        </W>
      </Section>

      {/* 실제 사용 폭: lg 600·766·821·955 / sm 335 (UI Design 집계) */}
      <Section title="Card-list-review / lg 955・821・766・600 ・ sm 335 (테두리 없음 - 목록 행)">
        <W px={955}>
          <CardReview size="lg" {...REVIEW} />
        </W>
        <W px={821}>
          <CardReview size="lg" {...REVIEW} />
        </W>
        <W px={766}>
          <CardReview size="lg" {...REVIEW} />
        </W>
        <W px={600}>
          <CardReview size="lg" {...REVIEW} />
        </W>
        <W px={335}>
          <CardReview {...REVIEW} rating={3} />
        </W>
      </Section>

      <Section title="내가 작성한 리뷰 / lg 588 · 1120 · sm 327">
        <W px={588}>
          <CardMyReview size="lg" {...MY_REVIEW} />
        </W>
        <W px={1120}>
          <CardMyReview size="lg" {...MY_REVIEW} />
        </W>
        <W px={327}>
          <CardMyReview {...MY_REVIEW} isTargeted />
        </W>
      </Section>

      <Section title="작성 가능한 리뷰 / lg 1120 · md 600 · sm 327 (default · disabled)">
        <W px={1120}>
          <CardWritableReview size="lg" {...WRITABLE} />
        </W>
        <W px={1120}>
          <CardWritableReview size="lg" {...WRITABLE} disabled />
        </W>
        <W px={600}>
          <CardWritableReview size="md" {...WRITABLE} />
        </W>
        <W px={600}>
          <CardWritableReview size="md" {...WRITABLE} disabled />
        </W>
        <W px={327}>
          <CardWritableReview {...WRITABLE} isTargeted />
        </W>
        <W px={327}>
          <CardWritableReview {...WRITABLE} isTargeted disabled />
        </W>
      </Section>

      <Section title="대기중인 내역 / lg 558 · 600 · sm 327">
        <W px={558}>
          <CardPendingHistory size="lg" category="SMALL" isTargeted {...MOVER} price={180000} />
        </W>
        <W px={600}>
          <CardPendingHistory size="lg" category="SMALL" isTargeted {...MOVER} price={180000} />
        </W>
        <W px={327}>
          <CardPendingHistory category="SMALL" isTargeted {...MOVER} price={180000} />
        </W>
      </Section>
    </div>
  );
}
