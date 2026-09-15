import Link from "next/link";
import AuxText from "@/components/auth/AuxText";

interface AuthSwitchLinkProps {
  prompt: string;
  href: string;
  linkText: string;
}

export default function AuthSwitchLink({ prompt, href, linkText }: AuthSwitchLinkProps) {
  return (
    <AuxText>
      <span className="font-normal">{prompt}</span>
      <Link href={href} className="font-semibold text-orange-400 underline">
        {linkText}
      </Link>
    </AuxText>
  );
}
