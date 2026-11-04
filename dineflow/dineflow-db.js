/**
 * ==============================================================================
 * DineFlow - Live Real-Time Database Bridge (Supabase PostgreSQL + Realtime CDC)
 * Connects the Vanilla JS SPA to a live, persistent multi-tenant database.
 * Provides instant bi-directional synchronization (< 100ms) for:
 * - Customer QR Orders (Cart -> PostgreSQL -> KDS Kanban)
 * - Kitchen Display System (Status updates -> PostgreSQL -> Customer Tracker)
 * - Waiter Calls & Bill Requests (Table -> PostgreSQL -> Waiter Terminal)
 * - Table Occupancy & Audit Logging
 * ==============================================================================
 */

(function () {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://jgloekyhfzafubfvvuwx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbG9la3loZnphZnViZnZ2dXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNTM2OTMsImV4cCI6MjEwODgyOTY5M30.Xa94lVAMz5pUcrylN33oubRGQJcoCVNC444Fr2ZjYkQ'
  };

  let client = null;
  let activeChannel = null;
  let currentTenant = 'the-urban-plate';
  let isHydrated = false;
  let outboxQueue = [];
  let isSyncingOutbox = false;

  // Initialize Supabase Client if SDK is available
  function getClient() {
    if (!client && typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });
      } catch (e) {
        console.warn('[DineFlowDB] Error initializing Supabase client:', e);
      }
    }
    return client;
  }

  // ------------------------------------------------------------------------------
  // DATA TRANSFORMERS (snake_case DB <--> camelCase DineFlow SPA)
  // ------------------------------------------------------------------------------
  const Transformers = {
    orderToDb(order, tenantId) {
      return {
        id: order.id,
        tenant_id: order.tenantId || tenantId || currentTenant,
        table_id: order.tableId,
        customer_name: order.customerName || 'Guest Diner',
        customer_phone: order.customerPhone || null,
        status: order.status || 'RECEIVED',
        items: Array.isArray(order.items) ? order.items : [],
        subtotal: Number(order.subtotal) || 0,
        discount: Number(order.discount) || 0,
        tax: Number(order.tax) || 0,
        service_charge: Number(order.serviceCharge) || 0,
        total: Number(order.total) || 0,
        payment_method: order.paymentMethod || 'UPI',
        payment_status: order.paymentStatus || 'PENDING',
        special_notes: order.specialNotes || null,
        estimated_minutes: Number(order.estimatedMinutes) || 15
      };
    },

    orderFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        tableId: db.table_id,
        customerName: db.customer_name,
        customerPhone: db.customer_phone,
        status: db.status,
        verificationStatus: db.verification_status || (db.status === 'RECEIVED' ? 'PENDING' : 'VERIFIED'),
        cancelReason: db.cancel_reason || (db.status === 'CANCELLED' ? 'Rejected by floor staff' : null),
        items: Array.isArray(db.items) ? db.items : [],
        subtotal: Number(db.subtotal) || 0,
        discount: Number(db.discount) || 0,
        tax: Number(db.tax) || 0,
        serviceCharge: Number(db.service_charge) || 0,
        total: Number(db.total) || 0,
        paymentMethod: db.payment_method || 'UPI',
        paymentStatus: db.payment_status || 'PENDING',
        specialNotes: db.special_notes,
        estimatedMinutes: Number(db.estimated_minutes) || 15,
        timestamp: db.created_at || new Date().toISOString()
      };
    },

    tableFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        name: db.name,
        section: db.section,
        capacity: Number(db.capacity) || 4,
        status: db.status || 'available',
        qrScans: Number(db.qr_scans) || 0,
        lastScanned: db.last_scanned || 'Never',
        manuallyOccupied: Boolean(db.manually_occupied)
      };
    },

    tableToDb(table, tenantId) {
      return {
        tenant_id: table.tenantId || tenantId || currentTenant,
        id: table.id,
        name: table.name || `Table ${table.id}`,
        section: table.section || 'Indoor AC Dining',
        capacity: Number(table.capacity) || 4,
        status: table.status || 'available',
        qr_scans: Number(table.qrScans) || 0,
        last_scanned: table.lastScanned || 'Never',
        manually_occupied: Boolean(table.manuallyOccupied)
      };
    },

    staffAccountFromDb(db) {
      return {
        id: db.id,
        name: db.name,
        roleTitle: db.role_title,
        role: db.role || 'RESTAURANT_ADMIN',
        tenantId: db.tenant_id,
        pin: db.pin || '1234',
        email: db.email,
        password: db.password_hash || 'admin',
        avatarEmoji: db.avatar_emoji || '👨‍🍳',
        department: db.department || 'Kitchen & Floor',
        isActive: db.is_active !== false
      };
    },

    staffRequestFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        tableId: db.table_id,
        type: db.type,
        label: db.label,
        status: db.status || 'PENDING',
        time: db.time_label || 'Just now'
      };
    },

    billRequestFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        tableId: db.table_id,
        amount: Number(db.amount) || 0,
        paymentMethod: db.payment_method || 'UPI',
        status: db.status || 'PENDING',
        time: db.time_label || 'Just now'
      };
    },

    menuItemFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        categoryId: db.category_id,
        name: db.name,
        description: db.description,
        price: Number(db.price) || 0,
        isVeg: Boolean(db.is_veg),
        spiceLevel: db.spice_level || 'medium',
        isBestseller: Boolean(db.is_bestseller),
        isRecommended: Boolean(db.is_recommended),
        isAvailable: Boolean(db.is_available),
        image: db.image,
        allergens: Array.isArray(db.allergens) ? db.allergens : [],
        addOns: Array.isArray(db.add_ons) ? db.add_ons : [],
        customizationOptions: Array.isArray(db.customization_options) ? db.customization_options : [],
        prepTimeMins: Number(db.prep_time_mins) || 15
      };
    },

    menuItemToDb(item, tenantId) {
      return {
        id: item.id,
        tenant_id: item.tenantId || tenantId || currentTenant,
        category_id: item.categoryId || 'cat-specials',
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
        is_veg: Boolean(item.isVeg),
        spice_level: item.spiceLevel || 'medium',
        is_bestseller: Boolean(item.isBestseller),
        is_recommended: Boolean(item.isRecommended),
        is_available: item.isAvailable !== false,
        image: item.image || 'images/paneer-tikka.jpg',
        allergens: Array.isArray(item.allergens) ? item.allergens : [],
        add_ons: Array.isArray(item.addOns) ? item.addOns : [],
        customization_options: Array.isArray(item.customizationOptions) ? item.customizationOptions : [],
        prep_time_mins: Number(item.prepTimeMins) || 15
      };
    },

    reviewToDb(rev, tenantId) {
      return {
        id: rev.id || `rev-${Date.now()}`,
        tenant_id: rev.tenantId || tenantId || currentTenant,
        customer_name: rev.customerName || 'Guest Diner',
        rating_overall: Number(rev.ratingOverall) || 5,
        rating_food: Number(rev.ratingFood) || 5,
        rating_service: Number(rev.ratingService) || 5,
        rating_ambience: Number(rev.ratingAmbience) || 5,
        comment: rev.comment || '',
        table_id: rev.tableId || null,
        date_label: rev.date || 'Today'
      };
    },

    categoryFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        name: db.name,
        icon: db.icon,
        sortOrder: Number(db.sort_order) || 0,
        isActive: Boolean(db.is_active)
      };
    },

    categoryToDb(cat, tenantId) {
      return {
        id: cat.id,
        tenant_id: cat.tenantId || tenantId || currentTenant,
        name: cat.name,
        icon: cat.icon || '🍽️',
        sort_order: Number(cat.sortOrder) || 0,
        is_active: cat.isActive !== false
      };
    },

    tenantFromDb(db) {
      return {
        id: db.id,
        name: db.name,
        slug: db.slug || db.id,
        tagline: db.tagline || 'Modern Dining Experience',
        branch: db.branch || 'Main',
        address: db.address || '',
        phone: db.phone || '',
        email: db.email || '',
        currency: db.currency || '₹',
        taxRate: Number(db.tax_rate) || 5,
        serviceChargeRate: Number(db.service_charge_rate) || 5,
        theme: {
          primaryColor: db.primary_color || '#E5A93C',
          secondaryColor: db.secondary_color || '#0F172A',
          radius: '12px'
        },
        coverImage: db.cover_image || `images/cover-${db.slug}.jpg`,
        logoEmoji: db.logo_emoji || '🍽️',
        wifiName: db.wifi_name || 'Guest-WiFi',
        wifiPass: db.wifi_pass || 'welcome123',
        upiVpa: db.upi_vpa || 'merchant@upi',
        plan: db.plan || 'Enterprise Pro',
        status: db.status || 'active'
      };
    },

    offerFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        code: db.code,
        title: db.title,
        description: db.description || '',
        type: db.type || 'percentage',
        value: Number(db.value) || 0,
        minOrder: Number(db.min_order) || 0,
        maxDiscount: db.max_discount ? Number(db.max_discount) : null,
        categoryScope: db.category_scope || 'all',
        expiry: db.expiry || 'Active',
        isActive: db.is_active !== false
      };
    },

    offerToDb(offer, tenantId) {
      return {
        id: offer.id,
        tenant_id: offer.tenantId || tenantId || currentTenant,
        code: offer.code,
        title: offer.title,
        description: offer.description || '',
        type: offer.type || 'percentage',
        value: Number(offer.value) || 0,
        min_order: Number(offer.minOrder) || 0,
        max_discount: offer.maxDiscount ? Number(offer.maxDiscount) : null,
        category_scope: offer.categoryScope || 'all',
        expiry: offer.expiry || 'Active',
        is_active: offer.isActive !== false
      };
    },

    customerFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        name: db.name,
        phone: db.phone || '',
        email: db.email || '',
        ordersCount: Number(db.orders_count) || 1,
        totalSpend: Number(db.total_spend) || 0,
        favDish: db.fav_dish || 'Chef Special',
        lastVisit: db.last_visit || 'Today'
      };
    },

    customerToDb(cust, tenantId) {
      return {
        id: cust.id,
        tenant_id: cust.tenantId || tenantId || currentTenant,
        name: cust.name,
        phone: cust.phone || '',
        email: cust.email || '',
        orders_count: Number(cust.ordersCount) || 1,
        total_spend: Number(cust.totalSpend) || 0,
        fav_dish: cust.favDish || '',
        last_visit: cust.lastVisit || 'Today'
      };
    },

    reviewFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        customerName: db.customer_name,
        ratingOverall: Number(db.rating_overall) || 5,
        ratingFood: Number(db.rating_food) || 5,
        ratingService: Number(db.rating_service) || 5,
        ratingAmbience: Number(db.rating_ambience) || 5,
        comment: db.comment || '',
        tableId: db.table_id || null,
        date: db.date_label || 'Today'
      };
    },

    auditLogFromDb(db) {
      return {
        id: db.id,
        tenantId: db.tenant_id,
        timestamp: db.created_at ? `Today, ${new Date(db.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Today',
        isoTime: db.created_at || new Date().toISOString(),
        managerId: db.manager_id,
        managerName: db.manager_name || 'Manager',
        category: db.category || 'INFO',
        action: db.action || 'Operation',
        details: db.details || '',
        orderId: db.order_id || 'N/A',
        amount: Number(db.amount) || 0,
        paymentMethod: db.payment_method || 'UPI',
        severity: db.severity || 'info',
        securityFlag: db.security_flag || '✓ Verified'
      };
    },

    auditLogToDb(log, tenantId) {
      return {
        id: log.id,
        tenant_id: log.tenantId || tenantId || currentTenant,
        manager_id: log.managerId || null,
        manager_name: log.managerName || 'Manager',
        category: log.category || 'INFO',
        action: log.action || 'Operation',
        details: log.details || '',
        order_id: log.orderId || 'N/A',
        amount: Number(log.amount) || 0,
        payment_method: log.paymentMethod || 'UPI',
        severity: log.severity || 'info',
        security_flag: log.securityFlag || '✓ Verified'
      };
    }
  };

  // ------------------------------------------------------------------------------
  // DineFlowDB REAL-TIME CONTROLLER
  // ------------------------------------------------------------------------------
  const DineFlowDB = {
    isOnline: true,
    initializedTenants: new Set(),
    _initPromise: null,

    async init(tenantSlug) {
      const slug = tenantSlug || currentTenant;
      if (this.initializedTenants.has(slug) && isHydrated) {
        return true;
      }
      if (this._initPromise) {
        return this._initPromise;
      }
      this._initPromise = (async () => {
        try {
          this.initializedTenants.add(slug);
          currentTenant = slug;

          const sb = getClient();
          if (!sb) {
            this.initializedTenants.delete(slug);
            return false;
          }

          console.log(`[DineFlowDB] Initializing live connection for tenant: "${slug}"`);
          await this.hydrateAll(slug);
          this.subscribeRealtime(slug);
          this.flushOutbox();
          return true;
        } finally {
          this._initPromise = null;
        }
      })();
      return this._initPromise;
    },

    // 1. Fetch complete platform state from PostgreSQL & populate DineFlowStore
    async hydrateAll(tenantSlug) {
      const sb = getClient();
      if (!sb) return false;

      const slug = tenantSlug || currentTenant || 'the-urban-plate';
      currentTenant = slug;

      try {
        console.log(`[DineFlowDB] 🌐 Hydrating complete database from PostgreSQL for "${slug}"...`);

        const [
          tenantsRes,
          staffAccRes,
          tablesRes,
          catsRes,
          itemsRes,
          ordersRes,
          staffReqRes,
          billsRes,
          customersRes,
          reviewsRes,
          offersRes,
          auditLogsRes
        ] = await Promise.all([
          sb.from('tenants').select('*'),
          sb.from('staff_accounts').select('*').eq('is_active', true),
          sb.from('tables').select('*'),
          sb.from('categories').select('*').order('sort_order', { ascending: true }),
          sb.from('menu_items').select('*'),
          sb.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
          sb.from('staff_requests').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('bill_requests').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('customers').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('offers').select('*'),
          sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(60)
        ]);

        const dbState = {};

        // 1. Tenants Map
        if (tenantsRes.data && tenantsRes.data.length > 0) {
          dbState.tenants = {};
          tenantsRes.data.forEach(row => {
            const t = Transformers.tenantFromDb(row);
            dbState.tenants[t.slug] = t;
          });
        }

        // 2. Staff Accounts (directly from PostgreSQL)
        if (staffAccRes.data && staffAccRes.data.length > 0) {
          dbState.staffAccounts = staffAccRes.data.map(Transformers.staffAccountFromDb);
        }

        // 3. Tables (serially sorted from PostgreSQL)
        if (tablesRes.data && tablesRes.data.length > 0) {
          const rawTables = tablesRes.data.map(Transformers.tableFromDb);
          dbState.tables = (typeof sortTablesSerially === 'function') ? sortTablesSerially(rawTables) : rawTables;
        }

        // 4. Categories
        if (catsRes.data && catsRes.data.length > 0) {
          dbState.categories = catsRes.data.map(Transformers.categoryFromDb);
        }

        // 5. Menu Items
        if (itemsRes.data && itemsRes.data.length > 0) {
          dbState.menuItems = itemsRes.data.map(Transformers.menuItemFromDb);
        }

        // 6. Orders
        if (ordersRes.data) {
          dbState.orders = ordersRes.data.map(Transformers.orderFromDb);
        }

        // 7. Staff Requests
        if (staffReqRes.data) {
          dbState.staffRequests = staffReqRes.data.map(Transformers.staffRequestFromDb);
        }

        // 8. Bill Requests
        if (billsRes.data) {
          dbState.billRequests = billsRes.data.map(Transformers.billRequestFromDb);
        }

        // 9. Customers (CRM)
        if (customersRes.data && customersRes.data.length > 0) {
          dbState.customers = customersRes.data.map(Transformers.customerFromDb);
        }

        // 10. Reviews
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          dbState.reviews = reviewsRes.data.map(Transformers.reviewFromDb);
        }

        // 11. Offers & Coupons
        const dbOffers = (offersRes.data && offersRes.data.length > 0)
          ? offersRes.data.map(Transformers.offerFromDb)
          : [];
        if (typeof DineFlowStore !== 'undefined' && typeof DineFlowStore.mergeOffers === 'function') {
          dbState.offers = DineFlowStore.mergeOffers(dbOffers);
        } else if (dbOffers.length > 0) {
          dbState.offers = dbOffers;
        }

        // 12. Security Audit Logs
        if (auditLogsRes.data && auditLogsRes.data.length > 0) {
          dbState.auditLogs = auditLogsRes.data.map(Transformers.auditLogFromDb);
        }

        // Update DineFlowStore with clean database state
        if (typeof DineFlowStore !== 'undefined' && typeof DineFlowStore.setDatabaseState === 'function') {
          DineFlowStore.setDatabaseState(dbState);
        }

        isHydrated = true;
        this.isOnline = true;
        console.log(`[DineFlowDB] ✓ 100% database fetched from PostgreSQL: ${dbState.tables?.length || 0} tables, ${dbState.staffAccounts?.length || 0} staff, ${dbState.menuItems?.length || 0} dishes.`);

        if (typeof window.onDineFlowRemoteSync === 'function') {
          window.onDineFlowRemoteSync({
            type: 'SYNC',
            payload: DineFlowStore.get(),
            meta: { action: 'CLOUD_HYDRATED', tenantSlug: slug }
          });
        }

        return true;
      } catch (err) {
        console.warn('[DineFlowDB] HydrateAll notice:', err.message || err);
        return false;
      }
    },

    async hydrate(tenantSlug) {
      return this.hydrateAll(tenantSlug);
    },

    // 2. Subscribe to PostgreSQL Realtime WebSocket Channel
    subscribeRealtime(tenantSlug) {
      const sb = getClient();
      if (!sb) return;

      const slug = tenantSlug || currentTenant;

      if (activeChannel) {
        try { sb.removeChannel(activeChannel); } catch (e) {}
      }

      console.log(`[DineFlowDB] 📡 Subscribing to PostgreSQL Realtime stream for: ${slug}`);

      activeChannel = sb
        .channel(`dineflow-ops-${slug}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${slug}` },
          (payload) => this.handleLiveOrderEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tables', filter: `tenant_id=eq.${slug}` },
          (payload) => this.handleLiveTableEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff_requests', filter: `tenant_id=eq.${slug}` },
          (payload) => this.handleLiveStaffRequestEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bill_requests', filter: `tenant_id=eq.${slug}` },
          (payload) => this.handleLiveBillRequestEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff_accounts' },
          (payload) => this.handleLiveStaffAccountEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          (payload) => this.handleLiveMenuItemEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => this.handleLiveCategoryEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => this.handleLiveReviewEvent(payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'offers' },
          (payload) => this.handleLiveOfferEvent(payload)
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[DineFlowDB] 🟢 Realtime WebSocket connected successfully!`);
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('[DineFlowDB] Realtime channel notice:', err);
          }
        });
    },

    // --------------------------------------------------------------------------
    // INBOUND REAL-TIME EVENT HANDLERS (From Postgres CDC -> State -> UI)
    // --------------------------------------------------------------------------
    handleLiveOrderEvent(payload) {
      const state = DineFlowStore.get();
      const eventType = payload.eventType;

      if (eventType === 'INSERT') {
        const order = Transformers.orderFromDb(payload.new);
        if (!state.orders.some(o => o.id === order.id)) {
          state.orders.unshift(order);

          // Keep local serial order counter synchronized
          if (order.id && order.tenantId) {
            const m = order.id.match(/^ORD-(\d+)$/i);
            if (m) {
              const num = parseInt(m[1], 10);
              const tSlug = order.tenantId.toLowerCase().trim();
              if (!state.orderCounters) state.orderCounters = {};
              if (!state.orderCounters[tSlug] || num > state.orderCounters[tSlug]) {
                state.orderCounters[tSlug] = num;
              }
            }
          }

          // Auto-occupy table
          const tbl = state.tables.find(t => t.id === order.tableId && t.tenantId === order.tenantId);
          if (tbl) {
            tbl.status = 'occupied';
            tbl.lastScanned = 'Just now';
            tbl.qrScans = (tbl.qrScans || 0) + 1;
          }

          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({
            action: 'NEW_ORDER',
            orderId: order.id,
            tableId: order.tableId,
            customerName: order.customerName,
            tenantSlug: order.tenantId,
            order: order
          });
        }
      } else if (eventType === 'UPDATE') {
        const updated = Transformers.orderFromDb(payload.new);
        const idx = state.orders.findIndex(o => o.id === updated.id);
        const prevStatus = idx !== -1 ? state.orders[idx].status : null;

        // Ignore self-echo if order in local state already has this status
        if (prevStatus === updated.status) {
          return;
        }

        if (idx !== -1) {
          state.orders[idx] = updated;
        } else {
          state.orders.unshift(updated);
        }

        // If completed or paid, update table occupancy
        if (updated.status === 'COMPLETED') {
          const hasMore = state.orders.some(o => o.tableId === updated.tableId && o.tenantId === updated.tenantId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
          if (!hasMore) {
            const tbl = state.tables.find(t => t.id === updated.tableId && t.tenantId === updated.tenantId);
            if (tbl && !tbl.manuallyOccupied) tbl.status = 'available';
          }
        }

        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({
          action: 'ORDER_STATUS_CHANGED',
          orderId: updated.id,
          tableId: updated.tableId,
          newStatus: updated.status,
          prevStatus: prevStatus,
          tenantSlug: updated.tenantId
        });
      }
    },

    handleLiveTableEvent(payload) {
      const state = DineFlowStore.get();
      if (payload.eventType === 'INSERT' && payload.new) {
        const table = Transformers.tableFromDb(payload.new);
        const idx = state.tables.findIndex(t => t.id === table.id && t.tenantId === table.tenantId);
        if (idx === -1) {
          state.tables.push(table);
          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({
            action: 'TABLE_CREATED',
            table: table,
            tableId: table.id,
            tenantSlug: table.tenantId
          });
        }
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updated = Transformers.tableFromDb(payload.new);
        const idx = state.tables.findIndex(t => t.id === updated.id && t.tenantId === updated.tenantId);
        if (idx !== -1) {
          state.tables[idx] = updated;
          if (updated.status === 'available') {
            state.orders.forEach(o => {
              if (o.tableId === updated.id && (!o.tenantId || o.tenantId === updated.tenantId) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
                o.status = 'COMPLETED';
                o.paymentStatus = 'PAID';
              }
            });
            state.billRequests.forEach(b => {
              if (b.tableId === updated.id && (!b.tenantId || b.tenantId === updated.tenantId)) {
                b.status = 'PAID';
              }
            });
            state.staffRequests.forEach(s => {
              if (s.tableId === updated.id && (!s.tenantId || s.tenantId === updated.tenantId)) {
                s.status = 'RESOLVED';
              }
            });
          }
          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({
            action: 'TABLE_STATUS_TOGGLED',
            tableId: updated.id,
            isOccupied: updated.status === 'occupied',
            tenantSlug: updated.tenantId
          });
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const oldId = payload.old.id;
        state.tables = state.tables.filter(t => t.id !== oldId);
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({
          action: 'TABLE_DELETED',
          tableId: oldId
        });
      }
    },

    handleLiveStaffRequestEvent(payload) {
      const state = DineFlowStore.get();
      state.staffRequests = Array.isArray(state.staffRequests) ? state.staffRequests : [];

      if (payload.eventType === 'INSERT') {
        const req = Transformers.staffRequestFromDb(payload.new);
        if (!state.staffRequests.some(r => r.id === req.id)) {
          state.staffRequests.unshift(req);
          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({
            action: 'STAFF_CALL',
            tableId: req.tableId,
            requestLabel: req.label,
            tenantSlug: req.tenantId,
            request: req
          });
        }
      } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const reqId = payload.new ? payload.new.id : payload.old.id;
        state.staffRequests = state.staffRequests.filter(r => r.id !== reqId || (payload.new && payload.new.status === 'PENDING'));
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'STAFF_REQUEST_UPDATED', tenantSlug: currentTenant });
      }
    },

    handleLiveBillRequestEvent(payload) {
      const state = DineFlowStore.get();
      state.billRequests = Array.isArray(state.billRequests) ? state.billRequests : [];

      if (payload.eventType === 'INSERT') {
        const bill = Transformers.billRequestFromDb(payload.new);
        if (!state.billRequests.some(b => b.id === bill.id)) {
          state.billRequests.unshift(bill);
          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({
            action: 'BILL_REQUEST',
            tableId: bill.tableId,
            tenantSlug: bill.tenantId,
            bill: bill
          });
        }
      } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const billId = payload.new ? payload.new.id : payload.old.id;
        state.billRequests = state.billRequests.filter(b => b.id !== billId || (payload.new && payload.new.status === 'PENDING'));
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'BILL_REQUEST_UPDATED', tenantSlug: currentTenant });
      }
    },

    handleLiveStaffAccountEvent(payload) {
      const state = DineFlowStore.get();
      state.staffAccounts = Array.isArray(state.staffAccounts) ? state.staffAccounts : [];
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const acc = Transformers.staffAccountFromDb(payload.new);
        const idx = state.staffAccounts.findIndex(a => a.id === acc.id);
        if (idx >= 0) {
          state.staffAccounts[idx] = acc;
        } else {
          state.staffAccounts.push(acc);
        }
      } else if (payload.eventType === 'DELETE') {
        state.staffAccounts = state.staffAccounts.filter(a => a.id !== (payload.old && payload.old.id));
      }
      DineFlowStore.saveLocalOnly(state);
      this.notifyUI({ action: 'STAFF_ACCOUNT_UPDATED', tenantSlug: currentTenant });
    },

    handleLiveMenuItemEvent(payload) {
      const state = DineFlowStore.get();
      state.menuItems = Array.isArray(state.menuItems) ? state.menuItems : [];
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = Transformers.menuItemFromDb(payload.new);
        const idx = state.menuItems.findIndex(i => i.id === item.id);
        if (idx >= 0) {
          state.menuItems[idx] = item;
        } else {
          state.menuItems.push(item);
        }
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'MENU_ITEM_UPDATED', itemId: item.id, tenantSlug: item.tenantId });
      } else if (payload.eventType === 'DELETE' && payload.old) {
        state.menuItems = state.menuItems.filter(i => i.id !== payload.old.id);
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'MENU_ITEM_DELETED', itemId: payload.old.id });
      }
    },

    handleLiveCategoryEvent(payload) {
      const state = DineFlowStore.get();
      state.categories = Array.isArray(state.categories) ? state.categories : [];
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const cat = Transformers.categoryFromDb(payload.new);
        const idx = state.categories.findIndex(c => c.id === cat.id);
        if (idx >= 0) {
          state.categories[idx] = cat;
        } else {
          state.categories.push(cat);
        }
        state.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'CATEGORIES_UPDATED', tenantSlug: cat.tenantId });
      } else if (payload.eventType === 'DELETE' && payload.old) {
        state.categories = state.categories.filter(c => c.id !== payload.old.id);
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'CATEGORIES_UPDATED' });
      }
    },

    handleLiveReviewEvent(payload) {
      const state = DineFlowStore.get();
      state.reviews = Array.isArray(state.reviews) ? state.reviews : [];
      if (payload.eventType === 'INSERT' && payload.new) {
        const rev = Transformers.reviewFromDb(payload.new);
        if (!state.reviews.some(r => r.id === rev.id)) {
          state.reviews.unshift(rev);
          DineFlowStore.saveLocalOnly(state);
          this.notifyUI({ action: 'REVIEW_SUBMITTED', review: rev, tenantSlug: rev.tenantId });
        }
      }
    },

    handleLiveOfferEvent(payload) {
      const state = DineFlowStore.get();
      state.offers = Array.isArray(state.offers) ? state.offers : [];
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const offer = Transformers.offerFromDb(payload.new);
        const idx = state.offers.findIndex(o => o.id === offer.id);
        if (idx >= 0) {
          state.offers[idx] = offer;
        } else {
          state.offers.push(offer);
        }
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'OFFERS_UPDATED', tenantSlug: offer.tenantId });
      } else if (payload.eventType === 'DELETE' && payload.old) {
        state.offers = state.offers.filter(o => o.id !== payload.old.id);
        DineFlowStore.saveLocalOnly(state);
        this.notifyUI({ action: 'OFFERS_UPDATED' });
      }
    },

    // Notify DineFlow SPA UI through the existing remote sync callback
    notifyUI(meta) {
      const state = DineFlowStore.get();
      if (typeof window.onDineFlowRemoteSync === 'function') {
        window.onDineFlowRemoteSync({
          type: 'SYNC',
          payload: state,
          meta: meta
        });
      }
    },

    // --------------------------------------------------------------------------
    // OUTBOUND ACTIONS (From Cart / KDS / Waiter -> Push to PostgreSQL)
    // --------------------------------------------------------------------------
    async pushAction(meta, state) {
      if (!meta || !meta.action) return;
      const sb = getClient();

      if (!sb || !navigator.onLine) {
        // Queue for offline retry
        outboxQueue.push({ meta, state, timestamp: Date.now() });
        return;
      }

      const tenantId = meta.tenantSlug || currentTenant;

      try {
        switch (meta.action) {
          case 'NEW_ORDER': {
            if (meta.order) {
              const row = Transformers.orderToDb(meta.order, tenantId);
              const { error } = await sb.from('orders').insert(row);
              if (error) throw error;

              // Mark table as occupied in database
              await sb.from('tables')
                .update({ status: 'occupied', last_scanned: 'Just now' })
                .match({ tenant_id: tenantId, id: meta.tableId });
              console.log(`[DineFlowDB] ✓ Order ${row.id} synced to PostgreSQL!`);
            }
            break;
          }

          case 'ORDER_STATUS_CHANGED': {
            if (meta.orderId && meta.newStatus) {
              const updates = {
                status: meta.newStatus,
                updated_at: new Date().toISOString()
              };
              if (meta.newStatus === 'COMPLETED') {
                updates.payment_status = 'PAID';
              }
              const { error } = await sb.from('orders').update(updates).eq('id', meta.orderId);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Order ${meta.orderId} updated to ${meta.newStatus}`);

              // If order is cancelled/prank-blocked, free the table in DB if no other active orders remain
              if (meta.newStatus === 'CANCELLED' && meta.tableId) {
                try {
                  const { data: remainingOrders } = await sb.from('orders')
                    .select('id')
                    .eq('table_id', meta.tableId)
                    .match({ tenant_id: tenantId })
                    .neq('status', 'COMPLETED')
                    .neq('status', 'CANCELLED');
                  if (!remainingOrders || remainingOrders.length === 0) {
                    await sb.from('tables')
                      .update({ status: 'available' })
                      .match({ tenant_id: tenantId, id: meta.tableId });
                  }
                } catch (e) {
                  console.warn('[DineFlowDB] Non-critical table reset error on cancel:', e);
                }
              }
            }
            break;
          }

          case 'ALL_ORDERS_VERIFIED': {
            try {
              await sb.from('orders')
                .update({ status: 'PREPARING', updated_at: new Date().toISOString() })
                .match({ tenant_id: tenantId, status: 'RECEIVED' });
            } catch (e) {
              console.warn('[DineFlowDB] Non-critical error batch verifying orders:', e);
            }
            break;
          }

          case 'STAFF_CALL':
          case 'CALL_STAFF': {
            const req = meta.request || {};
            const reqId = req.id || ('REQ-' + Date.now().toString().slice(-4));
            const row = {
              id: reqId,
              tenant_id: tenantId,
              table_id: meta.tableId || req.tableId || 'T12',
              type: req.type || 'WAITER',
              label: meta.requestLabel || req.label || 'Staff Assistance',
              status: 'PENDING',
              time_label: 'Just now'
            };
            const { error } = await sb.from('staff_requests').upsert(row);
            if (error) throw error;
            console.log(`[DineFlowDB] ✓ Staff request ${reqId} synced to PostgreSQL!`);
            break;
          }

          case 'STAFF_REQUEST_RESOLVED': {
            if (meta.requestId) {
              const { error } = await sb.from('staff_requests')
                .update({ status: 'RESOLVED' })
                .eq('id', meta.requestId);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Staff request ${meta.requestId} resolved in PostgreSQL!`);
            }
            break;
          }

          case 'BILL_REQUEST': {
            const bill = meta.bill || {};
            const billId = bill.id || ('BILL-' + Date.now().toString().slice(-4));
            const row = {
              id: billId,
              tenant_id: tenantId,
              table_id: meta.tableId || bill.tableId || 'T12',
              amount: Number(bill.amount) || 0,
              payment_method: bill.paymentMethod || 'UPI',
              status: 'PENDING',
              time_label: 'Just now'
            };
            const { error } = await sb.from('bill_requests').upsert(row);
            if (error) throw error;
            console.log(`[DineFlowDB] ✓ Bill request ${billId} synced to PostgreSQL!`);
            break;
          }

          case 'BILL_SETTLED': {
            if (meta.tableId) {
              // Update all orders on that table to PAID and COMPLETED
              await sb.from('orders')
                .update({ status: 'COMPLETED', payment_status: 'PAID' })
                .match({ tenant_id: tenantId, table_id: meta.tableId });

              // Resolve bill requests
              await sb.from('bill_requests')
                .update({ status: 'PAID' })
                .match({ tenant_id: tenantId, table_id: meta.tableId });

              // Resolve staff requests
              await sb.from('staff_requests')
                .update({ status: 'RESOLVED' })
                .match({ tenant_id: tenantId, table_id: meta.tableId });

              // Mark table available
              await sb.from('tables')
                .update({ status: 'available', manually_occupied: false })
                .match({ tenant_id: tenantId, id: meta.tableId });

              console.log(`[DineFlowDB] ✓ Table ${meta.tableId} bill settled & cleared in PostgreSQL!`);
            }
            break;
          }

          case 'TABLE_STATUS_TOGGLED': {
            if (meta.tableId) {
              const status = meta.isOccupied ? 'occupied' : 'available';
              await sb.from('tables')
                .update({ status: status, manually_occupied: Boolean(meta.isOccupied) })
                .match({ tenant_id: tenantId, id: meta.tableId });

              // When clearing table to available, complete active orders and resolve bills/calls in PostgreSQL
              if (!meta.isOccupied) {
                await sb.from('orders')
                  .update({ status: 'COMPLETED', payment_status: 'PAID' })
                  .match({ tenant_id: tenantId, table_id: meta.tableId })
                  .neq('status', 'CANCELLED');
                await sb.from('bill_requests')
                  .update({ status: 'PAID' })
                  .match({ tenant_id: tenantId, table_id: meta.tableId });
                await sb.from('staff_requests')
                  .update({ status: 'RESOLVED' })
                  .match({ tenant_id: tenantId, table_id: meta.tableId });
              }
              console.log(`[DineFlowDB] ✓ Table ${meta.tableId} set to ${status} in PostgreSQL`);
            }
            break;
          }

          case 'TABLES_CLEARED_ALL':
          case 'ALL_TABLES_CLEARED': {
            if (meta.clearedTableIds && Array.isArray(meta.clearedTableIds)) {
              for (const tid of meta.clearedTableIds) {
                await sb.from('tables')
                  .update({ status: 'available', manually_occupied: false })
                  .match({ tenant_id: tenantId, id: tid });
                await sb.from('orders')
                  .update({ status: 'COMPLETED', payment_status: 'PAID' })
                  .match({ tenant_id: tenantId, table_id: tid })
                  .neq('status', 'CANCELLED');
                await sb.from('staff_requests')
                  .update({ status: 'RESOLVED' })
                  .match({ tenant_id: tenantId, table_id: tid });
              }
            } else {
              await sb.from('tables')
                .update({ status: 'available', manually_occupied: false })
                .eq('tenant_id', tenantId);
              await sb.from('orders')
                .update({ status: 'COMPLETED', payment_status: 'PAID' })
                .eq('tenant_id', tenantId)
                .neq('status', 'CANCELLED');
              await sb.from('bill_requests').update({ status: 'PAID' }).eq('tenant_id', tenantId);
              await sb.from('staff_requests').update({ status: 'RESOLVED' }).eq('tenant_id', tenantId);
            }
            console.log(`[DineFlowDB] ✓ Cleared tables processed for ${tenantId}`);
            break;
          }

          case 'AUDIT_LOG_RECORDED': {
            if (meta.log) {
              const log = meta.log;
              const row = {
                id: log.id,
                tenant_id: log.tenantId || tenantId,
                manager_id: log.managerId,
                manager_name: log.managerName || 'Manager',
                category: log.category || 'INFO',
                action: log.action || 'Operation',
                details: log.details || '',
                order_id: log.orderId || 'N/A',
                amount: Number(log.amount) || 0,
                payment_method: log.paymentMethod || 'UPI',
                severity: log.severity || 'info',
                security_flag: log.securityFlag || '✓ Verified'
              };
              await sb.from('audit_logs').insert(row);
            }
            break;
          }

          case 'TABLE_CREATED':
          case 'TABLE_UPSERTED': {
            if (meta.table) {
              const row = Transformers.tableToDb(meta.table, tenantId);
              const { error } = await sb.from('tables').upsert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Table ${row.id} synced to PostgreSQL!`);
            }
            break;
          }

          case 'MENU_ITEM_CREATED': {
            if (meta.item) {
              const row = Transformers.menuItemToDb(meta.item, tenantId);
              const { error } = await sb.from('menu_items').upsert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Menu item ${row.name} synced to PostgreSQL!`);
            }
            break;
          }

          case 'MENU_ITEM_AVAILABILITY_CHANGED': {
            if (meta.itemId) {
              const { error } = await sb.from('menu_items')
                .update({ is_available: Boolean(meta.isAvailable) })
                .match({ tenant_id: tenantId, id: meta.itemId });
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Menu item ${meta.itemId} stock updated to ${meta.isAvailable}`);
            }
            break;
          }

          case 'MENU_ITEM_DELETED': {
            if (meta.itemId) {
              const { error } = await sb.from('menu_items')
                .delete()
                .match({ tenant_id: tenantId, id: meta.itemId });
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Menu item ${meta.itemId} deleted from PostgreSQL`);
            }
            break;
          }

          case 'REVIEW_SUBMITTED': {
            if (meta.review) {
              const row = Transformers.reviewToDb(meta.review, tenantId);
              const { error } = await sb.from('reviews').insert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Review ${row.id} synced to PostgreSQL!`);
            }
            break;
          }

          case 'STAFF_ACCOUNT_CREATED':
          case 'STAFF_ACCOUNT_UPDATED': {
            if (meta.account) {
              const acc = meta.account;
              const row = {
                id: acc.id,
                tenant_id: acc.tenantId || tenantId,
                name: acc.name,
                role_title: acc.roleTitle || acc.title || 'Staff Member',
                role: acc.role || 'RESTAURANT_ADMIN',
                pin: acc.pin || '1234',
                email: acc.email || `${acc.id}@dineflow.io`,
                avatar_emoji: acc.avatarEmoji || '👨‍🍳',
                department: acc.department || 'Kitchen & Floor',
                is_active: acc.isActive !== false
              };
              const { error } = await sb.from('staff_accounts').upsert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Staff account ${row.name} synced to PostgreSQL!`);
            }
            break;
          }

          case 'STAFF_ACCOUNT_REVOKED': {
            if (meta.staffId) {
              const { error } = await sb.from('staff_accounts')
                .update({ is_active: false })
                .eq('id', meta.staffId);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Staff account ${meta.staffId} revoked in PostgreSQL!`);
            }
            break;
          }

          case 'TENANT_UPDATED': {
            if (meta.tenant) {
              const t = meta.tenant;
              const row = {
                name: t.name,
                tagline: t.tagline,
                primary_color: t.primaryColor || (t.theme && t.theme.primaryColor),
                currency: t.currency,
                tax_rate: Number(t.taxRate) || 5,
                service_charge_rate: Number(t.serviceChargeRate) || 5,
                wifi_name: t.wifiName,
                wifi_pass: t.wifiPass,
                updated_at: new Date().toISOString()
              };
              const { error } = await sb.from('tenants').update(row).eq('slug', t.slug || tenantId);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Tenant ${t.name} branding updated in PostgreSQL!`);
            }
            break;
          }

          case 'CATEGORY_CREATED': {
            if (meta.category) {
              const row = Transformers.categoryToDb(meta.category, tenantId);
              const { error } = await sb.from('categories').upsert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Category ${row.name} synced to PostgreSQL!`);
            }
            break;
          }

          case 'OFFER_CREATED':
          case 'OFFER_UPDATED':
          case 'OFFER_SAVED':
          case 'OFFER_TOGGLED': {
            if (meta.offer) {
              if (typeof DineFlowStore !== 'undefined' && typeof DineFlowStore.saveCustomOffer === 'function') {
                DineFlowStore.saveCustomOffer(meta.offer);
              }
              try {
                const row = Transformers.offerToDb(meta.offer, tenantId);
                const { error } = await sb.from('offers').upsert(row);
                if (error) {
                  console.warn(`[DineFlowDB] Notice: Offer saved locally. PostgreSQL cloud notice:`, error.message || error);
                } else {
                  console.log(`[DineFlowDB] ✓ Offer ${row.title} (${row.code}) synced to PostgreSQL!`);
                }
              } catch (offerErr) {
                console.warn(`[DineFlowDB] Offer persistence handled in local registry:`, offerErr.message || offerErr);
              }
            }
            break;
          }

          case 'OFFER_DELETED': {
            if (meta.offerId) {
              if (typeof DineFlowStore !== 'undefined' && typeof DineFlowStore.deleteCustomOffer === 'function') {
                DineFlowStore.deleteCustomOffer(meta.offerId);
              }
              try {
                const { error } = await sb.from('offers').delete().eq('id', meta.offerId);
                if (error) {
                  console.warn(`[DineFlowDB] Notice: Offer deleted locally. PostgreSQL cloud notice:`, error.message || error);
                } else {
                  console.log(`[DineFlowDB] ✓ Offer ${meta.offerId} deleted from PostgreSQL`);
                }
              } catch (offerErr) {
                console.warn(`[DineFlowDB] Offer deletion handled in local registry:`, offerErr.message || offerErr);
              }
            }
            break;
          }

          case 'CUSTOMER_CREATED':
          case 'CUSTOMER_UPDATED': {
            if (meta.customer) {
              const row = Transformers.customerToDb(meta.customer, tenantId);
              const { error } = await sb.from('customers').upsert(row);
              if (error) throw error;
              console.log(`[DineFlowDB] ✓ Customer ${row.name} synced to PostgreSQL!`);
            }
            break;
          }
        }
      } catch (err) {
        console.warn(`[DineFlowDB] Action ${meta.action} notice (queued for retry):`, err.message || err);
        outboxQueue.push({ meta, state, timestamp: Date.now() });
      }
    },

    // Flush any offline queued actions once back online
    async flushOutbox() {
      if (isSyncingOutbox || outboxQueue.length === 0 || !navigator.onLine) return;
      isSyncingOutbox = true;
      while (outboxQueue.length > 0) {
        const item = outboxQueue.shift();
        try {
          await this.pushAction(item.meta, item.state);
        } catch (e) {}
      }
      isSyncingOutbox = false;
    }
  };

  // Re-flush outbox when browser reconnects to Wi-Fi/LTE
  window.addEventListener('online', () => {
    console.log('[DineFlowDB] Network reconnected. Flushing offline outbox...');
    DineFlowDB.flushOutbox();
  });

  // Expose globally
  window.DineFlowDB = DineFlowDB;

  // Auto-boot DineFlowDB when page loads
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const r = params.get('r') || 'the-urban-plate';
        DineFlowDB.init(r);
      });
    } else {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('r') || 'the-urban-plate';
      DineFlowDB.init(r);
    }
  }

})();

