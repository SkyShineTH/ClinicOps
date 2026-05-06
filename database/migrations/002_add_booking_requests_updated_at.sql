ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS booking_requests_status_idx
  ON booking_requests (status);

CREATE INDEX IF NOT EXISTS booking_requests_branch_service_idx
  ON booking_requests (branch_id, service_id);
