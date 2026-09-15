import Image from "next/image";
import Link from "next/link";
import logoTextXl from "@/assets/images/common/logo-text-xl.svg";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";

interface AuthHeaderProps {
  prompt: string;
  href: string;
  linkText: string;
}

export default function AuthHeader({ prompt, href, linkText }: AuthHeaderProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Link href="/" aria-label="무빙 홈" className="shrink-0">
        <Image src={logoTextXl} alt="무빙" className="tablet:h-20 h-16 w-auto" priority />
      </Link>
      <AuthSwitchLink prompt={prompt} href={href} linkText={linkText} />
    </div>
  );
}
