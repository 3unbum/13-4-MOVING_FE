import { z } from "zod";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";

const serviceValues = SERVICE_OPTIONS.map((option) => option.value) as [string, ...string[]];
const regionValues = REGION_OPTIONS.map((option) => option.value) as [string, ...string[]];

// BE customerProfileCreateSchema와 동일한 계약: region은 단일 선택(enum), services는 배열
export const customerProfileSchema = z.object({
  image: z.string().optional(),
  region: z.enum(regionValues, { message: "내가 사는 지역을 선택해주세요" }),
  services: z.array(z.enum(serviceValues)).min(1, "이용 서비스를 1개 이상 선택해주세요"),
});

// BE moverProfileCreateSchema와 동일한 계약: services/regions 둘 다 배열(다중 선택)
export const moverProfileSchema = z.object({
  image: z.string().optional(),
  nickName: z.string().min(1, "별명을 입력해주세요"),
  // register(..., { valueAsNumber: true })로 이미 숫자로 변환된 값이 들어온다는 전제 —
  // z.coerce를 쓰면 useForm 입출력 타입이 갈라져 resolver 타입 에러가 남
  career: z.number().int().min(0, "경력은 0 이상이어야 합니다"),
  bio: z.string().min(1, "한 줄 소개를 입력해주세요"),
  description: z.string().min(1, "상세 설명을 입력해주세요"),
  services: z.array(z.enum(serviceValues)).min(1, "제공 서비스를 1개 이상 선택해주세요"),
  regions: z.array(z.enum(regionValues)).min(1, "서비스 가능 지역을 1개 이상 선택해주세요"),
});

export type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;
export type MoverProfileFormValues = z.infer<typeof moverProfileSchema>;
