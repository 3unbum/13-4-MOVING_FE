import { getTranslations } from "next-intl/server";
import bg from "@/assets/images/landing/hd_bg.png";
import bgWide from "@/assets/images/landing/hd_bg_wide.jpg";
import Image from "next/image";
import HeaderCarImage from "./_components/HeaderCarImage";
import MoveTypeSlideshow from "./_components/MoveTypeSlideshow";
import img3_sm from "@/assets/images/landing/img3_sm.png";
import img3_md from "@/assets/images/landing/img3_md.png";
import img3_lg from "@/assets/images/landing/img3_lg.png";
import CompareQuotesSection from "./_components/CompareQuotesSection";
import LandingSmoothScroll from "./_components/LandingSmoothScroll";
import QuoteDetailMock from "./_components/QuoteDetailMock";
import { QUOTE_DETAIL_MOCK_SIZE } from "./_components/QuoteDetailMockSize";
import ScaledStage from "./_components/ScaledStage";
import { Reveal, TiltOnScroll } from "./_components/Reveal";
import Footer from "./_components/Footer";

export default async function HomePage() {
  const t = await getTranslations("page");

  return (
    <div className="pc:w-full pc:max-w-none tablet:max-w-7xl max-w-186">
      <LandingSmoothScroll />
      {/* 첫 화면(히어로 + 스텝/슬라이드)을 GNB 바로 아래에 고정하고, spacer만큼 스크롤하는 동안 트럭이 왼쪽 끝까지 간다 */}
      <div>
        <div className="pc:top-22 sticky top-13.5">
          <header className="tablet:h-101.25 relative h-78.25 overflow-hidden">
            <Image src={bg} alt="background" fill className="tablet:hidden object-cover" />
            <Image
              src={bgWide}
              alt="background"
              fill
              className="tablet:block hidden object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.60)_100%),linear-gradient(0deg,rgba(70,43,20,0.70)_0%,rgba(70,43,20,0.70)_100%)]" />
            <article className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <HeaderCarImage />
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-20 tablet:text-32 font-bold text-white">{t("heroTitle")}</h1>
                <h2 className="text-16 text-gray-gray-200 tablet:text-18 font-normal">
                  {t("heroBody1")} <br /> {t("heroBody2")}
                </h2>
              </div>
            </article>
          </header>
          <section className="pc:mx-auto pc:flex pc:max-w-7xl pc:flex-row pc:justify-between pc:mt-28.75 pc:mb-[124.5px] tablet:pb-[108.5px] pb-15.25">
            <article className="tablet:mt-17.25 tablet:mb-10 mt-13.25 mb-8.5 ml-8">
              <ol className="text-20 text-black-black-400 tablet:text-32 font-bold">
                <li>{t("step1")}</li>
                <li>{t("step2")}</li>
              </ol>
            </article>
            <MoveTypeSlideshow />
          </section>
        </div>
        {/* 트럭 이동 거리와 같은 스크롤 구간. 트럭 너비(w-25 / tablet:w-40)를 바꾸면 -50px / -80px도 같이 바꾼다 */}
        <div className="tablet:h-[calc(50vw-80px)] h-[calc(50vw-50px)]" aria-hidden="true" />
      </div>
      <main>
        {/* 이미지는 글자 없이 두고 제목은 다국어 텍스트로 얹는다. 위치와 크기는 컨테이너 너비(cqw) 비율이라 이미지와 같이 줄고 늘어난다 */}
        <section className="tablet:px-8 tablet:mb-9 pc:mb-[61.5px] mb-[16.5px]">
          <div className="pc:max-w-[1402px] @container relative mx-auto w-full">
            <Reveal y={40} scale={0.97}>
              <TiltOnScroll>
                <Image
                  src={img3_sm}
                  width={375}
                  height={496}
                  alt=""
                  className="pc:hidden tablet:hidden mb-4 h-auto w-full"
                />
                <Image
                  src={img3_md}
                  width={679}
                  height={835}
                  alt=""
                  className="pc:hidden tablet:block hidden h-auto w-full"
                />
                <Image
                  src={img3_lg}
                  width={1402}
                  height={787}
                  alt=""
                  className="tablet:hidden pc:block hidden h-auto w-full"
                />
                {/* 이미지 속 "견적 상세" 화면 자리에 실제 컴포넌트를 올립니다. 좌표는 이미지 너비 비율입니다
                (카드 위치: sm 37.5/131.5 폭 243.5 · md 59/187 폭 458.5 · lg 143/60 폭 518) */}
                <div className="tablet:top-[27.54cqw] tablet:left-[8.69%] tablet:w-[67.5%] pc:top-[4.28cqw] pc:left-[10.2%] pc:w-[36.95%] absolute top-[35.07cqw] left-[10%] w-[64.93%]">
                  <ScaledStage {...QUOTE_DETAIL_MOCK_SIZE}>
                    <QuoteDetailMock />
                  </ScaledStage>
                </div>
              </TiltOnScroll>
            </Reveal>
            <Reveal
              tag="h2"
              y={30}
              blur={8}
              delay={0.15}
              className="tablet:top-[7.2cqw] tablet:right-[7.94cqw] tablet:text-[4.706cqw] tablet:leading-[6.765cqw] pc:top-[10.84cqw] pc:right-auto pc:left-[53.64cqw] pc:text-left pc:text-[2.282cqw] pc:leading-[3.281cqw] absolute top-[7.73cqw] right-[9.28cqw] text-right text-[5.333cqw] leading-[8.533cqw] font-bold whitespace-pre-line text-white"
            >
              {t("serviceTitle1")} <br /> {t("serviceTitle2")}
            </Reveal>
          </div>
        </section>
        <CompareQuotesSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
