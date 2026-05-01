import type { Metadata } from "next";
import { AppSidebar } from "@/components/app/AppSidebar";
import { DashboardFiltersProvider } from "@/components/app/dashboard-filters-context";
import { MobileStaffNav } from "@/components/app/MobileStaffNav";

export const metadata: Metadata = {
  title: "พนักงาน",
  robots: { index: false, follow: false },
};

export default function StaffAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardFiltersProvider>
      <div className="staff-saas relative isolate flex min-h-screen overflow-hidden bg-staff-canvas text-staff-ink antialiased">
        <div className="clinical-futures-field opacity-70" aria-hidden>
          <div className="clinical-futures-field__raster" />
        </div>
        <AppSidebar />
        <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center border-b border-staff-line bg-staff-surface/88 px-4 backdrop-blur-xl lg:hidden">
            <span className="text-sm font-semibold text-staff-ink">พนักงาน (สาธิต)</span>
          </header>
          <MobileStaffNav />
          <main className="flex-1 p-5 sm:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </DashboardFiltersProvider>
  );
}
