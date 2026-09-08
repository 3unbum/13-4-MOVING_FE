"use client";

import { useState } from "react";
import Tab from "@/component/common/tab";

export default function TabPage() {
  const [quoteTab, setQuoteTab] = useState<"waiting" | "received">("waiting");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">단일 상태 (active / default)</h2>
        <div className="flex">
          <Tab active>선택된 탭</Tab>
          <Tab>선택 안 된 탭</Tab>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          인터랙션 — 클릭으로 탭 전환 (모바일/태블릿: 폭 균등 분배, PC: 가운데 정렬)
        </h2>
        <div className="border-line-100 pc:justify-center pc:gap-8 flex border-b">
          <Tab active={quoteTab === "waiting"} onClick={() => setQuoteTab("waiting")}>
            대기 중인 견적
          </Tab>
          <Tab active={quoteTab === "received"} onClick={() => setQuoteTab("received")}>
            받았던 견적
          </Tab>
        </div>
        <p className="text-14 text-gray-500">현재 선택: {quoteTab}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">disabled</h2>
        <div className="flex">
          <Tab active disabled>
            비활성 탭
          </Tab>
          <Tab disabled>비활성 탭</Tab>
        </div>
      </section>
    </div>
  );
}
