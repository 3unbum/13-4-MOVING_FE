import Image from "next/image";
import AuxText from "@/components/auth/AuxText";
import { SOCIAL_PROVIDERS } from "@/constants/auth/social-provider";

interface SocialLoginSectionProps {
  // "로그인" | "회원가입" — 버튼 라벨(예: "구글로 로그인") 접미사로 조합
  actionLabel: string;
}

export default function SocialLoginSection({ actionLabel }: SocialLoginSectionProps) {
  return (
    <div className="tablet:gap-8 flex w-full flex-col items-center gap-6">
      <AuxText>
        <span className="font-normal">SNS 계정으로 간편 가입하기</span>
      </AuxText>
      <div className="tablet:gap-8 flex items-start gap-6">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.name}
            type="button"
            aria-label={`${provider.name}로 ${actionLabel}`}
            className="shrink-0"
          >
            {/* 모바일(54px)·태블릿·PC(72px) 각각 전용 에셋으로 교체(스케일링 아님) */}
            <Image src={provider.sm} alt="" className="tablet:hidden size-13.5" />
            <Image src={provider.md} alt="" className="tablet:block hidden size-18" />
          </button>
        ))}
      </div>
    </div>
  );
}
