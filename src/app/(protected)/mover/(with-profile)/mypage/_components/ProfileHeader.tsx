import Image from "next/image";
import likeMdActive from "@/assets/icons/like-md-active.svg";
import logoMarkSm from "@/assets/icons/logo-mark-sm.svg";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import type { MoverListItem } from "@/lib/services/mover-service";
import { EditBasicInfoButton, EditMoverProfileButton } from "./MoverProfileEditButtons";

interface ProfileHeaderProps {
  mover: MoverListItem;
}

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
            <span className="text-14 tablet:text-16 text-gray-gray-500">
              <span className="sr-only">찜 </span>
              {mover.favoriteCount}
            </span>
          </div>
        </div>
      </div>

      {/* 소개글+버튼 간격만 아바타 블록(16px)보다 넓다(모바일 28px/태블릿·PC 32px, 피그마 기준) */}
      <div className="tablet:gap-8 flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <p className="text-18 text-black-300 font-semibold">{mover.bio}</p>
          <p className="text-14 tablet:text-16 text-gray-gray-500 whitespace-pre-wrap">
            {mover.description}
          </p>
        </div>

        {/* 태블릿만 버튼 순서가 반전(아웃라인 왼쪽·솔리드 오른쪽)돼서 DOM은 그대로 두고
            flex-row-reverse로 시각 순서만 뒤집는다. PC는 우측 컬럼에서 따로 노출(pc:hidden) */}
        <div className="tablet:flex-row-reverse pc:hidden tablet:gap-4 flex flex-col gap-3">
          <EditMoverProfileButton />
          <EditBasicInfoButton />
        </div>
      </div>
    </div>
  );
}
