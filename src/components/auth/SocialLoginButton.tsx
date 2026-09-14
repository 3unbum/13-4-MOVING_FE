import Image, { type StaticImageData } from "next/image";

export interface SocialLoginButtonProps {
  label: string;
  sm: StaticImageData;
  md: StaticImageData;
}

// 구글/카카오/네이버 원형 아이콘 — 모바일(54px)·태블릿·PC(72px) 각각 전용 에셋으로 교체(스케일링 아님)
export default function SocialLoginButton({ label, sm, md }: SocialLoginButtonProps) {
  return (
    <button type="button" aria-label={label} className="shrink-0">
      <Image src={sm} alt="" className="tablet:hidden size-14" />
      <Image src={md} alt="" className="tablet:block hidden size-18" />
    </button>
  );
}
