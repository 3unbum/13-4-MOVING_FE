import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import app_icon_sm from "@/assets/images/landing/app_icon_sm.png";
import app_icon_lg from "@/assets/images/landing/app_icon_lg.png";

/**
 * 랜딩·고객센터·개인정보 처리방침이 공유하는 푸터입니다.
 *
 * 위쪽 주황 배너는 기존 랜딩 디자인 그대로이고, 아래 링크 줄만 더했습니다.
 * 개인정보 처리방침은 어느 화면에서든 닿을 수 있어야 해서 푸터에 두었습니다.
 */
export default async function Footer() {
  const t = await getTranslations("page");

  return (
    <div>
      <div className="tablet:gap-8 pc:py-21.75 tablet:py-16.25 flex flex-col items-center gap-3 bg-[linear-gradient(90deg,#F95D2E_3.36%,#F9502E_88.38%)] py-6">
        <Image
          src={app_icon_sm}
          width={56}
          height={56}
          alt=""
          className="pc:hidden tablet:hidden"
        />
        <Image
          src={app_icon_lg}
          width={100}
          height={100}
          alt=""
          className="pc:block tablet:block hidden"
        />
        <p className="text-16 tablet:text-28 pc:text-28 text-center font-bold text-gray-50">
          {t("footer1")}
          <br className="tablet:hidden" />
          {t("footer2")}
        </p>
      </div>

      <div className="bg-black-black-400 tablet:gap-3 tablet:py-8 flex flex-col items-center gap-2 px-6 py-6">
        <nav className="flex items-center gap-4">
          <Link
            href="/support"
            className="text-13 tablet:text-14 text-gray-gray-200 font-medium hover:text-gray-50"
          >
            {t("footer_support")}
          </Link>
          <span aria-hidden className="text-gray-gray-400">
            ·
          </span>
          <Link
            href="/privacy"
            className="text-13 tablet:text-14 text-gray-gray-200 font-medium hover:text-gray-50"
          >
            {t("footer_privacy")}
          </Link>
        </nav>
        <p className="text-12 tablet:text-13 text-gray-gray-400 text-center font-normal">
          {t("footer_copyright")}
        </p>
      </div>
    </div>
  );
}
