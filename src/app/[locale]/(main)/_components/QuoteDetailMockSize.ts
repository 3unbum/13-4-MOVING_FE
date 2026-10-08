/**
 * QuoteDetailMock이 그려지는 디자인 크기 (태블릿 폭 744 기준).
 *
 * QuoteDetailMock.tsx는 "use client"라서, 거기서 상수를 export하면 서버 컴포넌트(page.tsx)에서는
 * 값이 아니라 참조 객체로 받아 width가 비게 됩니다. 그래서 별도 파일에 둡니다.
 */
export const QUOTE_DETAIL_MOCK_SIZE = { width: 744, height: 978 } as const;
