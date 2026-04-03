ALTER TABLE "TeamMember"
ADD COLUMN IF NOT EXISTS "workEmail" TEXT,
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
ADD COLUMN IF NOT EXISTS "employeeActive" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_workEmail_key" ON "TeamMember"("workEmail");

ALTER TABLE "WorkReport"
ALTER COLUMN "authorId" DROP NOT NULL;

ALTER TABLE "WorkReport"
ADD COLUMN IF NOT EXISTS "submittedById" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'WorkReport_submittedById_fkey'
    ) THEN
        ALTER TABLE "WorkReport"
        ADD CONSTRAINT "WorkReport_submittedById_fkey"
        FOREIGN KEY ("submittedById") REFERENCES "TeamMember"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "WorkReport_submittedById_idx" ON "WorkReport"("submittedById");
