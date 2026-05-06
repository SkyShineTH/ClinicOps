"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { branches, providers, services } from "@/lib/mock-data";
import { PrivacyPolicyModalTrigger } from "@/components/marketing/PrivacyPolicyModal";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const thPhone = /^0[0-9]{9}$/;

export function BookingWizard() {
  const [step, setStep] = useState<Step>(0);
  const [branchId, setBranchId] = useState(branches[0]!.id);
  const [serviceId, setServiceId] = useState(services[0]!.id);
  const [providerId, setProviderId] = useState(providers[0]!.id);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneRef, setDoneRef] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ label: string; iso: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    setSlotIso(null);
    setSlotsLoading(true);

    const controller = new AbortController();
    const params = new URLSearchParams({ branchId, providerId });

    async function loadSlots() {
      try {
        const res = await fetch(`/api/availability/slots?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await res.json()) as { items?: { label: string; iso: string }[] };
        if (!res.ok) throw new Error("failed");
        setSlots(data.items ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSlots([]);
        setError("โหลดช่วงเวลานัดหมายไม่สำเร็จ กรุณาลองใหม่");
      } finally {
        setSlotsLoading(false);
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [branchId, providerId]);

  const branch = branches.find((b) => b.id === branchId)!;
  const service = services.find((s) => s.id === serviceId)!;
  const provider = providers.find((p) => p.id === providerId)!;

  async function submit() {
    setError(null);
    if (!slotIso) {
      setError("กรุณาเลือกวันและเวลา");
      return;
    }
    if (name.trim().length < 2) {
      setError("กรุณากรอกชื่อให้ครบถ้วน");
      return;
    }
    const digits = phone.replace(/\s+/g, "");
    if (!thPhone.test(digits)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก ขึ้นต้น 0)");
      return;
    }
    if (!consent) {
      setError("กรุณายอมรับนโยบายความเป็นส่วนตัว");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch.id,
          branchName: branch.nameTh,
          serviceId: service.id,
          serviceName: service.nameTh,
          providerPreference: providerId === "any" ? null : provider.labelTh,
          slotStart: slotIso,
          patientName: name.trim(),
          phone: digits,
          email: email.trim() || null,
          note: note.trim() || null,
        }),
      });
      const data = (await res.json()) as { item?: { id: string }; error?: string };
      if (!res.ok) {
        setError("เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่หรือติดต่อทาง LINE");
        return;
      }
      setDoneRef(`DEMO-BKK-${data.item?.id?.slice(-6).toUpperCase() ?? "000000"}`);
      setStep(5);
    } catch {
      setError("เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่หรือติดต่อทาง LINE");
    } finally {
      setLoading(false);
    }
  }

  const stepsLabel = [
    "สาขา",
    "บริการ",
    "ทันตแพทย์",
    "วันเวลา",
    "ข้อมูล",
    "เสร็จสิ้น",
  ];
  const progressPct = (step / (stepsLabel.length - 1)) * 100;
  const optionClass = (active: boolean) =>
    `group flex cursor-pointer flex-col rounded-2xl border px-4 py-3.5 transition ${
      active
        ? "border-teal bg-sky-soft/70 shadow-[0_18px_42px_-32px_rgba(8,127,122,0.82)]"
        : "border-line bg-white/70 hover:border-teal/35 hover:bg-white"
    }`;
  const rowOptionClass = (active: boolean) =>
    `group flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3.5 transition ${
      active
        ? "border-teal bg-sky-soft/70 shadow-[0_18px_42px_-32px_rgba(8,127,122,0.82)]"
        : "border-line bg-white/70 hover:border-teal/35 hover:bg-white"
    }`;
  const primaryButtonClass =
    "marketing-pressable clinical-cta inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60";
  const secondaryButtonClass =
    "marketing-pressable inline-flex flex-1 items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-ink hover:border-teal/35 hover:bg-white";
  const inputClass =
    "mt-1 w-full rounded-2xl border border-line bg-white/78 px-4 py-3 text-ink shadow-inner shadow-teal/5 transition focus:border-teal focus:bg-white";

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="clinical-panel h-fit min-w-0 max-w-full overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase text-teal">Booking calibrator</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">จัดคิวนัดหมายแบบแม่นยำ</h2>
        <p className="mt-3 break-words text-sm leading-relaxed text-ink-muted">
          เลือกสาขา บริการ และช่วงเวลาที่เหมาะสม ก่อนส่งคำขอให้ทีมหน้าร้านยืนยันอีกครั้ง
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <dl className="mt-6 min-w-0 space-y-3 text-sm">
          <div className="flex min-w-0 justify-between gap-4 rounded-2xl border border-line bg-white/64 px-4 py-3">
            <dt className="text-ink-muted">สาขา</dt>
            <dd className="min-w-0 break-words text-right font-medium text-ink">{branch.nameTh}</dd>
          </div>
          <div className="flex min-w-0 justify-between gap-4 rounded-2xl border border-line bg-white/64 px-4 py-3">
            <dt className="text-ink-muted">บริการ</dt>
            <dd className="min-w-0 break-words text-right font-medium text-ink">{service.nameTh}</dd>
          </div>
          <div className="flex min-w-0 justify-between gap-4 rounded-2xl border border-line bg-white/64 px-4 py-3">
            <dt className="text-ink-muted">เวลา</dt>
            <dd className="min-w-0 break-words text-right font-medium text-ink">
              {slotIso ? new Date(slotIso).toLocaleString("th-TH") : "ยังไม่เลือก"}
            </dd>
          </div>
        </dl>
      </aside>

      <div className="clinical-card min-w-0 max-w-full rounded-[1.75rem] p-5 sm:p-7">
        <ol className="mb-8 flex flex-wrap gap-2 text-[11px] text-ink-muted sm:text-xs" aria-label="ขั้นตอน">
          {stepsLabel.map((l, i) => (
            <li
              key={l}
              className={`rounded-full px-2.5 py-1 transition ${
                i === step ? "bg-teal text-white" : i < step ? "bg-sky-soft text-teal" : "bg-white/70"
              }`}
            >
              {i + 1}. {l}
            </li>
          ))}
        </ol>

        {error && (
          <p className="mb-4 rounded-2xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">เลือกสาขา</h2>
            {branches.map((b) => (
              <label key={b.id} className={optionClass(branchId === b.id)}>
                <input
                  type="radio"
                  name="branch"
                  className="sr-only"
                  checked={branchId === b.id}
                  onChange={() => setBranchId(b.id)}
                />
                <span className="font-medium text-ink group-hover:text-teal">{b.nameTh}</span>
                <span className="text-sm text-ink-muted">{b.area}</span>
              </label>
            ))}
            <button type="button" className={`${primaryButtonClass} mt-4 w-full`} onClick={() => setStep(1)}>
              ถัดไป
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">เลือกบริการหลัก</h2>
            {services.map((s) => (
              <label key={s.id} className={rowOptionClass(serviceId === s.id)}>
                <span className="font-medium text-ink group-hover:text-teal">{s.nameTh}</span>
                <input
                  type="radio"
                  name="service"
                  checked={serviceId === s.id}
                  onChange={() => setServiceId(s.id)}
                />
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(0)}>
                ย้อนกลับ
              </button>
              <button type="button" className={primaryButtonClass} onClick={() => setStep(2)}>
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">ความต้องการพบทันตแพทย์</h2>
            {providers.map((p) => (
              <label key={p.id} className={rowOptionClass(providerId === p.id)}>
                <span className="text-ink group-hover:text-teal">{p.labelTh}</span>
                <input
                  type="radio"
                  name="provider"
                  checked={providerId === p.id}
                  onChange={() => setProviderId(p.id)}
                />
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(1)}>
                ย้อนกลับ
              </button>
              <button type="button" className={primaryButtonClass} onClick={() => setStep(3)}>
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">เลือกวันและเวลา</h2>
            <p className="text-sm text-ink-muted">
              แสดงเฉพาะวันที่ทันตแพทย์และสาขาที่เลือกเข้างาน — โหมดสาธิต
            </p>
            {slotsLoading && <p className="text-sm text-ink-muted">กำลังโหลดช่วงเวลา…</p>}
            <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {slots.map((s) => (
                <button
                  key={s.iso}
                  type="button"
                  onClick={() => setSlotIso(s.iso)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    slotIso === s.iso
                      ? "border-teal bg-sky-soft/70 text-ink shadow-[0_18px_42px_-32px_rgba(8,127,122,0.82)]"
                      : "border-line bg-white/70 text-ink-muted hover:border-teal/35 hover:bg-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(2)}>
                ย้อนกลับ
              </button>
              <button type="button" className={primaryButtonClass} onClick={() => setStep(4)}>
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">ข้อมูลผู้จอง</h2>
            <div>
              <label className="text-sm font-medium text-ink-muted">ชื่อ-นามสกุล</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-muted">เบอร์โทรศัพท์</label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="0812345678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-muted">อีเมล (ไม่บังคับ)</label>
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-muted">หมายเหตุ</label>
              <textarea className={inputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/64 p-4 text-sm text-ink-muted">
              <input
                id="booking-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 shrink-0"
              />
              <div className="leading-relaxed">
                <label htmlFor="booking-consent" className="cursor-pointer">
                  ข้าพเจ้ายอมรับ
                </label>{" "}
                <PrivacyPolicyModalTrigger className="inline align-baseline text-teal underline hover:text-teal-hover">
                  นโยบายความเป็นส่วนตัว
                </PrivacyPolicyModalTrigger>
                <label htmlFor="booking-consent" className="cursor-pointer">
                  {" "}
                  และเข้าใจว่าการจองเป็นการนัดหมายเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์
                </label>
              </div>
            </div>
            <p className="text-xs text-ink-faint">
              หากต้องการเลื่อนหรือยกเลิกนัด กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง ผ่าน LINE หรือโทรศัพท์สาขา
              (ข้อความตัวอย่าง)
            </p>
            <div className="flex gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(3)}>
                ย้อนกลับ
              </button>
              <button type="button" disabled={loading} className={primaryButtonClass} onClick={() => void submit()}>
                {loading ? "กำลังส่ง…" : "ยืนยันการจอง"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && doneRef && (
          <div className="rounded-[1.5rem] border border-line bg-white/70 p-8 text-center">
            <p className="text-sm font-medium text-teal">ได้รับคำขอแล้ว</p>
            <p className="mt-2 text-2xl font-semibold text-ink">รหัสอ้างอิง {doneRef}</p>
            <p className="mt-4 text-sm text-ink-muted">
              เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันนัด — ในโหมดสาธิต คำขอปรากฏที่แดชบอร์ดหน้าร้าน
            </p>
            <Link href="/" className="marketing-pressable clinical-cta mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white">
              กลับหน้าแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
