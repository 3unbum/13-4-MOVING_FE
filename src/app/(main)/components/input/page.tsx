"use client";

import { useState } from "react";
import InputSearchbar from "@/components/common/InputSearchbar";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";

export default function ComponentInputPage() {
  const [searchSm, setSearchSm] = useState("");
  const [searchMd, setSearchMd] = useState("포장이사");

  return (
    <div className="mx-auto flex flex-col gap-8 p-10">
      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / default, hover, done</h2>
        <InputTextField size="sm" placeholder="codeit@email.com" />
        <InputTextField size="sm" placeholder="codeit@email.com" defaultValue="codeit@email.com" />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / error, feedback</h2>
        <InputTextField
          size="sm"
          defaultValue="codeit@email.com"
          errorMessage="이메일 형식이 아닙니다."
        />
        <InputTextField size="sm" placeholder="가게 이름(상호명)을 입력해주세요." />
        <InputTextField
          size="sm"
          placeholder="가게 이름(상호명)을 입력해주세요."
          errorMessage="가게 이름(상호명)을 필수로 입력해주세요."
        />
        <InputTextField
          size="sm"
          placeholder="닉네임을 입력해주세요."
          helperText="2~10자로 입력해주세요."
        />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / password (visibility toggle)</h2>
        <InputTextField size="sm" type="password" placeholder="비밀번호를 입력해주세요." />
        <InputTextField size="sm" type="password" placeholder="비밀번호를 입력해주세요." disabled />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / disabled</h2>
        <InputTextField size="sm" placeholder="codeit@email.com" disabled />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          md / default, done, error, feedback, disabled
        </h2>
        <InputTextField size="md" placeholder="codeit@email.com" />
        <InputTextField size="md" placeholder="codeit@email.com" defaultValue="codeit@email.com" />
        <InputTextField
          size="md"
          defaultValue="codeit@email.com"
          errorMessage="이메일 형식이 아닙니다."
        />
        <InputTextField
          size="md"
          placeholder="상호명을 입력해주세요."
          helperText="상호명은 추후 마이페이지에서 수정할 수 있습니다."
        />
        <InputTextField size="md" placeholder="codeit@email.com" disabled />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          searchbar / sm (default, focus, typing, clear, disabled)
        </h2>
        <InputSearchbar size="sm" value={searchSm} onChange={setSearchSm} onSearch={console.log} />
        <InputSearchbar size="sm" value="" onChange={() => {}} disabled />
      </section>

      <section className="flex w-120 flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">searchbar / md (filled, disabled)</h2>
        <InputSearchbar size="md" value={searchMd} onChange={setSearchMd} onSearch={console.log} />
        <InputSearchbar size="md" value="포장이사" onChange={() => {}} disabled />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          textarea / sm (default, filled, feedback)
        </h2>
        <InputTextArea size="sm" placeholder="최소 10자 이상 입력해주세요" />
        <InputTextArea size="sm" defaultValue="후기를 작성하는 중입니다" />
        <InputTextArea
          size="sm"
          placeholder="한 줄 소개를 입력해주세요."
          helperText="최소 10자 이상 입력해주세요."
        />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">textarea / md (error, disabled)</h2>
        <InputTextArea size="md" placeholder="후기" errorMessage="10자 이상 입력해주세요." />
        <InputTextArea size="md" placeholder="최소 10자 이상 입력해주세요" disabled />
      </section>

      <section className="flex max-w-[327px] flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">textarea / 스크롤바 (내용 넘칠 때)</h2>
        <InputTextArea
          size="sm"
          defaultValue={
            "text area는 최소 10자 이상 입력해야 버튼이 활성화됩니다. 또한 input 내용이 길어지면 내부 스크롤이 나타납니다. text area는 최소 10자 이상 입력해야 버튼이 활성화됩니다. 또한 input 내용이 길어지면 내부 스크롤이 나타납니다."
          }
        />
        <InputTextArea
          size="md"
          defaultValue={
            "text area는 최소 10자 이상 입력해야 버튼이 활성화됩니다. 또한 input 내용이 길어지면 내부 스크롤이 나타납니다. text area는 최소 10자 이상 입력해야 버튼이 활성화됩니다. 또한 input 내용이 길어지면 내부 스크롤이 나타납니다."
          }
        />
      </section>
    </div>
  );
}
