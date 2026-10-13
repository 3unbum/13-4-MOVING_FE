"use client";

import galleryIcon from "@/assets/icons/gallery-outline.svg";
import xSm from "@/assets/icons/x-sm.svg";
import { MAX_REVIEW_IMAGES, reviewService } from "@/lib/services/review-service";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ReviewPhotoFieldProps {
  reviewId: number;
  imageUrls: string[];
  onChange: (imageUrls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  disabled?: boolean;
}

/** 리뷰에 사진을 최대 3장 붙이거나 지운다. 작성 전·후 모두 가능하다. */
export default function ReviewPhotoField({
  reviewId,
  imageUrls,
  onChange,
  onUploadingChange,
  disabled = false,
}: ReviewPhotoFieldProps) {
  const t = useTranslations("review");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAdd = imageUrls.length < MAX_REVIEW_IMAGES && !disabled && !isUploading;

  const setUploading = (next: boolean) => {
    setIsUploading(next);
    onUploadingChange?.(next);
  };

  const uploadFiles = async (files: File[]) => {
    const room = MAX_REVIEW_IMAGES - imageUrls.length;
    const accepted = files.slice(0, room);
    if (accepted.length === 0) return;

    for (const file of accepted) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(t("photoInvalidType"));
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(t("photoTooLarge"));
        return;
      }
    }

    setError(null);
    setUploading(true);
    const nextUrls = [...imageUrls];

    try {
      for (const file of accepted) {
        const { imageUrl } = await reviewService.uploadImage(reviewId, file);
        nextUrls.push(imageUrl);
        onChange([...nextUrls]);
      }
    } catch {
      setError(t("photoUploadFailed"));
      onChange(nextUrls);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string) => {
    setError(null);
    setUploading(true);
    try {
      await reviewService.removeImage(reviewId, imageUrl);
      onChange(imageUrls.filter((url) => url !== imageUrl));
    } catch {
      setError(t("photoUploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-16 text-black-300 font-semibold">{t("photoPrompt")}</p>
        <p className="text-13 text-gray-gray-400">{t("photoHint")}</p>
      </div>

      <div className="flex items-center gap-2">
        {imageUrls.map((url) => (
          <div
            key={url}
            className="bg-background-200 relative size-20 shrink-0 overflow-hidden rounded-xl"
          >
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => {
                void removeImage(url);
              }}
              disabled={disabled || isUploading}
              aria-label={t("photoRemove")}
              className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-white/90 disabled:opacity-40"
            >
              <Image src={xSm} alt="" className="size-4" />
            </button>
          </div>
        ))}

        {imageUrls.length < MAX_REVIEW_IMAGES ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!canAdd}
            aria-label={t("photoAdd")}
            className={cn(
              "bg-background-200 flex size-20 shrink-0 items-center justify-center rounded-xl",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <Image src={galleryIcon} alt="" className="size-8" />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void uploadFiles(files);
        }}
      />

      {isUploading ? (
        <p className="text-13 font-medium text-gray-400">{t("photoUploading")}</p>
      ) : null}
      {error ? <p className="text-13 font-medium text-red-200">{error}</p> : null}
    </div>
  );
}
