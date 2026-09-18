import profile140 from "@/assets/images/common/프로필_140.png";
import profile50 from "@/assets/images/common/프로필_50.png";
import { cn } from "@/lib/utils/cn";
import Image, { type StaticImageData } from "next/image";

/**
 * 피그마 profile(1:4445)의 크기를 그대로 씁니다.
 * sm/md/lg 대신 픽셀값을 쓰는 이유는, 같은 "lg"라도 카드마다 크기가 달라
 * 이름으로는 어느 카드의 lg인지 알 수 없기 때문입니다.
 */
type ProfileAvatarSize = "50" | "64" | "80" | "100" | "134";

interface ProfileAvatarProps {
  /** 프로필 이미지 URL. 없으면 기본 아이콘으로 표시 */
  src?: string | null;
  alt?: string;
  size?: ProfileAvatarSize;
  className?: string;
}

const SIZE_CLASS: Record<ProfileAvatarSize, string> = {
  "50": "size-12.5",
  "64": "size-16",
  "80": "size-20",
  "100": "size-25",
  "134": "size-33.5",
};

/** Next Image sizes는 CSS 표시 폭. DPR 후보는 srcset이 고른다 */
const SIZE_PX: Record<ProfileAvatarSize, string> = {
  "50": "50px",
  "64": "64px",
  "80": "80px",
  "100": "100px",
  "134": "134px",
};

// 50만 1x 전용 에셋, 나머지는 고해상도(1000px) 폴백을 Next가 리사이즈
const FALLBACK_IMAGE: Record<ProfileAvatarSize, StaticImageData> = {
  "50": profile50,
  "64": profile140,
  "80": profile140,
  "100": profile140,
  "134": profile140,
};

const FALLBACK_FRAME_CLASS: Record<Exclude<ProfileAvatarSize, "50">, string> = {
  "64": "absolute left-[-16px] top-[-8.96px] size-24",
  "80": "absolute left-[-20px] top-[-11.2px] size-[120px]",
  "100": "absolute left-[-21.64px] top-[-11.94px] size-[143.284px]",
  "134": "absolute left-[-29px] top-[-16px] size-48",
};

// 사용법: <ProfileAvatar src={mover.image} alt={mover.nickName} size="134" />
export default function ProfileAvatar({
  src,
  alt = "프로필이미지",
  size = "50",
  className,
}: ProfileAvatarProps) {
  const hasSrc = Boolean(src);

  return (
    <div
      className={cn(
        "bg-black-300 relative shrink-0 overflow-hidden rounded-xl",
        SIZE_CLASS[size],
        className
      )}
    >
      {hasSrc ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={SIZE_PX[size]}
          quality={90}
          className="object-cover"
        />
      ) : size === "50" ? (
        // 프로필_50은 이미 상체 크롭된 1x 에셋 — offset 프레임 불필요
        <Image
          src={FALLBACK_IMAGE[size]}
          alt={alt}
          fill
          sizes={SIZE_PX[size]}
          quality={90}
          className="object-cover"
        />
      ) : (
        <div className={FALLBACK_FRAME_CLASS[size]}>
          <Image
            src={FALLBACK_IMAGE[size]}
            alt={alt}
            fill
            sizes={SIZE_PX[size]}
            quality={90}
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
