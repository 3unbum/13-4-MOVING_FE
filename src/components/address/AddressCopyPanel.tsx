"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import chevronDown from "@/assets/icons/chevron-down-sm.svg";
import Toast from "@/components/common/Toast";
import { cn } from "@/lib/utils/cn";

/** 토스트 노출 시간 — useShare와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

interface AddressCopyPanelProps {
  /** 도로명 주소 — 접힌 상태에서 보이는 값입니다 */
  address: string;
  /** 동·호수 등. 옛 데이터는 비어 있을 수 있습니다 */
  detailAddress?: string;
  postalCode?: string;
  className?: string;
  /**
   * 펼친 패널의 폭. 좁은 컨테이너(모달)에서는 바깥 행이 relative 기준이 되도록 두고
   * `w-full`을 넘겨 그 폭에 맞춥니다. 안 넘기면 내용 크기(`w-max`)를 씁니다.
   */
  panelClassName?: string;
}

/**
 * 주소 + 펼쳐서 복사 (네이버 지도 장소 패널과 같은 방식).
 *
 * 기사님이 실제로 찾아가려면 동·호수와 우편번호가 필요한데, 견적 정보 줄은
 * 도로명까지만 보여줍니다. 화면을 덮는 모달 대신 **그 자리에서 펼쳐** 항목별로
 * 복사하게 했습니다 — 주소를 보면서 필요한 부분만 가져갈 수 있습니다.
 */
export default function AddressCopyPanel({
  address,
  detailAddress,
  postalCode,
  className,
  panelClassName,
}: AddressCopyPanelProps) {
  const t = useTranslations("quote");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // 아래 공간이 모자라면 위로 펼칩니다 — 화면 끝에서 열면 패널이 잘립니다
  const [dropUp, setDropUp] = useState(false);

  // 토스트는 일정 시간 뒤 스스로 사라집니다 (useShare와 같은 방식)
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  // 패널 밖을 누르거나 ESC를 누르면 접습니다. 모달이 아니라 포커스를 가두지는 않습니다.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // 펼칠 방향은 **실제 패널 높이**로 정합니다. 주소가 두 줄로 접히면 높이가 달라져
  // 고정값으로는 아래가 잘릴 수 있습니다. 위아래 중 들어가는 쪽을 고르고,
  // 둘 다 부족하면 공간이 더 넓은 쪽으로 보냅니다.
  useEffect(() => {
    if (!open) return;

    const anchor = wrapperRef.current?.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight;
    if (!anchor || !panelHeight) return;

    const below = window.innerHeight - anchor.bottom;
    const above = anchor.top;
    setDropUp(below < panelHeight && above > below);
  }, [open, address, detailAddress, postalCode]);

  const detail = detailAddress?.trim();

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(t("addressCopied"));
    } catch {
      // 클립보드는 https·사용자 제스처 등 조건이 안 맞으면 거부됩니다.
      // 값은 화면에 그대로 떠 있으니 복사만 실패했다고 알립니다.
      setToast(t("addressCopyFailed"));
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative flex min-w-0 flex-col items-end", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="text-black-black-400 flex min-w-0 cursor-pointer items-center gap-1 text-left"
      >
        <span className="min-w-0 truncate">{address}</span>
        <Image
          src={chevronDown}
          alt=""
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          className={cn(
            // 좁은 컨테이너(모달 sm 327px) 안에서도 넘치지 않게 부모 폭을 넘지 않습니다.
            // 100vw 기준으로 잡으면 모달에서 왼쪽이 잘리고 가로 스크롤이 생깁니다.
            // w-max만 두면 내용이 가장 좁게 잡혀 "충북 / 증평군"처럼 쪼개집니다.
            // 그래서 최소 폭을 주는데, 모바일은 모달 내용이 327px뿐이라 min-w를 크게 잡으면
            // 패널이 왼쪽으로 삐져나가 라벨이 잘립니다("명 주소"). tablet부터만 넓힙니다.
            // grid — 라벨 열은 가장 긴 라벨(영어 "Address details")에 맞추고, 값 열이
            // 나머지를 가져갑니다. 라벨 폭을 고정하면 언어마다 길이가 달라
            // 영어·일본어에서 라벨이 두 줄로 접혔습니다.
            "border-line-100 shadow-modal absolute right-0 z-10 grid max-w-full grid-cols-[auto_1fr_auto] items-start gap-x-2 gap-y-2.5 rounded-lg border bg-white p-4",
            // 폭: 호출부가 지정하지 않으면 내용 크기. w-max만 두면 "충북 / 증평군"처럼
            // 어절마다 쪼개져 최소 폭(364px)을 함께 줍니다.
            // 모바일 모달은 내용이 327px뿐이라 min-w를 크게 잡으면 패널이 왼쪽으로
            // 삐져나가 라벨이 잘립니다 — 그래서 호출부가 w-full을 주면 그쪽을 씁니다.
            !panelClassName && "tablet:min-w-91 w-max",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
            panelClassName
          )}
        >
          <CopyRow label={t("roadAddressLabel")} value={address} onCopy={copy} />
          {/* 상세주소는 BE 스키마상 필수지만(detailAddress.min(1)) 옛 데이터가 비어 있을 수 있습니다 */}
          {detail && <CopyRow label={t("detailAddressLabel")} value={detail} onCopy={copy} />}
          {postalCode && <CopyRow label={t("postalCode")} value={postalCode} onCopy={copy} />}
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}

/** 라벨 + 값 + 복사 버튼 한 줄 */
function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (value: string) => void;
}) {
  const t = useTranslations("quote");

  // 부모가 grid라 세 칸을 직접 냅니다 — div로 감싸면 라벨 열이 줄마다 따로 잡혀
  // 값의 시작점이 어긋납니다.
  return (
    <>
      {/* 라벨은 내용 크기로 두고 줄바꿈만 막습니다. 폭을 고정하면 언어마다 길이가 달라
          ("도로명 주소" 6자 / "Address details" 15자) 긴 쪽이 두 줄로 접힙니다. */}
      <span className="text-12 text-gray-gray-400 bg-background-200 rounded px-1.5 py-0.5 text-center font-medium whitespace-nowrap">
        {label}
      </span>
      {/* break-keep을 쓰면 "광장로 / 88"처럼 번지만 떨어집니다.
          폭이 모자랄 때는 그냥 흐르듯 접히는 쪽이 덜 어색합니다. */}
      <span className="text-14 text-black-black-400 min-w-0 font-medium">{value}</span>
      {/* 세 버튼이 모두 "복사"라 화면 읽기 도구의 버튼 목록에서 구별되지 않습니다.
          보이는 문구는 그대로 두고 이름에 항목을 넣습니다 ("도로명 주소 복사") */}
      <button
        type="button"
        onClick={() => onCopy(value)}
        aria-label={`${label} ${t("copy")}`}
        className="text-12 cursor-pointer font-semibold whitespace-nowrap text-orange-400 hover:text-orange-500"
      >
        {t("copy")}
      </button>
    </>
  );
}
