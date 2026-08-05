-- Migration: Add auth fields to users table
-- 2026-08-05

BEGIN;

-- Add password hash (bcrypt)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add email verification status and code
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ;

-- Add password reset fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMPTZ;

COMMIT;
