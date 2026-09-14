export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 지역번호(01[016789]) + 7~8자리 — BE auth.schema.ts의 phoneNumber 정규식과 동일
export const PHONE_PATTERN = /^01[016789]\d{7,8}$/;
// 영문 + 숫자 + 특수문자 포함 8자 이상 — BE auth.schema.ts의 PASSWORD_RULE과 동일
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
