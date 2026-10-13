"use client";

import { useTranslations } from "next-intl";

import { useRef, useState } from "react";
import Image from "next/image";
import galleryIcon from "@/assets/icons/gallery-outline.svg";
import { profileService } from "@/lib/services/profile-service";
import { cn } from "@/lib/utils/cn";

// BE profile.constants.ts(PROFILE_IMAGE_MAX_SIZE_BYTES/ALLOWED_IMAGE_MIME_TYPES)와 동일 —
// 서버 검증 전에 미리 걸러 불필요한 업로드 요청을 줄인다
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ProfileImageUploadProps {
  // 업로드 완료 시 서버 imageUrl(POST /profiles/image 응답)을 부모(RHF)에 전달.
  // "삭제" 버튼을 누르면 null — PATCH는 undefined를 "변경 없음"으로 보기 때문에, 이미지를 비우려면
  // undefined와 구분되는 null을 보내야 한다(등록 폼은 null을 undefined로 바꿔 쓴다).
  value?: string | null;
  onChange: (imageUrl: string | null | undefined) => void;
  // 업로드 진행 상태를 부모에 알림 — 부모 폼은 업로드 중엔 제출 버튼을 막는 데 사용
  onUploadingChange?: (isUploading: boolean) => void;
  disabled?: boolean;
}

// 피그마 "img/profile/upload" 대응 — 원형 아바타가 아니라 사각형 업로드 박스.
// 빈 상태: bg-background-200 rounded-md 박스 + 중앙 갤러리 아이콘.
// 크기: 모바일·태블릿 100px(size-25) / 데스크탑 160px(size-40), 아이콘은 32px/40px.
// (갤러리 아이콘은 피그마 익스포트 자산을 그대로 받아오지 못해 동일한 형태로 새로 그린 대체 아이콘)
export default function ProfileImageUpload({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
}: ProfileImageUploadProps) {
  const t = useTranslations("profileImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value ?? undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 onChange가 뜨도록 초기화
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("invalidType"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t("tooLarge"));
      return;
    }

    setError(undefined);
    // 서버 업로드가 끝나기 전에도 바로 보이도록 로컬 미리보기부터 띄운다
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const { imageUrl } = await profileService.uploadImage(file);
      onChange(imageUrl);
    } catch {
      setError(t("uploadFailed"));
      setPreviewUrl(value ?? undefined);
      // 교체 업로드 실패 시 기존 값을 유지 — undefined로 지우면 미리보기(기존 이미지로 복원)와
      // 실제 제출값이 어긋나 버린다
      onChange(value);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  // 이미지 박스를 눌러도 바뀌지만 눈에 띄지 않아 "수정이 안 되는 줄" 아는 사용자가 있어 명시 버튼을 둔다
  function handleRemove() {
    setError(undefined);
    setPreviewUrl(undefined);
    onChange(null);
  }

  const actionButtonClass = cn(
    "border-line-200 not-disabled:hover:bg-background-200 text-14 text-black-black-400 h-9 rounded-lg border bg-gray-50 px-3 font-semibold",
    "disabled:cursor-not-allowed disabled:opacity-40"
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        aria-label={previewUrl ? t("change") : t("upload")}
        className={cn(
          "bg-background-200 pc:size-40 relative flex size-25 shrink-0 items-center justify-center overflow-hidden rounded-md",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="" fill sizes="160px" className="object-cover" />
        ) : (
          <Image src={galleryIcon} alt="" className="pc:size-10 size-8" />
        )}
      </button>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={actionButtonClass}
        >
          {previewUrl ? t("change") : t("upload")}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className={actionButtonClass}
          >
            {t("remove")}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      {isUploading && <p className="text-13 font-medium text-gray-400">{t("uploading")}</p>}
      {error && <p className="text-13 font-medium text-red-200">{error}</p>}
    </div>
  );
}
