import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { DoctorAvailabilityCalendar } from "@/components/booking/DoctorAvailabilityCalendar";
import { StockFigure } from "@/components/media/StockFigure";
import { servicePhotos } from "@/lib/stock-photos";

export const metadata: Metadata = {
  title: "จองคิวออนไลน์",
  description: "จองนัดทันตกรรม — โหมดสาธิต",
};

export default function BookingPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase text-teal">Clinical Futures booking</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">จองคิวออนไลน์</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
            ขั้นตอนจำลองสำหรับสาธิต — ข้อมูลไม่ใช่คนไข้จริง
          </p>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0">
          {(["veneers", "dsd", "general"] as const).map((id) => (
            <div key={id} className="min-w-[9.5rem] flex-1 sm:min-w-0">
              <StockFigure
                meta={servicePhotos[id]}
                aspectClassName="aspect-[4/3] sm:aspect-[16/10]"
                frameClassName="clinical-frame rounded-[1rem] border border-line bg-line sm:rounded-[1.35rem]"
                imageClassName="transition duration-700 ease-out hover:scale-[1.03]"
                sizes="(max-width: 640px) 10rem, 33vw"
                showCredit={false}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-ink-faint">
          ภาพสต็อกประกอบ ·{" "}
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal"
          >
            Unsplash License
          </a>
        </p>
        <div className="mt-10">
          <BookingWizard />
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <DoctorAvailabilityCalendar />
        </div>
      </div>
    </MarketingShell>
  );
}
