"use client";

import InputTextField from "@/component/common/input-textfield";

export default function ComponentInputPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / default, hover, done</h2>
        <InputTextField size="sm" placeholder="codeit@email.com" />
        <InputTextField size="sm" placeholder="codeit@email.com" defaultValue="codeit@email.com" />
      </section>

      <section className="flex flex-col gap-3">
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / password (visibility toggle)</h2>
        <InputTextField size="sm" type="password" placeholder="비밀번호를 입력해주세요." />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">sm / disabled</h2>
        <InputTextField size="sm" placeholder="codeit@email.com" disabled />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">md / default, done, error</h2>
        <InputTextField size="md" placeholder="codeit@email.com" />
        <InputTextField size="md" placeholder="codeit@email.com" defaultValue="codeit@email.com" />
        <InputTextField
          size="md"
          defaultValue="codeit@email.com"
          errorMessage="이메일 형식이 아닙니다."
        />
      </section>
    </div>
  );
}
