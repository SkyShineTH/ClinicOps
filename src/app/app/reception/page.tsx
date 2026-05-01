import { ReceptionBoard } from "@/components/app/ReceptionBoard";

export default function ReceptionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-staff-muted">
          แดชบอร์ด
        </p>
        <h1 className="text-2xl font-semibold text-staff-ink sm:text-3xl">
          หน้าร้าน
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-staff-muted">
          นัด คำขอจองจากเว็บ และกราฟสรุป — ข้อมูลจำลองสำหรับสาธิต
        </p>
      </header>
      <ReceptionBoard />
    </div>
  );
}
