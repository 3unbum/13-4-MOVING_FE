"use client";

import { useState } from "react";
import Tab from "@/component/common/tab";
import TabList from "@/component/common/tab-list";

export default function TabPage() {
  const [quoteTab, setQuoteTab] = useState<"waiting" | "received">("waiting");

  return (
    <div>
      {/* 브라우저 폭을 376px / 745px 기준으로 늘려보면 모바일 → 태블릿 → PC 순으로 스타일이 바뀜 */}
      <p className="text-14 p-4 font-semibold text-gray-500">브라우저 폭을 조정해서 확인해보세요</p>
      <TabList>
        <Tab active={quoteTab === "waiting"} onClick={() => setQuoteTab("waiting")}>
          대기 중인 견적
        </Tab>
        <Tab active={quoteTab === "received"} onClick={() => setQuoteTab("received")}>
          받았던 견적
        </Tab>
      </TabList>
      <p className="text-14 p-4 text-gray-500">현재 선택: {quoteTab}</p>
    </div>
  );
}
