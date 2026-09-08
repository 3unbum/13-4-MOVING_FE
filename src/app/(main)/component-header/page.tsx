import Header from "@/component/common/header";
export default function Page() {
  const page = ["견적요청", "견적 상세", "찜한 기사님"];
  return (
    <div className="bg-background-background-100">
      <h1 className="text-16 text-gray-gray-400 mt-1 ml-2">Header - lg사이즈</h1>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {page.map((p) => (
          <Header size="lg" key={p}>
            {p}
          </Header>
        ))}
      </section>
      <h2 className="text-16 text-gray-gray-400 mt-1 ml-2">Header - md사이즈</h2>
      <section className="mt-6 flex flex-col gap-x-3.5 gap-y-4.5">
        {page.map((p) => (
          <Header size="md" key={p} className="w-150">
            {p}
          </Header>
        ))}
      </section>
      <h3 className="text-16 text-gray-gray-400 mt-1 ml-2">Header - sm사이즈</h3>
      <section className="mt-6 flex flex-col gap-x-3.5 gap-y-4.5">
        {page.map((p) => (
          <Header size="sm" key={p} className="w-93.75">
            {p}
          </Header>
        ))}
      </section>
    </div>
  );
}
