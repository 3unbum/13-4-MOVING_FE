import SubHeader from "@/components/common/SubHeader";

const MOCK = {
  userId: 63,
  category: "HOME",
  movingDate: "2026-12-25T00:00:00.000Z",
  fromPostalCode: "06134",
  fromRegion: "SEOUL",
  fromAddress: "서울특별시 강남구 테헤란로 123",
  fromDetailAddress: "101동 202호",
  toPostalCode: "13529",
  toRegion: "GYEONGGI",
  toAddress: "경기도 성남시 분당구 판교역로 235",
  toDetailAddress: "303동 404호",
  quotationStatus: "PENDING",
  createdAt: "2026-09-09T00:47:07.065Z",
  updatedAt: "2026-09-09T00:47:07.065Z",
} as const;

export default function Page() {
  return (
    <div className="flex flex-col gap-20">
      <section className="w-full">
        <h1 className="text-16 text-gray-gray-400 ml-6">sub-header lg사이즈</h1>
        <div className="bg-background-200 w-full">
          <SubHeader
            size="lg"
            category={MOCK.category}
            createdAt={MOCK.createdAt}
            fromAddress={MOCK.fromAddress}
            toAddress={MOCK.toAddress}
            movingDate={MOCK.movingDate}
          />
        </div>
      </section>
      <section className="w-186">
        <h2 className="text-16 text-gray-gray-400 ml-6">sub-header md사이즈</h2>
        <div className="bg-background-200 w-186">
          <SubHeader
            size="md"
            category={MOCK.category}
            createdAt={MOCK.createdAt}
            fromAddress={MOCK.fromAddress}
            toAddress={MOCK.toAddress}
            movingDate={MOCK.movingDate}
          />
        </div>
      </section>
      <section className="w-93.75">
        <h3 className="text-16 text-gray-gray-400 ml-6">sub-header sm사이즈</h3>
        <div className="bg-background-200 w-93.75">
          <SubHeader
            size="sm"
            category={MOCK.category}
            createdAt={MOCK.createdAt}
            fromAddress={MOCK.fromAddress}
            toAddress={MOCK.toAddress}
            movingDate={MOCK.movingDate}
          />
        </div>
      </section>
    </div>
  );
}
