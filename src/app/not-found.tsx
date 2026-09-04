import logo from "@/assets/images/common/logo-icon-text-lg.svg";
import notFoundIcon from "@/assets/images/common/profile-icon-md.png";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 text-center">
      <Image src={logo} alt="무빙" className="h-auto w-40" />
      <Image src={notFoundIcon} alt="" className="h-auto w-60" />
      <div className="flex flex-col gap-3">
        <h1 className="text-pretendard-50-bold text-orange-400">404</h1>
        <p className="text-pretendard-24-regular text-gray-500">
          페이지를 찾을 수 없어요
          <br />
          요청하신 페이지가 존재하지 않거나 이동되었습니다
        </p>
      </div>
      <Link
        href="/"
        className="flex h-12 w-40 items-center justify-center rounded-xl bg-orange-400 text-pretendard-16-semibold text-white tablet:h-13 pc:h-14"
      >
        홈으로 이동
      </Link>
    </div>
  );
}
