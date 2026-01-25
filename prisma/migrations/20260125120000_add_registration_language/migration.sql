-- Add language used during registration submission (sr/en)
ALTER TABLE "EventRegistration"
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'sr';

