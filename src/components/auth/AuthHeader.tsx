import Image from "next/image";
import Link from "next/link";
import logoTextXl from "@/assets/images/common/logo-text-xl.svg";
import AuxText from "@/components/auth/AuxText";

interface AuthHeaderProps {
  moverHref: string;
}

export default function AuthHeader({ moverHref }: AuthHeaderProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Link href="/" aria-label="무빙 홈" className="shrink-0">
        <Image src={logoTextXl} alt="무빙" className="tablet:h-16 pc:h-20 h-16 w-auto" priority />
      </Link>
      <AuxText>
        <span className="font-normal">기사님이신가요?</span>
        <Link href={moverHref} className="font-semibold text-orange-400 underline">
          기사님 전용 페이지
        </Link>
      </AuxText>
    </div>
  );
}
