"use client";

import Image from "next/image";
import { Rating } from "next-flex-rating";
import starActive from "@/assets/icons/star-sm-active.svg";
import starDefault from "@/assets/icons/star-sm-default.svg";

interface ReviewDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  totalCount: number;
}

const RATINGS = ["5", "4", "3", "2", "1"] as const;

export default function ProgressBar({ data }: { data: ReviewDistribution }) {
  const average = data.totalCount
    ? RATINGS.reduce<number>((sum, rating) => sum + Number(rating) * data[rating], 0) /
      data.totalCount
    : 0;

  return (
    <>
      <div className="text-16 tablet:text-20 pc:text-20 mb-2 font-semibold">리뷰</div>
      <div className="tablet:flex-row tablet:justify-between flex flex-col gap-1 text-left">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-4.5">
            <p className="text-40 font-medium">{average.toFixed(1)}</p>
            <div>
              <div className="flex">
                <Rating
                  value={average}
                  icon={<Image src={starActive} alt="" width={20} height={20} />}
                  emptyIcon={<Image src={starDefault} alt="" width={20} height={20} />}
                  size={20}
                  readOnly
                />
              </div>
              <p className="text-14 text-gray-gray-500 font-normal">{data.totalCount}개의 리뷰</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {RATINGS.map((rating) => {
            const count = data[rating];
            const percent = data.totalCount ? (count / data.totalCount) * 100 : 0;
            return (
              <section key={rating} className="flex items-center gap-4">
                <span className="text-14 text-black-300 w-9 font-bold">{rating}점</span>
                <div className="bg-background-300 h-2 w-45 rounded-[15px]">
                  <div
                    className="h-full rounded-[15px] bg-yellow-100"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-14 text-gray-gray-300 font-medium">{count}</span>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
