"use client";

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
  // 업로드 완료 시 서버 imageUrl(POST /profiles/image 응답)을 부모(RHF)에 전달, 실패/제거 시 undefined
  value?: string;
  onChange: (imageUrl: string | undefined) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 onChange가 뜨도록 초기화
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("jpeg, png, webp 파일만 업로드할 수 있어요");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("이미지 용량은 5MB를 초과할 수 없어요");
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
      setError("이미지 업로드에 실패했어요. 다시 시도해주세요");
      setPreviewUrl(value);
      // 교체 업로드 실패 시 기존 값을 유지 — undefined로 지우면 미리보기(기존 이미지로 복원)와
      // 실제 제출값이 어긋나 버린다
      onChange(value);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        aria-label={previewUrl ? "프로필 이미지 변경" : "프로필 이미지 업로드"}
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
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      {isUploading && <p className="text-13 font-medium text-gray-400">업로드 중...</p>}
      {error && <p className="text-13 font-medium text-red-200">{error}</p>}
    </div>
  );
}
