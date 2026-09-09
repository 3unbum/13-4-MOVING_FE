import profile140 from "@/assets/images/common/프로필_140.png";
import profile50 from "@/assets/images/common/프로필_50.png";
import clsx from "clsx";
import Image, { type StaticImageData } from "next/image";

type ProfileAvatarSize = "sm" | "lg";

interface ProfileAvatarProps {
  /** 프로필 이미지 URL. 없으면 기본 아이콘으로 표시 */
  src?: string | null;
  alt?: string;
  size?: ProfileAvatarSize;
  className?: string;
}

const SIZE_CLASS: Record<ProfileAvatarSize, string> = {
  sm: "size-12.5",
  lg: "size-33.5",
};

const FALLBACK_IMAGE: Record<ProfileAvatarSize, StaticImageData> = {
  sm: profile50,
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
        sizes={size === "lg" ? "134px" : "50px"}
        className="object-cover"
      />
    </div>
  );
}
