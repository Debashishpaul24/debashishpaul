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

-- 6. Add real-time publication for menu items & reviews
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
END $$;
