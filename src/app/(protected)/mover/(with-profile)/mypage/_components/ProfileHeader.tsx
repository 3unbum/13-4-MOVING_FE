import Image from "next/image";
import likeMdActive from "@/assets/icons/like-md-active.svg";
import logoMarkSm from "@/assets/icons/logo-mark-sm.svg";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import type { MoverListItem } from "@/lib/services/mover-service";
import { EditBasicInfoButton, EditMoverProfileButton } from "./MoverProfileEditButtons";

interface ProfileHeaderProps {
  mover: MoverListItem;
}

// 아바타+닉네임+찜수+소개글, 그 아래 모바일/태블릿 전용 수정 버튼 행까지 묶은 블록.
// PC 우측 버튼 컬럼은 이 컴포넌트 밖(MoverMyPageContent)에서 따로 렌더링한다.
export default function ProfileHeader({ mover }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <ProfileAvatar
          src={mover.image}
          alt={mover.nickName}
          size="80"
          className="tablet:size-20 tablet:rounded-[20px] size-16"
        />
        <div className="tablet:gap-2 flex flex-col gap-0">
          <div className="flex items-center gap-1">
            <Image src={logoMarkSm} alt="" className="tablet:h-6.5 tablet:w-5.5 h-4.5 w-4" />
            <span className="text-16 tablet:text-24 text-black-300 font-semibold">
              {mover.nickName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Image src={likeMdActive} alt="" className="size-6" />
            <span className="text-14 tablet:text-16 text-gray-gray-500">{mover.favoriteCount}</span>
          </div>
        </div>
      </div>

      {/* 피그마: 소개글+본문과 버튼 그룹 사이 간격이 모바일 28px, 태블릿/PC 32px로
          아바타-이름 블록(16px)보다 더 넓다 */}
      <div className="tablet:gap-8 flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <p className="text-18 text-black-300 font-semibold">{mover.bio}</p>
          <p className="text-14 tablet:text-16 text-gray-gray-500 whitespace-pre-wrap">
            {mover.description}
          </p>
        </div>

        {/* 모바일: 세로로 쌓이며 솔리드(내 프로필 수정)가 위, 아웃라인(기본 정보 수정)이
            아래. 태블릿: 가로 50:50이면서 순서가 반전되어 아웃라인이 왼쪽, 솔리드가
            오른쪽(피그마 태블릿 프레임 기준) — DOM 순서는 그대로 두고
            flex-row-reverse로 시각 순서만 뒤집는다. PC는 우측 컬럼에서 따로 노출
            (pc:hidden) */}
        <div className="tablet:flex-row-reverse pc:hidden tablet:gap-4 flex flex-col gap-3">
          <EditMoverProfileButton />
          <EditBasicInfoButton />
        </div>
      </div>
    </div>
  );
}
