"use client";

import { useState } from "react";
import Image from "next/image";
import writingIcon from "@/assets/icons/writing-md.svg";
import Button from "@/component/common/button";
import CheckboxButton from "@/component/common/checkbox-button";
import EtcButton from "@/component/common/etc-button";
import FilterButton from "@/component/common/filter-button";

export default function ButtonPage() {
  const [likedSm, setLikedSm] = useState(false);
  const [likedMd, setLikedMd] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">solid / sm</h2>
        <Button size="sm">Primary CTA 버튼</Button>
        <Button size="sm" disabled>
          Primary CTA 버튼
        </Button>
        <Button size="sm" icon={<Image src={writingIcon} alt="" className="size-6" />}>
          Primary CTA 버튼
        </Button>
        <Button size="sm" disabled icon={<Image src={writingIcon} alt="" className="size-6" />}>
          Primary CTA 버튼
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">solid / md</h2>
        <Button size="md">Primary CTA 버튼</Button>
        <Button size="md" disabled>
          Primary CTA 버튼
        </Button>
        <Button size="md" icon={<Image src={writingIcon} alt="" className="size-6" />}>
          Primary CTA 버튼
        </Button>
        <Button size="md" disabled icon={<Image src={writingIcon} alt="" className="size-6" />}>
          Primary CTA 버튼
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">outlined / sm</h2>
        <Button variant="outlined" size="sm">
          Primary CTA 버튼
        </Button>
        <Button variant="outlined" size="sm" disabled>
          Primary CTA 버튼
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">outlined / md</h2>
        <Button variant="outlined" size="md">
          Primary CTA 버튼
        </Button>
        <Button variant="outlined" size="md" disabled>
          Primary CTA 버튼
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">etc / xs (like 제외)</h2>
        <div className="flex gap-3">
          <EtcButton kind="clip" size="xs" />
          <EtcButton kind="share-kakao" size="xs" />
          <EtcButton kind="share-facebook" size="xs" />
          <EtcButton kind="clip" size="xs" disabled />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">etc / sm</h2>
        <div className="flex gap-3">
          <EtcButton
            kind="like"
            size="sm"
            active={likedSm}
            onClick={() => setLikedSm((prev) => !prev)}
          />
          <EtcButton kind="clip" size="sm" />
          <EtcButton kind="share-kakao" size="sm" />
          <EtcButton kind="share-facebook" size="sm" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">etc / md</h2>
        <div className="flex gap-3">
          <EtcButton
            kind="like"
            size="md"
            active={likedMd}
            onClick={() => setLikedMd((prev) => !prev)}
          />
          <EtcButton kind="clip" size="md" />
          <EtcButton kind="share-kakao" size="md" />
          <EtcButton kind="share-facebook" size="md" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">checkbox / round</h2>
        <div className="flex items-center gap-3">
          <CheckboxButton shape="round" aria-label="선택 1" defaultChecked />
          <CheckboxButton shape="round" aria-label="선택 2" />
          <CheckboxButton shape="round" aria-label="선택 3" disabled />
          <CheckboxButton shape="round" aria-label="선택 4" disabled defaultChecked />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">checkbox / square</h2>
        <div className="flex items-center gap-3">
          <CheckboxButton shape="square" aria-label="선택 1" defaultChecked />
          <CheckboxButton shape="square" aria-label="선택 2" />
          <CheckboxButton shape="square" aria-label="선택 3" disabled />
          <CheckboxButton shape="square" aria-label="선택 4" disabled defaultChecked />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">filter</h2>
        <div className="flex gap-3">
          <FilterButton />
          <FilterButton active />
          <FilterButton active={filterActive} onClick={() => setFilterActive((prev) => !prev)} />
          <FilterButton disabled />
        </div>
      </section>
    </div>
  );
}
