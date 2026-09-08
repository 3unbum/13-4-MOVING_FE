import starActive from "@/assets/icons/star-sm-active.svg";
import clsx from "clsx";
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
  return (
    <div className={clsx("text-13 flex items-center gap-2 font-medium", className)}>
      <span className="flex items-center gap-0.5">
        <Image src={starActive} alt="" className="size-5 shrink-0" />
        <span className="text-black-300">{rating.toFixed(1)}</span>
        <span className="text-gray-gray-300">({reviewCount})</span>
      </span>

      <Divider />

      <span className="flex items-center gap-1">
        <span className="text-gray-gray-300">경력</span>
        <span className="text-black-300">{career}년</span>
      </span>

      <Divider />

      <span className="flex items-center gap-1">
        <span className="text-black-300">{confirmedCount}건</span>
        <span className="text-gray-gray-300">확정</span>
      </span>
    </div>
  );
}
