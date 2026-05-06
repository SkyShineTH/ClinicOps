const baseUrl = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const token = process.env.STAFF_API_TOKEN?.trim();

const headers = {
  "Content-Type": "application/json",
  ...(token ? { "x-staff-demo-token": token } : {}),
};

async function request(path, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function createPatchDelete(collectionPath, itemPath, createBody, patchBody) {
  const created = await request(collectionPath, {
    method: "POST",
    body: JSON.stringify(createBody),
  });
  const id = created.item?.id;
  if (!id) throw new Error(`${collectionPath} did not return item.id`);

  if (patchBody) {
    await request(`${itemPath}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patchBody),
    });
  }

  await request(`${itemPath}/${id}`, { method: "DELETE" });
}

await request("/api/ready");

await createPatchDelete(
  "/api/staff/inventory",
  "/api/staff/inventory",
  {
    sku: "SMK-TEST",
    nameTh: "รายการทดสอบ smoke",
    nameEn: "Smoke test item",
    category: "ทดสอบ",
    qty: 3,
    par: 1,
    supplier: "Smoke",
    location: "Test shelf",
  },
  { delta: 2 },
);

await createPatchDelete(
  "/api/staff/pipeline",
  "/api/staff/pipeline",
  {
    name: "คุณ Smoke",
    phoneLast4: "1234",
    stage: "สอบถาม",
    valueThb: 1000,
    source: "smoke",
    note: "test",
  },
  { stage: "เสนอราคา" },
);

await createPatchDelete(
  "/api/staff/marketing",
  "/api/staff/marketing",
  {
    name: "Smoke campaign",
    channel: "Smoke",
    spendThb: 100,
    leads: 2,
    conversions: 1,
    status: "draft",
    notes: "test",
  },
  { status: "active" },
);

await createPatchDelete(
  "/api/staff/schedule",
  "/api/staff/schedule",
  {
    dateYmd: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    endTime: "10:30",
    patientLabel: "คุณ Smoke",
    service: "ตรวจระบบ",
    room: "ห้อง Test",
    provider: "ทดสอบ",
    branch: "สยาม",
    status: "รอเข้าพบ",
  },
  { status: "เสร็จสิ้น" },
);

const clinical = await request("/api/staff/clinical-visits", {
  method: "POST",
  body: JSON.stringify({
    hn: "HN-SMOKE",
    patientLabel: "คุณ Smoke",
    visitedAt: new Date().toISOString(),
    provider: "ทดสอบ",
    branch: "สยาม",
    summary: "smoke test",
    consentFlags: [],
  }),
});
const clinicalId = clinical.item?.id;
if (!clinicalId) throw new Error("clinical smoke did not return item.id");
await request(`/api/staff/clinical-visits/${clinicalId}/note`, {
  method: "PATCH",
  body: JSON.stringify({ note: "smoke note" }),
});
await request(`/api/staff/clinical-visits/${clinicalId}`, { method: "DELETE" });

const user = await request("/api/staff/users", {
  method: "POST",
  body: JSON.stringify({
    name: "Smoke User",
    email: `smoke-${Date.now()}@clinic.local`,
    role: "หน้าร้าน",
    branch: "สยาม",
  }),
});
const userId = user.item?.id;
if (!userId) throw new Error("user smoke did not return item.id");
await request(`/api/staff/permissions/${userId}/admin`, {
  method: "PATCH",
  body: JSON.stringify({ enabled: true }),
});
await request(`/api/staff/users/${userId}`, { method: "DELETE" });

console.log("Staff smoke flow passed");
