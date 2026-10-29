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
    }
  };

  // ------------------------------------------------------------------------------
  // DineFlowDB REAL-TIME CONTROLLER
  // ------------------------------------------------------------------------------
  const DineFlowDB = {
    isOnline: true,
    initializedTenants: new Set(),

    async init(tenantSlug) {
      const slug = tenantSlug || currentTenant;
      if (this.initializedTenants.has(slug)) {
        return; // Guard: Already initialized and subscribed for this tenant
      }
      this.initializedTenants.add(slug);
      currentTenant = slug;

      const sb = getClient();
      if (!sb) {
        this.initializedTenants.delete(slug);
        setTimeout(() => this.init(slug), 500);
        return;
      }

      console.log(`[DineFlowDB] Initializing live connection for tenant: "${slug}"`);
      await this.hydrate(slug);
      this.subscribeRealtime(slug);
      this.flushOutbox();
    },

    // 1. Fetch fresh restaurant state from PostgreSQL & update DineFlowStore
    async hydrate(tenantSlug) {
      const sb = getClient();
      if (!sb) return;

      const slug = tenantSlug || currentTenant;

      try {
        console.log(`[DineFlowDB] 📥 Fetching live cloud data for "${slug}"...`);

        const [tablesRes, ordersRes, staffRes, billsRes, itemsRes, catsRes] = await Promise.all([
          sb.from('tables').select('*').eq('tenant_id', slug),
          sb.from('orders').select('*').eq('tenant_id', slug).order('created_at', { ascending: false }).limit(60),
          sb.from('staff_requests').select('*').eq('tenant_id', slug).eq('status', 'PENDING'),
          sb.from('bill_requests').select('*').eq('tenant_id', slug).eq('status', 'PENDING'),
          sb.from('menu_items').select('*').eq('tenant_id', slug),
          sb.from('categories').select('*').eq('tenant_id', slug).order('sort_order', { ascending: true })
        ]);

        if (tablesRes.error) throw tablesRes.error;

        // Retrieve current in-memory store
        const state = DineFlowStore.get();

        if (tablesRes.data && tablesRes.data.length > 0) {
          const freshTables = tablesRes.data.map(Transformers.tableFromDb);
          const freshIds = new Set(freshTables.map(t => t.id));
          // Preserve any newly added local tables (e.g. Table 21) not yet in cloud snapshot
          const pendingLocalTables = (state.tables || []).filter(t => t.tenantId === slug && !freshIds.has(t.id));
          const otherTables = (state.tables || []).filter(t => t.tenantId !== slug);
          state.tables = [...freshTables, ...pendingLocalTables, ...otherTables];
        }

        if (ordersRes.data) {
          const freshOrders = ordersRes.data.map(Transformers.orderFromDb);
          const freshIds = new Set(freshOrders.map(o => o.id));

          // Retain recent local orders (within 5 minutes) not yet in cloud snapshot
          // to prevent optimistic UI orders from flickering or disappearing
          const now = Date.now();
          const pendingRecentOrders = (state.orders || []).filter(o => {
            if (o.tenantId !== slug) return false;
            if (freshIds.has(o.id)) return false;
            const ageMs = now - new Date(o.timestamp || now).getTime();
            return ageMs < 5 * 60 * 1000;
          });

          const otherOrders = (state.orders || []).filter(o => o.tenantId !== slug);
          state.orders = [...pendingRecentOrders, ...freshOrders, ...otherOrders];
        }

        if (staffRes.data) {
          const freshStaff = staffRes.data.map(Transformers.staffRequestFromDb);
          const freshStaffIds = new Set(freshStaff.map(s => s.id));
          const pendingRecentStaff = (state.staffRequests || []).filter(s => {
            if (s.tenantId !== slug) return false;
            if (freshStaffIds.has(s.id)) return false;
            return s.status === 'PENDING';
          });
          const otherStaff = (state.staffRequests || []).filter(s => s.tenantId !== slug);
          state.staffRequests = [...pendingRecentStaff, ...freshStaff, ...otherStaff];
        }

        if (billsRes.data) {
          const freshBills = billsRes.data.map(Transformers.billRequestFromDb);
          const freshBillIds = new Set(freshBills.map(b => b.id));
          const pendingRecentBills = (state.billRequests || []).filter(b => {
            if (b.tenantId !== slug) return false;
            if (freshBillIds.has(b.id)) return false;
            return b.status === 'PENDING';
          });
          const otherBills = (state.billRequests || []).filter(b => b.tenantId !== slug);
          state.billRequests = [...pendingRecentBills, ...freshBills, ...otherBills];
        }

        if (itemsRes.data && itemsRes.data.length > 0) {
          const freshItems = itemsRes.data.map(Transformers.menuItemFromDb);
          const freshItemIds = new Set(freshItems.map(i => i.id));
          const pendingItems = (state.menuItems || []).filter(i => i.tenantId === slug && !freshItemIds.has(i.id));
          const otherItems = (state.menuItems || []).filter(m => m.tenantId !== slug);
          state.menuItems = [...freshItems, ...pendingItems, ...otherItems];
        }

        if (catsRes.data && catsRes.data.length > 0) {
          const freshCats = catsRes.data.map(Transformers.categoryFromDb);
          const otherCats = (state.categories || []).filter(c => c.tenantId !== slug);
          state.categories = [...freshCats, ...otherCats];
        }

        // Save fresh data to local cache
        DineFlowStore.saveLocalOnly(state);
        isHydrated = true;
        console.log(`[DineFlowDB] ✓ Cloud data hydrated: ${ordersRes.data?.length || 0} orders, ${tablesRes.data?.length || 0} tables.`);

        // Trigger visual UI update without flashing or resetting modals
        if (typeof window.onDineFlowRemoteSync === 'function') {
          window.onDineFlowRemoteSync({
            type: 'SYNC',
            payload: state,
            meta: { action: 'CLOUD_HYDRATED', tenantSlug: slug }
          });
        }
      } catch (err) {
        console.warn('[DineFlowDB] Hydration notice (using local offline cache):', err.message || err);
      }
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
            await sb.from('tables')
              .update({ status: 'available', manually_occupied: false })
              .eq('tenant_id', tenantId);
            await sb.from('orders')
              .update({ status: 'COMPLETED', payment_status: 'PAID' })
              .eq('tenant_id', tenantId)
              .neq('status', 'CANCELLED');
            await sb.from('bill_requests').update({ status: 'PAID' }).eq('tenant_id', tenantId);
            await sb.from('staff_requests').update({ status: 'RESOLVED' }).eq('tenant_id', tenantId);
            console.log(`[DineFlowDB] ✓ All tables cleared for ${tenantId}`);
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

          case 'STAFF_ACCOUNT_CREATED': {
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

