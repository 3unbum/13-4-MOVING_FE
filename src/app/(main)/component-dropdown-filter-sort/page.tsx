"use client";

import DropdownDateTrigger from "@/component/common/dropdown-date-trigger";
import DropdownNotification, {
  DropdownNotificationItem,
} from "@/component/common/dropdown-notification";
import DropdownProfile from "@/component/common/dropdown-profile";
import Filter from "@/component/common/filter";
import Sort from "@/component/common/sort";
import { useState } from "react";

const SERVICE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "SMALL", label: "소형이사" },
  { value: "FAMILY", label: "가정이사" },
  { value: "OFFICE", label: "사무실이사" },
];

const REGION_COLUMNS: [{ value: string; label: string }[], { value: string; label: string }[]] = [
  [
    { value: "ALL", label: "전체" },
    { value: "GYEONGGI", label: "경기" },
    { value: "GANGWON", label: "강원" },
    { value: "CHUNGNAM", label: "충남" },
    { value: "DAEJEON", label: "대전" },
    { value: "JEONNAM", label: "전남" },
    { value: "GYEONGBUK", label: "경북" },
    { value: "BUSAN", label: "부산" },
  ],
  [
    { value: "SEOUL", label: "서울" },
    { value: "INCHEON", label: "인천" },
    { value: "CHUNGBUK", label: "충북" },
    { value: "SEJONG", label: "세종" },
    { value: "JEONBUK", label: "전북" },
    { value: "GWANGJU", label: "광주" },
    { value: "GYEONGNAM", label: "경남" },
    { value: "JEJU", label: "제주" },
  ],
];

const SORT_OPTIONS = [
  { value: "review", label: "리뷰 많은순" },
  { value: "rating", label: "평점 높은순" },
  { value: "career", label: "경력 높은순" },
  { value: "confirmed", label: "확정 많은순" },
];

const SORT_OPTIONS_REQUEST = [
  { value: "rating", label: "평점 높은순" },
  { value: "movingDate", label: "이사 빠른순" },
  { value: "requestDate", label: "요청일 빠른순" },
];

const PROFILE_OPTIONS = [
  { value: "edit", label: "프로필 수정" },
  { value: "favorite", label: "찜한 기사님" },
  { value: "review", label: "이사 리뷰" },
  { value: "logout", label: "로그아웃", tone: "muted" as const },
];

const PROFILE_OPTIONS_MOVER = [
  { value: "mypage", label: "마이페이지" },
  { value: "logout", label: "로그아웃", tone: "muted" as const },
];

/** 임시 프리뷰 — Dropdown / Filter / Sort 시각 확인용 */
export default function DropdownFilterSortPreviewPage() {
  const [serviceSm, setServiceSm] = useState("ALL");
  const [serviceMd, setServiceMd] = useState("ALL");
  const [regionSm, setRegionSm] = useState("ALL");
  const [regionMd, setRegionMd] = useState("ALL");
  const [sortSm, setSortSm] = useState("review");
  const [sortMd, setSortMd] = useState("review");
  const [sortRequestSm, setSortRequestSm] = useState("rating");
  const [sortRequestMd, setSortRequestMd] = useState("rating");
  const [dateOpen, setDateOpen] = useState(false);
  const [profileAction, setProfileAction] = useState("");

  return (
    <main className="bg-background-200 tablet:px-12 pc:px-20 min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-300 flex-col gap-12">
        <header className="flex flex-col gap-2">
          <p className="text-14 font-medium text-orange-400">DEV PREVIEW</p>
          <h1 className="text-24 text-black-500 font-bold">Dropdown / Filter / Sort</h1>
          <p className="text-16 text-black-100">
            공통 컴포넌트 임시 확인 페이지 — 작업 확인 후 삭제해도 됩니다.
          </p>
        </header>

        {/* Filter */}
        <section className="pc:p-10 flex flex-col gap-6 overflow-visible rounded-2xl bg-gray-50 p-6 shadow-sm">
          <div>
            <h2 className="text-20 text-black-500 font-bold">Filter</h2>
            <p className="text-14 mt-1 text-gray-500">
              서비스: {serviceMd} / 지역: {regionMd}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">size=sm · layout=single</p>
              <div className="flex flex-wrap gap-4">
                <Filter
                  size="sm"
                  options={SERVICE_OPTIONS}
                  value={serviceSm}
                  onChange={setServiceSm}
                />
              </div>
            </div>

            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">size=md · layout=single</p>
              <div className="flex flex-wrap gap-4">
                <Filter
                  size="md"
                  options={SERVICE_OPTIONS}
                  value={serviceMd}
                  onChange={setServiceMd}
                />
              </div>
            </div>

            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">size=sm · layout=double</p>
              <div className="flex flex-wrap gap-4">
                <Filter
                  layout="double"
                  size="sm"
                  columns={REGION_COLUMNS}
                  value={regionSm}
                  onChange={setRegionSm}
                />
              </div>
            </div>

            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">size=md · layout=double</p>
              <div className="flex flex-wrap gap-4">
                <Filter
                  layout="double"
                  size="md"
                  columns={REGION_COLUMNS}
                  value={regionMd}
                  onChange={setRegionMd}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sort */}
        <section className="pc:p-10 flex flex-col gap-6 rounded-2xl bg-gray-50 p-6 shadow-sm">
          <div>
            <h2 className="text-20 text-black-500 font-bold">Sort</h2>
            <p className="text-14 mt-1 text-gray-500">
              기사님 찾기: {sortMd} / 받은 요청: {sortRequestMd}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">기사님 찾기 · size=sm</p>
              <Sort size="sm" options={SORT_OPTIONS} value={sortSm} onChange={setSortSm} />
            </div>
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">기사님 찾기 · size=md</p>
              <Sort size="md" options={SORT_OPTIONS} value={sortMd} onChange={setSortMd} />
            </div>
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">
                받은 요청 · size=sm (평점 / 이사 / 요청일)
              </p>
              <Sort
                size="sm"
                options={SORT_OPTIONS_REQUEST}
                value={sortRequestSm}
                onChange={setSortRequestSm}
              />
            </div>
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">
                받은 요청 · size=md (평점 / 이사 / 요청일)
              </p>
              <Sort
                size="md"
                options={SORT_OPTIONS_REQUEST}
                value={sortRequestMd}
                onChange={setSortRequestMd}
              />
            </div>
          </div>
        </section>

        {/* 조합 */}
        <section className="pc:p-10 flex flex-col gap-6 rounded-2xl bg-gray-50 p-6 shadow-sm">
          <h2 className="text-20 text-black-500 font-bold">조합 (기사님 찾기 툴바)</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Filter size="md" options={SERVICE_OPTIONS} value={serviceMd} onChange={setServiceMd} />
            <Filter
              layout="double"
              size="md"
              columns={REGION_COLUMNS}
              value={regionMd}
              onChange={setRegionMd}
            />
            <div className="ml-auto">
              <Sort size="md" options={SORT_OPTIONS} value={sortMd} onChange={setSortMd} />
            </div>
          </div>
          <div className="tablet:hidden flex flex-wrap items-center gap-3">
            <Filter size="sm" options={SERVICE_OPTIONS} value={serviceSm} onChange={setServiceSm} />
            <Filter
              layout="double"
              size="sm"
              columns={REGION_COLUMNS}
              value={regionSm}
              onChange={setRegionSm}
            />
            <div className="ml-auto">
              <Sort size="sm" options={SORT_OPTIONS} value={sortSm} onChange={setSortSm} />
            </div>
          </div>
        </section>

        {/* Dropdown */}
        <section className="pc:p-10 flex flex-col gap-6 rounded-2xl bg-gray-50 p-6 shadow-sm">
          <div>
            <h2 className="text-20 text-black-500 font-bold">Dropdown</h2>
            <p className="text-14 mt-1 text-gray-500">프로필 액션: {profileAction || "-"}</p>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">DropdownDateTrigger</p>
              <div className="max-w-130">
                <DropdownDateTrigger
                  displayValue="2024년 7월 1일"
                  open={dateOpen}
                  onOpenChange={setDateOpen}
                >
                  {/* 위치·크기·z-index는 DatePicker 담당 — 아래는 프리뷰용 임시 슬롯 */}
                  <div className="border-line-200 text-14 absolute top-full left-0 z-10 mt-2 w-full rounded-xl border bg-gray-50 p-4 text-gray-500">
                    DatePicker 슬롯 (해당 도메인 담당자 혹은 DatePicker 담당자가 연동)
                  </div>
                </DropdownDateTrigger>
              </div>
            </div>

            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">DropdownProfile (패널만)</p>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-13 mb-3 font-medium text-gray-500">고객님</p>
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-13 font-medium text-gray-500">size=sm</p>
                      <DropdownProfile
                        size="sm"
                        header="김가나 고객님"
                        options={PROFILE_OPTIONS}
                        closeOnOutsideClick={false}
                        onChange={setProfileAction}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-13 font-medium text-gray-500">size=md</p>
                      <DropdownProfile
                        size="md"
                        header="김가나 고객님"
                        options={PROFILE_OPTIONS}
                        closeOnOutsideClick={false}
                        onChange={setProfileAction}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-13 mb-3 font-medium text-gray-500">기사님</p>
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-13 font-medium text-gray-500">size=sm</p>
                      <DropdownProfile
                        size="sm"
                        header="김코드 기사님"
                        options={PROFILE_OPTIONS_MOVER}
                        closeOnOutsideClick={false}
                        onChange={setProfileAction}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-13 font-medium text-gray-500">size=md</p>
                      <DropdownProfile
                        size="md"
                        header="김코드 기사님"
                        options={PROFILE_OPTIONS_MOVER}
                        closeOnOutsideClick={false}
                        onChange={setProfileAction}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-14 text-black-200 mb-3 font-semibold">
                DropdownNotification (패널만)
              </p>
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-13 font-medium text-gray-500">size=md</p>
                  <DropdownNotification size="md" header="알림" closeOnOutsideClick={false}>
                    <DropdownNotificationItem
                      size="md"
                      message={
                        <>
                          김코드 기사님의 <span className="text-orange-400">소형이사 견적</span>이
                          도착했어요.
                        </>
                      }
                      timeLabel="2시간 전"
                    />
                    <DropdownNotificationItem
                      size="md"
                      message={
                        <>
                          김코드 기사님의 견적이 <span className="text-orange-400">확정</span>
                          되었어요.
                        </>
                      }
                      timeLabel="3시간 전"
                    />
                    <DropdownNotificationItem
                      size="md"
                      message={
                        <>
                          내일은{" "}
                          <span className="text-orange-400">
                            경기(일산) → 서울(영등포) 이사 예정일
                          </span>
                          이에요.
                        </>
                      }
                      timeLabel="5시간 전"
                    />
                  </DropdownNotification>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-13 font-medium text-gray-500">size=sm</p>
                  <DropdownNotification size="sm" header="알림" closeOnOutsideClick={false}>
                    <DropdownNotificationItem
                      size="sm"
                      message={
                        <>
                          김코드 기사님의 <span className="text-orange-400">소형이사 견적</span>이
                          도착했어요.
                        </>
                      }
                      timeLabel="2시간 전"
                    />
                    <DropdownNotificationItem
                      size="sm"
                      message={
                        <>
                          김코드 기사님의 견적이 <span className="text-orange-400">확정</span>
                          되었어요.
                        </>
                      }
                      timeLabel="3시간 전"
                    />
                    <DropdownNotificationItem
                      size="sm"
                      message={
                        <>
                          내일은{" "}
                          <span className="text-orange-400">
                            경기(일산) → 서울(영등포) 이사 예정일
                          </span>
                          이에요.
                        </>
                      }
                      timeLabel="5시간 전"
                    />
                  </DropdownNotification>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
