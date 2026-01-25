-- Add DECLINED status for event registrations
ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'DECLINED';

