import type { StaticImageData } from "next/image";
import loginGoogleMd from "@/assets/images/common/login-google-md.svg";
import loginGoogleSm from "@/assets/images/common/login-google-sm.svg";
import loginKakaoMd from "@/assets/images/common/login-kakao-md.svg";
import loginKakaoSm from "@/assets/images/common/login-kakao-sm.svg";
import loginNaverMd from "@/assets/images/common/login-naver-md.svg";
import loginNaverSm from "@/assets/images/common/login-naver-sm.svg";
import type { OAuthProviderKey } from "@/constants/auth/oauth";

export interface SocialProvider {
  key: OAuthProviderKey;
  name: string;
  sm: StaticImageData;
  md: StaticImageData;
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { key: "google", name: "구글", sm: loginGoogleSm, md: loginGoogleMd },
  { key: "kakao", name: "카카오", sm: loginKakaoSm, md: loginKakaoMd },
  { key: "naver", name: "네이버", sm: loginNaverSm, md: loginNaverMd },
];
