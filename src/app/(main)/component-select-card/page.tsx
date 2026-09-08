"use client";

import SelectCard from "@/component/common/select-card";
import { useState } from "react";

const MOVE_TYPES = ["SMALL", "HOME", "OFFICE"] as const;

export default function Page() {
  const [selected, setSelected] = useState<(typeof MOVE_TYPES)[number]>("SMALL");

  return (
    <div className="px-160">
      <h1 className="mt-6 font-semibold">이사유형 select card - md</h1>
      <p className="text-16 text-gray-gray-400 mt-1">*이용할 이사 서비스를 선택해주세요!</p>
      <section className="mt-6 flex flex-wrap gap-4">
        {MOVE_TYPES.map((type) => (
          <SelectCard
            key={type}
            variant={type}
            size="md"
            selected={selected === type}
            onClick={() => setSelected(type)}
          />
        ))}
      </section>
      <h2 className="mt-6 font-semibold">이사유형 select card - sm</h2>
      <p className="text-16 text-gray-gray-400 mt-1">*이용할 이사 서비스를 선택해주세요!</p>
      <section className="mt-6 flex flex-col flex-wrap gap-3">
        {MOVE_TYPES.map((type) => (
          <SelectCard
            key={type}
            variant={type}
            size="sm"
            selected={selected === type}
            onClick={() => setSelected(type)}
          />
        ))}
      </section>
    </div>
  );
}
