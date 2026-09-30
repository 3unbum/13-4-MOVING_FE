import { getTranslations } from "next-intl/server";
export default async function Loading() {
  const t = await getTranslations("page");

  return (
    <div
      role="status"
      aria-label={t("loadingLabel")}
      className="flex h-screen w-full items-center justify-center"
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-orange-400 border-t-transparent" />
    </div>
  );
}
