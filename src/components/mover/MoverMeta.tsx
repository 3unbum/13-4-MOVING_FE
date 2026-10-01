import starActive from "@/assets/icons/star-sm-active.svg";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface MoverMetaProps {
  rating: number;
  reviewCount: number;
  career: number;
  confirmedCount: number;
  className?: string;
}

function Divider() {
  return <span aria-hidden className="bg-line-200 h-3.5 w-px shrink-0" />;
}

// 사용법 : <MoverMeta rating={5.0} reviewCount={178} career={7} confirmedCount={334} />
export default function MoverMeta({
  rating,
  reviewCount,
  career,
  confirmedCount,
  className,
}: MoverMetaProps) {
  const t = useTranslations("common");
  return (
    <div className={cn("text-13 flex items-center gap-2 font-medium", className)}>
      <span className="flex items-center gap-0.5">
        <Image src={starActive} alt="" className="size-5 shrink-0" />
        <span className="text-black-300">{rating.toFixed(1)}</span>
        <span className="text-gray-gray-300">({reviewCount})</span>
      </span>

      <Divider />

      {/* 라벨·값 순서가 언어마다 다릅니다(한국어 "경력 5년" / 영어 "5 yrs experience").
          색이 달라 한 문자열로 못 합치므로 t.rich로 태그를 넘깁니다. */}
      <span className="flex items-center gap-1">
        {t.rich("careerRich", {
          years: career,
          label: (chunks) => <span className="text-gray-gray-300">{chunks}</span>,
          value: (chunks) => <span className="text-black-300">{chunks}</span>,
        })}
      </span>

      <Divider />

      <span className="flex items-center gap-1">
        {t.rich("confirmedRich", {
          count: confirmedCount,
          label: (chunks) => <span className="text-gray-gray-300">{chunks}</span>,
          value: (chunks) => <span className="text-black-300">{chunks}</span>,
        })}
      </span>
    </div>
  );
}
