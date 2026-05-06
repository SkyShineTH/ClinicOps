CREATE TABLE IF NOT EXISTS staff_demo_records (
  module text NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (module, id)
);

CREATE INDEX IF NOT EXISTS staff_demo_records_module_updated_at_idx
  ON staff_demo_records (module, updated_at DESC);
