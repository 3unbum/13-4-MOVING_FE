"use client";

import { useState } from "react";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";

export default function TabPage() {
  const [quoteTab, setQuoteTab] = useState<"waiting" | "received">("waiting");

  return (
    <div>
      <p className="text-14 p-4 font-semibold text-gray-500">브라우저 폭을 조정해서 확인해보세요</p>

      <TabList aria-label="견적 탭">
        <Tab
          id="tab-waiting"
          controls="panel-waiting"
          active={quoteTab === "waiting"}
          onClick={() => setQuoteTab("waiting")}
        >
          대기 중인 견적
        </Tab>
        <Tab
          id="tab-received"
          controls="panel-received"
          active={quoteTab === "received"}
          onClick={() => setQuoteTab("received")}
        >
          받았던 견적
        </Tab>
      </TabList>

      {quoteTab === "waiting" && (
        <div
          id="panel-waiting"
          role="tabpanel"
          aria-labelledby="tab-waiting"
          tabIndex={0}
          className="text-14 p-4 text-gray-500"
        >
          대기 중인 견적 목록 (예시 콘텐츠)
        </div>
      )}
      {quoteTab === "received" && (
        <div
          id="panel-received"
          role="tabpanel"
          aria-labelledby="tab-received"
          tabIndex={0}
          className="text-14 p-4 text-gray-500"
        >
          받았던 견적 목록 (예시 콘텐츠)
        </div>
      )}
    </div>
  );
}
