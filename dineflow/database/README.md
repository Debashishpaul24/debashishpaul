# DineFlow Real-Time Database Setup (Phase 1)

This directory contains the production-grade **PostgreSQL schema** and **seed database** for DineFlow. It allows your existing DineFlow frontend to run against a real, persistent multi-tenant cloud database with live WebSocket replication (Postgres Change Data Capture - CDC).

---

## 📁 Files in this Directory

| File | Purpose |
|---|---|
| [`schema.sql`](./schema.sql) | Complete database DDL: tables, constraints, foreign keys, indexes, auto `updated_at` triggers, RLS policies, and Realtime publications. |
| [`seed.sql`](./seed.sql) | Full seed data: 3 restaurants (*The Urban Plate*, *Bella Vista Trattoria*, *Sakura Modern Asian*), 23 categories, 56 menu items with rich JSONB customizations, 28 tables, staff accounts, offers, sample orders, CRM customers, reviews, and audit logs. |

---

## 🚀 3-Minute Quickstart (Supabase)

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **"New project"**.
3. Choose an organization, enter a name (e.g. `dineflow-prod`), set a secure database password, and select the region nearest to your restaurants (e.g. `ap-south-1` Mumbai / India).
4. Click **"Create new project"** and wait ~60 seconds for provisioning.

### Step 2: Execute the Database Schema
1. In your Supabase dashboard, click the **SQL Editor** icon (terminal icon `>_` on the left sidebar).
2. Click **"New query"**.
3. Copy the entire contents of [`schema.sql`](./schema.sql) and paste it into the editor.
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see `Success. No rows returned`.

### Step 3: Populate Seed Data
1. In the same SQL Editor, click **"New query"**.
2. Copy the entire contents of [`seed.sql`](./seed.sql) and paste it into the editor.
3. Click **"Run"**.
4. You should see `Success. No rows returned`.
5. Open the **Table Editor** on the left menu to verify that `tenants`, `tables`, `menu_items`, `orders`, and `categories` are now filled with live data!

### Step 4: Obtain Your API Credentials for Phase 2
1. Click **Project Settings** (gear icon at the bottom of the left sidebar).
2. Navigate to **API** under Configuration.
3. Note down:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Anon Key** (public `anon` `public` key starting with `eyJhbGciOi...`)

You will plug these two values into `dineflow-db.js` in Phase 2.

---

## 🛡️ Architecture & Security Highlights

* **Row Level Security (RLS)**: Public anonymous customers scanning table QR codes have read-only access to active menus and can only insert orders/requests for their table. Staff and admin interfaces are authenticated.
* **Instant Real-Time CDC**: PostgreSQL automatically pushes row changes via WebSockets on `orders`, `tables`, `staff_requests`, `bill_requests`, and `audit_logs` directly to connected KDS and Waiter terminals in **< 100ms**.
* **Zero UI Disruption**: Data structures and IDs (`the-urban-plate`, `T12`, `ORD-1048`, `item-01`, etc.) match DineFlow's existing client code exactly.

