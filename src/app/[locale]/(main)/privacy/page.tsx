import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Footer from "@/app/[locale]/(main)/_components/Footer";

/**
 * 섹션 구성입니다. 번역 키가 `s1Title`·`s1Body`·`s1Item1` 꼴로 짝지어져 있어
 * 여기에 `body` 유무와 항목 수만 적어두면 본문은 그대로 돌려 씁니다.
 */
const SECTIONS = [
  { n: 1, body: true, items: 7 },
  { n: 2, body: false, items: 5 },
  { n: 3, body: true, items: 4 },
  { n: 4, body: true, items: 2 },
  { n: 5, body: true, items: 3 },
  { n: 6, body: true, items: 3 },
  { n: 7, body: true, items: 0 },
  { n: 8, body: false, items: 3 },
  { n: 9, body: true, items: 0 },
  { n: 10, body: true, items: 0 },
] as const;

/** 고객센터 페이지에도 같은 주소가 있습니다. 바꿀 때 함께 고치세요. */
const SUPPORT_EMAIL = "letsmoving.help@gmail.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="tablet:px-18 tablet:py-16 mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="tablet:mb-12 mb-8 flex flex-col gap-2">
          <h1 className="text-24 tablet:text-32 text-black-black-400 font-bold">{t("title")}</h1>
          <p className="text-13 tablet:text-14 text-gray-gray-400 font-normal">{t("updatedAt")}</p>
          <p className="text-14 tablet:text-16 text-gray-gray-500 mt-3 leading-relaxed font-normal">
            {t("intro")}
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {SECTIONS.map(({ n, body, items }) => (
            <section key={n} aria-labelledby={`privacy-s${n}`}>
              <h2
                id={`privacy-s${n}`}
                className="text-16 tablet:text-18 text-black-black-400 mb-2 font-semibold"
              >
                {t(`s${n}Title`)}
              </h2>

              {body && (
                <p className="text-14 tablet:text-16 text-gray-gray-500 leading-relaxed font-normal">
                  {t(`s${n}Body`)}
                </p>
              )}

              {items > 0 && (
                <ul className="text-14 tablet:text-16 text-gray-gray-500 mt-2 flex list-disc flex-col gap-1 pl-5 leading-relaxed font-normal">
                  {Array.from({ length: items }, (_, i) => i + 1).map((i) => (
                    <li key={i}>{t(`s${n}Item${i}`)}</li>
                  ))}
                </ul>
              )}

              {/* 9번(보호책임자)만 연락처 줄이 따로 붙습니다.
                  주소는 `mailto:` 링크로 둡니다 — 법적 고지라 눈으로도 읽히고
                  클릭으로 바로 메일을 열 수도 있어야 합니다. */}
              {n === 9 && (
                <p className="text-14 tablet:text-16 text-black-black-400 mt-2 font-medium">
                  {t("s9Contact")}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="break-all text-orange-300 underline-offset-4 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              )}
            </section>
          ))}
        </div>

        {/* 실제 서비스가 아닌데 개인정보를 수집하는 것처럼 읽히면 오해의 소지가 있어 명시합니다. */}
        <p className="border-line-100 text-13 tablet:text-14 text-gray-gray-400 mt-10 border-t pt-6 leading-relaxed font-normal">
          {t("disclaimer")}
        </p>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
