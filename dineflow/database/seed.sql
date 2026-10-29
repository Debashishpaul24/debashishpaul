-- ==============================================================================
-- DINEFLOW MULTI-TENANT SEED DATABASE (UTF-8)
-- Populates: 3 Restaurants, 23 Categories, 56 Menu Items, 28 Tables,
-- 4 Staff Accounts, 5 Offers, Sample Orders, Staff Calls, CRM & Reviews
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TENANTS (RESTAURANTS)
-- ------------------------------------------------------------------------------
INSERT INTO tenants (id, name, slug, tagline, branch, address, phone, email, currency, tax_rate, service_charge_rate, primary_color, secondary_color, cover_image, logo_emoji, wifi_name, wifi_pass, upi_vpa, plan, status)
VALUES ('the-urban-plate', 'The Urban Plate', 'the-urban-plate', 'Good Food. Great Moments.', 'Kolkata • Sector V', 'Plot 12, Block EP & GP, Sector V, Salt Lake, Kolkata 700091', '+91 98301 23456', 'dine@theurbanplate.in', '₹', 5, 5, '#E5A93C', '#0F172A', 'images/cover-the-urban-plate.jpg', '🍽️', 'UrbanPlate_Guest', 'GoodFood2026', 'theurbanplate@icici', 'Enterprise Pro', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tenants (id, name, slug, tagline, branch, address, phone, email, currency, tax_rate, service_charge_rate, primary_color, secondary_color, cover_image, logo_emoji, wifi_name, wifi_pass, upi_vpa, plan, status)
VALUES ('bella-vista', 'Bella Vista Trattoria', 'bella-vista', 'Authentic Wood-Fired Italian Gastronomy', 'Park Street, Kolkata', '42A Park Street, Kolkata 700016', '+91 98302 98765', 'ciao@bellavista.in', '₹', 5, 7.5, '#10B981', '#1E1B4B', 'images/cover-bella-vista.jpg', '🍕', 'BellaVista_5G', 'PizzaPasta2026', 'bellavista@hdfcbank', 'Growth Tier', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tenants (id, name, slug, tagline, branch, address, phone, email, currency, tax_rate, service_charge_rate, primary_color, secondary_color, cover_image, logo_emoji, wifi_name, wifi_pass, upi_vpa, plan, status)
VALUES ('sakura-asian', 'Sakura Modern Asian', 'sakura-asian', 'Artisanal Sushi & Pan-Asian Wok', 'Ballygunge Circular Road, Kolkata', '18/1 Ballygunge Circular Rd, Kolkata 700019', '+91 98303 54321', 'hello@sakuraasian.in', '₹', 5, 10, '#E11D48', '#0B0F19', 'images/cover-sakura-asian.jpg', '🥢', 'Sakura_VIP', 'SushiTokyo26', 'sakuraasian@kotak', 'Enterprise Pro', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ------------------------------------------------------------------------------
-- 2. STAFF ACCOUNTS
-- ------------------------------------------------------------------------------
INSERT INTO staff_accounts (id, tenant_id, name, role_title, role, pin, email, password_hash, avatar_emoji, department)
VALUES ('staff-01', 'the-urban-plate', 'Chef Vikram Rao', 'Kitchen Operations Manager', 'RESTAURANT_ADMIN', '1234', 'manager@theurbanplate.in', 'admin', '👨‍🍳', 'Kitchen & Floor')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO staff_accounts (id, tenant_id, name, role_title, role, pin, email, password_hash, avatar_emoji, department)
VALUES ('staff-02', NULL, 'Debashish Paul', 'SaaS Platform Super Admin', 'SUPER_ADMIN', '9999', 'debashish@dineflow.io', 'admin', '⚡', 'Platform Operations & HQ')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO staff_accounts (id, tenant_id, name, role_title, role, pin, email, password_hash, avatar_emoji, department)
VALUES ('staff-03', 'bella-vista', 'Marco Rossi', 'Trattoria Floor Manager', 'RESTAURANT_ADMIN', '5678', 'manager@bellavista.in', 'admin', '🍕', 'Italian Cuisine Operations')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO staff_accounts (id, tenant_id, name, role_title, role, pin, email, password_hash, avatar_emoji, department)
VALUES ('staff-04', 'sakura-asian', 'Kenji Sato', 'Izakaya Floor Manager', 'RESTAURANT_ADMIN', '4321', 'manager@sakuraasian.in', 'admin', '🍱', 'Asian Cuisine Operations')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ------------------------------------------------------------------------------
-- 3. MENU CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-specials', 'the-urban-plate', 'Chef''s Specials', '👨‍🍳', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-starters', 'the-urban-plate', 'Starters & Small Plates', '🥟', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-biryani', 'the-urban-plate', 'Biryani & Pulao', '🍲', 30, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-pizza', 'the-urban-plate', 'Gourmet Pizzas', '🍕', 40, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-burgers', 'the-urban-plate', 'Artisanal Burgers', '🍔', 50, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-pasta', 'the-urban-plate', 'Handcrafted Pastas', '🍝', 60, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-mains', 'the-urban-plate', 'Main Course & Curries', '🥘', 70, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-kebabs', 'the-urban-plate', 'Tandoor & Kebabs', '🍢', 80, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-desserts', 'the-urban-plate', 'Decadent Desserts', '🍰', 90, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-beverages', 'the-urban-plate', 'Craft Beverages & Shakes', '🍹', 100, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-antipasti', 'bella-vista', 'Antipasti & Crudo', '🥗', 110, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-pizza', 'bella-vista', 'Woodfired Pizzas', '🍕', 120, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-pasta', 'bella-vista', 'Handmade Pasta & Risotto', '🍝', 130, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-secondi', 'bella-vista', 'Secondi Piatti & Grills', '🥩', 140, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-dolci', 'bella-vista', 'Artisanal Dolci', '🍨', 150, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-bv-vini', 'bella-vista', 'Vini & Italian Mixology', '🍷', 160, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-dimsum', 'sakura-asian', 'Dim Sum & Baos', '🥟', 170, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-sushi', 'sakura-asian', 'Artisanal Nigiri & Maki', '🍣', 180, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-robata', 'sakura-asian', 'Robata Charcoal Skewers', '🍢', 190, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-ramen', 'sakura-asian', 'Ramen Bowls & Noodles', '🍜', 200, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-wok', 'sakura-asian', 'Signature Wok Mains', '🥢', 210, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-desserts', 'sakura-asian', 'Matcha & Sweet Bites', '🍵', 220, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO categories (id, tenant_id, name, icon, sort_order, is_active)
VALUES ('cat-sk-drinks', 'sakura-asian', 'Sake & Asian Mixology', '🍶', 230, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ------------------------------------------------------------------------------
-- 4. TABLES & SEATING
-- ------------------------------------------------------------------------------
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T01', 'Table T01', 'Indoor AC Dining', 2, 'available', 48, '10 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T02', 'Table T02', 'Indoor AC Dining', 2, 'available', 35, '25 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T03', 'Table T03', 'Indoor AC Dining', 4, 'available', 82, 'Just now')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T04', 'Table T04', 'Indoor AC Dining', 4, 'occupied', 64, '5 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T05', 'Table T05', 'Indoor AC Dining', 6, 'available', 41, '1 hr ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T06', 'Table T06', 'Indoor AC Dining', 6, 'available', 59, '15 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T07', 'Table T07', 'Indoor Family Booth', 8, 'occupied', 93, '8 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T08', 'Table T08', 'Indoor Family Booth', 8, 'available', 27, '3 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T09', 'Table T09', 'Garden Patio (Outdoor)', 2, 'available', 52, '45 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T10', 'Table T10', 'Garden Patio (Outdoor)', 2, 'available', 77, '12 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T11', 'Table T11', 'Garden Patio (Outdoor)', 4, 'available', 68, '2 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T12', 'Table T12', 'Garden Patio (Outdoor)', 4, 'occupied', 142, 'Just now')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T13', 'Table T13', 'Rooftop Lounge', 2, 'available', 15, '1 hr ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T14', 'Table T14', 'Rooftop Lounge', 4, 'available', 22, '30 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T15', 'Table T15', 'Rooftop Lounge', 4, 'occupied', 45, '5 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T16', 'Table T16', 'Rooftop Lounge', 6, 'available', 31, '40 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T17', 'Table T17', 'Private Cabana', 6, 'available', 18, '2 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T18', 'Table T18', 'Private Cabana', 8, 'occupied', 56, '15 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T19', 'Table T19', 'Private Cabana', 8, 'occupied', 89, '10 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('the-urban-plate', 'T20', 'Table T20', 'Private Cabana', 10, 'available', 12, '3 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-01', 'Terrazza 01', 'Main Trattoria', 2, 'available', 38, '15 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-02', 'Terrazza 02', 'Main Trattoria', 4, 'occupied', 62, '3 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-03', 'Terrazza 03', 'Main Trattoria', 4, 'available', 29, '40 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-04', 'Patio Fresco 04', 'Patio Fresco', 2, 'available', 44, '1 hr ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-05', 'Patio Fresco 05', 'Patio Fresco', 6, 'occupied', 81, '8 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-06', 'Sala Privata 06', 'Sala Privata', 8, 'available', 19, '2 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-07', 'Cantina 07', 'Wine Cellar', 2, 'available', 53, '25 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('bella-vista', 'BV-08', 'Cantina 08', 'Wine Cellar', 4, 'available', 67, '18 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-01', 'Tatami 01', 'Tatami Room', 4, 'occupied', 42, '5 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-02', 'Tatami 02', 'Tatami Room', 4, 'available', 31, '35 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-03', 'Sushi Bar 03', 'Counter Seating', 2, 'available', 55, '12 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-04', 'Sushi Bar 04', 'Counter Seating', 2, 'available', 63, '20 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-05', 'Zen Dining 05', 'Zen Hall', 6, 'available', 37, '1 hr ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-06', 'Zen Dining 06', 'Zen Hall', 6, 'available', 48, '45 mins ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-07', 'Bamboo Garden 07', 'Outdoor Bamboo', 4, 'available', 22, '3 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO tables (tenant_id, id, name, section, capacity, status, qr_scans, last_scanned)
VALUES ('sakura-asian', 'SK-08', 'Bamboo Garden 08', 'Outdoor Bamboo', 8, 'available', 18, '4 hrs ago')
ON CONFLICT (tenant_id, id) DO UPDATE SET status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 5. PROMOTIONAL OFFERS
-- ------------------------------------------------------------------------------
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-1', 'the-urban-plate', 'LUNCH20', '20% OFF on Mains & Biryanis', 'Valid everyday from 12:00 PM to 4:00 PM on orders above ₹500.', 'percentage', 20, 500, 200, 'cat-biryani', '31 Oct 2026', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-2', 'the-urban-plate', 'FIRSTBITE', 'Flat ₹100 OFF First Order', 'Exclusive welcome treat for first-time digital QR diners.', 'flat', 100, 600, 100, 'all', '30 Nov 2026', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-3', 'bella-vista', 'BELLAPIZZA', 'Buy 1 Gourmet Pizza, Get 50% on 2nd', 'Applies automatically to any two artisanal pizzas in cart.', 'percentage', 25, 700, 250, 'cat-pizza', '15 Nov 2026', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-4', 'bella-vista', 'DOLCE50', 'Flat ₹50 OFF on Italian Desserts', 'Satisfy your sweet tooth with our chef-crafted gourmet desserts.', 'flat', 50, 300, 50, 'cat-desserts', '31 Dec 2026', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO offers (id, tenant_id, code, title, description, type, value, min_order, max_discount, category_scope, expiry, is_active)
VALUES ('off-5', 'sakura-asian', 'SAKURA15', '15% OFF Sushi & Asian Specialties', 'Exclusive dining privilege on orders above ₹800.', 'percentage', 15, 800, 300, 'all', '31 Dec 2026', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- ------------------------------------------------------------------------------
-- 6. MENU ITEMS (56 DISHES ACROSS 3 RESTAURANTS)
-- ------------------------------------------------------------------------------
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-01', 'the-urban-plate', 'cat-specials', 'Royal Dum Handi Chicken Biryani', 'Slow-cooked fragrant aged basmati rice layered with tender marinated chicken, saffron milk, caramelized shallots, and whole roasted garam masala.', 389, false, 'medium', true, true, true, 'images/item-01.jpg', '["Dairy"]'::jsonb, '[
        { "name": "Extra Boneless Chicken", "price": 90 },
        { "name": "Spiced Boiled Egg (2 pcs)", "price": 30 },
        { "name": "Burani Garlic Raita", "price": 45 },
        { "name": "Mirchi Ka Salan Bowl", "price": 40 }
      ]'::jsonb, '[
        { "title": "Choose Spice Level", "type": "radio", "options": ["Mild Fragrant", "Classic Kolkata Medium", "Fiery Hyderabadi Spicy"] }
      ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-02', 'the-urban-plate', 'cat-specials', 'Truffle & Forest Mushroom Risotto', 'Arborio rice slowly simmered in porcini reduction, finished with black winter truffle butter and aged 24-month Parmigiano-Reggiano.', 495, true, 'mild', false, true, true, 'images/item-02.jpg', '["Dairy", "Gluten"]'::jsonb, '[
        { "name": "Extra Shaved Truffle", "price": 120 },
        { "name": "Toasted Garlic Focaccia", "price": 65 }
      ]'::jsonb, '[
        { "title": "Cheese Preference", "type": "radio", "options": ["Standard Aged Parmesan", "Extra Creamy Burrata Top (+₹85)"] }
      ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-03', 'the-urban-plate', 'cat-specials', 'Smoked Butter Garlic Tiger Prawns', 'Jumbo bay prawns tossed in clarified herb butter, roasted garlic flakes, crushed birds-eye chili, and deglazed with lemon zest.', 549, false, 'medium', true, true, true, 'images/item-03.jpg', '["Shellfish", "Dairy"]'::jsonb, '[
        { "name": "Herb Butter Rice", "price": 80 },
        { "name": "Cheesy Garlic Breadsticks", "price": 70 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-04', 'the-urban-plate', 'cat-starters', 'Crispy Corn & Water Chestnut Salt & Pepper', 'Golden fried sweet corn niblets and diced water chestnuts wok-tossed with scallions, cracked pepper, and cilantro.', 249, true, 'mild', true, false, true, 'images/item-04.jpg', '["Gluten"]'::jsonb, '[{ "name": "Spicy Schezwan Dip", "price": 30 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-05', 'the-urban-plate', 'cat-starters', 'Pan-Seared Chicken & Chive Gyoza', 'Delicate steamed dumplings with tender spiced minced chicken, pan-crisped to golden brown with chili sesame dipping oil.', 289, false, 'medium', false, true, true, 'images/item-05.jpg', '["Gluten", "Soy", "Sesame"]'::jsonb, '[{ "name": "Extra Dim Sum Sauce", "price": 25 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-06', 'the-urban-plate', 'cat-starters', 'Cheesy Jalapeño Potato Croquettes', 'Golden panko-crusted Idaho potato spheres filled with melted Monterey Jack, cream cheese, and fiery pickled jalapeños.', 229, true, 'spicy', true, false, true, 'images/item-06.jpg', '["Dairy", "Gluten"]'::jsonb, '[{ "name": "Chipotle Mayo Dip", "price": 35 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-07', 'the-urban-plate', 'cat-biryani', 'Awadhi Mutton Dum Biryani', 'Melt-in-mouth cuts of prime mutton simmered in fragrant brown onion gravy, layered with aged basmati, kewra water, and saffron.', 469, false, 'medium', true, true, true, 'images/item-07.jpg', '["Dairy"]'::jsonb, '[
        { "name": "Extra Mutton Boti (2 pcs)", "price": 140 },
        { "name": "Tandoori Raita", "price": 40 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-08', 'the-urban-plate', 'cat-biryani', 'Zaffrani Subz Biryani (Veg)', 'Garden fresh broccoli, baby corn, French beans, carrots, and cottage cheese infused with cardamom and basmati rice.', 299, true, 'mild', false, false, true, 'images/item-08.jpg', '["Dairy", "Nuts"]'::jsonb, '[
        { "name": "Extra Malai Paneer Cubes", "price": 60 },
        { "name": "Cucumber Mint Raita", "price": 35 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-09', 'the-urban-plate', 'cat-pizza', 'Burrata Margherita Pizza (12-inch)', 'Hand-stretched sourdough crust with San Marzano tomato coulis, fresh buffalo mozzarella, artisanal creamy burrata, and basil.', 429, true, 'mild', true, true, true, 'images/item-09.jpg', '["Gluten", "Dairy"]'::jsonb, '[
        { "name": "Extra Burrata Cheese Ball", "price": 95 },
        { "name": "Sun-Dried Tomatoes & Olives", "price": 50 }
      ]'::jsonb, '[
        { "title": "Crust Choice", "type": "radio", "options": ["Artisanal Thin Sourdough", "Cheese Burst Crust (+₹75)"] }
      ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-10', 'the-urban-plate', 'cat-pizza', 'Fiery BBQ Smoked Chicken Pizza', 'Smoked hickory BBQ glazed shredded chicken breast, red onions, pickled jalapeños, and four-cheese Italian mozzarella blend.', 479, false, 'spicy', true, false, true, 'images/item-10.jpg', '["Gluten", "Dairy"]'::jsonb, '[
        { "name": "Extra Chicken Bacon Strips", "price": 80 },
        { "name": "Garlic Butter Crust Dip", "price": 35 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-11', 'the-urban-plate', 'cat-pizza', 'Quattro Formaggi Bianca', 'White base pizza with roasted garlic olive oil, Gorgonzola dolce, Fontina, Fior di Latte mozzarella, and aged Pecorino.', 460, true, 'mild', false, true, true, 'images/item-11.jpg', '["Gluten", "Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-12', 'the-urban-plate', 'cat-burgers', 'The Big Boss Truffle Smash Burger', 'Double grilled tenderloin patties with molten cheddar, caramelized bourbon onions, black truffle aioli in toasted brioche.', 419, false, 'medium', true, true, true, 'images/item-12.jpg', '["Gluten", "Dairy", "Egg"]'::jsonb, '[
        { "name": "Crispy Peri-Peri Fries", "price": 75 },
        { "name": "Crisp Fried Egg on Top", "price": 25 },
        { "name": "Extra Patty & Cheese", "price": 110 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-13', 'the-urban-plate', 'cat-burgers', 'Nashville Hot Crunchy Chicken Burger', 'Crispy fried chicken thigh dipped in fiery Nashville cayenne chili butter, creamy purple cabbage slaw, and dill pickles.', 369, false, 'spicy', true, false, true, 'images/item-13.jpg', '["Gluten", "Dairy"]'::jsonb, '[{ "name": "Seasoned Potato Wedges", "price": 70 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-14', 'the-urban-plate', 'cat-burgers', 'Herb Halloumi & Roasted Portobello Burger', 'Pan-seared Cypriot halloumi slab, balsamic glazed portobello mushroom cap, baby rocket leaves, and sun-dried tomato pesto.', 349, true, 'mild', false, true, true, 'images/item-14.jpg', '["Gluten", "Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-15', 'the-urban-plate', 'cat-pasta', 'Slow-Simmered Chicken Penne Alfredo', 'Al dente Italian penne tossed in velvety cream sauce of churned European butter, freshly grated parmesan, and herbed grilled chicken.', 379, false, 'mild', true, false, true, 'images/item-15.jpg', '["Gluten", "Dairy"]'::jsonb, '[{ "name": "Toasted Garlic Herb Loaf", "price": 60 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-16', 'the-urban-plate', 'cat-pasta', 'Spaghetti Aglio Olio e Peperoncino', 'Bronze-die spaghetti swirled with extra virgin cold-pressed olive oil, golden garlic slivers, chili flakes, Kalamata olives, and fresh parsley.', 329, true, 'medium', false, true, true, 'images/item-16.jpg', '["Gluten"]'::jsonb, '[{ "name": "Add Grilled Herb Chicken", "price": 75 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-17', 'the-urban-plate', 'cat-mains', 'Dhaba Style Handi Butter Chicken', 'Charcoal-smoked tandoori chicken tikka chunks simmered in a rich tomato, butter, and cashew nut velvet makhani gravy.', 399, false, 'mild', true, true, true, 'images/item-17.jpg', '["Dairy", "Nuts"]'::jsonb, '[
        { "name": "Butter Garlic Naan", "price": 55 },
        { "name": "Laccha Paratha", "price": 45 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-18', 'the-urban-plate', 'cat-mains', 'Paneer Lababdar Awadhi Kadhai', 'Soft cottage cheese batons tossed with roasted bell peppers, crushed coriander seeds, and a lush spiced onion-cashew satin gravy.', 339, true, 'medium', true, false, true, 'images/item-18.jpg', '["Dairy", "Nuts"]'::jsonb, '[{ "name": "Amritsari Kulcha", "price": 65 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-19', 'the-urban-plate', 'cat-mains', 'Dal Makhani Bukhara (Slow Simmered 24-Hrs)', 'Whole black lentils gently slow-cooked overnight over charcoal embers, enriched with fresh white butter and dairy cream.', 299, true, 'mild', true, true, true, 'images/item-19.jpg', '["Dairy"]'::jsonb, '[{ "name": "Tandoori Roti (2 pcs)", "price": 40 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-20', 'the-urban-plate', 'cat-kebabs', 'Bhatti Da Murgh Tangdi (3 pcs)', 'Chicken drumsticks marinated in mustard oil, roasted cumin, hung curd, and stone-ground Kashmiri chilies, char-grilled in clay tandoor.', 389, false, 'spicy', true, false, true, 'images/item-20.jpg', '["Dairy"]'::jsonb, '[{ "name": "Mint Chutney & Laccha Onion", "price": 20 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-21', 'the-urban-plate', 'cat-kebabs', 'Angara Paneer Tikka Shashlik', 'Farm-fresh cottage cheese cubes, sweet bell peppers, and shallots marinated in carom seeds, yogurt, and smoked yellow chili.', 319, true, 'medium', false, true, true, 'images/item-21.jpg', '["Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-22', 'the-urban-plate', 'cat-kebabs', 'Melt-in-Mouth Galouti Kebab with Sheermal', 'Finely minced spiced mutton patties infused with 16 royal spices, served on warm mini saffron sheermal breads.', 449, false, 'mild', true, true, true, 'images/item-22.jpg', '["Dairy", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-23', 'the-urban-plate', 'cat-desserts', 'Belgian Molten Chocolate Lava Cake', 'Warm dark chocolate souffle with a molten Callebaut chocolate center, served with Madagascan vanilla bean ice cream.', 249, true, 'mild', true, true, true, 'images/item-23.jpg', '["Dairy", "Gluten", "Egg"]'::jsonb, '[{ "name": "Extra Scoop Vanilla Gelato", "price": 50 }]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-24', 'the-urban-plate', 'cat-desserts', 'Saffron & Pistachio Shahi Tukda Brioche', 'Crispy butter-fried brioche steeped in cardamom saffron syrup, blanketed with slow-reduced thick rabri and toasted silvered pistachios.', 219, true, 'mild', false, true, true, 'images/item-24.jpg', '["Dairy", "Gluten", "Nuts"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-25', 'the-urban-plate', 'cat-desserts', 'Classic New York Blueberry Cheesecake', 'Creamy Philadelphia cream cheese filling baked over a buttery graham cracker crust, topped with artisanal wild blueberry coulis.', 269, true, 'mild', true, false, true, 'images/item-25.jpg', '["Dairy", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-26', 'the-urban-plate', 'cat-beverages', 'Signature Passionfruit & Basil Mojito', 'Fresh passionfruit pulp muddled with garden sweet basil, lime juice, brown cane sugar, and sparkling club soda over crushed ice.', 189, true, 'mild', true, true, true, 'images/item-26.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-27', 'the-urban-plate', 'cat-beverages', 'Belgian Dark Chocolate Hazelnut Shake', 'Rich dark chocolate gelato whipped with Nutella hazelnut paste, cold milk, topped with roasted hazelnut crumble and chocolate swirl.', 229, true, 'mild', true, false, true, 'images/item-27.jpg', '["Dairy", "Nuts"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-28', 'the-urban-plate', 'cat-beverages', 'Cold Brew Peach Iced Tea', 'Artisanal Darjeeling black tea slow-steeped for 18 hours, infused with natural white peach puree and fresh mint sprigs.', 169, true, 'mild', false, true, true, 'images/item-28.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-29', 'the-urban-plate', 'cat-beverages', 'Freshly Squeezed Valencia Orange & Basil', 'Pure cold-pressed seasonal oranges with chia seeds and subtle touch of pink Himalayan rock salt.', 179, true, 'mild', false, false, true, 'images/item-29.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-30', 'the-urban-plate', 'cat-starters', 'Crispy Calamari Rings with Garlic Aioli', 'Tender squid rings lightly dusted with seasoned semolina, flash-fried till golden, accompanied by roasted garlic saffron mayo.', 369, false, 'mild', false, true, true, 'images/item-30.jpg', '["Shellfish", "Egg", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-31', 'the-urban-plate', 'cat-mains', 'Smoked Dal Tadka with Jeera Rice', 'Yellow arhar lentils tempered with ghee, cumin seeds, garlic, red chilies, and smoked with dhungar method, served with cumin basmati.', 259, true, 'medium', false, false, true, 'images/item-31.jpg', '["Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-32', 'the-urban-plate', 'cat-desserts', 'Artisanal Alphonso Mango Kulfi', 'Dense traditional condensed milk kulfi infused with pure Ratnagiri Alphonso mango pulp, saffron strands, and green cardamom.', 189, true, 'mild', true, false, true, 'images/item-32.jpg', '["Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-01', 'bella-vista', 'cat-bv-pizza', 'Woodfired Margherita Burrata Pizza', 'Slow-fermented sourdough crust topped with San Marzano tomato coulis, fresh Pugliese burrata, sweet basil, and cold-pressed extra virgin olive oil.', 480, true, 'mild', true, true, true, 'images/item-bv-01.jpg', '["Dairy", "Gluten"]'::jsonb, '[
        { "name": "Extra Creamy Burrata Ball", "price": 120 },
        { "name": "Black Summer Truffle Shavings", "price": 150 }
      ]'::jsonb, '[
        { "title": "Crust Preference", "type": "radio", "options": ["Classic Neapolitan Soft", "Thin & Crispy Roman"] }
      ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-02', 'bella-vista', 'cat-bv-pasta', 'Truffle Porcini Fettuccine', 'Hand-rolled fresh egg fettuccine tossed in sautéed wild porcini mushrooms, mountain butter, white truffle oil, and aged Parmigiano-Reggiano.', 410, true, 'mild', true, true, true, 'images/item-bv-02.jpg', '["Dairy", "Gluten", "Eggs"]'::jsonb, '[
        { "name": "Garlic Herb Ciabatta (2 pcs)", "price": 75 },
        { "name": "Grated 36-Month Parmesan", "price": 60 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-03', 'bella-vista', 'cat-bv-pizza', 'Four Cheese Quattro Formaggi', 'White woodfired pizza layered with artisan Fior di Latte, sharp Gorgonzola Dolce, Fontina d’Aosta, and shaved Grana Padano, finished with wild clover honey.', 520, true, 'mild', false, true, true, 'images/item-bv-03.jpg', '["Dairy", "Gluten"]'::jsonb, '[
        { "name": "Caramelized Roasted Walnuts", "price": 60 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-04', 'bella-vista', 'cat-bv-dolci', 'Traditional Espresso Tiramisu', 'Layers of espresso-soaked Savoiardi ladyfingers and cloud-soft whipped mascarpone cream, dusted with dark Valrhona cocoa powder.', 290, true, 'mild', true, true, true, 'images/item-bv-04.jpg', '["Dairy", "Gluten", "Eggs"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-05', 'bella-vista', 'cat-bv-antipasti', 'Prosciutto di Parma Bruschetta', 'Charred rustic sourdough brushed with garlic oil, topped with aged Parma ham, whipped ricotta, fig jam, and micro arugula.', 390, false, 'mild', false, true, true, 'images/item-bv-05.jpg', '["Dairy", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-06', 'bella-vista', 'cat-bv-antipasti', 'Crispy Calamari Fritti', 'Tender Adriatic squid flash-fried in semolina crumb, served with house lemon-caper remoulade and charred Amalfi lemon.', 440, false, 'mild', true, false, true, 'images/item-bv-06.jpg', '["Seafood", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-07', 'bella-vista', 'cat-bv-pasta', 'Classic Tagliolini al Tartufo', 'Delicate ribbon pasta spun in French churned cultured butter with freshly shaved Norcia black truffles and cracked black pepper.', 540, true, 'mild', false, true, true, 'images/item-bv-07.jpg', '["Dairy", "Gluten", "Eggs"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-08', 'bella-vista', 'cat-bv-secondi', 'Slow-Braised Osso Buco alla Milanese', 'Melt-in-mouth tender veal shank slow-simmered in white wine, mirepoix, and veal glaze, served over saffron-infused Risotto alla Milanese.', 680, false, 'mild', true, true, true, 'images/item-bv-08.jpg', '["Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-09', 'bella-vista', 'cat-bv-secondi', 'Pan-Seared Sea Bass Acqua Pazza', 'Mediterranean sea bass fillet pan-seared with sweet cherry tomatoes, capers, Kalamata olives, fresh parsley, and white wine broth.', 620, false, 'mild', false, true, true, 'images/item-bv-09.jpg', '["Seafood"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-10', 'bella-vista', 'cat-bv-dolci', 'Madagascar Vanilla Panna Cotta', 'Silky smooth set vanilla cream served with tart wild forest berry compote and fresh mint sprig.', 260, true, 'mild', false, false, true, 'images/item-bv-10.jpg', '["Dairy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-11', 'bella-vista', 'cat-bv-vini', 'Aperol Spritz Veneziano', 'Classic Italian aperitivo with Venetian Aperol, sparkling Valdobbiadene Prosecco DOCG, splash of club soda, and fresh orange wheel.', 380, true, 'mild', true, true, true, 'images/item-bv-11.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-bv-12', 'bella-vista', 'cat-bv-vini', 'Chianti Classico Riserva (Glass)', 'Tuscan Sangiovese red reserve featuring ruby red hues, violet aromatics, velvety tannins, and notes of ripe cherry and oak.', 490, true, 'mild', false, true, true, 'images/item-bv-12.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-01', 'sakura-asian', 'cat-sk-sushi', 'Salmon & Bluefin Nigiri Combo (8 pcs)', 'Chef selected Norwegian salmon and Pacific bluefin tuna nigiri, lightly torched and brushed with Nikiri glaze, wasabi root and pickled gari.', 680, false, 'mild', true, true, true, 'images/item-sk-01.jpg', '["Seafood", "Soy"]'::jsonb, '[
        { "name": "Fresh Shizuoka Grated Wasabi", "price": 65 },
        { "name": "Miso Shiro Soup Cup", "price": 80 }
      ]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-02', 'sakura-asian', 'cat-sk-ramen', 'Black Garlic Tonkotsu Ramen', '20-hour simmered rich pork bone broth with springy wheat noodles, charred chashu belly, ajitsuke tamago egg, nori, and roasted black garlic oil.', 480, false, 'medium', true, true, true, 'images/item-sk-02.jpg', '["Pork", "Eggs", "Gluten", "Soy"]'::jsonb, '[
        { "name": "Extra Marinated Chashu (2 slices)", "price": 95 },
        { "name": "Ajitsuke Soft-Boiled Egg", "price": 40 },
        { "name": "Extra Noodle Kaedama", "price": 70 }
      ]'::jsonb, '[
        { "title": "Broth Richness", "type": "radio", "options": ["Signature Rich Tonkotsu", "Light Shoyu Infused"] }
      ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-03', 'sakura-asian', 'cat-sk-dimsum', 'Truffle Edamame Crystal Dim Sum', 'Translucent steamed crystal dumplings stuffed with young edamame bean purée, water chestnut crunch, and white truffle essence.', 390, true, 'mild', true, true, true, 'images/item-sk-03.jpg', '["Soy", "Gluten"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-04', 'sakura-asian', 'cat-sk-dimsum', 'Spicy Prawn & Chive Har Gow', 'Plump Pacific tiger prawns and Chinese chives wrapped in delicate wheat starch skins, tossed in chili crisp sesame vinaigrette.', 440, false, 'spicy', false, true, true, 'images/item-sk-04.jpg', '["Seafood", "Gluten", "Sesame"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-05', 'sakura-asian', 'cat-sk-sushi', 'Dragon Roll Unagi & Avocado', 'Crunchy ebi tempura roll wrapped with sweet BBQ fresh water eel, creamy avocado slices, tobiko caviar, and unagi drizzle.', 590, false, 'mild', true, false, true, 'images/item-sk-05.jpg', '["Seafood", "Gluten", "Soy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-06', 'sakura-asian', 'cat-sk-robata', 'Charcoal Robata Chicken Yakitori', 'Skewered chicken thigh and scallion leeks grilled over Binchotan charcoal, glazed with aged tare teriyaki sauce and shichimi togarashi.', 360, false, 'mild', true, true, true, 'images/item-sk-06.jpg', '["Soy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-07', 'sakura-asian', 'cat-sk-robata', 'Miso Glazed Chilean Sea Bass', 'Sustainably caught Chilean sea bass marinated for 48 hours in sweet Saikyo white miso and mirin, caramelized over white hot coals.', 740, false, 'mild', false, true, true, 'images/item-sk-07.jpg', '["Seafood", "Soy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-08', 'sakura-asian', 'cat-sk-ramen', 'Wok-Tossed Dan Dan Noodles', 'Chewy handmade wheat noodles tossed in Sichuan spicy chili oil, roasted sesame paste, minced chicken, and crispy bok choy.', 380, false, 'spicy', true, false, true, 'images/item-sk-08.jpg', '["Peanuts", "Sesame", "Gluten", "Soy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-09', 'sakura-asian', 'cat-sk-wok', 'Wild Mushroom Claypot Rice', 'Japanese short-grain rice steamed in dashi broth with shimeji, shiitake, and enoki mushrooms, topped with scallion confit and crispy bottom crust.', 420, true, 'mild', false, true, true, 'images/item-sk-09.jpg', '["Soy"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-10', 'sakura-asian', 'cat-sk-desserts', 'Matcha Lava Fondant & Sesame Gelato', 'Warm Uji ceremonial green tea cake with a molten matcha white chocolate center, served with house-spun black sesame ice cream.', 290, true, 'mild', true, true, true, 'images/item-sk-10.jpg', '["Dairy", "Eggs", "Gluten", "Sesame"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-11', 'sakura-asian', 'cat-sk-drinks', 'Japanese Yuzu Plum Highball', 'Refreshing highball with Kishu Umeshu plum liqueur, sparkling yuzu soda, crushed ice, and fresh shiso leaf.', 380, true, 'mild', false, true, true, 'images/item-sk-11.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_veg, spice_level, is_bestseller, is_recommended, is_available, image, allergens, add_ons, customization_options)
VALUES ('item-sk-12', 'sakura-asian', 'cat-sk-drinks', 'Junmai Daiginjo Sake Tokkuri', 'Premium chilled Japanese rice wine brewed from polished Yamada Nishiki rice, presenting delicate floral and honeydew notes (180ml flask).', 540, true, 'mild', true, true, true, 'images/item-sk-12.jpg', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;

-- ------------------------------------------------------------------------------
-- 7. SAMPLE ORDERS (INITIAL LIVE KITCHEN & FLOOR STATE)
-- ------------------------------------------------------------------------------
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1048', 'the-urban-plate', 'T12', 'Rahul Verma', '+91 98311 00223', 'PREPARING', '[
        {
          "id": "item-01",
          "name": "Royal Dum Handi Chicken Biryani",
          "price": 389,
          "quantity": 2,
          "customizations": { "spice": "Medium", "addOns": ["Burani Garlic Raita"] },
          "specialInstructions": "Please make it fresh and aromatic."
        },
        {
          "id": "item-26",
          "name": "Signature Passionfruit & Basil Mojito",
          "price": 189,
          "quantity": 2,
          "customizations": {},
          "specialInstructions": "Extra ice please"
        }
      ]'::jsonb, 1156, 100, 52.8, 52.8, 1156, 'UPI', 'PENDING', 20)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1047', 'the-urban-plate', 'T04', 'Sneha Roy', NULL, 'CONFIRMED', '[
        { "id": "item-09", "name": "Burrata Margherita Pizza", "price": 429, "quantity": 1, "customizations": { "crust": "Sourdough" } },
        { "id": "item-27", "name": "Belgian Dark Chocolate Hazelnut Shake", "price": 229, "quantity": 1, "customizations": {} }
      ]'::jsonb, 658, 0, 32.9, 32.9, 658, 'CARD', 'PENDING', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1046', 'the-urban-plate', 'T07', 'Vikram Sengupta', NULL, 'READY', '[
        { "id": "item-20", "name": "Bhatti Da Murgh Tangdi", "price": 389, "quantity": 2, "customizations": {} },
        { "id": "item-17", "name": "Dhaba Style Handi Butter Chicken", "price": 399, "quantity": 1, "customizations": {} },
        { "id": "item-06", "name": "Cheesy Jalapeño Potato Croquettes", "price": 229, "quantity": 1, "customizations": {} }
      ]'::jsonb, 1406, 150, 62.8, 62.8, 1406, 'CASH', 'PENDING', 0)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1045', 'the-urban-plate', 'T15', 'Priya Mukherjee', NULL, 'SERVED', '[
        { "id": "item-12", "name": "The Big Boss Truffle Smash Burger", "price": 419, "quantity": 2, "customizations": {} },
        { "id": "item-23", "name": "Belgian Molten Chocolate Lava Cake", "price": 249, "quantity": 1, "customizations": {} }
      ]'::jsonb, 1087, 0, 54.35, 54.35, 1087, 'UPI', 'PAID', 0)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1044', 'the-urban-plate', 'T01', 'Amitava Bose', NULL, 'COMPLETED', '[
        { "id": "item-02", "name": "Truffle & Forest Mushroom Risotto", "price": 495, "quantity": 1, "customizations": {} },
        { "id": "item-28", "name": "Cold Brew Peach Iced Tea", "price": 169, "quantity": 1, "customizations": {} }
      ]'::jsonb, 664, 50, 30.7, 30.7, 664, 'UPI', 'PAID', 0)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1043', 'the-urban-plate', 'T03', 'Ananya Dutta', NULL, 'COMPLETED', '[
        { "id": "item-07", "name": "Awadhi Mutton Dum Biryani", "price": 469, "quantity": 2, "customizations": {} }
      ]'::jsonb, 938, 0, 46.9, 46.9, 938, 'CARD', 'PAID', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1042', 'the-urban-plate', 'T10', 'Debabrata Das', NULL, 'COMPLETED', '[
        { "id": "item-10", "name": "Fiery BBQ Smoked Chicken Pizza", "price": 479, "quantity": 1, "customizations": {} },
        { "id": "item-27", "name": "Belgian Dark Chocolate Hazelnut Shake", "price": 229, "quantity": 2, "customizations": {} }
      ]'::jsonb, 937, 100, 41.8, 41.8, 937, 'UPI', 'PAID', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1041', 'the-urban-plate', 'T18', 'Sanjay Kapoor', NULL, 'COMPLETED', '[
        { "id": "item-17", "name": "Dhaba Style Handi Butter Chicken", "price": 399, "quantity": 2, "customizations": {} },
        { "id": "item-19", "name": "Dal Makhani Bukhara", "price": 299, "quantity": 1, "customizations": {} }
      ]'::jsonb, 1097, 0, 54.8, 54.8, 1097, 'CARD', 'PAID', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1040', 'the-urban-plate', 'T11', 'Tanvi Chawla', NULL, 'COMPLETED', '[
        { "id": "item-04", "name": "Crispy Corn & Water Chestnut", "price": 249, "quantity": 1, "customizations": {} },
        { "id": "item-15", "name": "Chicken Penne Alfredo", "price": 379, "quantity": 1, "customizations": {} },
        { "id": "item-26", "name": "Passionfruit & Basil Mojito", "price": 189, "quantity": 1, "customizations": {} }
      ]'::jsonb, 817, 50, 38.3, 38.3, 817, 'UPI', 'PAID', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-1039', 'the-urban-plate', 'T19', 'Rohan Mehra', NULL, 'COMPLETED', '[
        { "id": "item-03", "name": "Tiger Prawns", "price": 549, "quantity": 2, "customizations": {} },
        { "id": "item-22", "name": "Galouti Kebab", "price": 449, "quantity": 2, "customizations": {} },
        { "id": "item-23", "name": "Molten Lava Cake", "price": 249, "quantity": 2, "customizations": {} }
      ]'::jsonb, 2494, 250, 112.2, 112.2, 2494, 'CARD', 'PAID', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-2001', 'bella-vista', 'BV-02', 'Giulia Moretti', '+91 98201 44552', 'CONFIRMED', '[
        { "id": "item-bv-01", "name": "Woodfired Margherita Burrata Pizza", "price": 480, "quantity": 1, "customizations": { "crust": "Neapolitan" } },
        { "id": "item-bv-02", "name": "Truffle Porcini Fettuccine", "price": 410, "quantity": 1, "customizations": {} }
      ]'::jsonb, 890, 0, 44.5, 44.5, 890, 'CARD', 'PENDING', 18)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-2002', 'bella-vista', 'BV-05', 'Alessandro Conti', '+91 98203 99881', 'PREPARING', '[
        { "id": "item-bv-03", "name": "Four Cheese Quattro Formaggi", "price": 520, "quantity": 1, "customizations": {} },
        { "id": "item-bv-04", "name": "Traditional Espresso Tiramisu", "price": 290, "quantity": 2, "customizations": {} }
      ]'::jsonb, 1100, 50, 52.5, 52.5, 1100, 'UPI', 'PENDING', 22)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;
INSERT INTO orders (id, tenant_id, table_id, customer_name, customer_phone, status, items, subtotal, discount, tax, service_charge, total, payment_method, payment_status, estimated_minutes)
VALUES ('ORD-3001', 'sakura-asian', 'SK-01', 'Kenji Tanaka', '+91 98199 11224', 'PREPARING', '[
        { "id": "item-sk-01", "name": "Salmon & Bluefin Nigiri Combo (8 pcs)", "price": 680, "quantity": 1, "customizations": {} },
        { "id": "item-sk-02", "name": "Black Garlic Tonkotsu Ramen", "price": 480, "quantity": 1, "customizations": { "broth": "Rich Tonkotsu" } }
      ]'::jsonb, 1160, 100, 53.0, 53.0, 1160, 'UPI', 'PENDING', 15)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_status = EXCLUDED.payment_status;

-- ------------------------------------------------------------------------------
-- 8. STAFF REQUESTS & BILL REQUESTS
-- ------------------------------------------------------------------------------
INSERT INTO staff_requests (id, tenant_id, table_id, type, label, status, time_label)
VALUES ('REQ-101', 'the-urban-plate', 'T12', 'WATER', 'Need Chilled Water', 'PENDING', '2 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO staff_requests (id, tenant_id, table_id, type, label, status, time_label)
VALUES ('REQ-102', 'the-urban-plate', 'T04', 'CUTLERY', 'Need Extra Spoons & Napkins', 'PENDING', '6 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO staff_requests (id, tenant_id, table_id, type, label, status, time_label)
VALUES ('REQ-103', 'the-urban-plate', 'T11', 'WAITER', 'Call Server to Table', 'ATTENDING', '10 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO staff_requests (id, tenant_id, table_id, type, label, status, time_label)
VALUES ('REQ-201', 'bella-vista', 'BV-05', 'WAITER', 'Call Server for Sommelier / Wine List', 'PENDING', '4 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO staff_requests (id, tenant_id, table_id, type, label, status, time_label)
VALUES ('REQ-301', 'sakura-asian', 'SK-01', 'WASABI', 'Extra Fresh Grated Wasabi & Pickled Ginger', 'PENDING', '5 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

INSERT INTO bill_requests (id, tenant_id, table_id, amount, payment_method, status, time_label)
VALUES ('BILL-101', 'the-urban-plate', 'T07', 1381.6, 'UPI', 'PENDING', '3 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
INSERT INTO bill_requests (id, tenant_id, table_id, amount, payment_method, status, time_label)
VALUES ('BILL-201', 'bella-vista', 'BV-02', 979.0, 'CARD', 'PENDING', '5 mins ago')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 9. CUSTOMERS (CRM)
-- ------------------------------------------------------------------------------
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-01', 'the-urban-plate', 'Rahul Verma', '+91 98311 00223', 'rahul.v@gmail.com', 8, 8450, 'Royal Dum Handi Chicken Biryani', 'Today')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-02', 'the-urban-plate', 'Sneha Roy', '+91 98305 77665', 'sneharoy@outlook.com', 5, 4200, 'Burrata Margherita Pizza', 'Today')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-03', 'the-urban-plate', 'Vikram Sengupta', '+91 98302 11988', 'vikram.sengupta@tcs.com', 14, 16800, 'Awadhi Mutton Dum Biryani', 'Today')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-04', 'the-urban-plate', 'Priya Mukherjee', '+91 98314 44556', 'priya.m@techcorp.in', 3, 3100, 'Truffle Smash Burger', 'Today')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-05', 'the-urban-plate', 'Amitava Bose', '+91 98309 33221', 'amitava.bose@gmail.com', 11, 12500, 'Truffle Mushroom Risotto', 'Today')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-06', 'the-urban-plate', 'Ananya Dutta', '+91 98318 66778', 'ananya.d@gmail.com', 6, 5900, 'Molten Lava Cake', 'Yesterday')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-07', 'the-urban-plate', 'Debabrata Das', '+91 98301 99887', 'debabrata.das@wipro.com', 9, 9200, 'Bhatti Da Murgh Tangdi', '2 days ago')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-08', 'the-urban-plate', 'Sanjay Kapoor', '+91 98312 88990', 'sanjay.k@venture.in', 7, 7800, 'Handi Butter Chicken', '3 days ago')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-09', 'the-urban-plate', 'Tanvi Chawla', '+91 98304 22334', 'tanvi.c@designstudio.com', 4, 3950, 'Passionfruit Mojito', '4 days ago')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;
INSERT INTO customers (id, tenant_id, name, phone, email, orders_count, total_spend, fav_dish, last_visit)
VALUES ('CUST-10', 'the-urban-plate', 'Rohan Mehra', '+91 98307 11223', 'rohan.mehra@lawllp.in', 16, 24500, 'Melt-in-Mouth Galouti Kebab', '5 days ago')
ON CONFLICT (id) DO UPDATE SET total_spend = EXCLUDED.total_spend;

-- ------------------------------------------------------------------------------
-- 10. REVIEWS
-- ------------------------------------------------------------------------------
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-01', 'the-urban-plate', 'Rahul Verma', 5, 5, 5, 5, 'Scanning the QR code and ordering directly from Table T12 was blazing fast! The Biryani arrived piping hot in 18 minutes. Elite digital dining experience.', 'T12', 'Today, 2:15 PM')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-02', 'the-urban-plate', 'Sneha Roy', 5, 5, 4, 5, 'The sourdough pizza crust is truly authentic Italian. Loved being able to call the server for extra chili flakes right from the phone without waving hands!', 'T04', 'Today, 1:40 PM')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-03', 'the-urban-plate', 'Vikram Sengupta', 5, 5, 5, 5, 'Awadhi Mutton Biryani is the finest in Sector V. The real-time order tracker on my phone kept us updated at every stage.', 'T07', 'Today, 1:10 PM')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-04', 'the-urban-plate', 'Priya Mukherjee', 4, 5, 4, 5, 'Rooftop ambience at Table T15 is magical. Lava cake was decadent and molten. Will definitely return with friends.', 'T15', 'Today, 12:50 PM')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-05', 'the-urban-plate', 'Amitava Bose', 5, 5, 5, 4, 'Truffle risotto was rich and aromatic. Requesting the bill through the web app took just 1 click and staff arrived with the card machine immediately.', 'T01', 'Today, 12:20 PM')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-06', 'the-urban-plate', 'Ananya Dutta', 5, 5, 5, 5, 'Zero friction QR ordering. No downloading clunky apps. So smooth and clean!', 'T03', 'Yesterday')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-07', 'the-urban-plate', 'Debabrata Das', 4, 4, 5, 4, 'Bhatti Da Murgh had that authentic smoky tandoor flavor. Great hospitality and fast service.', 'T10', '2 days ago')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-08', 'the-urban-plate', 'Sanjay Kapoor', 5, 5, 4, 5, 'Butter chicken and garlic naan are top tier. The garden patio setting was serene.', 'T18', '3 days ago')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-09', 'the-urban-plate', 'Tanvi Chawla', 5, 5, 5, 5, 'Loved the allergen information and spice levels marked on every dish. Makes dining so peaceful.', 'T11', '4 days ago')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;
INSERT INTO reviews (id, tenant_id, customer_name, rating_overall, rating_food, rating_service, rating_ambience, comment, table_id, date_label)
VALUES ('rev-10', 'the-urban-plate', 'Rohan Mehra', 5, 5, 5, 5, 'The private cabana experience is benchmark quality. High value for corporate dinners.', 'T19', '5 days ago')
ON CONFLICT (id) DO UPDATE SET comment = EXCLUDED.comment;

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-101', 'the-urban-plate', 'staff-01', 'Chef Vikram Rao', 'DISCOUNT', 'VIP Comp Discount Applied', 'Applied 15% VIP Courtesy Discount on Table T04', 'ORD-1048', 1850, 'UPI', 'alert', '🚨 Review Comp')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-102', 'the-urban-plate', 'staff-01', 'Chef Vikram Rao', 'PAYMENT', 'Bill Settled via Direct UPI', 'Table T12 payment completed via PhonePe QR', 'ORD-1046', 2450, 'UPI', 'info', '✓ Verified')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-103', 'bella-vista', 'staff-03', 'Marco Rossi', 'OVERRIDE', 'Manual Table Override', 'Table T02 manually marked Available (Guests departed)', 'ORD-1042', 3150, 'Card', 'warning', '⚠️ Manual Clear')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-104', 'sakura-asian', 'staff-04', 'Kenji Sato', 'STOCK', 'Menu Item 86ed (Sold Out)', 'Bluefin Tuna Sashimi marked out-of-stock for dinner rush', 'N/A', 0, 'N/A', 'warning', '⚠️ Stock Cut')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-105', 'the-urban-plate', 'staff-01', 'Chef Vikram Rao', 'PAYMENT', 'Bill Settled via POS Terminal', 'Table T07 paid via HDFC Credit Card EDC swipe', 'ORD-1038', 4200, 'Card', 'info', '✓ Batch Synced')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-106', 'bella-vista', 'staff-03', 'Marco Rossi', 'RECONCILIATION', 'Cash Register Reconciliation', 'Mid-day cash drop of ₹14,280 deposited into safe. Discrepancy: ₹0.00', 'CASH-DROP-01', 14280, 'Cash', 'info', '✓ Reconciled')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-107', 'sakura-asian', 'staff-04', 'Kenji Sato', 'PAYMENT', 'Bill Settled via Direct UPI', 'Table T05 QR payment settled to merchant Kotak Bank', 'ORD-1031', 3890, 'UPI', 'info', '✓ Verified')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;
INSERT INTO audit_logs (id, tenant_id, manager_id, manager_name, category, action, details, order_id, amount, payment_method, severity, security_flag)
VALUES ('log-108', 'the-urban-plate', 'staff-01', 'Chef Vikram Rao', 'SHIFT', 'Shift Clock-In & Station Open', 'Morning operations shift started. Cash float verified: ₹5,000', 'SHIFT-09', 5000, 'Cash', 'info', '✓ Verified')
ON CONFLICT (id) DO UPDATE SET details = EXCLUDED.details;

