import Image from "next/image";
import app_icon_sm from "@/assets/images/landing/app_icon_sm.png";
import app_icon_lg from "@/assets/images/landing/app_icon_lg.png";

export default function Footer() {
  return (
    <div className="tablet:gap-8 pc:py-21.75 tablet:py-16.25 flex flex-col items-center gap-3 bg-[linear-gradient(90deg,#F95D2E_3.36%,#F9502E_88.38%)] py-6">
      <Image
        src={app_icon_sm}
        width={56}
        height={56}
        alt="app_icon_sm"
        className="pc:hidden tablet:hidden"
      />
      <Image
        src={app_icon_lg}
        width={100}
        height={100}
        alt="app_icon_lg"
        className="pc:block tablet:block hidden"
      />
      <p className="text-16 tablet:text-28 pc:text-28 text-center font-bold text-gray-50">
        복잡한 이사 준비,
        <br className="tablet:hidden" />
        무빙 하나면 끝!
      </p>
    </div>
  );
}
