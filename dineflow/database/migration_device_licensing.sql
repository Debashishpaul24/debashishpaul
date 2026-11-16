-- ==============================================================================
-- DINEFLOW COMMERCIAL LICENSING & ANTI-PIRACY MIGRATION
-- Adds active device sessions, hardware fingerprint tracking, device quotas,
-- and Debashish Paul Creator HQ telemetry enforcement.
-- ==============================================================================

-- 1. Add licensing columns to tenants if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'allowed_devices') THEN
        ALTER TABLE tenants ADD COLUMN allowed_devices INT DEFAULT 3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'subscription_status') THEN
        ALTER TABLE tenants ADD COLUMN subscription_status VARCHAR(32) DEFAULT 'active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'valid_until') THEN
        ALTER TABLE tenants ADD COLUMN valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'owner_name') THEN
        ALTER TABLE tenants ADD COLUMN owner_name VARCHAR(128) DEFAULT 'Restaurant Owner';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'license_key') THEN
        ALTER TABLE tenants ADD COLUMN license_key VARCHAR(128) DEFAULT 'DF-PRO-2026-LIVE';
    END IF;
END $$;

-- 2. Create Active Device Sessions Table
CREATE TABLE IF NOT EXISTS active_device_sessions (
    id VARCHAR(128) PRIMARY KEY,                         -- Unique hardware fingerprint hash
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    device_name VARCHAR(128) NOT NULL,                   -- e.g. "Main Kitchen KDS Display", "Cashier POS"
    browser VARCHAR(64),                                 -- e.g. "Chrome 122", "Edge 121"
    os VARCHAR(64),                                      -- e.g. "Windows 11", "iPadOS"
    screen_res VARCHAR(32),                              -- e.g. "1920x1080", "412x915"
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    staff_id VARCHAR(64),                                -- Last staff account active on device
    staff_name VARCHAR(128),
    role VARCHAR(32) DEFAULT 'STAFF',                    -- 'STAFF' | 'OWNER' | 'KDS' | 'POS'
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,                    -- Remote killswitch status
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE active_device_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'active_device_sessions' AND policyname = 'Public read active_device_sessions') THEN
        CREATE POLICY "Public read active_device_sessions" ON active_device_sessions FOR SELECT USING (TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'active_device_sessions' AND policyname = 'Staff insert active_device_sessions') THEN
        CREATE POLICY "Staff insert active_device_sessions" ON active_device_sessions FOR INSERT WITH CHECK (TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'active_device_sessions' AND policyname = 'Staff update active_device_sessions') THEN
        CREATE POLICY "Staff update active_device_sessions" ON active_device_sessions FOR UPDATE USING (TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'active_device_sessions' AND policyname = 'Staff delete active_device_sessions') THEN
        CREATE POLICY "Staff delete active_device_sessions" ON active_device_sessions FOR DELETE USING (TRUE);
    END IF;
END $$;

-- 4. Enable Supabase Realtime CDC for active_device_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'active_device_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE active_device_sessions;
    END IF;
END $$;

-- 5. Seed initial device session tracking for active demo outlets
UPDATE tenants SET 
    allowed_devices = 5,
    subscription_status = 'active',
    owner_name = 'Chef Vikram Rao',
    license_key = 'DF-URBAN-PLATE-ENT-2026'
WHERE id = 'the-urban-plate';

UPDATE tenants SET 
    allowed_devices = 3,
    subscription_status = 'active',
    owner_name = 'Marco Rossi',
    license_key = 'DF-BELLA-VISTA-BIZ-2026'
WHERE id = 'bella-vista';

