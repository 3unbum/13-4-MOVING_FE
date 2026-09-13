import ProgressBar from "@/components/common/ProgressBar";

const integerAverageData = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 30,
  totalCount: 30,
};

const decimalAverageData = {
  "1": 0,
  "2": 0,
  "3": 20,
  "4": 30,
  "5": 50,
  totalCount: 100,
};

const lowAverageData = {
  "1": 12,
  "2": 8,
  "3": 3,
  "4": 1,
  "5": 1,
  totalCount: 25,
};

const noReviewData = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  totalCount: 0,
};

export default function ProgressBarPage() {
  return (
    <div className="mt-30 flex w-full flex-col gap-16 px-20">
      <section className="max-w-7xl">
        <h2 className="text-14 mb-3 font-semibold text-gray-500">평균 정수 단위 (5.0)</h2>
        <div className="bg-background-200 rounded-2xl p-6">
          <ProgressBar data={integerAverageData} />
        </div>
      </section>
      <section className="max-w-7xl">
        <h2 className="text-14 mb-3 font-semibold text-gray-500">평균 소수점 단위 (4.3)</h2>
        <div className="bg-background-200 rounded-2xl p-6">
          <ProgressBar data={decimalAverageData} />
        </div>
      </section>
      <section className="max-w-7xl">
        <h2 className="text-14 mb-3 font-semibold text-gray-500">저평점 다수</h2>
        <div className="bg-background-200 rounded-2xl p-6">
          <ProgressBar data={lowAverageData} />
        </div>
      </section>
      <section className="max-w-7xl">
        <h2 className="text-14 mb-3 font-semibold text-gray-500">리뷰 없음 (0 나누기 방어)</h2>
        <div className="bg-background-200 rounded-2xl p-6">
          <ProgressBar data={noReviewData} />
        </div>
      </section>
    </div>
  );
}
