import type { ServiceCode } from "@/components/filter/ChipRegion";

/**
 * 퍼블리싱용 임시 데이터.
 *
 * BE가 견적 목록에 기사님 정보를 포함하지 않아(estimate 테이블 컬럼만 응답) 카드를 채울 수
 * 없습니다 — BE 이슈 #80에서 `include` 추가 예정. 그 PR이 머지되면 이 파일을 지우고
 * 실제 API로 교체합니다.
 */

export interface MockMover {
  nickName: string;
  profileImage?: string | null;
  rating: number;
  reviewCount: number;
  career: number;
  confirmedCount: number;
  favoriteCount: number;
}

export interface MockEstimate extends MockMover {
  id: number;
  category: ServiceCode;
  isTargeted: boolean;
  title: string;
  price: number;
  isConfirmed: boolean;
}

export interface MockQuotationRequest {
  id: number;
  category: ServiceCode;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  movingDate: string;
  estimates: MockEstimate[];
}

const MOVER: MockMover = {
  // MoverName이 "기사님"을 붙여주므로 별명만 넣습니다
  nickName: "김코드",
  profileImage: null,
  rating: 5.0,
  reviewCount: 178,
  career: 7,
  confirmedCount: 334,
  favoriteCount: 136,
};

const TITLE = "고객님의 물품을 안전하게 운송해 드립니다.";

/** 대기 중인 견적 — 활성 요청 1건과 거기 달린 견적들 */
export const MOCK_ACTIVE_REQUEST: MockQuotationRequest = {
  id: 1,
  category: "SMALL",
  createdAt: "2026-06-24T00:00:00.000Z",
  fromAddress: "서울시 중구 삼일대로 343",
  toAddress: "경기도 수원시 선릉로 428",
  movingDate: "2026-07-01T00:00:00.000Z",
  estimates: [1, 2, 3, 4].map((id) => ({
    id,
    category: "SMALL",
    isTargeted: true,
    title: TITLE,
    price: 180000,
    isConfirmed: false,
    ...MOVER,
  })),
};

/** 받았던 견적 — 지난 요청들, 각각 견적 목록을 가짐 */
export const MOCK_PAST_REQUESTS: MockQuotationRequest[] = [10, 11].map((id) => ({
  id,
  category: "OFFICE",
  createdAt: "2026-06-24T00:00:00.000Z",
  fromAddress: "서울 중구 삼일대로 343",
  toAddress: "서울 강남구 선릉로 428",
  movingDate: "2026-07-01T00:00:00.000Z",
  estimates: [1, 2, 3, 4].map((seq) => ({
    id: id * 100 + seq,
    category: "OFFICE" as ServiceCode,
    isTargeted: true,
    title: TITLE,
    price: 180000,
    // 요청마다 첫 번째 견적만 확정 상태
    isConfirmed: seq === 1,
    ...MOVER,
  })),
}));
