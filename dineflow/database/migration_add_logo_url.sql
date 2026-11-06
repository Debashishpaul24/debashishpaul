-- ==============================================================================
-- DINEFLOW MIGRATION: ADD RESTAURANT LOGO URL COLUMN
-- Execute in Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)
-- Adds logo_url column to tenants table for persistent custom restaurant logos.
-- ==============================================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Notify PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload config';

