-- AlterTable: Add AI Experience Labs fields to Opportunity
ALTER TABLE "Opportunity"
  ADD COLUMN IF NOT EXISTS "contactName"         TEXT,
  ADD COLUMN IF NOT EXISTS "contactTitle"        TEXT,
  ADD COLUMN IF NOT EXISTS "contactEmail"        TEXT,
  ADD COLUMN IF NOT EXISTS "trinamixOwner"       TEXT,
  ADD COLUMN IF NOT EXISTS "dealRating"          INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "copyOracle"          BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailOwner"          TEXT,
  ADD COLUMN IF NOT EXISTS "interestedScenarios" TEXT[],
  ADD COLUMN IF NOT EXISTS "followUpNotes"       TEXT,
  ADD COLUMN IF NOT EXISTS "urgentNotes"         TEXT,
  ADD COLUMN IF NOT EXISTS "lastReviewed"        TIMESTAMP(3);
