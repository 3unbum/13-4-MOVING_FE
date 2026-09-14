"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
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
import Modal, { ModalHeader } from "@/components/common/Modal";
import { authService } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";

interface CustomerSignupFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
}

const SOCIAL_PROVIDERS: SocialLoginButtonProps[] = [
  { label: "구글로 회원가입", sm: loginGoogleSm, md: loginGoogleMd },
  { label: "카카오로 회원가입", sm: loginKakaoSm, md: loginKakaoMd },
  { label: "네이버로 회원가입", sm: loginNaverSm, md: loginNaverMd },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 지역번호(01[016789]) + 7~8자리 — BE auth.schema.ts의 phoneNumber 정규식과 동일
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;
// 영문 + 숫자 + 특수문자 포함 8자 이상 — BE auth.schema.ts의 PASSWORD_RULE과 동일
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function CustomerSignupPage() {
  const router = useRouter();
  const modalTitleId = useId();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CustomerSignupFormValues>({ mode: "onChange" });

  const onSubmit = async (values: CustomerSignupFormValues) => {
    const { passwordConfirm: _passwordConfirm, ...signupValues } = values;
    try {
      await authService.signup({ role: "CUSTOMER", ...signupValues });
      // 가입 직후엔 hasProfile이 항상 false — 바로 등록시키지 않고 모달로 물어본다.
      setIsProfileModalOpen(true);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        setError("email", { message: error.message });
        return;
      }
      const message =
        error instanceof ApiError ? error.message : "회원가입 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  // 모달을 닫는 모든 경로(오버레이 클릭·esc·"아니오")는 동일하게 랜딩으로 보낸다 —
  // 가입 페이지(비로그인 전용 (auth) 그룹)에 로그인된 채로 남아있게 두지 않기 위함.
  const skipProfileRegister = () => router.push("/");

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
            <Link href="/mover/signup" className="font-semibold text-orange-400 underline">
              기사님 전용 페이지
            </Link>
          </AuxText>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="tablet:gap-8 flex w-full flex-col gap-6"
          noValidate
        >
          <div className="tablet:gap-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="tablet:text-18 pc:text-20 text-black-black-400 text-14"
              >
                이름
              </label>
              <InputTextField
                id="name"
                size="sm"
                type="text"
                placeholder="이름을 입력해 주세요"
                autoComplete="name"
                errorMessage={errors.name?.message}
                {...register("name", { required: "이름을 입력해 주세요" })}
              />
            </div>

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
                htmlFor="phoneNumber"
                className="tablet:text-18 pc:text-20 text-black-black-400 text-14"
              >
                전화번호
              </label>
              <InputTextField
                id="phoneNumber"
                size="sm"
                type="tel"
                placeholder="숫자만 입력해 주세요"
                autoComplete="tel"
                errorMessage={errors.phoneNumber?.message}
                {...register("phoneNumber", {
                  required: "전화번호를 입력해 주세요",
                  pattern: { value: PHONE_PATTERN, message: "올바른 전화번호 형식이 아닙니다." },
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
                autoComplete="new-password"
                errorMessage={errors.password?.message}
                {...register("password", {
                  required: "비밀번호를 입력해 주세요",
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.",
                  },
                  // password가 바뀔 때마다 passwordConfirm도 같이 재검증 — 안 그러면 이미
                  // 일치했던 확인란이, 비밀번호를 나중에 다시 고쳐도 새로 건드리기 전까진
                  // 계속 "일치함"으로 남아있음(제출 시점엔 어차피 다시 걸러지지만 버튼 활성화 상태가 그새 부정확해짐).
                  deps: ["passwordConfirm"],
                })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="passwordConfirm"
                className="tablet:text-18 pc:text-20 text-black-black-400 text-14"
              >
                비밀번호 확인
              </label>
              <InputTextField
                id="passwordConfirm"
                size="sm"
                type="password"
                placeholder="비밀번호 다시 한번 입력해 주세요"
                autoComplete="new-password"
                errorMessage={errors.passwordConfirm?.message}
                {...register("passwordConfirm", {
                  required: "비밀번호 다시 한번 입력해 주세요",
                  validate: (value) =>
                    value === getValues("password") || "비밀번호가 일치하지 않습니다.",
                })}
              />
            </div>
          </div>

          {errors.root?.message && (
            <p className="text-13 tablet:text-16 text-center text-red-200">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !isValid}
            className="tablet:h-15 tablet:gap-2 tablet:rounded-2xl tablet:text-18"
          >
            회원가입
          </Button>
        </form>

        <AuxText>
          <span className="font-normal">이미 무빙 회원이신가요?</span>
          <Link href="/customer/login" className="font-semibold text-orange-400 underline">
            로그인하기
          </Link>
        </AuxText>

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

      <Modal
        open={isProfileModalOpen}
        onClose={skipProfileRegister}
        labelledBy={modalTitleId}
        className="tablet:w-152 tablet:min-w-152 w-93.75 min-w-93.75 gap-10 rounded-[32px] px-6 pt-8 pb-10"
      >
        <ModalHeader
          id={modalTitleId}
          title="프로필을 등록하시겠어요?"
          size="md"
          onClose={skipProfileRegister}
        />
        <p className="text-18 text-black-300 w-full font-medium">
          프로필을 등록하면 견적 요청, 찜하기 등 무빙의 모든 서비스를 바로 이용할 수 있어요.
        </p>
        <div className="flex w-full gap-3">
          <Button variant="outlined" size="lg" onClick={skipProfileRegister}>
            다음에 할게요
          </Button>
          <Button
            variant="solid"
            size="lg"
            onClick={() => router.push("/customer/profile-register")}
          >
            등록하러 가기
          </Button>
        </div>
      </Modal>
    </main>
  );
}
