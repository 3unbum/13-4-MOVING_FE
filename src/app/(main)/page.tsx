import bg from "@/assets/images/landing/hd_bg.png";
import bgWide from "@/assets/images/landing/hd_bg_wide.jpg";
import Image from "next/image";
import HeaderCarImage from "./_components/HeaderCarImage";
import MoveTypeSlideshow from "./_components/MoveTypeSlideshow";
import img3_sm from "@/assets/images/landing/img3_sm.png";
import img3_md from "@/assets/images/landing/img3_md.png";
import img3_lg from "@/assets/images/landing/img3_lg.png";
import img4_sm from "@/assets/images/landing/img4_sm.png";
import img4_md from "@/assets/images/landing/img4_md.png";
import img4_lg from "@/assets/images/landing/img4_lg.png";
import Footer from "./_components/Footer";

export default function HomePage() {
  return (
    <div className="pc:w-full pc:max-w-none tablet:max-w-7xl max-w-186">
      <header className="tablet:h-101.25 relative h-78.25 overflow-hidden">
        <Image src={bg} alt="background" fill className="tablet:hidden object-cover" />
        <Image src={bgWide} alt="background" fill className="tablet:block hidden object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.60)_100%),linear-gradient(0deg,rgba(70,43,20,0.70)_0%,rgba(70,43,20,0.70)_100%)]" />
        <article className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <HeaderCarImage />
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-20 tablet:text-32 font-bold text-white">
              이사업체, 어떻게 고르세요?
            </p>
            <p className="text-16 text-gray-gray-200 tablet:text-18 font-normal">
              무빙은 여러 견적을 한눈에 비교해 <br /> 이사업체 선정 과정을 간편하게 바꿔드려요
            </p>
          </div>
        </article>
      </header>
      <main>
        <section className="pc:mx-auto pc:flex pc:max-w-7xl pc:flex-row pc:justify-between pc:mt-28.75 pc:mb-[124.5px] tablet:pb-[108.5px] pb-15.25">
          <article className="tablet:mt-17.25 tablet:mb-10 mt-13.25 mb-8.5 ml-8">
            <ol className="text-20 text-black-black-400 tablet:text-32 font-bold">
              <li>번거로운 선정과정,</li>
              <li>이사 유형부터 선택해요</li>
            </ol>
          </article>
          <MoveTypeSlideshow />
        </section>
        <section className="tablet:px-8 tablet:mb-9 pc:mb-[61.5px] mb-[16.5px]">
          <Image
            src={img3_sm}
            width={375}
            height={496}
            alt="img3_sm"
            className="pc:hidden tablet:hidden mb-4 h-auto w-full"
          />
          <Image
            src={img3_md}
            width={679}
            height={835}
            alt="img3_md"
            className="pc:hidden tablet:block hidden h-auto w-full overflow-x-hidden"
          />
          <Image
            src={img3_lg}
            width={1402}
            height={786.5}
            alt="img3_lg"
            className="tablet:hidden pc:block inset-0 mx-auto hidden"
          />
        </section>
        <section>
          <p className="text-20 text-black-black-400 tablet:text-32 pc:mt-[7.99%] pc:ml-[21.71%] absolute mt-[56.33px] ml-[31.75px] text-left font-bold">
            여러 업체의 견적을
            <br /> 한눈에 비교하고 선택해요
          </p>
          <Image
            src={img4_sm}
            width={375}
            height={1076}
            alt="img4_sm"
            className="tablet:hidden pc:hidden h-auto w-full"
          />
          <Image
            src={img4_md}
            width={744}
            height={1008}
            alt="img4_md"
            className="tablet:block pc:hidden hidden h-auto w-full"
          />
          <Image
            src={img4_lg}
            width={1920}
            height={1081}
            alt="img4_md"
            className="tablet:hidden pc:block hidden h-auto w-full"
          />
        </section>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
