-- Add native multi-currency pricing fields to Service
ALTER TABLE "Service"
ADD COLUMN IF NOT EXISTS "priceMinUsd" INTEGER,
ADD COLUMN IF NOT EXISTS "priceMaxUsd" INTEGER,
ADD COLUMN IF NOT EXISTS "priceMinEur" INTEGER,
ADD COLUMN IF NOT EXISTS "priceMaxEur" INTEGER,
ADD COLUMN IF NOT EXISTS "priceMinBdt" INTEGER,
ADD COLUMN IF NOT EXISTS "priceMaxBdt" INTEGER;

-- Backfill USD from legacy fields for compatibility
UPDATE "Service"
SET
  "priceMinUsd" = COALESCE("priceMinUsd", "priceMin"),
  "priceMaxUsd" = COALESCE("priceMaxUsd", "priceMax")
WHERE "priceMinUsd" IS NULL OR "priceMaxUsd" IS NULL;
