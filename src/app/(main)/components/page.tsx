"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

const COMPONENT_ROUTES = [
  { label: "Button", slug: "button" },
  { label: "Card List", slug: "card-list" },
  { label: "Chip", slug: "chip" },
  { label: "Date Picker", slug: "date-picker" },
  { label: "Dropdown / Filter / Sort", slug: "dropdown-filter-sort" },
  { label: "GNB", slug: "gnb" },
  { label: "Header", slug: "header" },
  { label: "Input", slug: "input" },
  { label: "Modal / Popup", slug: "modal-popup" },
  { label: "Pagination", slug: "pagination" },
  { label: "Progress Bar", slug: "progress-bar" },
  { label: "Select Card", slug: "select-card" },
  { label: "Sub Header", slug: "sub-header" },
  { label: "Tab", slug: "tab" },
];

export default function ComponentsIndexPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-6">
      <div className="flex w-[240px] flex-col gap-2">
        {COMPONENT_ROUTES.map(({ label, slug }) => (
          <Button
            key={slug}
            variant="outlined"
            size="xs"
            onClick={() => router.push(`/components/${slug}`)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
