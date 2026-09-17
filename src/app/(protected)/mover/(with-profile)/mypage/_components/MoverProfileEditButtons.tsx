"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import writingMd from "@/assets/icons/writing-md.svg";
import writingMdGray from "@/assets/icons/writing-md-gray.svg";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils/cn";

// Button의 size prop은 반응형이 아니라서, lg(태블릿·PC 값)를 기본으로 두고
// 모바일 값(sm과 동일)만 className으로 덮어쓴다(tailwind-merge가 뒤 클래스를 우선함).
const RESPONSIVE_CTA_SIZE =
  "h-13.5 tablet:h-16 gap-1 tablet:gap-2 rounded-xl tablet:rounded-2xl text-16 tablet:text-18";

// TODO: 기사님 "내 프로필 수정"/"기본 정보 수정" 페이지가 아직 없어서, 두 버튼 다 임시로
// 기사님 로그인 후 랜딩 경로(/mover/requests, (auth)/mover/login·OAuth 콜백과 동일)로
// 보내둔다. 각 페이지 라우트가 나오면 onClick을 그 경로로 바꿀 것.
const TEMP_DESTINATION = "/mover/requests";

// ProfileHeader(모바일/태블릿 버튼 행)와 MoverMyPageContent(PC 우측 컬럼)가 함께 쓴다.

export function EditBasicInfoButton() {
  const router = useRouter();

  return (
    <Button
      variant="outlined"
      size="lg"
      icon={<Image src={writingMdGray} alt="" className="size-6" />}
      onClick={() => router.push(TEMP_DESTINATION)}
      className={cn(RESPONSIVE_CTA_SIZE, "border-gray-gray-200 text-gray-gray-300")}
    >
      기본 정보 수정
    </Button>
  );
}

// Button은 <button>만 지원해 Link 대신 router.push로 이동시킨다
export function EditMoverProfileButton() {
  const router = useRouter();

  return (
    <Button
      variant="solid"
      size="lg"
      icon={<Image src={writingMd} alt="" className="size-6" />}
      onClick={() => router.push(TEMP_DESTINATION)}
      className={RESPONSIVE_CTA_SIZE}
    >
      내 프로필 수정
    </Button>
  );
}
