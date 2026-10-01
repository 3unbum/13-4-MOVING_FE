import MoversPageClient from "./_components/MoversPageClient";
import { parseMoverListSearchParams } from "@/lib/utils/mover-list-url-filters";

export default async function MoversPage({ searchParams }: PageProps<"/[locale]/movers">) {
  const params = await searchParams;

  return <MoversPageClient initialFilters={parseMoverListSearchParams(params)} />;
}
