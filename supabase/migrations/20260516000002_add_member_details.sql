-- Migration: Add phone and birth_date to members table
-- Created At: 2026-05-16

ALTER TABLE dowon.members 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date TEXT;
