import profile140 from "@/assets/images/common/프로필_140.png";
import profile50 from "@/assets/images/common/프로필_50.png";
import clsx from "clsx";
import Image, { type StaticImageData } from "next/image";

type ProfileAvatarSize = "sm" | "md" | "lg";

interface ProfileAvatarProps {
  /** 프로필 이미지 URL. 없으면 기본 아이콘으로 표시 */
  src?: string | null;
  alt?: string;
  size?: ProfileAvatarSize;
  className?: string;
}

// 피그마 profile(1:4445)은 50/64/80/100/140 5종. 카드에 쓰이는 것만 구현합니다
const SIZE_CLASS: Record<ProfileAvatarSize, string> = {
  sm: "size-12.5",
  md: "size-20",
  lg: "size-33.5",
};

const SIZE_PX: Record<ProfileAvatarSize, string> = {
  sm: "50px",
  md: "80px",
  lg: "134px",
};

// md(80px)용 기본 이미지가 따로 없어 140을 줄여 씁니다 (50을 키우면 깨집니다)
const FALLBACK_IMAGE: Record<ProfileAvatarSize, StaticImageData> = {
  sm: profile50,
  md: profile140,
  lg: profile140,
};

// 사용법: <ProfileAvatar src={mover.image} alt={mover.nickName} size="lg" />
export default function ProfileAvatar({
  src,
  alt = "프로필이미지",
  size = "sm",
  className,
}: ProfileAvatarProps) {
  return (
    <div
      className={clsx(
        "bg-black-300 relative shrink-0 overflow-hidden rounded-xl",
        SIZE_CLASS[size],
        className
      )}
    >
      <Image
        src={src || FALLBACK_IMAGE[size]}
        alt={alt}
        fill
        sizes={SIZE_PX[size]}
        className="object-cover"
      />
    </div>
  );
}
