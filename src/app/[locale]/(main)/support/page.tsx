import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Accordion from "@/components/common/Accordion";
import Footer from "@/app/[locale]/(main)/_components/Footer";

/** FAQ 키는 `q1`/`a1` 처럼 번호로 짝지어 둡니다. 늘릴 때 이 숫자만 바꾸면 됩니다. */
const FAQ_COUNT = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("support");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SupportPage() {
  const t = await getTranslations("support");
  const questions = Array.from({ length: FAQ_COUNT }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="tablet:px-18 tablet:py-16 mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="tablet:mb-12 mb-8 flex flex-col gap-2">
          <h1 className="text-24 tablet:text-32 text-black-black-400 font-bold">{t("title")}</h1>
          <p className="text-14 tablet:text-16 text-gray-gray-500 font-normal">{t("subtitle")}</p>
        </header>

        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-18 tablet:text-20 text-black-black-400 mb-2 font-semibold"
          >
            {t("faqTitle")}
          </h2>
          <div className="border-line-100 border-t">
            {questions.map((n) => (
              <Accordion key={n} question={t(`q${n}`)}>
                {t(`a${n}`)}
              </Accordion>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="bg-background-100 tablet:mt-12 tablet:p-8 mt-10 flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
        >
          <h2
            id="contact-heading"
            className="text-16 tablet:text-18 text-black-black-400 font-semibold"
          >
            {t("contactTitle")}
          </h2>
          <p className="text-14 tablet:text-16 text-gray-gray-500 font-normal">
            {t("contactBody")}
          </p>
          {/* 문의 폼 대신 메일로 받습니다 — 접수 테이블·API 가 필요해져서 범위에서 뺐습니다. */}
          <a
            href="mailto:support@letsmoving.site"
            className="text-14 tablet:text-16 mt-1 rounded-2xl bg-orange-300 px-6 py-3 font-semibold text-gray-50 hover:brightness-95"
          >
            {t("contactButton")}
          </a>
        </section>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
