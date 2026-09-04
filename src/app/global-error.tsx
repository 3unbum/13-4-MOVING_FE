"use client";

import logo from "@/assets/images/common/logo-icon-text-lg.svg";
import errorIcon from "@/assets/images/common/profile-icon-md.png";
import localFont from "next/font/local";
import Image from "next/image";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.ttf",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div className="flex min-h-screen flex-col items-center justify-center gap-7 text-center">
          <Image src={logo} alt="무빙" className="h-auto w-40" />
          <Image src={errorIcon} alt="" className="h-auto w-60" />
          <div className="flex flex-col gap-3">
            <h1 className="text-pretendard-50-bold text-orange-400">오류</h1>
            <p className="text-pretendard-24-regular text-gray-500">
              문제가 발생했어요
              <br />
              잠시 후 다시 시도해주세요
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="flex h-12 w-40 items-center justify-center rounded-xl bg-orange-400 text-pretendard-16-semibold text-white tablet:h-13 pc:h-14"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
