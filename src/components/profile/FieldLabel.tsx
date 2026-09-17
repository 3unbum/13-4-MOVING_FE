// 피그마 라벨(text-16 semibold, 필수 항목은 주황 *)이 InputTextField/InputTextArea의
// label prop(sr-only)만으로는 화면에 안 보여서 직접 그려줌 — 접근성용 label은 그대로 두고
// 시각적 라벨을 별도로 얹는 방식. 기사님 프로필 등록/수정 폼(MoverProfileForm,
// MoverProfileEditForm, MoverBasicInfoEditForm)이 공유한다.
export default function FieldLabel({
  children,
  required = true,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <span className="text-16 text-black-black-300 pc:text-20 font-semibold">
      {children}
      {required && <span className="text-orange-400"> *</span>}
    </span>
  );
}
