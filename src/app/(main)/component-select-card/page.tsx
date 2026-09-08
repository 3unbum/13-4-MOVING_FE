"use client";

import SelectCard from "@/component/common/select-card";
import { useState } from "react";

const MOVE_TYPES = ["소형이사", "가정이사", "사무실이사"] as const;

export default function Page() {
  const [selectedMd, setSelectedMd] = useState<(typeof MOVE_TYPES)[number]>("소형이사");
  const [selectedSm, setSelectedSm] = useState<(typeof MOVE_TYPES)[number]>("소형이사");

  return (
    <div className="px-160">
      <h1 className="mt-6 font-semibold">이사유형 select card - md</h1>
      <p className="text-16 mt-1 text-[#999]">*이용할 이사 서비스를 선택해주세요!</p>
      <section className="mt-6 flex flex-wrap gap-4">
        {MOVE_TYPES.map((type) => (
          <SelectCard
            key={type}
            variant={type}
            size="md"
            selected={selectedMd === type}
            onClick={() => setSelectedMd(type)}
          />
        ))}
      </section>
      <h2 className="mt-6 font-semibold">이사유형 select card - sm</h2>
      <p className="text-16 mt-1 text-[#999]">*이용할 이사 서비스를 선택해주세요!</p>
      <section className="mt-6 flex flex-col flex-wrap gap-3">
        {MOVE_TYPES.map((type) => (
          <SelectCard
            key={type}
            variant={type}
            size="sm"
            selected={selectedSm === type}
            onClick={() => setSelectedSm(type)}
          />
        ))}
      </section>
    </div>
  );
}
