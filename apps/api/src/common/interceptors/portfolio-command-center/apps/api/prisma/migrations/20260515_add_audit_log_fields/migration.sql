-- AlterTable: add user identity and IP tracking fields to AuditLog
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userName"  TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userEmail" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Index on occurredAt for fast time-range queries
CREATE INDEX IF NOT EXISTS "AuditLog_occurredAt_idx" ON "AuditLog"("occurredAt");
