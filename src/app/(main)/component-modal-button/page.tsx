import Button from "@/component/common/button";
import ModalButton from "@/component/common/modal-button";

export default function ComponentModalButtonPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          Button size=&quot;md&quot; (60px) vs ModalButton (64px) — solid
        </h2>
        <Button size="md">기존 Button md</Button>
        <ModalButton>ModalButton</ModalButton>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">outlined</h2>
        <Button variant="outlined" size="md">
          기존 Button md
        </Button>
        <ModalButton variant="outlined">ModalButton</ModalButton>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">disabled</h2>
        <Button size="md" disabled>
          기존 Button md
        </Button>
        <ModalButton disabled>ModalButton</ModalButton>
      </section>
    </div>
  );
}
