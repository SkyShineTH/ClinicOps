"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Package,
  Settings,
  Stethoscope,
} from "lucide-react";

const links = [
  { href: "/app/reception", label: "หน้าร้าน", icon: LayoutDashboard },
  { href: "/app/schedule", label: "ตารางนัด & เก้าอี้", icon: CalendarDays },
  { href: "/app/pipeline", label: "ลีด / ผู้ประสานงาน", icon: Activity },
  { href: "/app/clinical-lite", label: "บันทึกคลินิก (Lite)", icon: Stethoscope },
  { href: "/app/inventory", label: "คลัง / วัสดุ", icon: Package },
  { href: "/app/marketing", label: "การตลาด", icon: BarChart3 },
  { href: "/app/admin", label: "ตั้งค่า", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="relative z-[2] hidden w-64 shrink-0 border-r border-staff-line bg-staff-surface/88 backdrop-blur-xl lg:block">
      <div className="flex h-18 items-center border-b border-staff-line px-5">
        <Link
          href="/app/reception"
          className="text-sm font-semibold text-staff-ink transition hover:text-staff-accent"
        >
          พนักงาน (สาธิต)
        </Link>
      </div>
      <nav className="space-y-1.5 p-3" aria-label="แอปพนักงาน">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`marketing-pressable flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-staff-accent-soft font-medium text-staff-accent shadow-[0_18px_38px_-32px_rgba(8,127,122,0.82)]"
                  : "text-staff-muted hover:bg-white/72 hover:text-staff-ink"
              }`}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-staff-line p-4">
        <Link
          href="/"
          className="text-xs font-medium text-staff-accent transition hover:text-staff-accent-hover"
        >
          ← กลับเว็บไซต์
        </Link>
      </div>
    </aside>
  );
}
