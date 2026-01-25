-- Ensure registration language column exists (safe/idempotent)
ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'sr';

