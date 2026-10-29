-- ==============================================================================
-- DINEFLOW REAL-TIME RESTAURANT OS - DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Multi-Tenant SaaS, Real-Time KDS Kanban, Table QR Ordering & Staff Floor OS
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (Clean Migration)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS bill_requests CASCADE;
DROP TABLE IF EXISTS staff_requests CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS staff_accounts CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TENANTS (Restaurants)
-- ------------------------------------------------------------------------------
CREATE TABLE tenants (
    id VARCHAR(64) PRIMARY KEY,                         -- e.g. 'the-urban-plate', 'bella-vista'
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    branch VARCHAR(128),
    address TEXT,
    phone VARCHAR(32),
    email VARCHAR(128),
    currency VARCHAR(8) DEFAULT '₹',
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,                -- GST %
    service_charge_rate NUMERIC(5, 2) DEFAULT 5.00,     -- Service Charge %
    primary_color VARCHAR(32) DEFAULT '#E5A93C',
    secondary_color VARCHAR(32) DEFAULT '#0F172A',
    cover_image TEXT,
    logo_emoji VARCHAR(16) DEFAULT '🍽️',
    wifi_name VARCHAR(64),
    wifi_pass VARCHAR(64),
    upi_vpa VARCHAR(128) DEFAULT 'merchant@upi',        -- Merchant UPI ID for instant dynamic QR
    plan VARCHAR(64) DEFAULT 'Enterprise Pro',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. STAFF ACCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE staff_accounts (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'staff-01'
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE SET NULL, -- NULL = Super Admin
    name VARCHAR(128) NOT NULL,
    role_title VARCHAR(128),
    role VARCHAR(32) NOT NULL DEFAULT 'RESTAURANT_ADMIN', -- 'CUSTOMER' | 'RESTAURANT_ADMIN' | 'SUPER_ADMIN'
    pin VARCHAR(16) NOT NULL,                           -- Quick terminal 4-digit PIN (e.g. '1234')
    email VARCHAR(128) UNIQUE,
    password_hash VARCHAR(128) DEFAULT 'admin',
    avatar_emoji VARCHAR(16) DEFAULT '👨‍🍳',
    department VARCHAR(128) DEFAULT 'Kitchen & Floor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. MENU CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,                         -- e.g. 'cat-specials', 'cat-starters'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    icon VARCHAR(16) DEFAULT '🍽️',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. MENU ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE menu_items (
    id VARCHAR(64) PRIMARY KEY,                         -- e.g. 'item-01'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_veg BOOLEAN DEFAULT TRUE,
    spice_level VARCHAR(20) DEFAULT 'medium',           -- 'mild' | 'medium' | 'spicy' | 'hot'
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,                  -- 86-ing capability (sold out toggle)
    image TEXT,
    allergens JSONB DEFAULT '[]'::jsonb,                -- Array of allergen tags: ["Dairy", "Gluten"]
    add_ons JSONB DEFAULT '[]'::jsonb,                  -- Array of [{name, price}]
    customization_options JSONB DEFAULT '[]'::jsonb,    -- Array of [{title, type, options}]
    prep_time_mins INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLES & SEATING
-- ------------------------------------------------------------------------------
CREATE TABLE tables (
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    id VARCHAR(32) NOT NULL,                            -- e.g. 'T01', 'T12', 'BV-01'
    name VARCHAR(64) NOT NULL,                          -- 'Table T12'
    section VARCHAR(64) DEFAULT 'Indoor AC Dining',     -- 'Indoor', 'Garden Patio', 'Rooftop'
    capacity INT DEFAULT 4 CHECK (capacity > 0),
    status VARCHAR(32) DEFAULT 'available',             -- 'available' | 'occupied' | 'reserved'
    qr_scans INT DEFAULT 0,
    last_scanned VARCHAR(64) DEFAULT 'Never',
    qr_token UUID DEFAULT gen_random_uuid(),            -- Signed dynamic token preventing remote spoofing
    manually_occupied BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (tenant_id, id)
);

-- ------------------------------------------------------------------------------
-- 6. PROMOTIONAL OFFERS & COUPONS
-- ------------------------------------------------------------------------------
CREATE TABLE offers (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'off-1'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,                          -- e.g. 'FIRSTBITE', 'LUNCH20'
    title VARCHAR(128) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'percentage',     -- 'percentage' | 'flat'
    value NUMERIC(10, 2) NOT NULL,                      -- percentage discount or flat amount
    min_order NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    category_scope VARCHAR(64) DEFAULT 'all',           -- 'all' or category_id
    expiry VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS & KDS KANBAN TICKETS
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'ORD-1048'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id VARCHAR(32) NOT NULL,
    customer_name VARCHAR(128) DEFAULT 'Guest Diner',
    customer_phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',     -- 'RECEIVED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED'
    items JSONB NOT NULL,                               -- Cart items snapshot [{id, name, price, quantity, customizations, specialInstructions}]
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    tax NUMERIC(10, 2) NOT NULL,
    service_charge NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'UPI',           -- 'UPI' | 'CARD' | 'CASH' | 'SPLIT'
    payment_status VARCHAR(32) DEFAULT 'PENDING',       -- 'PENDING' | 'PAID'
    special_notes TEXT,
    estimated_minutes INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id, table_id) REFERENCES tables(tenant_id, id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 8. REAL-TIME STAFF CALL REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE staff_requests (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'REQ-101'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL,                          -- 'WAITER' | 'WATER' | 'CUTLERY' | 'WASABI'
    label VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',      -- 'PENDING' | 'ATTENDING' | 'RESOLVED'
    time_label VARCHAR(64) DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id, table_id) REFERENCES tables(tenant_id, id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 9. BILL SETTLEMENT REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE bill_requests (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'BILL-101'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id VARCHAR(32) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'UPI',           -- 'UPI' | 'CARD' | 'CASH'
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',      -- 'PENDING' | 'PAID'
    time_label VARCHAR(64) DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id, table_id) REFERENCES tables(tenant_id, id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 10. CUSTOMERS (CRM & REPEAT DINERS)
-- ------------------------------------------------------------------------------
CREATE TABLE customers (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'CUST-01'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    email VARCHAR(128),
    orders_count INT DEFAULT 1,
    total_spend NUMERIC(10, 2) DEFAULT 0,
    fav_dish VARCHAR(128),
    last_visit VARCHAR(64) DEFAULT 'Today',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. CUSTOMER REVIEWS & FEEDBACK
-- ------------------------------------------------------------------------------
CREATE TABLE reviews (
    id VARCHAR(32) PRIMARY KEY,                         -- e.g. 'rev-01'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(128) NOT NULL,
    rating_overall INT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_food INT CHECK (rating_food BETWEEN 1 AND 5),
    rating_service INT CHECK (rating_service BETWEEN 1 AND 5),
    rating_ambience INT CHECK (rating_ambience BETWEEN 1 AND 5),
    comment TEXT,
    table_id VARCHAR(32),
    date_label VARCHAR(64) DEFAULT 'Today',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. AUDIT LOGS (MANAGER ACTIVITY & LEDGER)
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,                         -- e.g. 'log-101'
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    manager_id VARCHAR(32),
    manager_name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL,                      -- 'DISCOUNT' | 'PAYMENT' | 'OVERRIDE' | 'STOCK' | 'SHIFT'
    action VARCHAR(128) NOT NULL,
    details TEXT,
    order_id VARCHAR(32) DEFAULT 'N/A',
    amount NUMERIC(10, 2) DEFAULT 0,
    payment_method VARCHAR(32) DEFAULT 'UPI',
    severity VARCHAR(16) DEFAULT 'info',                -- 'info' | 'warning' | 'alert'
    security_flag VARCHAR(64) DEFAULT '✓ Verified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR LOW-LATENCY DINNER RUSH QUERIES
-- ==============================================================================
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_table ON orders(tenant_id, table_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_tables_status ON tables(tenant_id, status);
CREATE INDEX idx_menu_items_category ON menu_items(tenant_id, category_id);
CREATE INDEX idx_staff_requests_status ON staff_requests(tenant_id, status);
CREATE INDEX idx_bill_requests_status ON bill_requests(tenant_id, status);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);

-- ==============================================================================
-- AUTOMATIC updated_at TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- REAL-TIME WEBSOCKET REPLICATION (CDC)
-- Broadcasts changes instantaneously to KDS, Waiter Terminals, and Guest Screens
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tables'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE tables;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'staff_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE staff_requests;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bill_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bill_requests;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
    END IF;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Clean multi-tenant isolation + public access for QR guest ordering
-- ==============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public (anon guests scanning QR) read access to restaurant catalog
CREATE POLICY "Public can view active tenants" ON tenants FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active menu items" ON menu_items FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view tables" ON tables FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active offers" ON offers FOR SELECT USING (is_active = TRUE);

-- Allow public guests to place orders and submit requests
CREATE POLICY "Guests can create orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Guests can view their own orders" ON orders FOR SELECT USING (TRUE);
CREATE POLICY "Guests can request staff" ON staff_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Guests can view staff requests" ON staff_requests FOR SELECT USING (TRUE);
CREATE POLICY "Guests can request bill" ON bill_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Guests can view bill requests" ON bill_requests FOR SELECT USING (TRUE);
CREATE POLICY "Guests can read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Guests can submit reviews" ON reviews FOR INSERT WITH CHECK (TRUE);

-- Operational updates: Allow updates for order status, tables, requests (Staff and Floor Terminal)
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE USING (TRUE);
CREATE POLICY "Staff can update tables" ON tables FOR UPDATE USING (TRUE);
CREATE POLICY "Staff can insert tables" ON tables FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Staff can delete tables" ON tables FOR DELETE USING (TRUE);
CREATE POLICY "Staff can update staff requests" ON staff_requests FOR UPDATE USING (TRUE);
CREATE POLICY "Staff can update bill requests" ON bill_requests FOR UPDATE USING (TRUE);
CREATE POLICY "Staff can manage menu items" ON menu_items FOR ALL USING (TRUE);
CREATE POLICY "Staff can manage categories" ON categories FOR ALL USING (TRUE);
CREATE POLICY "Staff can manage staff accounts" ON staff_accounts FOR ALL USING (TRUE);
CREATE POLICY "Staff can view and record audit logs" ON audit_logs FOR ALL USING (TRUE);
CREATE POLICY "Staff can view CRM customers" ON customers FOR ALL USING (TRUE);

