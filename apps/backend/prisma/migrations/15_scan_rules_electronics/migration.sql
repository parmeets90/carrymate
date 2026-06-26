-- Broaden electronics coverage for the open-box Smart Scan. The on-device base
-- ML Kit model often labels a laptop/phone/TV with a generic term
-- ("Technology", "Output device", "Personal computer") instead of the specific
-- object name, so a real laptop could pass undetected. Add those generic labels.
-- Idempotent: only insert a label that isn't already present.
INSERT INTO "scan_rules" (id, label, kind, category, active, created_at, updated_at)
SELECT gen_random_uuid(), v.label, 'PROHIBITED', 'electronics', true, now(), now()
FROM (VALUES
  ('phone'),
  ('tablet'),
  ('netbook'),
  ('touchpad'),
  ('keyboard'),
  ('monitor'),
  ('output device'),
  ('display'),
  ('screen'),
  ('technology'),
  ('electronic')
) AS v(label)
WHERE NOT EXISTS (
  SELECT 1 FROM "scan_rules" s WHERE lower(s.label) = v.label
);
