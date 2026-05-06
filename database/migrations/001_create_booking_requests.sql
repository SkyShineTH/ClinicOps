CREATE TABLE IF NOT EXISTS booking_requests (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  branch_id text NOT NULL,
  branch_name text NOT NULL,
  service_id text NOT NULL,
  service_name text NOT NULL,
  provider_preference text,
  slot_start timestamptz NOT NULL,
  patient_name text NOT NULL,
  phone text NOT NULL,
  email text,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'reschedule', 'rejected')
  ),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_requests_created_at_idx
  ON booking_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS booking_requests_slot_start_idx
  ON booking_requests (slot_start);

INSERT INTO booking_requests (
  id,
  created_at,
  branch_id,
  branch_name,
  service_id,
  service_name,
  provider_preference,
  slot_start,
  patient_name,
  phone,
  email,
  note,
  status
) VALUES
  (
    'req-seed-1',
    now() - interval '45 minutes',
    'siam',
    'สยาม',
    'veneers',
    'วีเนียร์',
    null,
    now() + interval '1 day',
    'คุณสมหญิง (ตัวอย่าง)',
    '0812345678',
    null,
    'สอบถามเวลาเย็น',
    'pending'
  ),
  (
    'req-seed-2',
    now() - interval '20 hours',
    'thonglor',
    'ทองหล่อ',
    'ortho',
    'จัดฟัน',
    null,
    now() - interval '2 hours',
    'คุณนนท์ (ตัวอย่าง)',
    '0890001122',
    null,
    null,
    'confirmed'
  ),
  (
    'req-seed-3',
    now() - interval '48 hours',
    'ari',
    'อารีย์',
    'implants',
    'รากเทียม',
    null,
    now() - interval '30 hours',
    'คุณแนน (ตัวอย่าง)',
    '0823344556',
    null,
    null,
    'pending'
  )
ON CONFLICT (id) DO NOTHING;
