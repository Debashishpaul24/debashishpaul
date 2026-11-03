-- ==============================================================================
-- DINEFLOW MIGRATION: ENABLE COMPLETE DATABASE PERSISTENCE FOR MANAGEMENT ACTIONS
-- Execute in Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)
-- ==============================================================================

-- 1. TABLES: Allow creating and deleting dining tables from Staff OS
DROP POLICY IF EXISTS "Staff can insert tables" ON tables;
CREATE POLICY "Staff can insert tables" ON tables FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can delete tables" ON tables;
CREATE POLICY "Staff can delete tables" ON tables FOR DELETE USING (TRUE);

-- 2. MENU ITEMS: Allow creating dishes, updating stock (86-ing), and deleting items
DROP POLICY IF EXISTS "Staff can insert menu items" ON menu_items;
CREATE POLICY "Staff can insert menu items" ON menu_items FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can update menu items" ON menu_items;
CREATE POLICY "Staff can update menu items" ON menu_items FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Staff can delete menu items" ON menu_items;
CREATE POLICY "Staff can delete menu items" ON menu_items FOR DELETE USING (TRUE);

-- 3. MENU CATEGORIES: Allow adding and managing categories
DROP POLICY IF EXISTS "Staff can insert categories" ON categories;
CREATE POLICY "Staff can insert categories" ON categories FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can update categories" ON categories;
CREATE POLICY "Staff can update categories" ON categories FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Staff can delete categories" ON categories;
CREATE POLICY "Staff can delete categories" ON categories FOR DELETE USING (TRUE);

-- 4. STAFF ACCOUNTS: Allow onboarding and revoking staff profiles
DROP POLICY IF EXISTS "Staff can insert staff accounts" ON staff_accounts;
CREATE POLICY "Staff can insert staff accounts" ON staff_accounts FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can update staff accounts" ON staff_accounts;
CREATE POLICY "Staff can update staff accounts" ON staff_accounts FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Staff can delete staff accounts" ON staff_accounts;
CREATE POLICY "Staff can delete staff accounts" ON staff_accounts FOR DELETE USING (TRUE);

-- 5. REVIEWS & RATINGS: Ensure guest diners can submit reviews
DROP POLICY IF EXISTS "Guests can submit reviews" ON reviews;
CREATE POLICY "Guests can submit reviews" ON reviews FOR INSERT WITH CHECK (TRUE);

-- 6. OFFERS & PROMO CODES: Allow staff to create, edit, toggle, and delete promo codes
DROP POLICY IF EXISTS "Staff can manage offers" ON offers;
CREATE POLICY "Staff can manage offers" ON offers FOR ALL USING (TRUE);

-- 7. Add real-time publication for menu items, reviews & offers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'offers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE offers;
    END IF;
END $$;

-- 8. SEED PERMANENT VIP FAMILY PASS: PURBA_KRISH (100% OFF)
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-family-purba-krish', 'the-urban-plate', 'PURBA_KRISH', '100% OFF Family Privilege', 'VIP Family Member Pass: 100% full dining privilege for Purba & Krish.', 'percentage', 100, 0, NULL, 'all', '31 Dec 2030', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, value = EXCLUDED.value, is_active = true;
