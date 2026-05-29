-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "aiStage" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactTitle" TEXT,
ADD COLUMN     "copyOracle" BOOLEAN DEFAULT false,
ADD COLUMN     "dealRating" INTEGER DEFAULT 0,
ADD COLUMN     "emailOwner" TEXT,
ADD COLUMN     "followUpNotes" TEXT,
ADD COLUMN     "interestedScenarios" TEXT[],
ADD COLUMN     "lastReviewed" TIMESTAMP(3),
ADD COLUMN     "trinamixOwner" TEXT,
ADD COLUMN     "urgentNotes" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_occurredAt_idx" ON "AuditLog"("occurredAt");
