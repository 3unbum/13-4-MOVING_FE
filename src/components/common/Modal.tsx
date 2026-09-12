"use client";

import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import xMd from "@/assets/icons/x-md.svg";
import xSm from "@/assets/icons/x-sm.svg";
import { useDialog } from "@/hooks/useDialog";

type ModalPosition = "center" | "bottom";
type ModalHeaderSize = "sm" | "md";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  position?: ModalPosition;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  position = "center",
  labelledBy,
  children,
  className,
}: ModalProps) {
  const { panelRef } = useDialog({ open, onClose });

  if (!open) return null;

  return (
    <div className="z-modal bg-overlay-dim fixed inset-0 overflow-auto">
      <div
        className={clsx(
          "flex min-h-full",
          position === "bottom" ? "items-end justify-center" : "items-center justify-center p-4"
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={clsx(
            "shadow-modal relative flex min-h-0 flex-none flex-col items-stretch overflow-hidden bg-gray-50 outline-none",
            position === "bottom" ? "max-h-dvh" : "max-h-[calc(100dvh-2rem)]",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export interface ModalHeaderProps {
  id?: string;
  title: string;
  size?: ModalHeaderSize;
  onClose: () => void;
}

export function ModalHeader({ id, title, size = "sm", onClose }: ModalHeaderProps) {
  const isMd = size === "md";

  return (
    <div className="flex w-full shrink-0 items-center justify-between bg-gray-50">
      <p
        id={id}
        className={clsx(
          "text-black-black-400 shrink-0 whitespace-nowrap",
          isMd ? "text-24 font-semibold" : "text-18 font-bold"
        )}
      >
        {title}
      </p>
      <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
        <Image src={isMd ? xMd : xSm} alt="" className={isMd ? "size-9" : "size-6"} />
      </button>
    </div>
  );
}
