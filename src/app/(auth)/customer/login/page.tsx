"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import loginGoogleMd from "@/assets/images/common/login-google-md.svg";
import loginGoogleSm from "@/assets/images/common/login-google-sm.svg";
import loginKakaoMd from "@/assets/images/common/login-kakao-md.svg";
import loginKakaoSm from "@/assets/images/common/login-kakao-sm.svg";
import loginNaverMd from "@/assets/images/common/login-naver-md.svg";
import loginNaverSm from "@/assets/images/common/login-naver-sm.svg";
import logoTextXl from "@/assets/images/common/logo-text-xl.svg";
import AuxText from "@/components/auth/AuxText";
import SocialLoginButton, {
  type SocialLoginButtonProps,
} from "@/components/auth/SocialLoginButton";
import Button from "@/components/common/Button";
import InputTextField from "@/components/common/InputTextfield";
import { authService } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";

interface CustomerLoginFormValues {
  email: string;
  password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 + 숫자 + 특수문자 포함 8자 이상 — 회원가입 규칙과 동일한 형식 검사(피그마 디자인 기준). BE loginSchema는 이 규칙을 강제하지 않음(min(1)만 검사).
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SOCIAL_PROVIDERS: SocialLoginButtonProps[] = [
  { label: "구글로 로그인", sm: loginGoogleSm, md: loginGoogleMd },
  { label: "카카오로 로그인", sm: loginKakaoSm, md: loginKakaoMd },
  { label: "네이버로 로그인", sm: loginNaverSm, md: loginNaverMd },
];

// TODO: "로그인 전 마지막 페이지"로 되돌리는 건 아직 미구현 — 지금은 항상 랜딩("/")으로 보낸다.
// document.referrer(SPA 라우팅에서 안 바뀜)나 sessionStorage(effect 순서 레이스 위험) 대신
// 로그인 버튼에 ?redirect= 쿼리파라미터를 실어 넘기는 방식을 추천 — 다만 useSearchParams는
// 프로덕션 빌드 시 Suspense 경계가 필요해서, 다른 페이지들이 실제로 이 파라미터를 넘기기
// 시작할 때 페이지를 Suspense로 감싸며 함께 추가하는 게 낫다.
// hasProfile: false를 여기서 강제로 등록 페이지로 보내지 않는 이유 — customer는 프로필이 선택사항이라
// 견적요청/내견적 등 실제로 필요한 페이지에서만 개별적으로 유도한다.
export default function CustomerLoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CustomerLoginFormValues>({ mode: "onChange" });

  const onSubmit = async (values: CustomerLoginFormValues) => {
    try {
      await authService.login({ role: "CUSTOMER", ...values });
      await refetch();
      router.push("/");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "로그인 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  return (
    <main className="tablet:bg-orange-400 tablet:py-16 flex flex-1 flex-col items-center justify-center bg-white px-6 py-10">
      <div className="tablet:max-w-130 tablet:gap-11 tablet:rounded-[32px] tablet:bg-gray-50 tablet:px-10 tablet:py-11 pc:max-w-185 pc:gap-12 pc:rounded-[40px] pc:px-12.5 pc:py-12 flex w-full max-w-100 flex-col items-center gap-10">
        <div className="flex w-full flex-col items-center gap-2">
          <Link href="/" aria-label="무빙 홈" className="shrink-0">
            <Image
              src={logoTextXl}
              alt="무빙"
              className="tablet:h-16 pc:h-20 h-16 w-auto"
              priority
            />
          </Link>
          <AuxText>
            <span className="font-normal">기사님이신가요?</span>
            <Link href="/mover/login" className="font-semibold text-orange-400 underline">
              기사님 전용 페이지
            </Link>
          </AuxText>
        </div>

        <div className="tablet:gap-6 flex w-full flex-col gap-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="tablet:gap-14 flex flex-col gap-8"
            noValidate
          >
            <div className="tablet:gap-8 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="tablet:text-18 pc:text-20 text-black-black-400 text-14"
                >
                  이메일
                </label>
                <InputTextField
                  id="email"
                  size="sm"
                  type="email"
                  placeholder="이메일을 입력해 주세요"
                  autoComplete="email"
                  errorMessage={errors.email?.message}
                  {...register("email", {
                    required: "이메일을 입력해 주세요",
                    pattern: { value: EMAIL_PATTERN, message: "올바른 이메일 형식이 아닙니다." },
                  })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="tablet:text-18 pc:text-20 text-black-black-400 text-14"
                >
                  비밀번호
                </label>
                <InputTextField
                  id="password"
                  size="sm"
                  type="password"
                  placeholder="비밀번호를 입력해 주세요"
                  autoComplete="current-password"
                  errorMessage={errors.password?.message}
                  {...register("password", {
                    required: "비밀번호를 입력해 주세요",
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message: "비밀번호가 올바르지 않습니다.",
                    },
                  })}
                />
              </div>
            </div>

            {errors.root?.message && (
              <p className="text-13 tablet:text-16 text-center text-red-200">
                {errors.root.message}
              </p>
            )}

            {/* 모바일 54px vs 태블릿·PC 60px — form 안에 submit 버튼이 중복 마운트되지 않도록 한 인스턴스에 breakpoint별 className만 덮어씀 */}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isValid}
              className="tablet:h-15 tablet:gap-2 tablet:rounded-2xl tablet:text-18"
            >
              로그인
            </Button>
          </form>

          <AuxText>
            <span className="font-normal">아직 무빙 회원이 아니신가요?</span>
            <Link href="/customer/signup" className="font-semibold text-orange-400 underline">
              이메일로 회원가입하기
            </Link>
          </AuxText>
        </div>

        <div className="tablet:gap-8 flex w-full flex-col items-center gap-6">
          <AuxText>
            <span className="font-normal">SNS 계정으로 간편 가입하기</span>
          </AuxText>
          <div className="tablet:gap-8 flex items-start gap-6">
            {SOCIAL_PROVIDERS.map((provider) => (
              <SocialLoginButton key={provider.label} {...provider} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
