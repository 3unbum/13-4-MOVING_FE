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

// PR #73(프로필 수정/기본정보 수정 화면)이 머지되면서 라우트가 분리됐다 — "내 프로필 수정"은
// /mover/mypage/edit(프로필 수정), "기본 정보 수정"은 /mover/mypage/edit/basic-info(기본정보 수정)
// 로 각각 이동한다 (edit/page.tsx 상단 주석 참고).
const MOVER_PROFILE_EDIT_DESTINATION = "/mover/mypage/edit";
const MOVER_BASIC_INFO_EDIT_DESTINATION = "/mover/mypage/edit/basic-info";

// ProfileHeader(모바일/태블릿 버튼 행)와 MoverMyPageContent(PC 우측 컬럼)가 함께 쓴다.

export function EditBasicInfoButton() {
  const router = useRouter();

  return (
    <Button
      variant="outlined"
      size="lg"
      icon={<Image src={writingMdGray} alt="" className="size-6" />}
      onClick={() => router.push(MOVER_BASIC_INFO_EDIT_DESTINATION)}
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
      onClick={() => router.push(MOVER_PROFILE_EDIT_DESTINATION)}
      className={RESPONSIVE_CTA_SIZE}
    >
      내 프로필 수정
    </Button>
  );
}
