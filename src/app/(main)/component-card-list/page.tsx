"use client";

import { useState } from "react";
import CardMover from "@/component/common/card-mover";

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
    </div>
  );
}
