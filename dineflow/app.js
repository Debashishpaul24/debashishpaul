/**
 * ==============================================================================
 * DineFlow - Core Application Engine
 * Pure Vanilla JavaScript SPA Architecture with Multi-Tenant Routing,
 * Real-Time Cross-Tab State Sync, Cart, Ordering, QR Generation,
 * Kitchen Kanban, and Admin Portals.
 * ==============================================================================
 */

(function () {
  'use strict';



  // State Container
  let state = DineFlowStore.get();
  let currentFilterCategory = 'all';
  let searchQuery = '';
  let vegOnlyFilter = false;
  let activeModal = null;
  let cart = []; // Array of cart items
  let activeDetailItem = null;
  let activeTableTentData = null;
  let currentAdminTab = 'orders';
  let activeTrackingOrderId = null;

  // Universal Table Sorter & Serial Extractor
  const sortTablesSerially = (typeof window !== 'undefined' && window.sortTablesSerially) ? window.sortTablesSerially : (arr) => arr;
  const extractTableSerialNumber = (typeof window !== 'undefined' && window.extractTableSerialNumber) ? window.extractTableSerialNumber : (t) => {
    const m = String(t && (t.id || t.name) || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 999999;
  };

  // ------------------------------------------------------------------------------
  // ZERO-NETWORK RESILIENT DISH IMAGE FALLBACK ENGINE
  // Renders exquisite, category-tailored glassmorphic vector badges if corporate VPNs,
  // firewalls, or offline states block external CDN images.
  // ------------------------------------------------------------------------------
  window.dfGetDishSvgFallback = function (categoryId, itemName = '') {
    const configs = {
      'cat-specials': { icon: '👨‍🍳', label: "Chef's Special", g1: '#2e1c0d', g2: '#120f09', accent: '#E5A93C' },
      'cat-starters': { icon: '🥟', label: 'Starters & Bites', g1: '#281c12', g2: '#120e09', accent: '#F59E0B' },
      'cat-biryani': { icon: '🍲', label: 'Royal Dum Biryani', g1: '#2d1808', g2: '#140c06', accent: '#F97316' },
      'cat-pizza': { icon: '🍕', label: 'Gourmet Pizza', g1: '#2c1414', g2: '#140a0a', accent: '#EF4444' },
      'cat-burgers': { icon: '🍔', label: 'Artisanal Burger', g1: '#281a0e', g2: '#130d07', accent: '#EAB308' },
      'cat-pasta': { icon: '🍝', label: 'Handcrafted Pasta', g1: '#251e13', g2: '#120f09', accent: '#D97706' },
      'cat-mains': { icon: '🥘', label: 'Signature Main', g1: '#2b150c', g2: '#140905', accent: '#EA580C' },
      'cat-kebabs': { icon: '🍢', label: 'Tandoor & Kebab', g1: '#29120c', g2: '#140805', accent: '#DC2626' },
      'cat-desserts': { icon: '🍰', label: 'Decadent Dessert', g1: '#291321', g2: '#140810', accent: '#EC4899' },
      'cat-beverages': { icon: '🍹', label: 'Craft Beverage', g1: '#0e222a', g2: '#061116', accent: '#06B6D4' },
      // Bella Vista Ristorante (Italian)
      'cat-bv-antipasti': { icon: '🥗', label: 'Antipasti & Crudo', g1: '#1f2913', g2: '#0f1409', accent: '#84CC16' },
      'cat-bv-pizza': { icon: '🍕', label: 'Woodfired Pizza', g1: '#2c1414', g2: '#140a0a', accent: '#EF4444' },
      'cat-bv-pasta': { icon: '🍝', label: 'Handmade Pasta', g1: '#2c1f10', g2: '#140e07', accent: '#F59E0B' },
      'cat-bv-secondi': { icon: '🥩', label: 'Secondi & Grills', g1: '#2b1414', g2: '#130808', accent: '#DC2626' },
      'cat-bv-dolci': { icon: '🍨', label: 'Artisanal Dolci', g1: '#281324', g2: '#130811', accent: '#D946EF' },
      'cat-bv-vini': { icon: '🍷', label: 'Vini & Aperitivi', g1: '#260f1c', g2: '#12060c', accent: '#E11D48' },
      // Sakura Modern Asian
      'cat-sk-dimsum': { icon: '🥟', label: 'Dim Sum & Baos', g1: '#261a12', g2: '#130c08', accent: '#F59E0B' },
      'cat-sk-sushi': { icon: '🍣', label: 'Nigiri & Maki', g1: '#261219', g2: '#12080c', accent: '#F43F5E' },
      'cat-sk-robata': { icon: '🍢', label: 'Robata Skewers', g1: '#27170e', g2: '#130a06', accent: '#FB923C' },
      'cat-sk-ramen': { icon: '🍜', label: 'Ramen & Broths', g1: '#291e0f', g2: '#140e06', accent: '#EAB308' },
      'cat-sk-wok': { icon: '🥢', label: 'Signature Wok', g1: '#24141d', g2: '#11090d', accent: '#EC4899' },
      'cat-sk-desserts': { icon: '🍵', label: 'Matcha Sweets', g1: '#142517', g2: '#09130b', accent: '#10B981' },
      'cat-sk-drinks': { icon: '🍶', label: 'Sake & Mixology', g1: '#121f28', g2: '#080f14', accent: '#06B6D4' }
    };
    const cfg = configs[categoryId] || { icon: '🍽️', label: 'Culinary Delicacy', g1: '#1c1f2b', g2: '#0d1017', accent: '#E5A93C' };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <defs>
        <radialGradient id="df-grad-${categoryId}" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stop-color="${cfg.g1}"/>
          <stop offset="100%" stop-color="${cfg.g2}"/>
        </radialGradient>
        <linearGradient id="df-stroke-${categoryId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cfg.accent}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#E5A93C" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#df-grad-${categoryId})"/>
      <circle cx="150" cy="122" r="70" fill="none" stroke="url(#df-stroke-${categoryId})" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/>
      <circle cx="150" cy="122" r="54" fill="${cfg.accent}" fill-opacity="0.08" stroke="${cfg.accent}" stroke-width="1" opacity="0.65"/>
      <text x="150" y="140" font-size="52" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">${cfg.icon}</text>
      <rect x="25" y="214" width="250" height="28" rx="14" fill="rgba(15, 23, 42, 0.88)" stroke="${cfg.accent}" stroke-width="1" stroke-opacity="0.35"/>
      <text x="150" y="232" font-size="10.5" font-weight="700" letter-spacing="1.2" fill="${cfg.accent}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" text-transform="uppercase">${cfg.label}</text>
    </svg>`;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  window.dfHandleImageError = function (imgElement, categoryId, itemId) {
    if (!imgElement || imgElement.dataset.failed) return;
    imgElement.dataset.failed = 'true';
    imgElement.onerror = null;
    imgElement.classList.add('df-img-fallback');
    let itemName = '';
    try {
      if (typeof state !== 'undefined' && state.menuItems) {
        const match = state.menuItems.find(m => m.id === itemId);
        if (match) itemName = match.name;
      }
    } catch (e) { }
    imgElement.src = window.dfGetDishSvgFallback(categoryId, itemName);
  };

  // Professional Acoustic Audio Synthesizer (Zero external audio assets needed!)
  const SoundFX = {
    ctx: null,

    init() {
      try {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      } catch (e) { }
    },

    getToneProfile() {
      try {
        const s = DineFlowStore.get();
        return (s && s.settings && s.settings.toneProfile) || 'executive';
      } catch (e) {
        return 'executive';
      }
    },

    // Refined acoustic bell synthesis with fundamental sine, harmonic overtone, and smooth envelope
    playBell(freq, startTime, duration = 0.45, volume = 0.16, overtoneRatio = 2.0, overtoneGainRatio = 0.22, waveType = 'sine') {
      if (!this.ctx) return;
      const ctx = this.ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, startTime);
      masterGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.008); // 8ms soft attack (zero clicks)
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // smooth exponential decay
      masterGain.connect(ctx.destination);

      // Fundamental harmonic
      const osc1 = ctx.createOscillator();
      osc1.type = waveType;
      osc1.frequency.setValueAtTime(freq, startTime);
      osc1.connect(masterGain);
      osc1.start(startTime);
      osc1.stop(startTime + duration + 0.05);

      // Harmonic overtone for natural acoustic warmth
      if (overtoneGainRatio > 0) {
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * overtoneRatio, startTime);
        const overGain = ctx.createGain();
        overGain.gain.setValueAtTime(overtoneGainRatio, startTime);
        overGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.75);
        osc2.connect(overGain);
        overGain.connect(masterGain);
        osc2.start(startTime);
        osc2.stop(startTime + duration + 0.05);
      }
    },

    __lastChimeTime: 0,
    chime(type = 'success', overrideProfile = null) {
      try {
        const nowMs = Date.now();
        if (nowMs - this.__lastChimeTime < 450) {
          return; // Suppress rapid-fire overlapping audio chimes
        }
        this.__lastChimeTime = nowMs;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime + 0.01;
        const profile = overrideProfile || this.getToneProfile();

        if (profile === 'mute') return;

        if (profile === 'concierge') {
          // Warm 5-Star Hotel Hospitality Bell (Rich brass resonance)
          if (type === 'success' || type === 'confirm') {
            this.playBell(587.33, now, 0.4, 0.15, 2.76, 0.18); // D5
            this.playBell(880.00, now + 0.12, 0.65, 0.20, 2.76, 0.22); // A5
          } else if (type === 'alert' || type === 'notice' || type === 'logout') {
            this.playBell(783.99, now, 0.35, 0.14, 2.0, 0.15); // G5
            this.playBell(523.25, now + 0.11, 0.5, 0.16, 2.0, 0.18); // C5
          } else if (type === 'order') {
            this.playBell(523.25, now, 0.35, 0.14, 2.76, 0.2); // C5
            this.playBell(659.25, now + 0.12, 0.4, 0.16, 2.76, 0.2); // E5
            this.playBell(783.99, now + 0.24, 0.65, 0.20, 2.76, 0.25); // G5
          } else {
            this.playBell(659.25, now, 0.5, 0.15, 2.0, 0.18);
          }
        } else if (profile === 'marimba') {
          // Warm Acoustic Marimba (Organic wooden mallet strikes)
          if (type === 'success' || type === 'confirm') {
            this.playBell(440.00, now, 0.28, 0.18, 3.0, 0.12, 'triangle'); // A4
            this.playBell(659.25, now + 0.09, 0.35, 0.22, 3.0, 0.14, 'triangle'); // E5
          } else if (type === 'alert' || type === 'notice' || type === 'logout') {
            this.playBell(587.33, now, 0.25, 0.16, 3.0, 0.10, 'triangle'); // D5
            this.playBell(440.00, now + 0.09, 0.32, 0.18, 3.0, 0.12, 'triangle'); // A4
          } else if (type === 'order') {
            this.playBell(440.00, now, 0.25, 0.16, 3.0, 0.12, 'triangle');
            this.playBell(554.37, now + 0.10, 0.28, 0.18, 3.0, 0.12, 'triangle'); // C#5
            this.playBell(659.25, now + 0.20, 0.40, 0.22, 3.0, 0.15, 'triangle'); // E5
          } else {
            this.playBell(554.37, now, 0.3, 0.16, 3.0, 0.12, 'triangle');
          }
        } else if (profile === 'minimal') {
          // Subtle Discrete Glass / Modern Haptic (Quiet executive minimalism)
          if (type === 'success' || type === 'confirm') {
            this.playBell(1046.50, now, 0.12, 0.12, 1.5, 0.05); // C6
            this.playBell(1318.51, now + 0.06, 0.18, 0.14, 1.5, 0.05); // E6
          } else if (type === 'alert' || type === 'notice' || type === 'logout') {
            this.playBell(1174.66, now, 0.12, 0.10, 1.5, 0.05); // D6
            this.playBell(880.00, now + 0.06, 0.16, 0.12, 1.5, 0.05); // A5
          } else {
            this.playBell(1046.50, now, 0.15, 0.12, 1.5, 0.05);
          }
        } else {
          // Default: 'executive' (Apple Pay / Square POS crystalline luxury chime)
          if (type === 'success' || type === 'confirm') {
            // Elegant two-note harmonic bell (Eb5 -> Bb5)
            this.playBell(622.25, now, 0.4, 0.16, 2.0, 0.22); // Eb5
            this.playBell(932.33, now + 0.11, 0.55, 0.20, 2.0, 0.25); // Bb5
          } else if (type === 'alert' || type === 'notice' || type === 'logout') {
            // Calm, executive downward dual chime (A5 -> E5) - no harsh alarms
            this.playBell(880.00, now, 0.32, 0.14, 2.0, 0.18); // A5
            this.playBell(659.25, now + 0.10, 0.45, 0.16, 2.0, 0.18); // E5
          } else if (type === 'order') {
            // High-end restaurant pass announcement (D5 -> A5 -> D6)
            this.playBell(587.33, now, 0.35, 0.15, 2.0, 0.20); // D5
            this.playBell(880.00, now + 0.11, 0.42, 0.18, 2.0, 0.22); // A5
            this.playBell(1174.66, now + 0.22, 0.65, 0.22, 2.0, 0.26); // D6
          } else {
            this.playBell(880.00, now, 0.4, 0.15, 2.0, 0.20);
          }
        }
      } catch (e) { }
    }
  };

  // Toast Notification (with debounce & stack-limit protection)
  let __lastToastText = '';
  let __lastToastTime = 0;

  function showToast(message, icon = '\u2713') {
    const now = Date.now();
    if (message === __lastToastText && (now - __lastToastTime) < 2200) {
      return; // Suppress duplicate toast stacking
    }
    __lastToastText = message;
    __lastToastTime = now;

    let container = document.getElementById('df-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'df-toast-container';
      container.className = 'df-toast-container';
      document.body.appendChild(container);
    }
    while (container.children.length >= 3) {
      container.removeChild(container.firstChild);
    }
    const toast = document.createElement('div');
    toast.className = 'df-toast';
    toast.innerHTML = `<span class="df-toast-icon">${icon}</span><span class="df-toast-msg">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-14px) scale(0.96)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ------------------------------------------------------------------------------
  // NORMALIZED TABLE & QR CODE URL RESOLVER
  // Cleanly generates absolute SPA URLs (?r=slug&t=tableId) regardless of host,
  // path, subfolder, port, or whether loaded from demo sandbox or production.
  // ------------------------------------------------------------------------------
  function getDineFlowTableUrl(tenantSlug, tableId) {
    let origin = window.location.origin;
    if (!origin || origin === 'null') {
      origin = 'https://www.debashishpaul.in';
    }
    let path = window.location.pathname.replace(/(demo\.html|index\.html).*$/, '');
    if (!path.endsWith('/')) path += '/';
    return `${origin}${path}?r=${encodeURIComponent(tenantSlug)}&t=${encodeURIComponent(tableId)}`;
  }

  // ------------------------------------------------------------------------------
  // MULTI-TENANT SERIAL ORDER ID GENERATOR
  // Generates strictly consecutive, monotonically increasing order IDs for each
  // individual restaurant (e.g. ORD-1049, ORD-1050 for The Urban Plate;
  // ORD-2003 for Bella Vista; ORD-3002 for Sakura Asian; ORD-4001 for new outlets).
  // ------------------------------------------------------------------------------
  function getNextSerialOrderId(tenantSlug) {
    const slug = (tenantSlug || 'the-urban-plate').toString().toLowerCase().trim();

    // Standard starting seeds for known tenant order series
    const RESTAURANT_SEEDS = {
      'the-urban-plate': 1048,
      'bella-vista': 2002,
      'sakura-asian': 3001
    };

    if (!state.orderCounters) {
      state.orderCounters = {};
    }

    const allOrders = Array.isArray(state.orders) ? state.orders : [];
    const existingIds = new Set(allOrders.map(o => o.id));

    // Determine current baseline counter
    let currentVal = state.orderCounters[slug];

    if (!currentVal) {
      const baseSeed = RESTAURANT_SEEDS[slug] || (function () {
        const tenants = Object.keys(state.tenants || {});
        const idx = tenants.indexOf(slug);
        return (idx >= 0 ? idx + 1 : 4) * 1000;
      })();

      const tenantOrders = allOrders.filter(o => {
        const oSlug = (o.tenantId || 'the-urban-plate').toString().toLowerCase().trim();
        return oSlug === slug;
      });

      // Find highest contiguous serial for this tenant (ignoring random outlier jumps)
      let maxFound = baseSeed;
      const sortedNums = tenantOrders
        .map(o => {
          const m = typeof o.id === 'string' && o.id.match(/^ORD-(\d+)$/i);
          return m ? parseInt(m[1], 10) : null;
        })
        .filter(n => n !== null && n >= baseSeed)
        .sort((a, b) => a - b);

      for (const num of sortedNums) {
        if (num <= maxFound + 10) {
          maxFound = Math.max(maxFound, num);
        }
      }

      currentVal = maxFound;
    }

    // Advance to next sequential number
    let nextNum = currentVal + 1;

    // Guarantee absolute uniqueness across all orders in state
    while (existingIds.has(`ORD-${nextNum}`)) {
      nextNum++;
    }

    // Persist counter
    state.orderCounters[slug] = nextNum;
    return `ORD-${nextNum}`;
  }

  // ------------------------------------------------------------------------------
  // REAL-TIME MULTI-TENANT CLOUD SYNCHRONIZATION ENGINE
  // Bridges isolated physical devices (customer smartphone scanning table QR code
  // and kitchen staff laptop/tablet running KDS) with zero accounts or API keys.
  // Uses dedicated high-throughput multi-tenant pub/sub channels on ntfy.sh
  // with Dual-Layer SSE live push and heartbeat polling fallback.
  // ------------------------------------------------------------------------------
  const DINEFLOW_DEVICE_ID = (function () {
    let id = null;
    try {
      id = sessionStorage.getItem('DINEFLOW_TAB_ID_V2');
      if (!id) {
        id = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        sessionStorage.setItem('DINEFLOW_TAB_ID_V2', id);
      }
    } catch (e) {
      id = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    return id;
  })();

  const processedCloudEventIds = new Set();
  function isDuplicateCloudEvent(eventId) {
    if (!eventId) return false;
    if (processedCloudEventIds.has(eventId)) return true;
    processedCloudEventIds.add(eventId);
    if (processedCloudEventIds.size > 200) {
      const oldest = processedCloudEventIds.values().next().value;
      processedCloudEventIds.delete(oldest);
    }
    return false;
  }

  function getCloudTopic(tenantSlug) {
    const slug = (tenantSlug || 'the-urban-plate').toString().toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
    return `dineflow_ops_${slug}`;
  }

  function broadcastCloudEvent(tenantSlug, eventData) {
    try {
      const slug = (tenantSlug || 'the-urban-plate').toString().toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
      const eventId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      processedCloudEventIds.add(eventId);

      const payload = {
        eventId: eventId,
        senderDeviceId: DINEFLOW_DEVICE_ID,
        tenantSlug: slug,
        timestamp: Date.now(),
        ...eventData
      };

      if (window.DineFlowCloudSync && typeof window.DineFlowCloudSync.publish === 'function') {
        window.DineFlowCloudSync.publish(slug, payload);
      }
    } catch (e) {
      console.warn('Cloud broadcast notice:', e);
    }
  }

  function handleRemoteOpsEvent(event) {
    if (!event || typeof event !== 'object') return;
    if (event.senderDeviceId === DINEFLOW_DEVICE_ID) return; // Discard self-broadcast
    if (isDuplicateCloudEvent(event.eventId)) return; // Prevent duplicate handling

    state = DineFlowStore.get();
    let stateChanged = false;

    if (event.action === 'NEW_ORDER') {
      if (event.order && !state.orders.some(o => o.id === event.order.id)) {
        state.orders.unshift(event.order);
        stateChanged = true;

        // Keep local tenant order counter synchronized with remote events
        if (event.order.id && (event.order.tenantId || event.tenantSlug)) {
          const tSlug = (event.order.tenantId || event.tenantSlug).toLowerCase().trim();
          const m = event.order.id.match(/^ORD-(\d+)$/i);
          if (m) {
            const num = parseInt(m[1], 10);
            if (!state.orderCounters) state.orderCounters = {};
            if (!state.orderCounters[tSlug] || num > state.orderCounters[tSlug]) {
              state.orderCounters[tSlug] = num;
            }
          }
        }

        const table = state.tables.find(t => t.id === event.order.tableId);
        if (table) {
          table.status = 'occupied';
          table.qrScans = (table.qrScans || 0) + 1;
          table.lastScanned = 'Just now';
        }
      }
    } else if (event.action === 'ORDER_STATUS_CHANGED') {
      const order = state.orders.find(o => o.id === event.orderId);
      if (order && order.status !== event.newStatus) {
        order.status = event.newStatus;
        if (event.newStatus === 'COMPLETED') {
          order.paymentStatus = 'PAID';
          const pendingBill = state.billRequests.find(b => b.tableId === order.tableId && b.status === 'PENDING');
          if (pendingBill) pendingBill.status = 'PAID';
          const hasMoreOrders = state.orders.some(o => o.tableId === order.tableId && o.status !== 'COMPLETED');
          if (!hasMoreOrders) {
            const tableObj = state.tables.find(t => t.id === order.tableId);
            if (tableObj) {
              tableObj.status = 'available';
              delete tableObj.manuallyOccupied;
            }
          }
        }
        stateChanged = true;
      }
    } else if (event.action === 'STAFF_CALL' || event.action === 'CALL_STAFF') {
      state.staffRequests = Array.isArray(state.staffRequests) ? state.staffRequests : [];
      const reqId = (event.request && event.request.id) ? event.request.id : ('REQ-' + Date.now().toString().slice(-4));
      if (!state.staffRequests.some(r => r.id === reqId)) {
        const staffReq = event.request || {
          id: reqId,
          tableId: event.tableId || 'T12',
          type: 'WAITER',
          label: event.requestLabel || 'Call Server to Table',
          status: 'PENDING',
          time: 'Just now'
        };
        state.staffRequests.unshift(staffReq);
        stateChanged = true;
      }
      const table = state.tables.find(t => t.id === (event.tableId || (event.request && event.request.tableId)));
      if (table) {
        table.status = 'occupied';
        table.lastScanned = 'Just now';
        stateChanged = true;
      }
    } else if (event.action === 'BILL_REQUEST') {
      if (event.bill && !state.billRequests.some(b => b.id === event.bill.id)) {
        state.billRequests.unshift(event.bill);
        stateChanged = true;
      }
    } else if (event.action === 'BILL_SETTLED') {
      const tableOrders = state.orders.filter(o => o.tableId === event.tableId);
      tableOrders.forEach(o => {
        o.paymentStatus = 'PAID';
        o.status = 'COMPLETED';
      });
      const bills = state.billRequests.filter(b => b.tableId === event.tableId);
      bills.forEach(b => { b.status = 'PAID'; });
      const table = state.tables.find(t => t.id === event.tableId);
      if (table) {
        table.status = 'available';
        delete table.manuallyOccupied;
      }
      stateChanged = true;
    } else if (event.action === 'TABLES_CLEARED_ALL' || event.action === 'ALL_TABLES_CLEARED') {
      state.tables.forEach(t => {
        t.status = 'available';
        delete t.manuallyOccupied;
      });
      state.orders.forEach(o => {
        if (o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
          o.status = 'COMPLETED';
          o.paymentStatus = 'PAID';
        }
      });
      state.billRequests.forEach(b => { b.status = 'PAID'; });
      state.staffRequests.forEach(s => { s.status = 'RESOLVED'; });
      stateChanged = true;
    } else if (event.action === 'TABLE_STATUS_TOGGLED') {
      const table = state.tables.find(t => t.id === event.tableId);
      if (table) {
        if (event.isOccupied) {
          table.status = 'occupied';
          table.manuallyOccupied = true;
        } else {
          table.status = 'available';
          delete table.manuallyOccupied;
          state.orders.forEach(o => {
            if (o.tableId === event.tableId && (!o.tenantId || o.tenantId === event.tenantSlug) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
              o.status = 'COMPLETED';
              o.paymentStatus = 'PAID';
            }
          });
          state.billRequests.forEach(b => {
            if (b.tableId === event.tableId && (!b.tenantId || b.tenantId === event.tenantSlug)) {
              b.status = 'PAID';
            }
          });
          state.staffRequests.forEach(s => {
            if (s.tableId === event.tableId && (!s.tenantId || s.tenantId === event.tenantSlug)) {
              s.status = 'RESOLVED';
            }
          });
        }
        stateChanged = true;
      }
    } else if (event.action === 'TABLE_CREATED') {
      if (event.table && !state.tables.some(t => t.id === event.table.id && (!t.tenantId || t.tenantId === event.tenantSlug))) {
        state.tables.push(event.table);
        state.tables = sortTablesSerially(state.tables);
        stateChanged = true;
      }
    }

    if (stateChanged) {
      DineFlowStore.saveLocalOnly(state);
    }

    if (typeof window.onDineFlowRemoteSync === 'function') {
      window.onDineFlowRemoteSync({
        type: 'SYNC',
        payload: state,
        meta: event
      });
    }
  }

  const DineFlowCloudSync = {
    currentTenantSlug: null,
    client: null,
    isConnected: false,
    reconnectTimer: null,
    serverIndex: 0,
    outbox: [],
    servers: [
      { host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
      { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' }
    ],

    broadcast(meta) {
      if (!meta || !meta.action) return;
      const tenantSlug = meta.tenantSlug || this.currentTenantSlug || (state && state.currentTenantId) || 'the-urban-plate';
      broadcastCloudEvent(tenantSlug, meta);
    },

    publish(tenantSlug, payload) {
      const topic = `dineflow/${tenantSlug}/ops`;
      if (this.client && this.isConnected) {
        try {
          const message = new Paho.MQTT.Message(JSON.stringify(payload));
          message.destinationName = topic;
          message.qos = 0;
          this.client.send(message);
          return;
        } catch (e) {
          console.warn('Publish failed, queuing payload', e);
        }
      }
      // If client not connected yet, queue in outbox
      this.outbox.push({ topic, payload });
      if (!this.isConnected) this.connect();
    },

    subscribe(tenantSlug) {
      if (!tenantSlug) return;
      const normalizedSlug = tenantSlug === '#' ? '#' : (tenantSlug || 'the-urban-plate').toString().toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
      const prevSlug = this.currentTenantSlug;
      this.currentTenantSlug = normalizedSlug;

      if (this.client && this.isConnected) {
        try {
          if (prevSlug && prevSlug !== normalizedSlug) {
            this.client.unsubscribe(prevSlug === '#' ? 'dineflow/#' : `dineflow/${prevSlug}/#`);
          }
          this.client.subscribe(normalizedSlug === '#' ? 'dineflow/#' : `dineflow/${normalizedSlug}/#`);
        } catch (e) { }
      } else {
        this.connect();
      }
    },

    connect() {
      if (typeof window === 'undefined' || typeof Paho === 'undefined' || !Paho.MQTT) {
        // Retry shortly if script is still loading
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 600);
        return;
      }

      if (this.isConnected) return;

      const s = this.servers[this.serverIndex % this.servers.length];
      const clientId = 'df_' + DINEFLOW_DEVICE_ID + '_' + Math.random().toString(36).substring(2, 6);

      try {
        if (this.client) {
          try { this.client.disconnect(); } catch (e) { }
        }
        this.client = new Paho.MQTT.Client(s.host, s.port, s.path, clientId);

        this.client.onConnectionLost = (responseObject) => {
          this.isConnected = false;
          if (responseObject.errorCode !== 0) {
            this.serverIndex++;
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => this.connect(), 2500);
          }
        };

        this.client.onMessageArrived = (message) => {
          try {
            const parsed = JSON.parse(message.payloadString);
            handleRemoteOpsEvent(parsed);
          } catch (e) { }
        };

        this.client.connect({
          useSSL: true,
          timeout: 5,
          keepAliveInterval: 30,
          cleanSession: true,
          onSuccess: () => {
            this.isConnected = true;
            if (this.currentTenantSlug) {
              try {
                this.client.subscribe(this.currentTenantSlug === '#' ? 'dineflow/#' : `dineflow/${this.currentTenantSlug}/#`);
              } catch (e) { }
            }
            // Flush outbox
            while (this.outbox.length > 0) {
              const item = this.outbox.shift();
              try {
                const msg = new Paho.MQTT.Message(JSON.stringify(item.payload));
                msg.destinationName = item.topic;
                this.client.send(msg);
              } catch (e) { }
            }
          },
          onFailure: () => {
            this.isConnected = false;
            this.serverIndex++;
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => this.connect(), 2500);
          }
        });
      } catch (err) {
        this.isConnected = false;
        this.serverIndex++;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 2500);
      }
    },

    unsubscribe() {
      if (this.client && this.isConnected && this.currentTenantSlug) {
        try {
          this.client.unsubscribe(`dineflow/${this.currentTenantSlug}/#`);
        } catch (e) { }
      }
    }
  };

  // Expose globally for DineFlowStore hook
  window.DineFlowCloudSync = DineFlowCloudSync;

  // URL Builders & Navigation (Query-parameter routing without '#')
  function buildRouteUrl(route) {
    if (!route) return './';
    if (route.view === 'hub') {
      if (route.section) {
        return `?section=${encodeURIComponent(route.section)}`;
      }
      return './';
    }
    if (route.view === 'customer') {
      return `?r=${encodeURIComponent(route.tenantSlug || 'the-urban-plate')}&t=${encodeURIComponent(route.tableId || 'T12')}`;
    }
    if (route.view === 'login' || route.view === 'staff-login') {
      if (route.tenantSlug) {
        return `?r=${encodeURIComponent(route.tenantSlug)}&view=login`;
      }
      return '?view=login';
    }
    if (route.view === 'admin') {
      const tenant = route.tenantSlug || (state.session && state.session.tenantId) || state.currentTenantId || 'the-urban-plate';
      return `?r=${encodeURIComponent(tenant)}&view=admin`;
    }
    if (route.view === 'super-admin') return '?view=super-admin';
    if (route.view === 'onboarding') return '?view=onboarding';
    return './';
  }

  function navigateTo(route) {
    const url = buildRouteUrl(route);
    window.history.pushState({}, '', url);
    renderApp();
  }

  // Router Parser (Supports Query Parameters like ?view=admin, ?section=roi-calculator and auto-migrates legacy '#' hashes)
  function parseRoute() {
    // 1. Backward Compatibility & Complete '#' Elimination:
    // If any legacy or in-page hash exists (e.g. #roi-calculator, #pilot, #admin, #r/the-urban-plate/t/T12),
    // immediately rewrite the address bar to a clean query URL without '#' via history.replaceState.
    let targetQuery = '';
    const rawHash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (rawHash) {
      const parts = rawHash.split('/');
      if (parts[0] === 'login') {
        targetQuery = parts[1] && parts[1] !== 'admin' ? `?view=login&target=${encodeURIComponent(parts[1])}` : '?view=login';
      } else if (parts[0] === 'r' && parts[1]) {
        targetQuery = `?r=${encodeURIComponent(parts[1])}&t=${encodeURIComponent((parts[2] === 't' && parts[3]) ? parts[3] : 'T12')}`;
      } else if (parts[0] === 'admin') {
        const tenantSlug = parts[1] || 'the-urban-plate';
        targetQuery = `?r=${encodeURIComponent(tenantSlug)}&view=admin`;
      } else if (parts[0] === 'dine' && parts[1]) {
        const tenantSlug = parts[1];
        const tableId = parts[2] || 'T01';
        targetQuery = `?r=${encodeURIComponent(tenantSlug)}&t=${encodeURIComponent(tableId)}`;
      } else if (parts[0] === 'super-admin') {
        targetQuery = '?view=super-admin';
      } else if (parts[0] === 'onboarding') {
        targetQuery = '?view=onboarding';
      } else if (rawHash === 'pilot' || rawHash === 'free-pilot') {
        targetQuery = '?pilot=true';
      } else {
        // Any in-page anchor section (e.g. #roi-calculator, #demo-sandbox, #why-dineflow)
        targetQuery = `?section=${encodeURIComponent(rawHash)}`;
      }

      // Immediately clear '#' from the browser address bar
      window.history.replaceState({}, '', targetQuery);
    }

    // 2. Query Parameters routing (?view=admin, ?section=roi-calculator, ?r=the-urban-plate&t=T12, etc.)
    const searchSource = targetQuery || window.location.search;
    const searchParams = new URLSearchParams(searchSource.startsWith('?') ? searchSource.slice(1) : searchSource);
    if (searchParams.get('clear') === 'true' || searchParams.get('reset') === 'true' || searchParams.get('cache') === 'clear') {
      DineFlowStore.clearAllCache();
      searchParams.delete('clear');
      searchParams.delete('reset');
      searchParams.delete('cache');
      const cleanSearch = searchParams.toString();
      window.history.replaceState({}, '', window.location.pathname + (cleanSearch ? '?' + cleanSearch : ''));
      state = DineFlowStore.get();
    }

    const viewParam = searchParams.get('view');
    const rParam = searchParams.get('r');
    const tParam = searchParams.get('t');
    const sectionParam = searchParams.get('section');
    const pilotParam = searchParams.get('pilot');

    // Multi-Restaurant Directory / Outlets Showcase: ?view=restaurants or ?view=directory
    if (viewParam === 'restaurants' || viewParam === 'directory' || viewParam === 'outlets') {
      return {
        view: 'hub',
        section: 'restaurant-directory'
      };
    }

    // Tenant-isolated Staff OS view: ?r=<tenant>&view=admin
    if (viewParam === 'admin') {
      return {
        view: 'admin',
        tenantSlug: rParam || (state.session && state.session.tenantId) || state.currentTenantId || 'the-urban-plate'
      };
    }

    // Single Unified Operations & Staff Login Gateway: ?view=login or ?view=staff-login or ?view=owner-login
    if (viewParam === 'login' || viewParam === 'staff-login' || viewParam === 'owner-login') {
      const isOwner = viewParam === 'owner-login' || searchParams.get('target') === 'super-admin' || searchParams.get('portal') === 'owner';
      return {
        view: 'login',
        target: isOwner ? 'super-admin' : 'admin',
        portal: isOwner ? 'owner' : 'staff',
        tenantSlug: rParam || null
      };
    }

    // Customer Guest Menu: ?r=<tenant>&t=<tableId>
    if (rParam) {
      return {
        view: 'customer',
        tenantSlug: rParam,
        tableId: tParam || 'T12'
      };
    }

    if (viewParam === 'super-admin') {
      return { view: 'super-admin' };
    }

    if (viewParam === 'demo' || viewParam === 'sandbox') {
      return {
        view: 'demo',
        role: searchParams.get('role') || 'staff',
        step: searchParams.get('step') || null,
        autostart: searchParams.get('autostart') === 'true' || searchParams.get('sim') === 'true',
        sound: searchParams.get('sound') !== 'false' && searchParams.get('sound') !== '0'
      };
    }

    if (viewParam === 'onboarding') {
      return { view: 'onboarding' };
    }

    // Default Route: Platform Showcase Hub (with optional query section)
    return {
      view: 'hub',
      section: sectionParam || (pilotParam === 'true' ? 'pilot' : null)
    };
  }

  // Get current tenant data
  function getCurrentTenant(slug) {
    const currentSlug = slug || state.currentTenantId;
    return state.tenants[currentSlug] || state.tenants['the-urban-plate'];
  }

  // Apply Tenant Brand Variables to CSS Root
  function applyTenantBranding(tenant) {
    if (!tenant) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', tenant.primaryColor || '#E5A93C');
    root.style.setProperty('--brand-secondary', tenant.secondaryColor || '#0F172A');

    // Hex to RGB
    const hex = (tenant.primaryColor || '#E5A93C').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 229;
    const g = parseInt(hex.substring(2, 4), 16) || 169;
    const b = parseInt(hex.substring(4, 6), 16) || 60;
    root.style.setProperty('--brand-primary-rgb', `${r}, ${g}, ${b}`);

    document.title = `${tenant.name} | QR Digital Dining Experience`;
  }

  // Floating Role Switcher Pill for Multi-Persona Exploration
  function renderFloatingRoleSwitcher(activeView) {
    if (window.self !== window.top || activeView === 'customer') {
      removeFloatingRoleSwitcher();
      return;
    }

    let el = document.getElementById('df-floating-demo-bar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'df-floating-demo-bar';
      document.body.appendChild(el);
    }
    el.style.display = 'block';

    const isCustomerView = (activeView === 'customer');
    const isCollapsed = localStorage.getItem('dineflow_demo_bar_collapsed') === 'true';

    el.className = `df-floating-demo-bar ${isCustomerView ? 'above-bottom-nav' : ''} ${isCollapsed ? 'is-collapsed' : ''}`;

    if (isCollapsed) {
      el.innerHTML = `
        <button id="btn-expand-demo-bar" class="df-demo-bar-expand-btn" title="Click to expand Demo Portal Switcher">
          <span>⚡ Switch Demo</span>
        </button>
      `;
      document.getElementById('btn-expand-demo-bar')?.addEventListener('click', () => {
        localStorage.setItem('dineflow_demo_bar_collapsed', 'false');
        renderFloatingRoleSwitcher(activeView);
      });
      return;
    }

    const curTenant = state.currentTenantId || 'the-urban-plate';
    const curTable = state.currentTableId || (curTenant === 'bella-vista' ? 'BV-02' : (curTenant === 'sakura-asian' ? 'SK-02' : 'T12'));

    el.innerHTML = `
      <div class="df-demo-bar-inner">
        <a href="?view=hub&section=restaurant-directory" class="df-demo-bar-brand" title="View All Partner Restaurants Directory">
          <span class="live-dot"></span>
          <span>🏢 Outlets (3) ↗</span>
        </a>
        <div class="df-demo-bar-links">
          <a href="?r=${curTenant}&t=${curTable}" class="df-demo-link ${activeView === 'customer' ? 'active' : ''}" title="Guest QR Menu (${curTable})">
            <span>📱 Guest ${curTable}</span>
          </a>
          <a href="?r=bella-vista&t=BV-02" class="df-demo-link ${curTenant === 'bella-vista' && activeView === 'customer' ? 'active' : ''}" title="Bella Vista Italian Guest Menu">
            <span>🍷 Bella Vista</span>
          </a>
          <a href="?r=sakura-asian&t=SK-02" class="df-demo-link ${curTenant === 'sakura-asian' && activeView === 'customer' ? 'active' : ''}" title="Sakura Asian Guest Menu">
            <span>🍱 Sakura</span>
          </a>
          <a href="?r=${curTenant}&view=admin" class="df-demo-link ${activeView === 'admin' ? 'active' : ''}" title="Kitchen Staff OS & KDS">
            <span>👨‍🍳 Staff OS</span>
          </a>
          <a href="?view=super-admin" class="df-demo-link ${activeView === 'super-admin' ? 'active' : ''}" title="Platform Super Admin">
            <span>⚡ SaaS HQ</span>
          </a>
        </div>
        <button id="btn-collapse-demo-bar" class="df-demo-bar-close" title="Minimize demo switcher to corner">✕</button>
      </div>
    `;

    document.getElementById('btn-collapse-demo-bar')?.addEventListener('click', () => {
      localStorage.setItem('dineflow_demo_bar_collapsed', 'true');
      renderFloatingRoleSwitcher(activeView);
    });
  }

  function removeFloatingRoleSwitcher() {
    const el = document.getElementById('df-floating-demo-bar');
    if (el) el.style.display = 'none';
  }

  function handleHubQueryNavigation(section) {
    if (!section) return;

    // Sync active state on navigation guide pills
    document.querySelectorAll('.df-nav-pill').forEach(pill => {
      const href = pill.getAttribute('href') || '';
      const isMatch = href.includes(`section=${section}`);
      pill.classList.toggle('active', isMatch);
    });

    if (section === 'pilot' || section === 'free-pilot') {
      const calcEl = document.getElementById('roi-calculator');
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        calcEl.classList.add('df-roi-highlight-pulse');
        setTimeout(() => calcEl.classList.remove('df-roi-highlight-pulse'), 2500);
      }
      const leadModal = document.getElementById('lead-modal-backdrop');
      if (leadModal) {
        setTimeout(() => {
          const rangeTables = document.getElementById('range-tables');
          const leadTables = document.getElementById('lead-tables');
          if (rangeTables && leadTables) {
            leadTables.value = rangeTables.value;
          }
          leadModal.classList.add('active');
        }, 350);
      }
      return;
    }

    const targetEl = document.getElementById(section);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (section === 'roi-calculator') {
          targetEl.classList.add('df-roi-highlight-pulse');
          setTimeout(() => targetEl.classList.remove('df-roi-highlight-pulse'), 2500);
        }
      }, 100);
    }
  }

  // ==============================================================================
  // VIEW RENDERERS & ROUTE GUARDS
  // ==============================================================================

  function dismissBootLoader() {
    try {
      document.documentElement.classList.remove('df-deep-loading');
      const bootLoader = document.getElementById('df-boot-loader');
      if (bootLoader) bootLoader.style.display = 'none';
    } catch (e) { }
  }

  function renderApp() {


    const activeEl = document.activeElement;
    const isSearchFocused = activeEl && activeEl.id === 'df-search-input';
    const cursorStart = isSearchFocused ? activeEl.selectionStart : null;
    const cursorEnd = isSearchFocused ? activeEl.selectionEnd : null;

    state = DineFlowStore.get();
    const route = parseRoute();
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Ensure active tenant cloud synchronization across mobile and desktop
    if (typeof DineFlowCloudSync !== 'undefined') {
      if (route.view === 'admin' || route.view === 'super-admin') {
        DineFlowCloudSync.subscribe('#');
      } else {
        const activeTenantSlug = route.tenantSlug || (state.session && state.session.tenantId) || state.currentTenantId || 'the-urban-plate';
        DineFlowCloudSync.subscribe(activeTenantSlug);
      }
    }

    // Connect & hydrate live PostgreSQL database stream
    if (typeof DineFlowDB !== 'undefined' && typeof DineFlowDB.init === 'function') {
      const activeTenantSlug = route.tenantSlug || (state.session && state.session.tenantId) || state.currentTenantId || 'the-urban-plate';
      DineFlowDB.init(activeTenantSlug);
    }

    const isStaffAuth = state.session && state.session.isAuthenticated && (state.session.role === 'RESTAURANT_ADMIN' || state.session.role === 'SUPER_ADMIN');
    const isSuperAuth = state.session && state.session.isAuthenticated && state.session.role === 'SUPER_ADMIN';

    if (route.view === 'hub') {
      removeFloatingRoleSwitcher();
      if (!document.getElementById('demo-sandbox')) {
        renderShowcaseHubView(appEl);
      }
      handleHubQueryNavigation(route.section);
    } else if (route.view === 'customer') {
      state.currentTenantId = route.tenantSlug;
      state.currentTableId = route.tableId;
      applyTenantBranding(getCurrentTenant(route.tenantSlug));
      renderCustomerView(appEl, route.tenantSlug, route.tableId);
      renderFloatingRoleSwitcher('customer');
    } else if (route.view === 'logout') {
      removeFloatingRoleSwitcher();
      state.session = {
        isAuthenticated: false,
        role: 'CUSTOMER',
        user: null,
        tenantId: state.currentTenantId || 'the-urban-plate'
      };
      DineFlowStore.save(state);
      SoundFX.chime('notice');
      showToast('Logged out of operations session.', '🔒');
      navigateTo({ view: 'login' });
      return;
    } else if (route.view === 'login') {
      renderLoginView(appEl, null, null, null, route.tenantSlug || null);
      renderFloatingRoleSwitcher('login');
    } else if (route.view === 'admin') {
      const targetTenantSlug = route.tenantSlug || (state.session && state.session.tenantId) || state.currentTenantId || 'the-urban-plate';
      const tenant = getCurrentTenant(targetTenantSlug);

      // 1. Session Revocation Check: If staff was revoked in Owner HQ, terminate session immediately!
      const currentStaff = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
      if (state.session && state.session.isAuthenticated && state.session.role === 'RESTAURANT_ADMIN') {
        const isStillValid = currentStaff.some(acc => acc.id === state.session.user?.id && acc.role === 'RESTAURANT_ADMIN');
        if (!isStillValid) {
          state.session = { isAuthenticated: false, role: 'CUSTOMER', user: null, tenantId: targetTenantSlug };
          DineFlowStore.save(state);
          removeFloatingRoleSwitcher();
          SoundFX.chime('alert');
          showToast('Session Terminated: Your staff profile was revoked by the restaurant owner.', '🔒');
          renderLoginView(appEl, `?r=${targetTenantSlug}&view=admin`, 'RESTAURANT_ADMIN', 'staff', targetTenantSlug);
          dismissBootLoader();
          return;
        }

        // 2. Strict Cross-Tenant RBAC Barrier:
        // A restaurant staff account is strictly bound to its assigned restaurant tenantId!
        if (state.session.tenantId && state.session.tenantId !== tenant.slug) {
          const staffHomeTenant = (state.tenants && state.tenants[state.session.tenantId]?.name) || state.session.tenantId;
          SoundFX.chime('alert');
          showToast(`Access Restricted: Your staff account belongs to ${staffHomeTenant}. You cannot access ${tenant.name}'s Staff OS.`, '🚫');
          navigateTo({ view: 'admin', tenantSlug: state.session.tenantId });
          return;
        }
      }

      if (!isStaffAuth) {
        const currentStaffList = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
        const defaultStaff = currentStaffList.find(s => (!s.tenantId || s.tenantId === targetTenantSlug) && s.role === 'RESTAURANT_ADMIN') || currentStaffList[0];
        state.session = {
          isAuthenticated: true,
          role: 'RESTAURANT_ADMIN',
          user: defaultStaff,
          tenantId: targetTenantSlug
        };
        DineFlowStore.save(state);
      }
      state.currentTenantId = tenant.slug;
      applyTenantBranding(tenant);
      renderAdminView(appEl, tenant);
      renderFloatingRoleSwitcher('admin');
    } else if (route.view === 'super-admin') {
      if (!isSuperAuth) {
        removeFloatingRoleSwitcher();
        if (state.session && state.session.isAuthenticated) {
          showToast(`Access Restricted: Staff account (${state.session.user?.name || 'Staff'}) is restricted to Restaurant Staff OS.`, '🔒');
          navigateTo({ view: 'admin' });
          return;
        }
        renderLoginView(appEl, '?view=super-admin', 'SUPER_ADMIN', 'owner');
        dismissBootLoader();
        return;
      }
      renderSuperAdminView(appEl);
      renderFloatingRoleSwitcher('super-admin');
    } else if (route.view === 'onboarding') {
      if (!isSuperAuth) {
        removeFloatingRoleSwitcher();
        renderLoginView(appEl, '?view=onboarding', 'SUPER_ADMIN');
        dismissBootLoader();
        return;
      }
      renderOnboardingView(appEl);
      removeFloatingRoleSwitcher();
    } else if (route.view === 'demo' || route.view === 'sandbox') {
      removeFloatingRoleSwitcher();
      const search = window.location.search || '?view=demo';
      window.location.replace('demo.html' + search);
      return;
    }

    if (isSearchFocused) {
      const newInput = document.getElementById('df-search-input');
      if (newInput) {
        newInput.focus();
        if (cursorStart !== null) {
          try { newInput.setSelectionRange(cursorStart, cursorEnd); } catch (e) { }
        }
      }
    }

    // Dismiss boot shield after target view has been fully mounted in #app
    dismissBootLoader();
  }

  // ------------------------------------------------------------------------------
  // 00. INTERACTIVE PLATFORM SHOWCASE HUB VIEW (#/hub)
  // ------------------------------------------------------------------------------
  function renderShowcaseHubView(container) {
    document.title = 'DineFlow - QR Restaurant SaaS Platform Showcase & Operations Hub';

    container.innerHTML = `
      <header class="df-topbar df-hub-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon" style="background: linear-gradient(135deg, #E5A93C, #FF5E3A); color: #fff;">🍽️</div>
          <div class="df-brand-text">
            <h1>DineFlow - QR Restaurant SaaS</h1>
            <span class="df-brand-tagline">Multi-Tenant Hospitality Ecosystem &bull; Real-Time Operations</span>
          </div>
        </div>
        <div class="df-top-actions">
          <div class="df-cloud-sync-pill" title="Live PostgreSQL Realtime Stream Active" style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.35); padding: 0.28rem 0.65rem; border-radius: 999px;">
            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10B981; box-shadow: 0 0 8px #10B981;"></span>
            <span class="df-hide-mobile">Postgres </span>Live
          </div>
          <a href="../projects" class="df-pill-btn" title="Back to Debashish Paul Portfolio">
            <span>← Back to Portfolio</span>
          </a>
          <a href="?view=demo" class="df-pill-btn" style="background: rgba(229,169,60,0.15); border-color: var(--brand-primary); color: #fff;" title="Dual-Device Live Operations Sandbox">
            <span>⚡ Dual-Device Demo</span>
          </a>
          <a href="?view=login" class="df-pill-btn primary" title="Universal Operations Terminal Login">
            <span>Terminal Login 🔒</span>
          </a>
        </div>
      </header>

      <main class="df-hub-layout">
        <div class="df-hub-hero">
          <div class="df-hub-badge">
            <span class="live-indicator"></span>
            <span>Production-Grade Hospitality SaaS Platform</span>
          </div>
          <h1 class="df-hub-headline">
            Experience Next-Gen Digital Dining &amp; Kitchen Operations
          </h1>
          <p class="df-hub-subtext">
            Engineered by <a href="../" style="color: var(--brand-primary); font-weight: 700; text-decoration: none;">Debashish Paul</a>. 
            Choose an interactive portal below or launch the unified side-by-side simulator to test real-time cross-device event synchronization:
          </p>
        </div>

        <!-- Interactive Dual-Device Sandbox Feature Banner -->
        <div class="df-hub-sandbox-banner">
          <div class="df-sandbox-banner-badge">
            <span class="live-indicator"></span>
            <span>RECOMMENDED INTERACTIVE EXPERIENCE</span>
          </div>
          <div class="df-sandbox-banner-body">
            <div class="df-sandbox-banner-info">
              <h2 class="df-sandbox-banner-title">
                Dual-Device Operations Sandbox
              </h2>
              <p class="df-sandbox-banner-desc">
                Experience the entire restaurant ecosystem side-by-side on a single screen! Watch live cross-frame sync as a guest orders on an iPhone 16 Pro and the Kitchen KDS Kanban rings &amp; dispatches in real-time.
              </p>
              <div class="df-sandbox-features">
                <span class="df-sandbox-chip">⚡ Live BroadcastChannel Sync</span>
                <span class="df-sandbox-chip">📱 Customer iPhone Simulator</span>
                <span class="df-sandbox-chip">👨‍🍳 Kitchen KDS Kanban</span>
                <span class="df-sandbox-chip">🔊 Acoustic Hotel Chimes</span>
              </div>

              <!-- 4-Step Interactive Architecture Pipeline -->
              <div class="df-sandbox-pipeline">
                <div class="df-pipeline-step">
                  <span class="df-pipeline-num">Step 1</span>
                  <span class="df-pipeline-title">📱 QR Mobile Scan</span>
                  <span class="df-pipeline-desc">Guest opens Table T12 menu, customizes dishes &amp; places order</span>
                </div>
                <div class="df-pipeline-step">
                  <span class="df-pipeline-num">Step 2</span>
                  <span class="df-pipeline-title">⚡ Real-Time Bus</span>
                  <span class="df-pipeline-desc">BroadcastChannel event dispatches instantly across windows</span>
                </div>
                <div class="df-pipeline-step">
                  <span class="df-pipeline-num">Step 3</span>
                  <span class="df-pipeline-title">👨‍🍳 Kitchen KDS Chime</span>
                  <span class="df-pipeline-desc">Kitchen Kanban rings, receives ticket &amp; starts preparation</span>
                </div>
                <div class="df-pipeline-step">
                  <span class="df-pipeline-num">Step 4</span>
                  <span class="df-pipeline-title">🔔 5-Stage Tracking</span>
                  <span class="df-pipeline-desc">Guest phone displays live cooking milestones with zero refresh</span>
                </div>
              </div>
            </div>
            <div class="df-sandbox-banner-cta">
              <a href="?view=demo" class="df-sandbox-launch-btn">
                <span>Launch Dual-Device Sandbox</span>
                <span class="btn-arrow">→</span>
              </a>
              <span class="df-sandbox-subhint">1-Click Auto Simulation &bull; Zero Configuration</span>
            </div>
          </div>
        </div>

        <!-- Multi-Restaurant Directory & Live Outlets Showcase -->
        <section class="df-restaurants-directory-section" id="restaurant-directory">
          <div class="df-directory-header">
            <div class="df-directory-title-wrap">
              <h2>
                <span>🏢</span> Multi-Restaurant Portals &amp; Live Outlets
              </h2>
              <p>
                Each restaurant operates with complete multi-tenant database isolation, custom branding, dedicated Kitchen KDS, and private staff credentials.
              </p>
            </div>
            <div class="df-directory-badge">
              <span class="live-indicator"></span>
              <span>${Object.keys(state.tenants || {}).length || 3} Active Tenants</span>
            </div>
          </div>

          <div class="df-outlets-grid">
            ${Object.values(state.tenants || {}).map(t => {
      const totalTbls = (state.tables || []).filter(tbl => tbl.tenantId === t.slug).length || 8;
      const occTbls = (state.tables || []).filter(tbl => tbl.tenantId === t.slug && tbl.status === 'occupied').length;
      const tenantOrders = (state.orders || []).filter(o => o.tenantId === t.slug);
      const shiftRev = tenantOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const defaultTable = t.slug === 'bella-vista' ? 'BV-02' : (t.slug === 'sakura-asian' ? 'SK-02' : 'T12');
      const primaryColor = (t.theme && t.theme.primaryColor) || '#E5A93C';
      const cuisineLabel = t.slug === 'bella-vista' ? 'Italian Trattoria' : (t.slug === 'sakura-asian' ? 'Pan-Asian & Robata' : 'Bistro & Craft Bar');

      return `
                <div class="df-outlet-card" style="--outlet-color: ${primaryColor};">
                  <div class="df-outlet-top">
                    <div class="df-outlet-brand">
                      <div class="df-outlet-icon">${t.logoEmoji || '🍽️'}</div>
                      <div class="df-outlet-info">
                        <h3>${t.name}</h3>
                        <div class="df-outlet-branch">
                          <span>📍 ${t.branch || 'Main'}</span>
                          <span>&bull;</span>
                          <span class="df-outlet-cuisine-tag">${cuisineLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="df-outlet-desc">
                    ${t.tagline || 'Exquisite hospitality powered by DineFlow SaaS platform.'}
                  </p>
                  <div class="df-outlet-metrics">
                    <div class="df-metric-item">
                      <span class="metric-label">Tables</span>
                      <span class="metric-value">${totalTbls} Tables</span>
                    </div>
                    <div class="df-metric-item">
                      <span class="metric-label">Floor Status</span>
                      <span class="metric-value live">● ${occTbls} Occupied</span>
                    </div>
                    <div class="df-metric-item">
                      <span class="metric-label">Shift Revenue</span>
                      <span class="metric-value">₹${shiftRev.toLocaleString('en-IN')} Today</span>
                    </div>
                  </div>
                  <div class="df-outlet-actions">
                    <a href="?r=${t.slug}&t=${defaultTable}" class="df-outlet-btn primary" title="Open Guest Menu for Table ${defaultTable}">
                      <span>📱 Guest Menu (Table ${defaultTable})</span>
                    </a>
                    <div class="df-outlet-actions-row">
                      <a href="?r=${t.slug}&view=admin" class="df-outlet-btn staff" title="Launch Dedicated Kitchen Staff OS">
                        <span>👨‍🍳 Staff OS &amp; KDS</span>
                      </a>
                      <a href="?r=${t.slug}&view=staff-login" class="df-outlet-btn secondary" title="Open Keypad Staff Login">
                        <span>🔐 Staff Login</span>
                      </a>
                    </div>
                  </div>
                </div>
              `;
    }).join('')}
          </div>
        </section>

        <div class="df-hub-grid">
          <!-- Card 1: Guest Dining -->
          <div class="df-hub-card guest-card">
            <div class="df-hub-card-top">
              <span class="df-hub-role-badge">Front-of-House &bull; Guest Experience</span>
              <div class="df-hub-card-icon">📱</div>
            </div>
            <h2 class="df-hub-card-title">At-Table QR Dining</h2>
            <div class="df-hub-card-sub">The Urban Plate &bull; Table T12</div>
            <p class="df-hub-card-desc">
              Zero-download mobile ordering experience. Browse 32 gourmet delicacies, filter Pure Veg, customize cooking instructions, and track live kitchen status.
            </p>
            <ul class="df-hub-features-list">
              <li><span>✓</span> Instant QR scan simulation (Table T12)</li>
              <li><span>✓</span> Real-time 5-stage order progress tracker</li>
              <li><span>✓</span> 1-Touch Waiter Call &amp; Zero-Fee UPI billing</li>
            </ul>
            <div class="df-hub-card-cta">
              <a href="?r=the-urban-plate&t=T12" class="df-pill-btn primary" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700;">
                Launch Guest Menu (Table T12) →
              </a>
            </div>
          </div>

          <!-- Card 2: Kitchen Staff OS -->
          <div class="df-hub-card staff-card">
            <div class="df-hub-card-top">
              <span class="df-hub-role-badge staff">Back-of-House &bull; Operations</span>
              <div class="df-hub-card-icon">👨‍🍳</div>
            </div>
            <h2 class="df-hub-card-title">Kitchen Staff OS &amp; KDS</h2>
            <div class="df-hub-card-sub">Chef &amp; Floor Management Hub</div>
            <p class="df-hub-card-desc">
              Frontline operations console. Real-time Kitchen Display System (KDS) Kanban board, visual 20-table dining floor matrix, and service bell dispatcher.
            </p>
            <ul class="df-hub-features-list">
              <li><span>✓</span> Real-time Kanban cross-tab sync without refresh</li>
              <li><span>✓</span> Dynamic Table Tent Stand print generator</li>
              <li><span>✓</span> Fast 4-digit PIN access (PIN: <strong>1234</strong>)</li>
            </ul>
            <div class="df-hub-card-cta">
              <a href="?view=admin" class="df-pill-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700; background: rgba(229,169,60,0.15); border-color: var(--brand-primary); color: #fff;">
                Launch Kitchen Staff OS →
              </a>
            </div>
          </div>

          <!-- Card 3: SaaS Super Admin -->
          <div class="df-hub-card admin-card">
            <div class="df-hub-card-top">
              <span class="df-hub-role-badge super">Multi-Tenant Platform HQ</span>
              <div class="df-hub-card-icon">⚡</div>
            </div>
            <h2 class="df-hub-card-title">SaaS Platform Super Admin</h2>
            <div class="df-hub-card-sub">Chain &amp; Franchise Governance</div>
            <p class="df-hub-card-desc">
              Multi-restaurant SaaS central dashboard. Monitor network GMV, tenant analytics, batch QR generation, and launch the 10-step restaurant onboarding wizard.
            </p>
            <ul class="df-hub-features-list">
              <li><span>✓</span> 10-Step partner restaurant onboarding wizard</li>
              <li><span>✓</span> Dynamic multi-tenant branding engine</li>
              <li><span>✓</span> Executive HQ passcode access (PIN: <strong>9999</strong>)</li>
            </ul>
            <div class="df-hub-card-cta">
              <a href="?view=super-admin" class="df-pill-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700; background: rgba(99,102,241,0.15); border-color: #818CF8; color: #fff;">
                Launch Platform Super Admin →
              </a>
            </div>
          </div>
        </div>

        <!-- Real-Time Testing Helper Box -->
        <div class="df-hub-testing-banner">
          <div class="df-testing-banner-header">
            <span style="font-size: 1.35rem;">🧪</span>
            <div>
              <h3 style="font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 0.2rem;">
                Dual-Window Live Testing Recommendation
              </h3>
              <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
                For the best demo experience, open <strong>Guest Menu</strong> in one window and <strong>Staff OS</strong> in a second side-by-side window. When an order or waiter call is sent from Table T12, the kitchen board rings and updates instantaneously without page reloads!
              </p>
            </div>
          </div>
          <div class="df-testing-banner-actions">
            <a href="?r=the-urban-plate&t=T12" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
              <span>Window 1: Guest T12 ↗</span>
            </a>
            <a href="?view=admin" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
              <span>Window 2: Staff OS ↗</span>
            </a>
          </div>
        </div>

        <footer style="margin-top: 3.5rem; text-align: center; font-size: 0.82rem; color: var(--text-dim);">
          DineFlow &bull; Engineered with Vanilla JS, BroadcastChannel Real-Time Engine &amp; Luxury Glassmorphism by 
          <a href="../" style="color: var(--brand-primary); font-weight: 700; text-decoration: none;">Debashish Paul</a>
        </footer>
      </main>
    `;
  }

  // ------------------------------------------------------------------------------
  // 0. AUTHENTICATION & LOGIN GATEWAY VIEW
  // ------------------------------------------------------------------------------
  function renderLoginView(container, redirectTarget = null, requestedRole = null, portalType = null, tenantSlug = null) {
    let currentAuthMode = 'pin'; // 'pin' | 'password'
    let enteredPin = '';

    const routeInfo = parseRoute();
    const explicitTenantSlug = tenantSlug || routeInfo.tenantSlug || null;
    const targetTenant = explicitTenantSlug ? getCurrentTenant(explicitTenantSlug) : null;
    const activeTenant = targetTenant || getCurrentTenant(state.currentTenantId || 'the-urban-plate');

    function updatePinDots() {
      const dots = container.querySelectorAll('.df-pin-dot');
      dots.forEach((dot, idx) => {
        if (idx < enteredPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    }

    function triggerShake() {
      const pinDisp = container.querySelector('.df-pin-display');
      if (pinDisp) {
        pinDisp.classList.add('shake');
        setTimeout(() => pinDisp.classList.remove('shake'), 450);
      }
    }

    function authenticateUser(account) {
      if (!account) return false;
      state = DineFlowStore.get();
      const currentAccounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

      // 1. Directory Existence Check
      const existsInDirectory = currentAccounts.some(a => a.id === account.id || a.pin === account.pin);
      if (!existsInDirectory) {
        SoundFX.chime('alert');
        triggerShake();
        showToast('Access Denied: Account not found or revoked in directory.', '🚫');
        return false;
      }

      // 2. Intelligent Auto-Routing (Single Unified Gateway: No cross-tenant brick walls!)
      const isSuper = account.role === 'SUPER_ADMIN';
      const destinationTenantId = isSuper ? (state.currentTenantId || 'the-urban-plate') : (account.tenantId || 'the-urban-plate');
      const destinationTenant = getCurrentTenant(destinationTenantId);

      // 3. Establish Authenticated Session
      state.session = {
        isAuthenticated: true,
        role: account.role,
        user: account,
        tenantId: destinationTenantId
      };
      if (!isSuper && account.tenantId) {
        state.currentTenantId = account.tenantId;
      }
      DineFlowStore.save(state);
      SoundFX.chime('success');

      if (isSuper) {
        showToast(`Welcome, ${account.name}! Authenticated to Platform Owner HQ`, account.avatarEmoji || '⚡');
      } else {
        showToast(`Welcome, ${account.name}! Authenticated to ${destinationTenant.name}`, account.avatarEmoji || '👨‍🍳');
      }

      // 4. Record Immutable Security Audit Log
      DineFlowStore.recordLog({
        tenantId: destinationTenantId,
        tenantName: isSuper ? 'Platform Owner HQ' : destinationTenant.name,
        managerId: account.id,
        managerName: account.name,
        category: 'SHIFT',
        action: isSuper ? 'Owner HQ Login' : 'Staff Portal Login',
        details: `${account.name} (${account.roleTitle}) authenticated via DineFlow Universal Login Gateway. Auto-routed to ${isSuper ? 'Owner HQ' : destinationTenant.name}.`,
        amount: 0,
        paymentMethod: null,
        securityFlag: '✓ Authorized Session',
        severity: 'info'
      });

      // 5. Direct navigation to target dashboard
      setTimeout(() => {
        if (isSuper) {
          navigateTo({ view: 'super-admin' });
        } else {
          navigateTo({ view: 'admin', tenantSlug: destinationTenantId });
        }
      }, 200);
      return true;
    }

    function verifyPin() {
      if (enteredPin.length < 4) {
        showToast('Please enter full 4-digit PIN', '⚠️');
        triggerShake();
        return;
      }
      state = DineFlowStore.get();
      const accounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
      const match = accounts.find(acc => acc.pin === enteredPin);

      if (!match) {
        SoundFX.chime('alert');
        triggerShake();
        showToast('Authentication Failed: Unrecognized 4-digit PIN. Please use an authorized staff or owner PIN.', '❌');
        enteredPin = '';
        updatePinDots();
        return;
      }

      authenticateUser(match);
    }

    document.title = 'DineFlow - Unified Operations Terminal & Staff Gateway';

    // All active authorized accounts for fast 1-click login:
    const allAccounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

    container.innerHTML = `
      <header class="df-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon" style="background: linear-gradient(135deg, #6366F1, #10B981); color: #fff;">⚡</div>
          <div class="df-brand-text">
            <h1>DineFlow Operations Terminal</h1>
            <span class="df-brand-tagline">Unified Access Gateway &bull; Restaurant Staff OS &amp; Owner HQ</span>
          </div>
        </div>
        <div class="df-top-actions">
          <a href="?view=hub&section=restaurant-directory" class="df-pill-btn" title="View All Outlets Directory">
            <span>🏪 Outlets Directory</span>
          </a>
          <a href="?r=${activeTenant.slug}&t=T12" class="df-pill-btn" title="Return to Guest Dining Experience">
            <span>🍽️ Guest Dining</span>
          </a>
          <a href="?view=super-admin" class="df-pill-btn" style="border-color: rgba(99,102,241,0.4); color: #818CF8;" title="Platform Super Admin HQ">
            <span>Owner HQ ⚡</span>
          </a>
        </div>
      </header>

      <main class="df-login-container">
        <div class="df-login-card">
          <div class="df-login-header">
            <div class="df-login-icon-badge" style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.2)); color: #10B981; border: 1px solid rgba(16,185,129,0.35);">
              🛡️
            </div>
            <h2 class="df-login-title">Operations Terminal Login</h2>
            <p class="df-login-subtitle">
              Single entry gateway for all restaurants and executive controls. Enter your 4-digit PIN to automatically open your designated venue or Owner HQ.
            </p>
          </div>

          <!-- Scope Context Banner -->
          ${targetTenant ? `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.55rem; min-width: 0; flex: 1;">
                <span style="font-size: 1.2rem; flex-shrink: 0;">🏢</span>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${targetTenant.name}</div>
                  <div style="font-size: 0.68rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${targetTenant.branch || 'Restaurant Terminal'} &bull; Suggested Outlet</div>
                </div>
              </div>
              <span class="df-staff-scope-pill staff-only" style="font-size: 0.66rem; background: rgba(16,185,129,0.15); color: #10B981; border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; padding: 0.2rem 0.55rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;">Universal Keypad 🌐</span>
            </div>
          ` : `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.65rem; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.55rem; min-width: 0; flex: 1;">
                <span style="font-size: 1.2rem; flex-shrink: 0;">🌐</span>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-size: 0.82rem; font-weight: 700; color: #818CF8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Universal Platform Gateway</div>
                  <div style="font-size: 0.68rem; color: #CBD5E1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Multi-Outlet Floor Staff &bull; Platform Owner HQ</div>
                </div>
              </div>
              <span style="font-size: 0.66rem; background: rgba(99,102,241,0.2); color: #C7D2FE; border: 1px solid rgba(99,102,241,0.4); border-radius: 4px; padding: 0.2rem 0.55rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;">1 Keypad &bull; All Portals</span>
            </div>
          `}

          <!-- Quick 1-Click Authorized Profiles -->
          <div class="df-demo-box">
            <div class="df-demo-box-label">
              <span>⚡ Authorized Profiles (1-Click)</span>
              <span style="font-size: 0.65rem; color: #10B981; font-weight: 700; white-space: nowrap;">
                ${allAccounts.length} Active Profiles
              </span>
            </div>
            <div class="df-demo-profile-btns">
              ${allAccounts.map(acc => {
      const isSuper = acc.role === 'SUPER_ADMIN';
      const tenantName = isSuper
        ? 'Platform Owner HQ'
        : ((state.tenants && state.tenants[acc.tenantId]?.name) || acc.tenantId || 'Partner Outlet');
      const badgeLabel = isSuper ? 'Owner HQ ⚡' : 'Staff Terminal 👨‍🍳';
      const badgeColor = isSuper ? '#818CF8' : (acc.tenantId === 'bella-vista' ? '#F59E0B' : (acc.tenantId === 'sakura-asian' ? '#EC4899' : '#10B981'));
      return `
                  <button class="df-demo-btn btn-quick-login" data-pin="${acc.pin}" title="Login as ${acc.name}">
                    <div class="df-demo-btn-info">
                      <span class="df-demo-btn-emoji">${acc.avatarEmoji || (isSuper ? '⚡' : '👨‍🍳')}</span>
                      <div class="df-demo-btn-text">
                        <div class="df-demo-btn-title">
                          <span>${acc.name}</span>
                          <span class="df-demo-role-badge" style="background: rgba(255,255,255,0.08); color: ${badgeColor};">${badgeLabel}</span>
                        </div>
                        <div class="df-demo-btn-sub" title="${acc.roleTitle} • ${tenantName}">${acc.roleTitle} &bull; ${tenantName}</div>
                      </div>
                    </div>
                    <div class="df-demo-btn-pin" style="color: ${badgeColor}; border-color: rgba(255,255,255,0.15);">PIN: ${acc.pin}</div>
                  </button>
                `;
    }).join('')}
            </div>
          </div>

          <!-- Mode Tabs -->
          <div class="df-auth-tabs">
            <button class="df-auth-tab ${currentAuthMode === 'pin' ? 'active' : ''}" data-mode="pin">
              🔢 Fast 4-Digit PIN
            </button>
            <button class="df-auth-tab ${currentAuthMode === 'password' ? 'active' : ''}" data-mode="password">
              🔑 Email &amp; Password
            </button>
          </div>

          <!-- PIN Pad Mode -->
          <div id="df-pin-view" style="${currentAuthMode === 'pin' ? '' : 'display: none;'}">
            <div class="df-pin-display">
              <div class="df-pin-dot"></div>
              <div class="df-pin-dot"></div>
              <div class="df-pin-dot"></div>
              <div class="df-pin-dot"></div>
            </div>

            <div class="df-pin-keypad">
              <button class="df-keypad-btn btn-digit" data-digit="1">1</button>
              <button class="df-keypad-btn btn-digit" data-digit="2">2</button>
              <button class="df-keypad-btn btn-digit" data-digit="3">3</button>
              <button class="df-keypad-btn btn-digit" data-digit="4">4</button>
              <button class="df-keypad-btn btn-digit" data-digit="5">5</button>
              <button class="df-keypad-btn btn-digit" data-digit="6">6</button>
              <button class="df-keypad-btn btn-digit" data-digit="7">7</button>
              <button class="df-keypad-btn btn-digit" data-digit="8">8</button>
              <button class="df-keypad-btn btn-digit" data-digit="9">9</button>
              <button class="df-keypad-btn action-btn btn-clear" title="Clear PIN">⌫</button>
              <button class="df-keypad-btn btn-digit" data-digit="0">0</button>
              <button class="df-keypad-btn submit-btn btn-submit-pin" title="Authenticate">✓</button>
            </div>
            <p style="text-align: center; font-size: 0.72rem; color: var(--text-dim); margin-top: 0.5rem;">
              Type 4 digits on physical keyboard or click keypad buttons above
            </p>
          </div>

          <!-- Email & Password Mode -->
          <form id="df-password-view" class="df-login-form" style="${currentAuthMode === 'password' ? '' : 'display: none;'}" onsubmit="return false;">
            <div class="df-form-field">
              <label>Staff / Owner Email</label>
              <input type="email" id="login-email" placeholder="manager@theurbanplate.in" value="manager@theurbanplate.in" required>
            </div>
            <div class="df-form-field">
              <label>Password</label>
              <input type="password" id="login-password" placeholder="••••••••" value="admin" required>
            </div>
            <button class="df-pill-btn primary" id="btn-submit-password" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700; background: linear-gradient(135deg, #10B981, #059669); border: none;">
              Authenticate &amp; Launch Terminal →
            </button>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim);">
            <span>🔒 Single Universal Operations Gateway</span>
            <a href="?view=hub&section=restaurant-directory" style="color: var(--brand-primary); text-decoration: none; font-weight: 600;">Browse Outlets →</a>
          </div>
        </div>
      </main>
    `;

    // Event Listeners for 1-Click Demo Profiles
    container.querySelectorAll('.btn-quick-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pin = btn.getAttribute('data-pin');
        state = DineFlowStore.get();
        const accounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
        const match = accounts.find(acc => acc.pin === pin);
        if (match) {
          authenticateUser(match);
        }
      });
    });

    // Tab Switching
    container.querySelectorAll('.df-auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.df-auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAuthMode = tab.getAttribute('data-mode');
        const pinView = container.querySelector('#df-pin-view');
        const passView = container.querySelector('#df-password-view');
        if (currentAuthMode === 'pin') {
          pinView.style.display = 'block';
          passView.style.display = 'none';
        } else {
          pinView.style.display = 'none';
          passView.style.display = 'flex';
        }
      });
    });

    // Keypad digits
    container.querySelectorAll('.btn-digit').forEach(btn => {
      btn.addEventListener('click', () => {
        if (enteredPin.length < 4) {
          enteredPin += btn.getAttribute('data-digit');
          updatePinDots();
          if (enteredPin.length === 4) {
            setTimeout(verifyPin, 150);
          }
        }
      });
    });

    // Clear digit
    container.querySelector('.btn-clear')?.addEventListener('click', () => {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDots();
      }
    });

    // Submit PIN
    container.querySelector('.btn-submit-pin')?.addEventListener('click', verifyPin);

    // Password form submit
    container.querySelector('#btn-submit-password')?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email')?.value.trim();
      const pass = container.querySelector('#login-password')?.value;
      state = DineFlowStore.get();
      const accounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
      const match = accounts.find(acc => acc.email && acc.email.toLowerCase() === email.toLowerCase());
      if (match && (match.password === pass || !match.password)) {
        authenticateUser(match);
      } else {
        SoundFX.chime('alert');
        triggerShake();
        showToast('Authentication Failed: Invalid email or password credentials.', '❌');
      }
    });

    // Keyboard listener for PIN entry
    const keyHandler = (e) => {
      if (currentAuthMode !== 'pin') return;
      if (e.key >= '0' && e.key <= '9') {
        if (enteredPin.length < 4) {
          enteredPin += e.key;
          updatePinDots();
          if (enteredPin.length === 4) {
            setTimeout(verifyPin, 150);
          }
        }
      } else if (e.key === 'Backspace') {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDots();
      } else if (e.key === 'Enter') {
        verifyPin();
      }
    };

    window.addEventListener('keydown', keyHandler);
    const cleanup = () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('hashchange', cleanup);
      window.removeEventListener('popstate', cleanup);
    };
    window.addEventListener('hashchange', cleanup);
    window.addEventListener('popstate', cleanup);
  }

  // ------------------------------------------------------------------------------
  // 1. CUSTOMER EXPERIENCE VIEW
  // ------------------------------------------------------------------------------
  // Universal multi-tenant menu & category isolation guardian
  function ensureTenantMenuAndCategories(tenant) {
    if (!tenant || !tenant.id) return;
    let modified = false;

    // 1. Ensure categories exist for this tenant
    let tCats = (state.categories || []).filter(c => c.tenantId === tenant.id);
    if (!tCats.length) {
      const defaults = (typeof DINEFLOW_DEFAULT_DATA !== 'undefined' && Array.isArray(DINEFLOW_DEFAULT_DATA.categories))
        ? DINEFLOW_DEFAULT_DATA.categories.filter(c => c.tenantId === tenant.id) : [];
      if (defaults.length) {
        state.categories = state.categories || [];
        state.categories.push(...JSON.parse(JSON.stringify(defaults)));
        modified = true;
      } else {
        const prefix = `cat-${tenant.slug || tenant.id}`;
        state.categories = state.categories || [];
        state.categories.push(
          { id: `${prefix}-specials`, name: "Chef's Specials", icon: '👨‍🍳', tenantId: tenant.id },
          { id: `${prefix}-starters`, name: 'Appetizers & Bites', icon: '🥟', tenantId: tenant.id },
          { id: `${prefix}-mains`, name: 'Signature Main Courses', icon: '🥘', tenantId: tenant.id },
          { id: `${prefix}-desserts`, name: 'Artisan Desserts', icon: '🍰', tenantId: tenant.id },
          { id: `${prefix}-beverages`, name: 'Craft Beverages & Cocktails', icon: '🍹', tenantId: tenant.id }
        );
        modified = true;
      }
    }

    // 2. Ensure menu items exist for this tenant
    let tItems = (state.menuItems || []).filter(i => i.tenantId === tenant.id);
    if (!tItems.length) {
      const defaultItems = (typeof DINEFLOW_DEFAULT_DATA !== 'undefined' && Array.isArray(DINEFLOW_DEFAULT_DATA.menuItems))
        ? DINEFLOW_DEFAULT_DATA.menuItems.filter(i => i.tenantId === tenant.id) : [];
      if (defaultItems.length) {
        state.menuItems = state.menuItems || [];
        state.menuItems.push(...JSON.parse(JSON.stringify(defaultItems)));
        modified = true;
      } else {
        const prefix = `cat-${tenant.slug || tenant.id}`;
        state.menuItems = state.menuItems || [];
        state.menuItems.push(
          {
            id: `item-${tenant.slug || tenant.id}-01`,
            tenantId: tenant.id,
            categoryId: `${prefix}-specials`,
            name: `${tenant.name} Executive Tasting Platter`,
            description: `Signature culinary assortment curated fresh daily by the executive culinary team of ${tenant.name}.`,
            price: 495,
            isVeg: false,
            spiceLevel: 'medium',
            isBestseller: true,
            isRecommended: true,
            isAvailable: true,
            image: 'images/item-01.jpg',
            allergens: ['Dairy'],
            addOns: []
          },
          {
            id: `item-${tenant.slug || tenant.id}-02`,
            tenantId: tenant.id,
            categoryId: `${prefix}-starters`,
            name: 'Crispy Truffle Herb Medley',
            description: 'Golden fried herb bites infused with roasted garlic, micro greens, and house-blended emulsion.',
            price: 290,
            isVeg: true,
            spiceLevel: 'mild',
            isBestseller: true,
            isRecommended: false,
            isAvailable: true,
            image: 'images/item-03.jpg',
            allergens: ['Gluten'],
            addOns: []
          },
          {
            id: `item-${tenant.slug || tenant.id}-03`,
            tenantId: tenant.id,
            categoryId: `${prefix}-mains`,
            name: 'Slow-Simmered Signature Entrée',
            description: 'Aromatic slow-cooked reduction served with herb pilaf, charred seasonal vegetables, and warm brioche.',
            price: 540,
            isVeg: false,
            spiceLevel: 'medium',
            isBestseller: false,
            isRecommended: true,
            isAvailable: true,
            image: 'images/item-05.jpg',
            allergens: ['Dairy'],
            addOns: []
          },
          {
            id: `item-${tenant.slug || tenant.id}-04`,
            tenantId: tenant.id,
            categoryId: `${prefix}-desserts`,
            name: 'Velvety Chocolate Ganache Dome',
            description: 'Dark Belgian chocolate mousse with salted caramel core, edible gold flakes, and wild berry coulis.',
            price: 240,
            isVeg: true,
            spiceLevel: 'mild',
            isBestseller: true,
            isRecommended: true,
            isAvailable: true,
            image: 'images/item-09.jpg',
            allergens: ['Dairy'],
            addOns: []
          }
        );
        modified = true;
      }
    }

    if (modified) {
      DineFlowStore.save(state);
    }
  }

  function getFilteredCustomerItems(tenant) {
    ensureTenantMenuAndCategories(tenant);
    let items = (state.menuItems || []).filter(item => item.tenantId === tenant.id && item.isAvailable);
    if (currentFilterCategory !== 'all') {
      items = items.filter(item => item.categoryId === currentFilterCategory);
    }
    if (vegOnlyFilter) {
      items = items.filter(item => item.isVeg);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return items;
  }

  function renderFoodListHtml(items, tenant) {
    if (!items || !items.length) {
      return `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍽️</div>
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.35rem;">No dishes match your search</h4>
          <p style="font-size: 0.85rem;">Try clearing your search query or toggling filters.</p>
        </div>
      `;
    }

    return items.map(item => {
      const inCart = cart.find(c => c.id === item.id);
      return `
        <article class="df-food-card" data-item-id="${item.id}">
          <div class="df-food-info">
            <div class="df-food-header-badges">
              <span class="df-diet-badge ${item.isVeg ? 'veg' : 'nonveg'}" title="${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
              ${item.isBestseller ? `<span class="df-micro-badge bestseller">⭐ Bestseller</span>` : ''}
              ${item.isRecommended ? `<span class="df-micro-badge chef">👨‍🍳 Chef Choice</span>` : ''}
            </div>
            <h4 class="df-food-title">${item.name}</h4>
            <p class="df-food-desc">${item.description}</p>
            <div class="df-food-footer">
              <span class="df-food-price">${tenant.currency}${item.price}</span>
            </div>
          </div>

          <div class="df-food-media">
            <img src="${item.image}" alt="${item.name.replace(/"/g, '&quot;')}" class="df-food-img" loading="lazy" onerror="window.dfHandleImageError(this, '${item.categoryId}', '${item.id}')">
            ${inCart ? `
              <div class="df-qty-stepper" style="position: absolute; bottom: 6px; right: 6px;" onclick="event.stopPropagation()">
                <button class="df-qty-btn btn-cart-dec" data-id="${item.id}">−</button>
                <span class="df-qty-value">${inCart.quantity}</span>
                <button class="df-qty-btn btn-cart-inc" data-id="${item.id}">+</button>
              </div>
            ` : `
              <button class="df-card-add-btn btn-quick-add" data-id="${item.id}">
                <span>+</span> ADD
              </button>
            `}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderCustomerView(container, tenantSlug, tableId) {
    const tenant = getCurrentTenant(tenantSlug);
    const table = state.tables.find(t => t.id === tableId) || { id: tableId, name: `Table ${tableId}`, section: 'Indoor' };
    const offers = state.offers.filter(o => o.isActive);

    // Calculate cart item count
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Filter categories & menu items
    ensureTenantMenuAndCategories(tenant);
    const tenantCategories = state.categories.filter(c => c.tenantId === tenant.id);
    let items = getFilteredCustomerItems(tenant);

    container.innerHTML = `
      <!-- Top Sticky Bar -->
      <header class="df-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon">${tenant.logoEmoji || '🍽️'}</div>
          <div class="df-brand-text">
            <h1>${tenant.name}</h1>
            <span class="df-brand-tagline">${tenant.branch}</span>
          </div>
        </div>
      </header>

      <main class="df-app-viewport">
        <div class="df-customer-layout">

          <!-- Restaurant Hero Card -->
          <div class="df-restaurant-hero" style="background-image: url('${tenant.coverImage}'), url('../assets/dineflow-showcase.jpg');">
            <div class="df-hero-scrim"></div>
            <div class="df-hero-content">
              <div class="df-hero-title">
                <h2>${tenant.name}</h2>
                <div class="df-hero-meta">
                  <span class="df-hero-item">📍 ${table.section}</span>
                  <span class="df-hero-divider">•</span>
                  <span class="df-hero-item">
                    <svg class="df-wifi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <line x1="12" y1="20" x2="12.01" y2="20" stroke-width="2.5"></line>
                    </svg>
                    <span>Free Guest Wi-Fi: <strong>${tenant.wifiName}</strong></span>
                  </span>
                </div>
              </div>
              <div class="df-table-chip">
                <span class="live-indicator"></span>
                <span>Table ${table.id}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Hub -->
          <div class="df-quick-actions-bar">
            <button class="df-action-card" id="act-call-staff" title="Summon Waiter for Table Assistance">
              <span class="df-action-icon">🛎️</span>
              <span class="df-action-label">Call Waiter</span>
            </button>
            <button class="df-action-card" id="act-track-orders" title="Track Placed Orders Live">
              <span class="df-action-icon">📋</span>
              <span class="df-action-label">My Orders</span>
            </button>
            <button class="df-action-card" id="act-request-bill" title="Request & Settle Table Bill">
              <span class="df-action-icon">🧾</span>
              <span class="df-action-label">Request Bill</span>
            </button>
          </div>

          <!-- Search & Veg Toggle -->
          <div class="df-search-wrapper">
            <div class="df-search-box">
              <span class="df-search-icon">🔍</span>
              <input type="text" id="df-search-input" class="df-search-input" placeholder="Search dishes, biryani, pizzas, desserts..." value="${searchQuery}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
              <span class="df-search-clear ${searchQuery ? 'active' : ''}" id="df-search-clear">✕</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.65rem;">
              <span style="font-size: 0.78rem; color: var(--text-muted);">
                Showing <strong id="df-top-count">${items.length}</strong> delicacies
              </span>
              <button class="df-pill-btn ${vegOnlyFilter ? 'primary' : ''}" id="btn-toggle-veg" style="font-size: 0.72rem; padding: 0.25rem 0.75rem;">
                <span class="df-diet-badge veg" style="width: 10px; height: 10px;"></span>
                <span>${vegOnlyFilter ? 'Pure Veg Only' : 'Veg Filter'}</span>
              </button>
            </div>
          </div>

          <!-- Promotional Offers Scroll -->
          ${offers.length ? `
            <div class="df-offers-scroll">
              ${offers.map(o => `
                <div class="df-offer-badge-card">
                  <div class="df-offer-icon-box">🏷️</div>
                  <div class="df-offer-details">
                    <h4>${o.title}</h4>
                    <p>${o.description}</p>
                    <span class="df-coupon-code">${o.code}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Sticky Category Nav -->
          <div class="df-category-sticky-bar" id="category-bar">
            <button class="df-cat-pill ${currentFilterCategory === 'all' ? 'active' : ''}" data-cat="all">
              <span>✨</span> All Delights
            </button>
            ${tenantCategories.map(cat => `
              <button class="df-cat-pill ${currentFilterCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                <span>${cat.icon}</span> ${cat.name}
              </button>
            `).join('')}
          </div>

          <!-- Food Items Catalog -->
          <div class="df-menu-section">
            <div class="df-section-heading">
              <h3 id="df-section-title">${currentFilterCategory === 'all' ? 'Signature Menu' : (tenantCategories.find(c => c.id === currentFilterCategory)?.name || 'Menu')}</h3>
              <span class="df-section-count" id="df-section-count">${items.length} items</span>
            </div>

            <div class="df-food-list" id="df-food-list">
              ${renderFoodListHtml(items, tenant)}
            </div>
          </div>

          <!-- DineFlow Luxury Customer Footer -->
          <footer class="df-customer-footer">
            <div class="df-footer-top">
              <div class="df-footer-brand">
                <span class="df-footer-icon">${tenant.logoEmoji || '🍽️'}</span>
                <div>
                  <h4 class="df-footer-name">${tenant.name}</h4>
                  <p class="df-footer-branch">${tenant.branch}</p>
                </div>
              </div>
              <a href="../projects" class="df-back-portfolio-btn" title="Return to Debashish Paul Portfolio">
                <span>← Back to Portfolio</span>
              </a>
            </div>

            <div class="df-footer-divider"></div>

            <div class="df-footer-bottom">
              <div class="df-footer-credit">
                Designed &amp; Engineered by <a href="../" class="df-credit-link">Debashish Paul</a>
              </div>
              <div class="df-footer-tech">
                <span>DineFlow Platform</span> • <span>QR Dining Experience</span> • <a href="?view=login" style="color: var(--text-dim); text-decoration: underline;" title="Restaurant Staff &amp; Manager Gateway">Staff Access</a>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <!-- Sticky Floating Bottom Navigation -->
      <nav class="df-bottom-nav">
        <button class="df-nav-tab active" id="nav-tab-home">
          <span class="df-nav-icon">🏠</span>
          <span class="df-nav-label">Home</span>
        </button>
        <button class="df-nav-tab" id="nav-tab-menu">
          <span class="df-nav-icon">📖</span>
          <span class="df-nav-label">Menu</span>
        </button>
        <button class="df-nav-tab" id="nav-tab-orders">
          <span class="df-nav-icon">📋</span>
          <span class="df-nav-label">Orders</span>
        </button>
        <button class="df-nav-tab" id="nav-tab-cart">
          <div class="df-nav-icon">
            🛒
            ${cartCount > 0 ? `<span class="df-cart-pill-count">${cartCount}</span>` : ''}
          </div>
          <span class="df-nav-label">Cart ${cartCount > 0 ? `(${tenant.currency}${cartTotal})` : ''}</span>
        </button>
      </nav>

      <!-- Splash / Welcome Overlay Screen (First time scan simulation) -->
      <div class="df-splash-screen ${sessionStorage.getItem('df_splash_dismissed') ? 'hidden' : ''}" id="splash-screen">
        <div class="df-splash-logo-card">
          ${tenant.logoEmoji || '🍽️'}
        </div>
        <h2 class="df-splash-title">
          Welcome to ${tenant.name}
        </h2>
        <p class="df-splash-tagline">
          ${tenant.tagline}
        </p>
        <div class="df-splash-table-badge">
          <span class="df-badge-table">📍 Table ${table.id}</span>
          <span class="df-badge-divider">•</span>
          <span class="df-badge-section">${table.section}</span>
        </div>
        <button class="df-splash-btn" id="btn-enter-menu">
          Explore Digital Menu ↗
        </button>
        <p class="df-splash-footer-note">
          Instant QR Dining Experience &bull; Powered by DineFlow
        </p>
      </div>
    `;

    bindCustomerEvents(tenant, table);
  }

  // ------------------------------------------------------------------------------
  // BIND CUSTOMER EVENTS
  // ------------------------------------------------------------------------------
  function bindCustomerEvents(tenant, table) {
    // Dismiss Splash Screen
    const enterBtn = document.getElementById('btn-enter-menu');
    const splash = document.getElementById('splash-screen');
    if (enterBtn && splash) {
      if (!sessionStorage.getItem('df_splash_dismissed')) {
        document.body.classList.add('splash-active');
      } else {
        document.body.classList.remove('splash-active');
      }
      enterBtn.addEventListener('click', () => {
        splash.classList.add('hidden');
        document.body.classList.remove('splash-active');
        sessionStorage.setItem('df_splash_dismissed', 'true');
        SoundFX.chime('success');
      });
    }

    function updateNavCartBadge() {
      const cCount = cart.reduce((acc, item) => acc + item.quantity, 0);
      const cTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const navCart = document.getElementById('nav-tab-cart');
      if (navCart) {
        navCart.innerHTML = `
          <div class="df-nav-icon">
            🛒
            ${cCount > 0 ? `<span class="df-cart-pill-count">${cCount}</span>` : ''}
          </div>
          <span class="df-nav-label">Cart ${cCount > 0 ? `(${tenant.currency}${cTotal})` : ''}</span>
        `;
      }
    }

    function bindFoodCardEvents() {
      // Food Card Click -> Open Detail Modal
      document.querySelectorAll('.df-food-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-quick-add') || e.target.closest('.df-qty-stepper')) return;
          const itemId = card.getAttribute('data-item-id');
          const item = state.menuItems.find(m => m.id === itemId);
          if (item) openFoodDetailModal(item, tenant);
        });
      });

      // Quick Add Button
      document.querySelectorAll('.btn-quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemId = btn.getAttribute('data-id');
          const item = state.menuItems.find(m => m.id === itemId);
          if (item) {
            if (item.addOns && item.addOns.length) {
              openFoodDetailModal(item, tenant);
            } else {
              addToCart(item, 1, {}, '');
              SoundFX.chime('success');
              showToast(`Added ${item.name} to cart`);
              updateNavCartBadge();
              refreshCustomerMenuCatalog();
            }
          }
        });
      });

      // Stepper buttons in cards
      document.querySelectorAll('.btn-cart-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemId = btn.getAttribute('data-id');
          const cartItem = cart.find(c => c.id === itemId);
          if (cartItem) {
            cartItem.quantity++;
            SoundFX.chime('success');
            updateNavCartBadge();
            refreshCustomerMenuCatalog();
          }
        });
      });

      document.querySelectorAll('.btn-cart-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemId = btn.getAttribute('data-id');
          const index = cart.findIndex(c => c.id === itemId);
          if (index > -1) {
            if (cart[index].quantity > 1) {
              cart[index].quantity--;
            } else {
              cart.splice(index, 1);
            }
            updateNavCartBadge();
            refreshCustomerMenuCatalog();
          }
        });
      });
    }

    function refreshCustomerMenuCatalog() {
      const filtered = getFilteredCustomerItems(tenant);
      const listContainer = document.getElementById('df-food-list');
      const topCount = document.getElementById('df-top-count');
      const secCount = document.getElementById('df-section-count');
      const secTitle = document.getElementById('df-section-title');

      if (listContainer) {
        listContainer.innerHTML = renderFoodListHtml(filtered, tenant);
        bindFoodCardEvents();
      }
      if (topCount) topCount.textContent = filtered.length;
      if (secCount) secCount.textContent = `${filtered.length} items`;
      if (secTitle) {
        const tenantCategories = state.categories.filter(c => c.tenantId === tenant.id);
        const cat = tenantCategories.find(c => c.id === currentFilterCategory);
        secTitle.textContent = currentFilterCategory === 'all' ? 'Signature Menu' : (cat ? cat.name : 'Menu');
      }
    }

    // Category Tabs
    document.querySelectorAll('.df-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilterCategory = btn.getAttribute('data-cat');
        document.querySelectorAll('.df-cat-pill').forEach(b => b.classList.toggle('active', b === btn));
        refreshCustomerMenuCatalog();
      });
    });

    // Search Input with Real-Time Non-Destructive Filtering
    const searchInput = document.getElementById('df-search-input');
    const searchClear = document.getElementById('df-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.classList.toggle('active', searchQuery.length > 0);
        }
        refreshCustomerMenuCatalog();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClear.classList.remove('active');
        refreshCustomerMenuCatalog();
      });
    }

    // Veg Only Filter
    const vegBtn = document.getElementById('btn-toggle-veg');
    if (vegBtn) {
      vegBtn.addEventListener('click', () => {
        vegOnlyFilter = !vegOnlyFilter;
        vegBtn.classList.toggle('primary', vegOnlyFilter);
        const span = vegBtn.querySelector('span:last-child');
        if (span) span.textContent = vegOnlyFilter ? 'Pure Veg Only' : 'Veg Filter';
        refreshCustomerMenuCatalog();
      });
    }

    // Bind initial food cards
    bindFoodCardEvents();

    // Navigation Tabs
    document.getElementById('nav-tab-cart')?.addEventListener('click', () => openCartModal(tenant, table));
    document.getElementById('nav-tab-orders')?.addEventListener('click', () => openOrdersModal(tenant, table));
    document.getElementById('act-track-orders')?.addEventListener('click', () => openOrdersModal(tenant, table));
    document.getElementById('act-call-staff')?.addEventListener('click', () => openCallStaffModal(tenant, table));
    document.getElementById('btn-call-staff-top')?.addEventListener('click', () => openCallStaffModal(tenant, table));
    document.getElementById('act-request-bill')?.addEventListener('click', () => openRequestBillModal(tenant, table));
  }

  // ------------------------------------------------------------------------------
  // FOOD DETAIL & CUSTOMIZATION MODAL (Bottom Sheet)
  // ------------------------------------------------------------------------------
  function openFoodDetailModal(item, tenant) {
    activeDetailItem = item;
    let selectedSpice = 'Medium';
    let selectedAddOns = [];
    let qty = 1;

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="detail-backdrop">
        <div class="df-bottom-sheet">
          <div class="df-sheet-handle"></div>
          <div class="df-sheet-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="df-diet-badge ${item.isVeg ? 'veg' : 'nonveg'}"></span>
              <h3 style="font-size: 1.15rem; font-weight: 700;">${item.name}</h3>
            </div>
            <button class="df-sheet-close" id="btn-close-detail">✕</button>
          </div>
          <div class="df-sheet-body">
            <div class="df-detail-hero">
              <img src="${item.image}" alt="${item.name.replace(/"/g, '&quot;')}" class="df-detail-img" onerror="window.dfHandleImageError(this, '${item.categoryId}', '${item.id}')">
            </div>

            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.25rem;">
              ${item.description}
            </p>

            ${item.allergens && item.allergens.length ? `
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 1.25rem;">
                ⚠️ <strong>Allergen Info:</strong> Contains ${item.allergens.join(', ')}
              </div>
            ` : ''}

            <!-- Spice Level Customization -->
            <div class="df-option-group">
              <h4 class="df-option-title">Spice Level</h4>
              <div class="df-choice-list">
                ${['Mild & Fragrant', 'Medium (Chef Classic)', 'Spicy & Fiery'].map((level, idx) => `
                  <label class="df-choice-item ${idx === 1 ? 'selected' : ''}">
                    <div class="df-choice-left">
                      <input type="radio" name="spice-opt" value="${level}" ${idx === 1 ? 'checked' : ''}>
                      <span style="font-size: 0.85rem; font-weight: 600;">${level}</span>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Add-Ons -->
            ${item.addOns && item.addOns.length ? `
              <div class="df-option-group">
                <h4 class="df-option-title">Pair with Add-Ons</h4>
                <div class="df-choice-list">
                  ${item.addOns.map(add => `
                    <label class="df-choice-item">
                      <div class="df-choice-left">
                        <input type="checkbox" class="addon-checkbox" data-name="${add.name}" data-price="${add.price}">
                        <span style="font-size: 0.85rem; font-weight: 600;">${add.name}</span>
                      </div>
                      <span style="font-size: 0.85rem; font-weight: 700; color: var(--brand-primary);">+${tenant.currency}${add.price}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Special Instructions -->
            <div class="df-option-group">
              <h4 class="df-option-title">Cooking Note for Chef</h4>
              <textarea id="detail-notes" rows="2" placeholder="e.g. Less spicy, dressing on the side, extra crispy..." style="width: 100%; resize: none; font-size: 0.85rem;"></textarea>
            </div>

            <!-- Footer Action Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
              <div class="df-qty-stepper">
                <button class="df-qty-btn" id="modal-qty-dec">−</button>
                <span class="df-qty-value" id="modal-qty-val">1</span>
                <button class="df-qty-btn" id="modal-qty-inc">+</button>
              </div>

              <button class="df-splash-btn" id="btn-modal-add-cart" style="flex: 1; padding: 0.85rem 1.25rem; font-size: 0.95rem; text-align: center;">
                Add to Cart • <span id="modal-total-price">${tenant.currency}${item.price}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    function updatePrice() {
      let addOnTotal = 0;
      document.querySelectorAll('.addon-checkbox:checked').forEach(cb => {
        addOnTotal += parseFloat(cb.getAttribute('data-price') || 0);
      });
      const total = (item.price + addOnTotal) * qty;
      const priceEl = document.getElementById('modal-total-price');
      if (priceEl) priceEl.innerText = `${tenant.currency}${total.toFixed(0)}`;
    }

    document.querySelectorAll('.addon-checkbox').forEach(cb => {
      cb.addEventListener('change', updatePrice);
    });

    document.getElementById('modal-qty-inc')?.addEventListener('click', () => {
      qty++;
      document.getElementById('modal-qty-val').innerText = qty;
      updatePrice();
    });

    document.getElementById('modal-qty-dec')?.addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        document.getElementById('modal-qty-val').innerText = qty;
        updatePrice();
      }
    });

    document.getElementById('btn-close-detail')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.getElementById('btn-modal-add-cart')?.addEventListener('click', () => {
      const spice = document.querySelector('input[name="spice-opt"]:checked')?.value || 'Medium';
      const checkedAddOns = [];
      document.querySelectorAll('.addon-checkbox:checked').forEach(cb => {
        checkedAddOns.push(cb.getAttribute('data-name'));
      });
      const notes = document.getElementById('detail-notes')?.value || '';

      addToCart(item, qty, { spice, addOns: checkedAddOns }, notes);
      SoundFX.chime('success');
      showToast(`Added ${qty} × ${item.name} to cart`);
      modalContainer.innerHTML = '';
      renderApp();
    });
  }

  // ------------------------------------------------------------------------------
  // CART OPERATIONS & CHECKOUT MODAL
  // ------------------------------------------------------------------------------
  function addToCart(item, quantity = 1, customizations = {}, specialInstructions = '') {
    const existing = cart.find(c => c.id === item.id && JSON.stringify(c.customizations) === JSON.stringify(customizations));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        quantity,
        customizations,
        specialInstructions
      });
    }
  }

  function openCartModal(tenant, table) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    let appliedCoupon = null;
    let discountAmount = 0;

    function renderCartContents() {
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const tax = (subtotal - discountAmount) * (tenant.taxRate / 100);
      const service = (subtotal - discountAmount) * (tenant.serviceChargeRate / 100);
      const grandTotal = Math.max(0, subtotal - discountAmount + tax + service);

      modalContainer.innerHTML = `
        <div class="df-modal-backdrop active" id="cart-backdrop">
          <div class="df-bottom-sheet">
            <div class="df-sheet-handle"></div>
            <div class="df-sheet-header">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Your Cart</h3>
                <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Table ${table.id} • ${table.section}</span>
              </div>
              <button class="df-sheet-close" id="btn-close-cart">✕</button>
            </div>

            <div class="df-sheet-body">
              ${cart.length ? `
                <div style="margin-bottom: 1.25rem;">
                  ${cart.map((item, idx) => `
                    <div class="df-cart-item">
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                          <span class="df-diet-badge ${item.isVeg ? 'veg' : 'nonveg'}"></span>
                          <span class="df-cart-item-name">${item.name}</span>
                        </div>
                        <div class="df-cart-customization-summary">
                          ${item.customizations?.spice ? `Spice: ${item.customizations.spice}` : ''}
                          ${item.customizations?.addOns?.length ? ` • Add-ons: ${item.customizations.addOns.join(', ')}` : ''}
                          ${item.specialInstructions ? ` • "${item.specialInstructions}"` : ''}
                        </div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #fff; margin-top: 0.25rem;">
                          ${tenant.currency}${item.price * item.quantity}
                        </div>
                      </div>

                      <div class="df-qty-stepper">
                        <button class="df-qty-btn cart-dec" data-index="${idx}">−</button>
                        <span class="df-qty-value">${item.quantity}</span>
                        <button class="df-qty-btn cart-inc" data-index="${idx}">+</button>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Apply Promo Code -->
                <div class="df-coupon-input-box">
                  <input type="text" id="cart-coupon-input" placeholder="Enter Coupon Code (e.g. LUNCH20)" value="${appliedCoupon ? appliedCoupon.code : ''}">
                  <button class="df-pill-btn primary" id="btn-apply-coupon">
                    ${appliedCoupon ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>

                <!-- Bill Breakdown -->
                <div class="df-bill-summary-card">
                  <div class="df-bill-row">
                    <span>Subtotal (${cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span>${tenant.currency}${subtotal.toFixed(2)}</span>
                  </div>
                  ${discountAmount > 0 ? `
                    <div class="df-bill-row" style="color: #10B981; font-weight: 700;">
                      <span>Coupon Discount (${appliedCoupon?.code})</span>
                      <span>−${tenant.currency}${discountAmount.toFixed(2)}</span>
                    </div>
                  ` : ''}
                  <div class="df-bill-row">
                    <span>GST (${tenant.taxRate}%)</span>
                    <span>${tenant.currency}${tax.toFixed(2)}</span>
                  </div>
                  <div class="df-bill-row">
                    <span>Service Charge (${tenant.serviceChargeRate}%)</span>
                    <span>${tenant.currency}${service.toFixed(2)}</span>
                  </div>
                  <div class="df-bill-row total">
                    <span>Grand Total</span>
                    <span>${tenant.currency}${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <!-- Optional Customer Details -->
                <div style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                  <input type="text" id="cust-name-input" placeholder="Your Name (Optional for order tracking)">
                  <input type="tel" id="cust-phone-input" placeholder="Phone Number (Optional for SMS receipt)">
                </div>

                <!-- Place Order CTA -->
                <button class="df-splash-btn" id="btn-place-order" style="width: 100%; text-align: center; padding: 1rem;">
                  Place Order • ${tenant.currency}${grandTotal.toFixed(2)} 🚀
                </button>
              ` : `
                <div style="text-align: center; padding: 3rem 1rem;">
                  <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🛒</div>
                  <h4 style="font-size: 1.2rem; color: #fff; margin-bottom: 0.35rem;">Your Cart is Empty</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Explore the chef's culinary specials and add dishes to start dining.</p>
                  <button class="df-pill-btn primary" id="btn-browse-empty-cart" style="padding: 0.65rem 1.5rem;">Browse Menu</button>
                </div>
              `}
            </div>
          </div>
        </div>
      `;

      // Event bindings
      document.getElementById('btn-close-cart')?.addEventListener('click', () => {
        modalContainer.innerHTML = '';
      });
      document.getElementById('btn-browse-empty-cart')?.addEventListener('click', () => {
        modalContainer.innerHTML = '';
      });

      document.querySelectorAll('.cart-inc').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-index'));
          cart[idx].quantity++;
          renderCartContents();
        });
      });

      document.querySelectorAll('.cart-dec').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-index'));
          if (cart[idx].quantity > 1) {
            cart[idx].quantity--;
          } else {
            cart.splice(idx, 1);
          }
          renderCartContents();
          renderApp();
        });
      });

      // Coupon validation
      document.getElementById('btn-apply-coupon')?.addEventListener('click', () => {
        const code = document.getElementById('cart-coupon-input')?.value.trim().toUpperCase();
        const found = state.offers.find(o => o.code === code && o.isActive);
        if (found) {
          appliedCoupon = found;
          if (found.type === 'percentage') {
            discountAmount = Math.min(found.maxDiscount, (subtotal * found.value) / 100);
          } else {
            discountAmount = found.value;
          }
          SoundFX.chime('success');
          showToast(`Coupon ${code} applied successfully!`);
          renderCartContents();
        } else {
          showToast('Invalid or expired coupon code', '⚠️');
        }
      });

      // Place Order
      document.getElementById('btn-place-order')?.addEventListener('click', () => {
        if (!cart.length) return;
        const name = document.getElementById('cust-name-input')?.value.trim() || 'Guest Diner';
        const phone = document.getElementById('cust-phone-input')?.value.trim() || '';
        const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
        const newOrderId = getNextSerialOrderId(tenantSlug);

        const newOrder = {
          id: newOrderId,
          tenantId: tenantSlug,
          tableId: table.id,
          customerName: name,
          customerPhone: phone,
          status: 'RECEIVED',
          timestamp: new Date().toISOString(),
          items: JSON.parse(JSON.stringify(cart)),
          subtotal,
          discount: discountAmount,
          tax,
          serviceCharge: service,
          total: grandTotal,
          paymentMethod: 'UPI',
          paymentStatus: 'PENDING',
          estimatedMinutes: 20
        };

        // Prepend to orders database
        state.orders.unshift(newOrder);

        // Mark table as occupied
        const targetTable = state.tables.find(t => t.id === table.id && (!t.tenantId || t.tenantId === tenantSlug));
        if (targetTable) {
          targetTable.status = 'occupied';
          targetTable.qrScans++;
          targetTable.lastScanned = 'Just now';
        }

        // Save state and notify cross-tabs & cross-device cloud
        DineFlowStore.save(state, {
          action: 'NEW_ORDER',
          source: 'customer',
          orderId: newOrder.id,
          tableId: table.id,
          customerName: newOrder.customerName,
          order: newOrder,
          tenantSlug: tenantSlug
        });

        // Clear cart
        cart = [];
        SoundFX.chime('success');
        modalContainer.innerHTML = '';
        renderApp();

        // Immediately open Live Order Tracking screen
        openOrdersModal(tenant, table, newOrder.id);
      });
    }

    renderCartContents();
  }

  // ------------------------------------------------------------------------------
  // REAL-TIME ORDER TRACKING MODAL
  // ------------------------------------------------------------------------------
  function openOrdersModal(tenant, table, focusOrderId) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    // Find latest active orders for this table
    const tableOrders = state.orders.filter(o => o.tableId === table.id && o.tenantId === tenant.id);
    const activeOrder = focusOrderId ? tableOrders.find(o => o.id === focusOrderId) : tableOrders[0];
    activeTrackingOrderId = activeOrder ? activeOrder.id : (focusOrderId || null);

    const statusSteps = [
      { key: 'RECEIVED', title: 'Order Received', desc: 'Sent directly to the kitchen brigade' },
      { key: 'CONFIRMED', title: 'Confirmed by Chef', desc: 'Ingredients prepared & wok seasoned' },
      { key: 'PREPARING', title: 'Simmering & Sautéing', desc: 'Freshly cooking on high flame' },
      { key: 'READY', title: 'Plated & Garnished', desc: 'Hot and ready at service counter' },
      { key: 'SERVED', title: 'Delivered to Table', desc: 'Enjoy your delicious feast!' }
    ];

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="orders-backdrop">
        <div class="df-bottom-sheet">
          <div class="df-sheet-handle"></div>
          <div class="df-sheet-header">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700;">Live Order Tracking</h3>
              <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Table ${table.id} • ${table.section}</span>
            </div>
            <button class="df-sheet-close" id="btn-close-orders">✕</button>
          </div>

          <div class="df-sheet-body">
            ${activeOrder ? `
              <div class="df-order-tracking-card">
                <div class="df-tracking-header">
                  <div>
                    <span class="df-order-badge">#${activeOrder.id}</span>
                    <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin-top: 0.4rem;">
                      ${activeOrder.customerName}
                    </h4>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-dim);">Est. Prep Time</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--status-gold);">
                      ~${activeOrder.estimatedMinutes || 20} mins
                    </div>
                  </div>
                </div>

                <!-- 5-Step Animated Visual Stepper -->
                <div class="df-stepper-track">
                  ${statusSteps.map((step, idx) => {
      const statusOrder = ['RECEIVED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
      const currentIdx = statusOrder.indexOf(activeOrder.status);
      const stepIdx = statusOrder.indexOf(step.key);

      const isDone = currentIdx > stepIdx;
      const isActive = currentIdx === stepIdx;

      return `
                      <div class="df-step-node ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}">
                        <div class="df-step-circle">
                          ${isDone ? '✓' : idx + 1}
                        </div>
                        <div class="df-step-title">${step.title}</div>
                        <div class="df-step-time">${step.desc}</div>
                      </div>
                    `;
    }).join('')}
                </div>
              </div>

              <!-- Ordered Items List -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase;">
                  Ordered Items
                </h4>
                ${activeOrder.items.map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.85rem;">
                    <div>
                      <span style="font-weight: 700; color: #fff;">${item.quantity} ×</span>
                      <span>${item.name}</span>
                    </div>
                    <span style="font-weight: 700;">${tenant.currency}${item.price * item.quantity}</span>
                  </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; font-weight: 800; font-size: 0.95rem; color: var(--brand-primary);">
                  <span>Total Amount</span>
                  <span>${tenant.currency}${activeOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <!-- Action buttons -->
              <div style="display: flex; gap: 0.75rem;">
                <button class="df-pill-btn" id="btn-order-more" style="flex: 1; padding: 0.75rem; justify-content: center;">
                  + Add More Dishes
                </button>
                <button class="df-pill-btn primary" id="btn-order-feedback" style="flex: 1; padding: 0.75rem; justify-content: center;">
                  ⭐ Leave Review
                </button>
              </div>
            ` : `
              <div style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">📋</div>
                <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.35rem;">No Active Orders Yet</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Browse our chef's specials and place an order for Table ${table.id}.</p>
                <button class="df-pill-btn primary" id="btn-browse-orders">Browse Menu</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    const closeOrdersModal = () => {
      activeTrackingOrderId = null;
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-orders')?.addEventListener('click', closeOrdersModal);
    document.getElementById('btn-browse-orders')?.addEventListener('click', closeOrdersModal);
    document.getElementById('btn-order-more')?.addEventListener('click', closeOrdersModal);
    document.getElementById('orders-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'orders-backdrop') closeOrdersModal();
    });
    document.getElementById('btn-order-feedback')?.addEventListener('click', () => {
      closeOrdersModal();
      openFeedbackModal(tenant, table);
    });
  }

  // ------------------------------------------------------------------------------
  // CALL STAFF MODAL
  // ------------------------------------------------------------------------------
  function openCallStaffModal(tenant, table) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="staff-backdrop">
        <div class="df-bottom-sheet">
          <div class="df-sheet-handle"></div>
          <div class="df-sheet-header">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700;">What do you need?</h3>
              <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Staff notification for Table ${table.id}</span>
            </div>
            <button class="df-sheet-close" id="btn-close-staff">✕</button>
          </div>

          <div class="df-sheet-body">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              Tap an option and our floor team will attend to your table immediately:
            </p>

            <div class="df-staff-call-grid">
              <button class="df-staff-opt-btn" data-type="WAITER" data-label="Call Server to Table">
                <span class="df-staff-opt-icon">🔔</span>
                <span>Call Waiter</span>
              </button>
              <button class="df-staff-opt-btn" data-type="WATER" data-label="Need Fresh Chilled Water">
                <span class="df-staff-opt-icon">💧</span>
                <span>Need Water</span>
              </button>
              <button class="df-staff-opt-btn" data-type="CUTLERY" data-label="Need Plates & Cutlery">
                <span class="df-staff-opt-icon">🍴</span>
                <span>Need Cutlery</span>
              </button>
              <button class="df-staff-opt-btn" data-type="NAPKINS" data-label="Need Extra Paper Napkins">
                <span class="df-staff-opt-icon">🧻</span>
                <span>Need Napkins</span>
              </button>
              <button class="df-staff-opt-btn" data-type="ASSISTANCE" data-label="Assistance / High Chair">
                <span class="df-staff-opt-icon">🪑</span>
                <span>Need Assistance</span>
              </button>
              <button class="df-staff-opt-btn" data-type="OTHER" data-label="Special Requirement">
                <span class="df-staff-opt-icon">❓</span>
                <span>Other Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-staff')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.querySelectorAll('.df-staff-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const label = btn.getAttribute('data-label');

        const newReq = {
          id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
          tenantId: tenant.slug || tenant.id,
          tableId: table.id,
          type,
          label,
          status: 'PENDING',
          time: 'Just now'
        };
        state.staffRequests.unshift(newReq);

        DineFlowStore.save(state, {
          action: 'STAFF_CALL',
          source: 'customer',
          tableId: table.id,
          requestLabel: label,
          request: newReq,
          tenantSlug: tenant.slug || tenant.id
        });
        SoundFX.chime('success');
        modalContainer.innerHTML = '';
        showToast(`Request sent to staff! Server arriving at Table ${table.id}.`, '🔔');
      });
    });
  }

  // ------------------------------------------------------------------------------
  // REQUEST BILL & PAYMENT MODAL
  // ------------------------------------------------------------------------------
  function openRequestBillModal(tenant, table) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    // Find table active UNPAID orders
    const unpaidOrders = state.orders.filter(o =>
      o.tableId === table.id &&
      (!o.tenantId || o.tenantId === tenant.id) &&
      o.paymentStatus !== 'PAID' &&
      o.status !== 'COMPLETED'
    );
    const totalAmount = unpaidOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    // Find settled orders & bill requests for history/receipt
    const settledOrders = state.orders.filter(o =>
      o.tableId === table.id &&
      (!o.tenantId || o.tenantId === tenant.id) &&
      (o.paymentStatus === 'PAID' || o.status === 'COMPLETED')
    );
    const latestSettledBill = state.billRequests.find(b => b.tableId === table.id && b.status === 'PAID');
    const pendingBill = state.billRequests.find(b => b.tableId === table.id && b.status === 'PENDING');

    // CASE 1: Bill is already paid & settled (No outstanding balance)
    if (totalAmount <= 0) {
      const settledTotal = latestSettledBill ? latestSettledBill.amount : settledOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

      modalContainer.innerHTML = `
        <div class="df-modal-backdrop active" id="bill-backdrop">
          <div class="df-bottom-sheet">
            <div class="df-sheet-handle"></div>
            <div class="df-sheet-header">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Table Bill Status</h3>
                <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Table ${table.id} • ${table.section}</span>
              </div>
              <button class="df-sheet-close" id="btn-close-bill">✕</button>
            </div>

            <div class="df-sheet-body">
              <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.5rem 1.25rem; text-align: center; margin-bottom: 1.25rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.35rem;">✅</div>
                <span class="df-micro-badge" style="background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 0.75rem; padding: 0.2rem 0.65rem; margin-bottom: 0.5rem;">
                  Paid &amp; Settled ✓
                </span>
                <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: #10B981; margin: 0.35rem 0 0.2rem;">
                  ${tenant.currency}0.00
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
                  All dues cleared! No outstanding balance for Table ${table.id}.
                </p>
              </div>

              ${settledOrders.length > 0 || latestSettledBill ? `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Settled Receipt Summary</span>
                    <span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">Completed</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.25rem 0; color: #fff;">
                    <span>Total Amount Paid</span>
                    <strong style="color: var(--brand-primary);">${tenant.currency}${settledTotal > 0 ? settledTotal.toFixed(2) : '0.00'}</strong>
                  </div>
                  ${latestSettledBill ? `
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); margin-top: 0.2rem;">
                      <span>Payment Method</span>
                      <span>${latestSettledBill.paymentMethod} • Settled</span>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <p style="font-size: 0.82rem; color: var(--text-dim); text-align: center; margin-bottom: 1.25rem;">
                  No active orders have been placed yet for this table.
                </p>
              `}

              <div style="display: flex; gap: 0.75rem;">
                <button class="df-pill-btn" id="btn-bill-add-more" style="flex: 1; padding: 0.85rem; justify-content: center; font-weight: 700;">
                  + Order More Dishes
                </button>
                <button class="df-pill-btn primary" id="btn-bill-feedback" style="flex: 1; padding: 0.85rem; justify-content: center; font-weight: 700;">
                  ⭐ Leave Review
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-close-bill')?.addEventListener('click', () => modalContainer.innerHTML = '');
      document.getElementById('bill-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'bill-backdrop') modalContainer.innerHTML = '';
      });
      document.getElementById('btn-bill-add-more')?.addEventListener('click', () => modalContainer.innerHTML = '');
      document.getElementById('btn-bill-feedback')?.addEventListener('click', () => {
        modalContainer.innerHTML = '';
        openFeedbackModal(tenant, table);
      });
      return;
    }

    // CASE 2: Active balance exists (totalAmount > 0)
    let selectedPayment = 'UPI';

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="bill-backdrop">
        <div class="df-bottom-sheet">
          <div class="df-sheet-handle"></div>
          <div class="df-sheet-header">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700;">Request Table Bill</h3>
              <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Table ${table.id} • ${table.section}</span>
            </div>
            <button class="df-sheet-close" id="btn-close-bill">✕</button>
          </div>

          <div class="df-sheet-body">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; margin-bottom: 1.25rem;">
              <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Total Table Balance</span>
              <div style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-heading); color: var(--brand-primary); margin: 0.25rem 0 0.5rem;">
                ${tenant.currency}${totalAmount.toFixed(2)}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Includes 5% GST and 5% Service Charge</p>
            </div>

            <!-- Ordered Dishes Summary Breakdown -->
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1.25rem;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.5rem;">Unpaid Items (${unpaidOrders.length} order${unpaidOrders.length > 1 ? 's' : ''})</div>
              ${unpaidOrders.flatMap(o => o.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding: 0.25rem 0; color: #e2e8f0;">
                  <span>${item.quantity} × ${item.name}</span>
                  <strong>${tenant.currency}${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              `).join('')}
            </div>

            ${pendingBill ? `
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1.25rem;">⏳</span>
                <div style="font-size: 0.8rem; color: #F59E0B;">
                  <strong>Bill Request Pending:</strong> Server notified (${pendingBill.paymentMethod}). Bringing bill to Table ${table.id}.
                </div>
              </div>
            ` : ''}

            <h4 class="df-option-title">Select Preferred Payment Mode</h4>
            <div class="df-choice-list" style="margin-bottom: 1.25rem;">
              <label class="df-choice-item selected" data-pay="UPI">
                <div class="df-choice-left">
                  <input type="radio" name="pay-method" value="UPI" checked>
                  <span style="font-size: 0.88rem; font-weight: 700;">📱 Instant UPI (GPay, PhonePe, Paytm, QR)</span>
                </div>
              </label>
              <label class="df-choice-item" data-pay="CARD">
                <div class="df-choice-left">
                  <input type="radio" name="pay-method" value="CARD">
                  <span style="font-size: 0.88rem; font-weight: 700;">💳 Credit / Debit Card (Server brings POS machine)</span>
                </div>
              </label>
              <label class="df-choice-item" data-pay="CASH">
                <div class="df-choice-left">
                  <input type="radio" name="pay-method" value="CASH">
                  <span style="font-size: 0.88rem; font-weight: 700;">💵 Cash at Table</span>
                </div>
              </label>
              <label class="df-choice-item" data-pay="COUNTER">
                <div class="df-choice-left">
                  <input type="radio" name="pay-method" value="COUNTER">
                  <span style="font-size: 0.88rem; font-weight: 700;">🏢 Settle at Reception Counter</span>
                </div>
              </label>
            </div>

            <!-- Dynamic Mock UPI QR if selected -->
            <div id="upi-qr-preview-box" style="text-align: center; margin-bottom: 1.25rem; background: #fff; padding: 1.25rem; border-radius: 16px; color: #0b0f17;">
              <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a;">Scan to Pay via Any UPI App</div>
              <div id="upi-qr-holder" style="width: 160px; height: 160px; margin: 0 auto;"></div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">UPI ID: <strong>urbanplate@hdfcbank</strong></div>
              <button class="df-pill-btn primary" id="btn-simulate-upi-paid" style="margin-top: 0.85rem; width: 100%; justify-content: center; font-size: 0.82rem; padding: 0.5rem 1rem;">
                ✓ I Have Paid via UPI (Complete Settlement)
              </button>
            </div>

            <button class="df-splash-btn" id="btn-submit-bill-req" style="width: 100%; text-align: center; padding: 0.95rem;">
              ${pendingBill ? 'Update Bill Request 💳' : 'Send Bill Request to Staff 💳'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Render mock UPI QR
    const upiHolder = document.getElementById('upi-qr-holder');
    if (upiHolder && window.DineFlowQR) {
      upiHolder.innerHTML = window.DineFlowQR.generateSVG(`upi://pay?pa=urbanplate@hdfcbank&pn=${encodeURIComponent(tenant.name)}&am=${totalAmount}&cu=INR`, { size: 160 });
    }

    document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedPayment = e.target.value;
        const qrBox = document.getElementById('upi-qr-preview-box');
        if (qrBox) qrBox.style.display = selectedPayment === 'UPI' ? 'block' : 'none';
      });
    });

    document.getElementById('btn-close-bill')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });
    document.getElementById('bill-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'bill-backdrop') modalContainer.innerHTML = '';
    });

    // Instant UPI settlement simulation
    document.getElementById('btn-simulate-upi-paid')?.addEventListener('click', () => {
      // Mark all table orders as PAID & COMPLETED
      state.orders.forEach(o => {
        if (o.tableId === table.id && (!o.tenantId || o.tenantId === tenant.id)) {
          o.paymentStatus = 'PAID';
          o.status = 'COMPLETED';
        }
      });
      // Settle any pending bill request
      if (pendingBill) {
        pendingBill.status = 'PAID';
        pendingBill.amount = totalAmount;
      } else {
        state.billRequests.unshift({
          id: `BILL-${Math.floor(100 + Math.random() * 900)}`,
          tenantId: tenant.slug || tenant.id,
          tableId: table.id,
          amount: totalAmount,
          paymentMethod: 'UPI',
          status: 'PAID',
          time: 'Just now'
        });
      }
      const tObj = state.tables.find(t => t.id === table.id && (!t.tenantId || t.tenantId === (tenant.slug || tenant.id)));
      if (tObj) tObj.status = 'available';

      DineFlowStore.save(state, {
        action: 'BILL_SETTLED',
        source: 'customer',
        tableId: table.id,
        tenantSlug: tenant.slug || tenant.id
      });
      SoundFX.chime('success');
      showToast(`Payment received! Table ${table.id} bill settled.`, '✅');
      openRequestBillModal(tenant, table);
    });

    document.getElementById('btn-submit-bill-req')?.addEventListener('click', () => {
      let activeBillObj = pendingBill;
      if (pendingBill) {
        pendingBill.paymentMethod = selectedPayment;
        pendingBill.amount = totalAmount;
        pendingBill.time = 'Just now';
      } else {
        activeBillObj = {
          id: `BILL-${Math.floor(100 + Math.random() * 900)}`,
          tenantId: tenant.slug || tenant.id,
          tableId: table.id,
          amount: totalAmount,
          paymentMethod: selectedPayment,
          status: 'PENDING',
          time: 'Just now'
        };
        state.billRequests.unshift(activeBillObj);
      }

      DineFlowStore.save(state, {
        action: 'BILL_REQUEST',
        source: 'customer',
        tableId: table.id,
        bill: activeBillObj,
        tenantSlug: tenant.slug || tenant.id
      });
      SoundFX.chime('success');
      modalContainer.innerHTML = '';
      showToast(`Bill requested! Server is bringing receipt to Table ${table.id}.`, '💳');
    });
  }

  // ------------------------------------------------------------------------------
  // CUSTOMER FEEDBACK & 5-STAR REVIEW MODAL
  // ------------------------------------------------------------------------------
  function openFeedbackModal(tenant, table) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    let ratings = { overall: 5, food: 5, service: 5, ambience: 5 };

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="feedback-backdrop">
        <div class="df-bottom-sheet">
          <div class="df-sheet-handle"></div>
          <div class="df-sheet-header">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700;">Rate Your Experience</h3>
              <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">Dining at Table ${table.id}</span>
            </div>
            <button class="df-sheet-close" id="btn-close-feedback">✕</button>
          </div>

          <div class="df-sheet-body">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Your rating helps chef and floor staff deliver five-star hospitality.
            </p>

            ${[
        { key: 'overall', label: 'Overall Dining Experience' },
        { key: 'food', label: 'Food Taste & Presentation' },
        { key: 'service', label: 'Service Speed & Hospitality' },
        { key: 'ambience', label: 'Restaurant Ambience & Music' }
      ].map(dim => `
              <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: #fff;">${dim.label}</label>
                <div class="df-rating-stars" data-dim="${dim.key}">
                  ${[1, 2, 3, 4, 5].map(star => `
                    <span class="star active" data-val="${star}">★</span>
                  `).join('')}
                </div>
              </div>
            `).join('')}

            <div style="margin-bottom: 1.5rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; display: block;">Your Review (Optional)</label>
              <textarea id="feedback-comment" rows="3" placeholder="Tell us what you loved, or what we can do better..." style="width: 100%; resize: none; font-size: 0.85rem;"></textarea>
            </div>

            <button class="df-splash-btn" id="btn-submit-feedback" style="width: 100%; text-align: center; padding: 0.95rem;">
              Submit Review ⭐
            </button>
          </div>
        </div>
      </div>
    `;

    // Star clicking logic
    document.querySelectorAll('.df-rating-stars').forEach(starGroup => {
      const dim = starGroup.getAttribute('data-dim');
      starGroup.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-val'));
          ratings[dim] = val;
          starGroup.querySelectorAll('.star').forEach(s => {
            const sVal = parseInt(s.getAttribute('data-val'));
            s.classList.toggle('active', sVal <= val);
          });
        });
      });
    });

    document.getElementById('btn-close-feedback')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.getElementById('btn-submit-feedback')?.addEventListener('click', () => {
      const comment = document.getElementById('feedback-comment')?.value.trim() || 'Wonderful meal and impeccable service!';
      const reviewObj = {
        id: `rev-${Date.now()}`,
        tenantId: tenant.slug || tenant.id || 'the-urban-plate',
        customerName: 'Guest Diner',
        ratingOverall: ratings.overall,
        ratingFood: ratings.food,
        ratingService: ratings.service,
        ratingAmbience: ratings.ambience,
        comment,
        tableId: table.id,
        date: 'Just now'
      };
      state.reviews.unshift(reviewObj);

      DineFlowStore.save(state, {
        action: 'REVIEW_SUBMITTED',
        source: 'customer',
        review: reviewObj,
        tenantSlug: tenant.slug || tenant.id
      });
      SoundFX.chime('success');
      modalContainer.innerHTML = '';
      showToast('Thank you for your generous feedback!', '⭐');
    });
  }

  // ------------------------------------------------------------------------------
  // 2. RESTAURANT ADMIN PORTAL VIEW
  // ------------------------------------------------------------------------------
  function renderAdminView(container, tenant) {
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantOrders = state.orders.filter(o => !o.tenantId || o.tenantId === tenantSlug);
    const tenantTables = sortTablesSerially(state.tables.filter(t => !t.tenantId || t.tenantId === tenantSlug));
    const tenantCalls = state.staffRequests.filter(r => (!r.tenantId || r.tenantId === tenantSlug) && r.status === 'PENDING');
    const tenantBills = state.billRequests.filter(b => (!b.tenantId || b.tenantId === tenantSlug) && b.status === 'PENDING');

    // Reconcile table statuses specifically for this tenant
    const activeOrderTableIds = new Set();
    tenantOrders.forEach(o => {
      if (o.status && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
        activeOrderTableIds.add(o.tableId);
      }
    });
    tenantBills.forEach(b => activeOrderTableIds.add(b.tableId));
    tenantCalls.forEach(s => activeOrderTableIds.add(s.tableId));

    let tableStatusChanged = false;
    tenantTables.forEach(t => {
      const shouldBeOccupied = activeOrderTableIds.has(t.id) || t.manuallyOccupied === true;
      if (shouldBeOccupied && t.status !== 'occupied') {
        t.status = 'occupied';
        tableStatusChanged = true;
      } else if (!shouldBeOccupied && t.status === 'occupied') {
        t.status = 'available';
        tableStatusChanged = true;
      }
    });
    if (tableStatusChanged) {
      DineFlowStore.save(state);
    }

    const todayOrdersCount = tenantOrders.length;
    const todayRevenue = tenantOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const activeTablesCount = tenantTables.filter(t => t.status === 'occupied').length;
    const pendingOrders = tenantOrders.filter(o => o.status === 'RECEIVED' || o.status === 'CONFIRMED' || o.status === 'PREPARING');
    const pendingCalls = tenantCalls.length;
    const pendingBills = tenantBills.length;

    const currentTone = (state.settings && state.settings.toneProfile) || 'executive';
    function getToneProfileLabel(profile) {
      switch (profile) {
        case 'concierge': return '🛎️ Concierge Bell';
        case 'marimba': return '🪵 Warm Marimba';
        case 'minimal': return '💎 Discrete Glass';
        case 'mute': return '🔇 Muted';
        default: return '✨ Executive Chime';
      }
    }

    container.innerHTML = `
      <!-- Admin Topbar -->
      <header class="df-topbar df-staff-topbar">
        <div class="df-venue-switcher-container" id="df-venue-switcher-wrap">
          <button id="btn-venue-switcher-toggle" class="df-venue-switcher-btn" type="button" aria-haspopup="true" aria-expanded="false" title="Switch Restaurant Outlets">
            <div class="df-brand-icon">${tenant.logoEmoji || '🍽️'}</div>
            <div class="df-brand-text">
              <div class="df-venue-current-row">
                <h1 title="${tenant.name} Staff OS">${tenant.name}</h1>
                <span class="df-venue-chevron">▾</span>
              </div>
              <span class="df-brand-tagline">${tenant.branch} • Staff OS</span>
            </div>
          </button>
          <div id="df-venue-dropdown-menu" class="df-venue-dropdown-menu">
            <div class="df-venue-dropdown-header">
              <span>Switch Restaurant Outlet</span>
              <span class="df-venue-badge">${Object.keys(state.tenants || {}).length || 3} Locations</span>
            </div>
            <div class="df-venue-dropdown-list">
              ${Object.values(state.tenants || {}).map(t => {
      const isCurrent = t.slug === tenant.slug;
      const occCount = (state.tables || []).filter(tbl => tbl.tenantId === t.slug && tbl.status === 'occupied').length;
      const totalTbls = (state.tables || []).filter(tbl => tbl.tenantId === t.slug).length;
      return `
                  <a href="?r=${t.slug}&view=admin" class="df-venue-item ${isCurrent ? 'active' : ''}" data-slug="${t.slug}">
                    <div class="df-venue-item-info">
                      <span class="df-venue-item-icon">${t.logoEmoji || '🍽️'}</span>
                      <div>
                        <div class="df-venue-item-name">${t.name}</div>
                        <div class="df-venue-item-sub">${t.branch || 'Main'} &bull; ${totalTbls} Tables</div>
                      </div>
                    </div>
                    <span class="df-venue-item-status">${occCount} Active</span>
                  </a>
                `;
    }).join('')}
            </div>
            <div class="df-venue-dropdown-footer">
              <a href="?view=hub&section=restaurant-directory" class="df-venue-footer-link">
                <span>🏢 Outlets Directory ↗</span>
              </a>
              <a href="?view=super-admin" class="df-venue-footer-link" style="color: #818CF8;">
                <span>⚡ Platform HQ</span>
              </a>
            </div>
          </div>
        </div>
        <div class="df-top-actions">
          <div class="df-cloud-sync-pill" title="Live PostgreSQL Realtime Stream Active" style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.35); padding: 0.28rem 0.65rem; border-radius: 999px;">
            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10B981; box-shadow: 0 0 8px #10B981;"></span>
            <span class="df-hide-mobile">Postgres </span>Live
          </div>
          <div class="df-session-status-badge" title="Active Session: ${state.session?.user?.roleTitle || 'Staff Member'}">
            <span>${state.session?.user?.avatarEmoji || '👨‍🍳'}</span>
            <span style="font-weight: 600; color: #fff;">${state.session?.user?.name || 'Staff User'}</span>
            <span class="df-role-tag">${state.session?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'STAFF'}</span>
          </div>
          <button id="btn-admin-tone-cycle" class="df-pill-btn" title="Synthesized Audio Alert Profile (Click to preview & cycle)">
            <span>${getToneProfileLabel(currentTone)}</span>
          </button>
          <a href="?r=${tenant.slug}&t=${tenant.slug === 'bella-vista' ? 'BV-02' : (tenant.slug === 'sakura-asian' ? 'SK-02' : 'T12')}" target="_blank" class="df-pill-btn" title="Open Customer View for this restaurant">
            <span>Customer QR ↗</span>
          </a>
          <a href="?view=super-admin" class="df-pill-btn" title="Super Admin Platform">
            <span>SaaS Admin</span>
          </a>
          <button id="btn-admin-logout" class="df-pill-btn danger" title="Sign Out of Staff OS" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.08);">
            <span>🔒 Logout</span>
          </button>
        </div>
      </header>

      <main class="df-app-viewport">
        <div class="df-admin-layout">
          <!-- Sidebar Navigation -->
          <aside class="df-admin-sidebar">
            <button class="df-admin-nav-item ${currentAdminTab === 'orders' ? 'active' : ''}" data-tab="orders">
              <span>👨‍🍳</span> Live Kitchen
              ${pendingOrders.length ? `<span class="df-admin-badge-count">${pendingOrders.length}</span>` : ''}
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'tables' ? 'active' : ''}" data-tab="tables">
              <span>🪑</span> Tables & QR Codes
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'menu' ? 'active' : ''}" data-tab="menu">
              <span>📖</span> Menu Catalog
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'staff-calls' ? 'active' : ''}" data-tab="staff-calls">
              <span>🔔</span> Service Requests
              ${pendingCalls ? `<span class="df-admin-badge-count">${pendingCalls}</span>` : ''}
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'bills' ? 'active' : ''}" data-tab="bills">
              <span>💳</span> Bill Requests
              ${pendingBills ? `<span class="df-admin-badge-count">${pendingBills}</span>` : ''}
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'offers' ? 'active' : ''}" data-tab="offers">
              <span>🏷️</span> Offers & Coupons
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'customers' ? 'active' : ''}" data-tab="customers">
              <span>👥</span> Customer CRM
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
              <span>📊</span> Analytics & Trends
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
              <span>⭐</span> Guest Reviews
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'staff' ? 'active' : ''}" data-tab="staff">
              <span>👥</span> Staff &amp; Team
            </button>
            <button class="df-admin-nav-item ${currentAdminTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <span>⚙️</span> Restaurant Branding
            </button>

            <!-- Quick Sidebar Venue Switcher -->
            <div class="df-sidebar-venue-box">
              <div class="df-sidebar-venue-head">
                <span>Switch Outlet</span>
                <span style="font-size: 0.62rem; color: var(--brand-primary);">${Object.keys(state.tenants || {}).length || 3} Venues</span>
              </div>
              <div class="df-sidebar-venue-list">
                ${Object.values(state.tenants || {}).map(t => `
                  <a href="?r=${t.slug}&view=admin" class="df-sidebar-venue-btn ${t.slug === tenant.slug ? 'active' : ''}" title="Switch to ${t.name}">
                    <span>${t.logoEmoji || '🍽️'} ${t.name.split(' ')[0]}</span>
                    <span style="font-size: 0.65rem; opacity: 0.7;">${t.slug === tenant.slug ? 'Active' : '↗'}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          </aside>

          <!-- Main Content Area -->
          <section class="df-admin-main" id="admin-main-content">
            <!-- Compact Metrics Bar Header with Toggle -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; padding: 0 0.15rem;">
              <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.35rem;">
                <span>📊</span> Shift Operations Telemetry
              </span>
              <button id="btn-toggle-stats-bar" type="button" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); color: var(--brand-primary); font-size: 0.65rem; font-weight: 700; cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 99px; display: inline-flex; align-items: center; gap: 0.25rem;" title="Collapse/Expand metrics to maximize ticket viewing area">
                <span id="stats-toggle-icon">▲ Hide Metrics</span>
              </button>
            </div>

            <!-- Top Metric Stat Cards -->
            <div class="df-stats-grid" id="admin-stats-grid">
              <div class="df-stat-card">
                <span class="df-stat-label">Today's Revenue</span>
                <div class="df-stat-val">${tenant.currency}${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <span class="df-stat-change">↑ +14.2% vs yesterday</span>
              </div>
              <div class="df-stat-card">
                <span class="df-stat-label">Total Orders</span>
                <div class="df-stat-val">${todayOrdersCount}</div>
                <span class="df-stat-change">↑ 84 QR scans</span>
              </div>
              <div class="df-stat-card">
                <span class="df-stat-label">Active Tables</span>
                <div class="df-stat-val">${activeTablesCount} / ${tenantTables.length}</div>
                <span class="df-stat-change" style="color: var(--brand-primary);">${((activeTablesCount / (tenantTables.length || 1)) * 100).toFixed(0)}% Occupancy</span>
              </div>
              <div class="df-stat-card">
                <span class="df-stat-label">Pending Staff Calls</span>
                <div class="df-stat-val" style="color: ${pendingCalls ? '#EF4444' : '#10B981'};">${pendingCalls}</div>
                <span class="df-stat-change">${pendingCalls ? '⚠️ Action Required' : '✓ All Resolved'}</span>
              </div>
            </div>

            <!-- Tab Content Dynamic Switcher -->
            <div id="admin-tab-body"></div>

            <!-- Operations OS Footer -->
            <footer class="df-admin-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div style="font-size: 0.82rem; color: var(--text-dim);">
                Designed &amp; Engineered by <a href="../" class="df-credit-link" style="color: var(--brand-primary); font-weight: 700;">Debashish Paul</a> • DineFlow Restaurant OS
              </div>
              <a href="../projects" class="df-back-portfolio-btn">
                <span>← Back to Portfolio</span>
              </a>
            </footer>
          </section>
        </div>
      </main>
    `;

    // Bind Admin Sidebar Nav
    document.querySelectorAll('.df-admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        currentAdminTab = btn.getAttribute('data-tab');
        renderAdminView(container, tenant);
      });
    });

    // Bind Metrics Bar Collapse / Expand Toggle
    document.getElementById('btn-toggle-stats-bar')?.addEventListener('click', () => {
      const grid = document.getElementById('admin-stats-grid');
      const icon = document.getElementById('stats-toggle-icon');
      if (grid) {
        grid.classList.toggle('collapsed');
        const isCollapsed = grid.classList.contains('collapsed');
        if (icon) icon.textContent = isCollapsed ? '▼ Show Metrics' : '▲ Hide Metrics';
      }
    });

    // Bind Tone Cycle & Preview
    document.getElementById('btn-admin-tone-cycle')?.addEventListener('click', () => {
      state = DineFlowStore.get();
      state.settings = state.settings || {};
      const profiles = ['executive', 'concierge', 'marimba', 'minimal', 'mute'];
      const curIndex = profiles.indexOf(state.settings.toneProfile || 'executive');
      const nextIndex = (curIndex + 1) % profiles.length;
      state.settings.toneProfile = profiles[nextIndex];
      DineFlowStore.save(state);

      const label = getToneProfileLabel(state.settings.toneProfile);
      const btn = document.getElementById('btn-admin-tone-cycle');
      if (btn) btn.innerHTML = `<span>${label}</span>`;

      if (state.settings.toneProfile !== 'mute') {
        SoundFX.chime('order', state.settings.toneProfile);
      }
      showToast(`Audio tone switched to: ${label}`, '🔊');
    });

    // Bind Staff OS Logout
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      state = DineFlowStore.get();
      state.session = {
        isAuthenticated: false,
        role: 'CUSTOMER',
        user: null,
        tenantId: tenant ? tenant.slug : 'the-urban-plate'
      };
      DineFlowStore.save(state);
      SoundFX.chime('notice');
      showToast('Signed out of Staff OS. Session secured.', '🔒');
      navigateTo({ view: 'login' });
    });

    // Bind Venue Switcher Dropdown Toggle
    const venueWrap = document.getElementById('df-venue-switcher-wrap');
    const venueToggleBtn = document.getElementById('btn-venue-switcher-toggle');
    if (venueToggleBtn && venueWrap) {
      venueToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        venueWrap.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!venueWrap.contains(e.target)) {
          venueWrap.classList.remove('open');
        }
      });
    }

    renderAdminTabContent(tenant);
  }

  // ------------------------------------------------------------------------------
  // ADMIN TAB ROUTING & CONTENTS
  // ------------------------------------------------------------------------------
  function renderAdminTabContent(tenant) {
    const tabBody = document.getElementById('admin-tab-body');
    if (!tabBody) return;

    if (currentAdminTab === 'orders') {
      renderKitchenKanban(tabBody, tenant);
    } else if (currentAdminTab === 'tables') {
      renderTablesAndQRs(tabBody, tenant);
    } else if (currentAdminTab === 'menu') {
      renderMenuManager(tabBody, tenant);
    } else if (currentAdminTab === 'staff-calls') {
      renderStaffRequestsFeed(tabBody, tenant);
    } else if (currentAdminTab === 'bills') {
      renderBillRequestsFeed(tabBody, tenant);
    } else if (currentAdminTab === 'offers') {
      renderOffersManager(tabBody, tenant);
    } else if (currentAdminTab === 'customers') {
      renderCustomerCRM(tabBody, tenant);
    } else if (currentAdminTab === 'analytics') {
      renderAnalyticsDashboard(tabBody, tenant);
    } else if (currentAdminTab === 'reviews') {
      renderReviewsFeed(tabBody, tenant);
    } else if (currentAdminTab === 'staff') {
      renderStaffManagementTab(tabBody, tenant);
    } else if (currentAdminTab === 'settings') {
      renderBrandingSettings(tabBody, tenant);
    }
  }

  // KITCHEN KANBAN BOARD
  function renderKitchenKanban(container, tenant) {
    const cols = [
      { key: 'RECEIVED', title: '📥 Incoming Orders', color: '#F59E0B' },
      { key: 'PREPARING', title: '🍳 In The Kitchen', color: '#38BDF8' },
      { key: 'READY', title: '🔔 Ready for Pickup', color: '#10B981' },
      { key: 'SERVED', title: '✅ Served / Active Table', color: '#94A3B8' }
    ];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h2 style="font-size: 1.12rem; font-weight: 800; margin: 0; line-height: 1.2;">Live Kitchen Display System (KDS)</h2>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin: 2px 0 0 0;">Real-time status changes sync live to customer phone.</p>
        </div>
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
          <button class="df-pill-btn" id="btn-admin-clear-all" title="Clear all active tables and mark them available" style="font-size: 0.68rem; padding: 0.2rem 0.55rem;">
            🧹 Clear Tables
          </button>
          <button class="df-pill-btn" id="btn-admin-refresh" style="font-size: 0.68rem; padding: 0.2rem 0.55rem;">🔄 Refresh</button>
        </div>
      </div>

      ${(() => {
        const tenantPendingCalls = (state.staffRequests || []).filter(r => (!r.tenantId || r.tenantId === tenant.slug || r.tenantId === tenant.id) && r.status === 'PENDING');
        return tenantPendingCalls.length > 0 ? `
          <div class="df-active-calls-banner" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(245, 158, 11, 0.16)); border: 1px solid rgba(239, 68, 68, 0.45); border-radius: var(--radius-md); padding: 0.65rem 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; animation: pulse 2s infinite;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.4rem;">🔔</span>
              <div>
                <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">
                  Active Waiter / Table Requests (${tenantPendingCalls.length})
                </div>
                <div style="font-size: 0.72rem; color: #FCA5A5; font-weight: 600;">
                  ${tenantPendingCalls.map(r => `<strong>Table ${r.tableId}</strong>: ${r.label}`).join(' • ')}
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="df-pill-btn btn-admin-view-calls" style="font-size: 0.72rem; padding: 0.3rem 0.75rem; background: #EF4444; border-color: #EF4444; color: #fff; font-weight: 700;">
                View & Attend All →
              </button>
            </div>
          </div>
        ` : '';
      })()}

      <div class="df-kanban-board">
        ${cols.map(col => {
        const orders = state.orders.filter(o => (!o.tenantId || o.tenantId === tenant.slug || o.tenantId === tenant.id) && (o.status === col.key || (col.key === 'RECEIVED' && o.status === 'CONFIRMED')));
        return `
            <div class="df-kanban-col" data-col-status="${col.key}">
              <div class="df-kanban-col-header">
                <span class="df-kanban-col-title" style="color: ${col.color};" title="${col.title}">${col.title}</span>
                <span class="df-kanban-col-count">
                  ${orders.length}
                </span>
              </div>
              <div class="df-kanban-cards">
                ${orders.length ? orders.map(order => {
          const orderDate = new Date(order.timestamp || Date.now());
          const elapsedMins = Math.max(0, Math.floor((Date.now() - orderDate.getTime()) / 60000));
          const isPending = order.status === 'RECEIVED' || order.status === 'CONFIRMED' || order.status === 'PREPARING';
          const isOverdue = isPending && elapsedMins >= 20;
          const isWarning = isPending && elapsedMins >= 10 && !isOverdue;

          return `
                  <div class="df-order-admin-card ${isOverdue ? 'df-card-overdue' : (isWarning ? 'df-card-warning' : '')}" draggable="true" data-order-id="${order.id}" data-current-status="${order.status}">
                    <div class="df-order-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.35rem; width: 100%;">
                      <div style="display: flex; align-items: center; gap: 0.35rem; min-width: 0; flex: 1;">
                        <span class="df-drag-handle" title="Drag ticket across stages" style="flex-shrink: 0; cursor: grab; display: inline-flex; align-items: center; opacity: 0.75;">
                          <svg width="8" height="13" viewBox="0 0 8 13" fill="currentColor">
                            <circle cx="2" cy="2" r="1.3" />
                            <circle cx="6" cy="2" r="1.3" />
                            <circle cx="2" cy="6.5" r="1.3" />
                            <circle cx="6" cy="6.5" r="1.3" />
                            <circle cx="2" cy="11" r="1.3" />
                            <circle cx="6" cy="11" r="1.3" />
                          </svg>
                        </span>
                        <span class="df-order-card-table" style="white-space: nowrap; font-weight: 800; font-size: 0.85rem;">Table ${order.tableId}</span>
                        <span class="df-order-card-id" style="font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace; font-size: 0.72rem; font-weight: 700; color: #38BDF8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.28); padding: 1px 6px; border-radius: 4px; letter-spacing: 0.3px; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; line-height: 1.3;" title="Order ID #${order.id}">#${order.id}</span>
                      </div>
                      <div style="flex-shrink: 0;">
                        <span class="df-elapsed-badge" data-order-timestamp="${orderDate.getTime()}" style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; display: inline-flex; align-items: center; gap: 2px; ${isOverdue ? 'background: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.4);' : (isWarning ? 'background: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.4);' : 'background: rgba(148, 163, 184, 0.12); color: #94A3B8;')}">
                          &#9201; ${elapsedMins}m${isOverdue ? ' LATE' : ''}
                        </span>
                      </div>
                    </div><div style="font-size: 0.82rem; font-weight: 700; color: #fff;">
                      ${order.customerName}
                    </div>
                    <div class="df-order-items-snippet">
                      ${order.items.map(it => `
                        <div class="df-kds-item-row" style="cursor: pointer; user-select: none;" title="Click to strike-through item when prepared" onclick="this.classList.toggle('df-item-prepared');">
                          • ${it.quantity} × <span>${it.name}</span> ${it.customizations?.spice ? `(${it.customizations.spice})` : ''}</div>
                      `).join('')}
                    </div>
                    ${order.items.some(i => i.specialInstructions) ? `
                      <div style="font-size: 0.72rem; color: var(--status-gold); background: rgba(245, 158, 11, 0.1); padding: 0.25rem 0.45rem; border-radius: 4px;">
                        Note: "${order.items.find(i => i.specialInstructions)?.specialInstructions}"
                      </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; margin-top: 0.25rem;">
                      <span style="font-size: 0.85rem; font-weight: 800; color: var(--brand-primary);">${tenant.currency}${order.total.toFixed(0)}</span>
                      <div style="display: flex; gap: 0.35rem;">
                        <button class="df-pill-btn btn-print-kot" data-id="${order.id}" title="Print 80mm Kitchen Order Ticket (KOT)" style="font-size: 0.68rem; padding: 0.25rem 0.5rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: var(--text-muted);">&#128424; KOT</button>
                        ${order.status === 'RECEIVED' || order.status === 'CONFIRMED' ? `
                          <button class="df-pill-btn primary btn-status-next" data-id="${order.id}" data-next="PREPARING" style="font-size: 0.68rem; padding: 0.25rem 0.65rem;">
                            🍳 Cook
                          </button>
                        ` : ''}
                        ${order.status === 'PREPARING' ? `
                          <button class="df-pill-btn primary btn-status-next" data-id="${order.id}" data-next="READY" style="font-size: 0.68rem; padding: 0.25rem 0.65rem;">
                            🔔 Ready
                          </button>
                        ` : ''}
                        ${order.status === 'READY' ? `
                          <button class="df-pill-btn primary btn-status-next" data-id="${order.id}" data-next="SERVED" style="font-size: 0.68rem; padding: 0.25rem 0.65rem;">
                            ✅ Serve
                          </button>
                        ` : ''}
                        ${order.status === 'SERVED' ? `
                          <button class="df-pill-btn btn-status-next" data-id="${order.id}" data-next="COMPLETED" style="font-size: 0.68rem; padding: 0.25rem 0.65rem;">
                            🏁 Settle
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
        }).join('') : `
                  <div style="text-align: center; padding: 2rem 0; color: var(--text-dim); font-size: 0.8rem;">
                    No orders in this stage
                  </div>
                `}
              </div>
            </div>
          `;
      }).join('')}
      </div>
    `;

    // Unified order status progression handler (used by both buttons and drag-and-drop)
    function applyOrderStatusChange(orderId, nextStatus) {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;
      if (order.status === nextStatus) return;

      order.status = nextStatus;
      if (nextStatus === 'COMPLETED') {
        order.paymentStatus = 'PAID';
        const pendingBill = state.billRequests.find(b => b.tableId === order.tableId && (!b.tenantId || b.tenantId === order.tenantId) && b.status === 'PENDING');
        if (pendingBill) pendingBill.status = 'PAID';
        const hasMoreOrders = state.orders.some(o => o.tableId === order.tableId && (!o.tenantId || o.tenantId === order.tenantId) && o.status !== 'COMPLETED');
        if (!hasMoreOrders) {
          const tableObj = state.tables.find(t => t.id === order.tableId && (!t.tenantId || t.tenantId === order.tenantId));
          if (tableObj) {
            tableObj.status = 'available';
            delete tableObj.manuallyOccupied;
          }
        }
      }
      DineFlowStore.save(state, {
        action: 'ORDER_STATUS_CHANGED',
        source: 'staff',
        orderId: order.id,
        newStatus: nextStatus,
        tableId: order.tableId,
        tenantSlug: tenant.slug || tenant.id
      });
      SoundFX.chime('success');
      showToast(`Order #${orderId} moved to ${nextStatus}`);
      // Re-render whole admin view so top stats cards update in real time
      renderAdminView(document.getElementById('app'), tenant);
    }

    // Kitchen Order Ticket (KOT) Thermal Print
    document.querySelectorAll('.btn-print-kot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderId = btn.getAttribute('data-id');
        const order = state.orders.find(o => o.id === orderId);
        if (order && window.DineFlowPrinter) {
          const html = window.DineFlowPrinter.generateKotHTML(order, tenant);
          window.DineFlowPrinter.openPreviewModal(`Kitchen Order Ticket - #${order.id}`, html);
        }
      });
    });

    // Button click status advance
    document.querySelectorAll('.btn-status-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        const nextStatus = btn.getAttribute('data-next');
        applyOrderStatusChange(orderId, nextStatus);
      });
    });

    // Drag & Drop Kanban Engine
    const cards = container.querySelectorAll('.df-order-admin-card');
    const kanbanCols = container.querySelectorAll('.df-kanban-col');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const orderId = card.getAttribute('data-order-id');
        e.dataTransfer.setData('text/plain', orderId);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('df-dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('df-dragging');
        kanbanCols.forEach(c => c.classList.remove('df-drag-over'));
      });
    });

    kanbanCols.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!col.classList.contains('df-drag-over')) {
          col.classList.add('df-drag-over');
        }
      });

      col.addEventListener('dragenter', (e) => {
        e.preventDefault();
        col.classList.add('df-drag-over');
      });

      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('df-drag-over');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('df-drag-over');
        const orderId = e.dataTransfer.getData('text/plain');
        const targetStatus = col.getAttribute('data-col-status');
        if (orderId && targetStatus) {
          applyOrderStatusChange(orderId, targetStatus);
        }
      });
    });

    // Touch Drag & Drop for Mobile & Tablet POS
    let activeTouchCard = null;
    let currentTouchCol = null;

    cards.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        const handle = e.target.closest('.df-drag-handle') || e.target.closest('.df-order-card-header');
        if (!handle) return;
        activeTouchCard = card;
        card.classList.add('df-touch-dragging');
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (!activeTouchCard || activeTouchCard !== card) return;
        const touch = e.touches[0];
        const targetElem = document.elementFromPoint(touch.clientX, touch.clientY);
        const col = targetElem?.closest('.df-kanban-col');

        kanbanCols.forEach(c => {
          if (c === col) {
            c.classList.add('df-drag-over');
          } else {
            c.classList.remove('df-drag-over');
          }
        });
        currentTouchCol = col;
      }, { passive: true });

      card.addEventListener('touchend', () => {
        if (!activeTouchCard || activeTouchCard !== card) return;
        card.classList.remove('df-touch-dragging');
        if (currentTouchCol) {
          const orderId = card.getAttribute('data-order-id');
          const targetStatus = currentTouchCol.getAttribute('data-col-status');
          currentTouchCol.classList.remove('df-drag-over');
          if (orderId && targetStatus) {
            applyOrderStatusChange(orderId, targetStatus);
          }
        }
        activeTouchCard = null;
        currentTouchCol = null;
      });
    });

    document.querySelector('.btn-admin-view-calls')?.addEventListener('click', () => {
      currentAdminTab = 'staff-calls';
      renderAdminView(document.getElementById('app'), tenant);
    });

    document.getElementById('btn-admin-clear-all')?.addEventListener('click', () => {
      const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
      const occupiedTables = state.tables.filter(t => (!t.tenantId || t.tenantId === tenantSlug) && t.status === 'occupied');

      const tablesWithPendingBills = occupiedTables.filter(t => {
        const hasPendingBill = state.billRequests.some(b => b.tableId === t.id && (!b.tenantId || b.tenantId === tenantSlug) && b.status === 'PENDING');
        const hasUnpaidOrders = state.orders.some(o => o.tableId === t.id && (!o.tenantId || o.tenantId === tenantSlug) && o.paymentStatus !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
        return hasPendingBill || hasUnpaidOrders;
      });

      if (occupiedTables.length > 0 && tablesWithPendingBills.length === occupiedTables.length) {
        SoundFX.chime('alert');
        showToast('Payment pending — settle bill to clear table', '💳');
        return;
      }

      const tablesToClear = occupiedTables.filter(t => !tablesWithPendingBills.some(pb => pb.id === t.id));
      if (!tablesToClear.length) {
        showToast('No eligible tables to clear.', 'ℹ️');
        return;
      }

      const clearedIds = new Set(tablesToClear.map(t => t.id));
      tablesToClear.forEach(t => {
        t.status = 'available';
        delete t.manuallyOccupied;
      });

      state.orders.forEach(o => {
        if (clearedIds.has(o.tableId) && (!o.tenantId || o.tenantId === tenantSlug) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
          o.status = 'COMPLETED';
          o.paymentStatus = 'PAID';
        }
      });
      state.staffRequests.forEach(s => {
        if (clearedIds.has(s.tableId) && (!s.tenantId || s.tenantId === tenantSlug)) {
          s.status = 'RESOLVED';
        }
      });

      DineFlowStore.save(state, {
        action: 'TABLES_CLEARED_ALL',
        clearedTableIds: Array.from(clearedIds),
        source: 'staff',
        tenantSlug: tenantSlug
      });

      if (tablesWithPendingBills.length > 0) {
        SoundFX.chime('notice');
        showToast(`${tablesToClear.length} table(s) cleared. ${tablesWithPendingBills.length} retained (payment pending)`, '💳');
      } else {
        SoundFX.chime('success');
        showToast(`All ${tablesToClear.length} dining tables cleared & marked Available!`, '🧹');
      }
      renderAdminView(document.getElementById('app'), tenant);
    });

    document.getElementById('btn-admin-refresh')?.addEventListener('click', () => {
      renderAdminView(document.getElementById('app'), tenant);
      showToast('Kitchen feed refreshed');
    });

    // Auto-update KDS aging timers every 30 seconds smoothly without DOM re-render
    if (window.__dfKdsAgingInterval) clearInterval(window.__dfKdsAgingInterval);
    window.__dfKdsAgingInterval = setInterval(() => {
      const badges = container.querySelectorAll('.df-elapsed-badge[data-order-timestamp]');
      if (!badges || !badges.length) {
        clearInterval(window.__dfKdsAgingInterval);
        return;
      }
      const now = Date.now();
      badges.forEach(badge => {
        const ts = parseInt(badge.getAttribute('data-order-timestamp'), 10) || now;
        const elapsed = Math.max(0, Math.floor((now - ts) / 60000));
        const card = badge.closest('.df-order-admin-card');
        const status = card ? card.getAttribute('data-current-status') : '';
        const isPending = status === 'RECEIVED' || status === 'CONFIRMED' || status === 'PREPARING';
        const isOverdue = isPending && elapsed >= 20;
        const isWarning = isPending && elapsed >= 10 && !isOverdue;

        badge.innerHTML = `&#9201; ${elapsed}m${isOverdue ? " LATE" : ""}`;
        if (isOverdue) {
          badge.style.background = 'rgba(239, 68, 68, 0.2)';
          badge.style.color = '#EF4444';
          badge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
          card?.classList.add('df-card-overdue');
          card?.classList.remove('df-card-warning');
        } else if (isWarning) {
          badge.style.background = 'rgba(245, 158, 11, 0.2)';
          badge.style.color = '#F59E0B';
          badge.style.border = '1px solid rgba(245, 158, 11, 0.4)';
          card?.classList.add('df-card-warning');
          card?.classList.remove('df-card-overdue');
        } else {
          badge.style.background = 'rgba(148, 163, 184, 0.12)';
          badge.style.color = '#94A3B8';
          badge.style.border = 'none';
          card?.classList.remove('df-card-overdue');
          card?.classList.remove('df-card-warning');
        }
      });
    }, 30000);
  }

  // TABLES & QR CODE MANAGEMENT
  function renderTablesAndQRs(container, tenant) {
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantTables = sortTablesSerially(state.tables.filter(t => !t.tenantId || t.tenantId === tenantSlug));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Table Management & QR Tent Cards (${tenantTables.length} Tables)</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Generate, preview, download, and print table tent cards with unique QR URLs for ${tenant.name}.</p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button class="df-pill-btn" id="btn-batch-print-all" title="Export & Print all tables to high-precision PDF batch">
            📄 Batch Print All (${tenantTables.length} PDFs)
          </button>
          <button class="df-pill-btn" id="btn-clear-all-tables-tab" title="Reset all tables to Available status">
            🧹 Clear All Tables
          </button>
          <button class="df-pill-btn primary" id="btn-add-table">
            + Add New Table
          </button>
        </div>
      </div>

      <div class="df-floor-metrics-bar" style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; align-items: center; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
        <div style="display: flex; gap: 1.2rem; align-items: center; flex: 1; flex-wrap: wrap;">
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            Total: <strong style="color: #fff;">${tenantTables.length}</strong>
          </span>
          <span style="font-size: 0.82rem; color: #10B981;">
            🟢 Available: <strong style="color: #10B981;">${tenantTables.filter(t => t.status === 'available').length}</strong>
          </span>
          <span style="font-size: 0.82rem; color: #EF4444;">
            🔴 Occupied: <strong style="color: #EF4444;">${tenantTables.filter(t => t.status === 'occupied').length}</strong>
          </span>
          <span style="font-size: 0.82rem; color: var(--brand-primary);">
            📊 Occupancy: <strong>${tenantTables.length ? Math.round((tenantTables.filter(t => t.status === 'occupied').length / tenantTables.length) * 100) : 0}%</strong>
          </span>
        </div>
        <div class="df-floor-filter-pills" style="display: flex; gap: 0.35rem;">
          <button class="df-nav-pill active btn-filter-tables" data-filter="all" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">All (${tenantTables.length})</button>
          <button class="df-nav-pill btn-filter-tables" data-filter="occupied" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">🔴 Occupied (${tenantTables.filter(t => t.status === 'occupied').length})</button>
          <button class="df-nav-pill btn-filter-tables" data-filter="available" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">🟢 Available (${tenantTables.filter(t => t.status === 'available').length})</button>
        </div>
      </div>

      <div class="df-tables-grid">
        ${tenantTables.length ? tenantTables.map(table => {
      // Construct normalized target URL for table
      const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);
      const hasPendingBill = state.billRequests.some(b => b.tableId === table.id && (!b.tenantId || b.tenantId === tenantSlug) && b.status === 'PENDING');
      const hasUnpaidOrders = state.orders.some(o => o.tableId === table.id && (!o.tenantId || o.tenantId === tenantSlug) && o.paymentStatus !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
      const isBillPending = hasPendingBill || hasUnpaidOrders;

      return `
            <div class="df-table-admin-card" data-table-status="${table.status}">
              <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff;">${table.name}</h4>
                <div style="display: flex; gap: 0.35rem; align-items: center;">
                  ${isBillPending ? `
                    <span class="df-micro-badge" style="background: rgba(239, 68, 68, 0.18); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 0.65rem; padding: 2px 6px;" title="Customer bill is pending settlement">
                      💳 Bill Pending
                    </span>
                  ` : ''}
                  <span class="df-micro-badge ${table.status === 'occupied' ? 'status-occupied' : 'status-available'}" style="text-transform: uppercase;">
                    ${table.status}
                  </span>
                </div>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${table.section} • Capacity: ${table.capacity}p</span>

              <!-- Live QR Code Canvas Holder -->
              <div class="df-table-qr-preview" id="qr-table-${table.id}">
                <!-- Rendered dynamically -->
              </div>

              <div style="font-size: 0.72rem; color: var(--text-dim); display: flex; justify-content: space-between; width: 100%;">
                <span>Scans: <strong>${table.qrScans}</strong></span>
                <span>${table.lastScanned}</span>
              </div>

              <div class="df-table-card-actions">
                <button class="df-pill-btn btn-view-tent" data-id="${table.id}" title="Print QR Stand Tent">
                  🖨️ Print Tent
                </button>
                <button class="df-pill-btn btn-toggle-table ${table.status === 'occupied' ? 'danger' : ''}" data-id="${table.id}" title="${table.status === 'occupied' ? (isBillPending ? 'Payment pending — settle bill to clear table' : 'Click to Clear Table (Mark Available)') : 'Click to Seat Guests (Mark Occupied)'}">
                  ${table.status === 'occupied' ? '🧹 Clear' : '🪑 Seat'}
                </button>
                <a href="${tableUrl}" target="_blank" class="df-pill-btn primary btn-test-link" title="Test Customer Experience">
                  ↗
                </a>
              </div>
            </div>
          `;
    }).join('') : `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
            <div style="font-size: 2.5rem; margin-bottom: 0.65rem;">🪑</div>
            <h4 style="color: #fff; font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">No Tables Configured Yet</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem; max-width: 400px; margin-left: auto; margin-right: auto;">Add dining tables with custom seating capacity, dining zones, and instant high-precision vector QR codes.</p>
            <button class="df-pill-btn primary" id="btn-add-table-empty" style="padding: 0.6rem 1.25rem; font-weight: 800;">+ Add First Table</button>
          </div>
        `}
      </div>
    `;

    // Generate real QR codes into each table preview box
    tenantTables.forEach(table => {
      const el = document.getElementById(`qr-table-${table.id}`);
      if (el && window.DineFlowQR) {
        const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);
        el.innerHTML = window.DineFlowQR.generateSVG(tableUrl, { size: 140, darkColor: '#0f172a' });
      }
    });

    // View & Print Tent Card
    document.querySelectorAll('.btn-view-tent').forEach(btn => {
      btn.addEventListener('click', () => {
        const tableId = btn.getAttribute('data-id');
        const table = state.tables.find(t => t.id === tableId && (!t.tenantId || t.tenantId === tenantSlug));
        if (table) openPrintTentModal(table, tenant);
      });
    });

    // Toggle Table Status (Clear Table / Seat Guests)
    document.querySelectorAll('.btn-toggle-table').forEach(btn => {
      btn.addEventListener('click', () => {
        const tableId = btn.getAttribute('data-id');
        const table = state.tables.find(t => t.id === tableId && (!t.tenantId || t.tenantId === tenantSlug));
        if (table) {
          if (table.status === 'occupied') {
            // Guard: Check if there are unsettled bills or unpaid active orders
            const hasPendingBill = state.billRequests.some(b => b.tableId === table.id && (!b.tenantId || b.tenantId === tenantSlug) && b.status === 'PENDING');
            const hasUnpaidOrders = state.orders.some(o => o.tableId === table.id && (!o.tenantId || o.tenantId === tenantSlug) && o.paymentStatus !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

            if (hasPendingBill || hasUnpaidOrders) {
              SoundFX.chime('alert');
              showToast('Payment pending — settle bill to clear table', '💳');
              return;
            }

            table.status = 'available';
            delete table.manuallyOccupied;
            state.staffRequests.forEach(s => {
              if (s.tableId === table.id && (!s.tenantId || s.tenantId === tenantSlug)) {
                s.status = 'RESOLVED';
              }
            });
            showToast(`${table.name} cleared & marked Available`, '🧹');
          } else {
            table.status = 'occupied';
            table.manuallyOccupied = true;
            showToast(`${table.name} marked Occupied`, '🪑');
          }
          DineFlowStore.save(state, {
            action: 'TABLE_STATUS_TOGGLED',
            tableId: table.id,
            isOccupied: table.status === 'occupied',
            tenantSlug: tenantSlug
          });
          DineFlowStore.recordLog({
            tenantId: tenantSlug,
            tenantName: tenant.name,
            managerId: state.session?.user?.id || 'staff-01',
            managerName: state.session?.user?.name || 'Chef Vikram Rao',
            category: 'OVERRIDE',
            action: table.status === 'occupied' ? 'Manual Seat Guest' : 'Table Cleared & Reset',
            details: `${table.name} (${table.section}) marked ${table.status} by manager on floor`,
            orderId: table.id,
            amount: 0,
            paymentMethod: 'N/A',
            severity: 'warning',
            securityFlag: '⚠️ Manual Floor Override'
          });
          SoundFX.chime('success');
          renderAdminView(document.getElementById('app'), tenant);
        }
      });
    });

    // Filter Floor Tables by Status
    document.querySelectorAll('.btn-filter-tables').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.btn-filter-tables').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');
        document.querySelectorAll('.df-table-admin-card').forEach(card => {
          const status = card.getAttribute('data-table-status');
          card.style.display = (filter === 'all' || status === filter) ? '' : 'none';
        });
      });
    });

    // Clear All Tables
    document.getElementById('btn-clear-all-tables-tab')?.addEventListener('click', () => {
      const occupiedTables = state.tables.filter(t => (!t.tenantId || t.tenantId === tenantSlug) && t.status === 'occupied');

      const tablesWithPendingBills = occupiedTables.filter(t => {
        const hasPendingBill = state.billRequests.some(b => b.tableId === t.id && (!b.tenantId || b.tenantId === tenantSlug) && b.status === 'PENDING');
        const hasUnpaidOrders = state.orders.some(o => o.tableId === t.id && (!o.tenantId || o.tenantId === tenantSlug) && o.paymentStatus !== 'PAID' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
        return hasPendingBill || hasUnpaidOrders;
      });

      if (occupiedTables.length > 0 && tablesWithPendingBills.length === occupiedTables.length) {
        SoundFX.chime('alert');
        showToast('Payment pending — settle bill to clear table', '💳');
        return;
      }

      const tablesToClear = occupiedTables.filter(t => !tablesWithPendingBills.some(pb => pb.id === t.id));
      if (!tablesToClear.length) {
        showToast('No eligible tables to clear.', 'ℹ️');
        return;
      }

      const clearedIds = new Set(tablesToClear.map(t => t.id));
      tablesToClear.forEach(t => {
        t.status = 'available';
        delete t.manuallyOccupied;
      });

      state.orders.forEach(o => {
        if (clearedIds.has(o.tableId) && (!o.tenantId || o.tenantId === tenantSlug) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') {
          o.status = 'COMPLETED';
          o.paymentStatus = 'PAID';
        }
      });
      state.staffRequests.forEach(s => {
        if (clearedIds.has(s.tableId) && (!s.tenantId || s.tenantId === tenantSlug)) {
          s.status = 'RESOLVED';
        }
      });

      DineFlowStore.save(state, {
        action: 'ALL_TABLES_CLEARED',
        clearedTableIds: Array.from(clearedIds),
        source: 'staff',
        tenantSlug: tenantSlug
      });

      if (tablesWithPendingBills.length > 0) {
        SoundFX.chime('notice');
        showToast(`${tablesToClear.length} table(s) cleared. ${tablesWithPendingBills.length} retained (payment pending)`, '💳');
      } else {
        SoundFX.chime('success');
        showToast(`All ${tablesToClear.length} tables cleared & marked Available!`, '🧹');
      }
      renderAdminView(document.getElementById('app'), tenant);
    });

    // Batch Print All Tables (PDF)
    document.getElementById('btn-batch-print-all')?.addEventListener('click', () => {
      batchPrintAllTables(tenantTables, tenant);
    });

    // Add Table
    const handleOpenAddTable = () => {
      openAddTableModal(tenant, () => renderAdminView(document.getElementById('app'), tenant));
    };
    document.getElementById('btn-add-table')?.addEventListener('click', handleOpenAddTable);
    document.getElementById('btn-add-table-empty')?.addEventListener('click', handleOpenAddTable);
  }

  // ------------------------------------------------------------------------------
  // ADD DINING TABLE MODAL (Configurable Capacity, Section & Seating Options)
  // ------------------------------------------------------------------------------
  function openAddTableModal(tenant, onComplete) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    state = DineFlowStore.get();
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantTables = sortTablesSerially(state.tables.filter(t => !t.tenantId || t.tenantId === tenantSlug));

    // Compute smart sequential table ID
    const prefix = tenantSlug === 'bella-vista' ? 'BV-' : (tenantSlug === 'sakura-asian' ? 'SK-' : 'T');
    const existingNums = tenantTables
      .map(t => extractTableSerialNumber(t))
      .filter(n => n > 0 && n < 999999);

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : tenantTables.length;
    const defaultTableId = `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
    const defaultTableName = `Table ${defaultTableId}`;

    // Collect unique sections from existing tables for this venue
    const collectedSections = Array.from(new Set(tenantTables.map(t => t.section).filter(Boolean)));
    const recommendedSections = [
      'Indoor AC Dining',
      'Garden Patio (Outdoor)',
      'Indoor Family Booth',
      'Rooftop Lounge & Bar',
      'Private Dining (VIP)',
      'Bar Counter Seating'
    ];
    recommendedSections.forEach(sec => {
      if (!collectedSections.includes(sec)) collectedSections.push(sec);
    });
    const defaultSection = collectedSections[0] || 'Indoor AC Dining';

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="add-table-backdrop">
        <div class="df-bottom-sheet" style="max-width: 540px; align-self: center; border-radius: 20px; background: #0E131F; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 24px 60px rgba(0,0,0,0.85); overflow: hidden;">
          <div class="df-sheet-header" style="padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(229, 169, 60, 0.15); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                🪑
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0;">Add Dining Table</h3>
                <span style="font-size: 0.72rem; color: var(--text-dim);">${tenant.name} • Capacity &amp; Floor Provisioning</span>
              </div>
            </div>
            <button class="df-sheet-close" id="btn-close-add-table" style="background: none; border: none; font-size: 1.25rem; color: var(--text-dim); cursor: pointer;">✕</button>
          </div>

          <div class="df-sheet-body" style="padding: 1.25rem 1.5rem; max-height: 82vh; overflow-y: auto;">
            <form id="df-add-table-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1.1rem;">
              
              <!-- 1. Table ID & Display Name -->
              <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">
                    Table Identifier / Code *
                  </label>
                  <input type="text" id="new-table-id" value="${defaultTableId}" placeholder="e.g. T22, BV-09" style="width: 100%; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;" required>
                  <span id="table-id-error" style="display: none; font-size: 0.7rem; color: #EF4444; margin-top: 0.25rem; font-weight: 600;">⚠️ Table ID already in use</span>
                </div>
                <div>
                  <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">
                    Display Name *
                  </label>
                  <input type="text" id="new-table-name" value="${defaultTableName}" placeholder="e.g. Table T22, Patio 04" style="width: 100%; font-weight: 700;" required>
                </div>
              </div>

              <!-- 2. Seating Capacity (Core User Request) -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
                  <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0;">
                    Seating Capacity *
                  </label>
                  <span style="font-size: 0.72rem; color: var(--text-dim);">Max covers/guests per sitting</span>
                </div>

                <!-- Quick Presets -->
                <div class="df-capacity-presets" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; margin-bottom: 0.6rem;">
                  <button type="button" class="btn-capacity-preset" data-capacity="2">
                    <span style="font-size: 1rem;">👥</span>
                    <span>2 Seats</span>
                  </button>
                  <button type="button" class="btn-capacity-preset active" data-capacity="4">
                    <span style="font-size: 1rem;">👥</span>
                    <span>4 Seats</span>
                  </button>
                  <button type="button" class="btn-capacity-preset" data-capacity="6">
                    <span style="font-size: 1rem;">👨‍👩‍👧</span>
                    <span>6 Seats</span>
                  </button>
                  <button type="button" class="btn-capacity-preset" data-capacity="8">
                    <span style="font-size: 1rem;">👨‍👩‍👦‍👦</span>
                    <span>8 Seats</span>
                  </button>
                  <button type="button" class="btn-capacity-preset" data-capacity="10">
                    <span style="font-size: 1rem;">🎉</span>
                    <span>10+ Seats</span>
                  </button>
                </div>

                <!-- Fine-tuning Stepper -->
                <div style="display: flex; align-items: center; gap: 0.65rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.35rem 0.65rem;">
                  <button type="button" id="btn-cap-minus" style="width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); color: #fff; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">−</button>
                  <div style="flex: 1; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                    <input type="number" id="new-table-capacity" value="4" min="1" max="60" style="width: 60px; text-align: center; font-size: 1.2rem; font-weight: 800; padding: 0.2rem; background: transparent; border: none; color: #fff;">
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Guests / Seats</span>
                  </div>
                  <button type="button" id="btn-cap-plus" style="width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); color: #fff; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">+</button>
                </div>
              </div>

              <!-- 3. Dining Section / Floor Zone -->
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">
                  Dining Section / Floor Zone *
                </label>
                <select id="new-table-section-select" style="width: 100%; margin-bottom: 0.4rem;">
                  ${collectedSections.map(sec => `<option value="${sec}" ${sec === defaultSection ? 'selected' : ''}>📍 ${sec}</option>`).join('')}
                  <option value="__custom__">➕ Add Custom Section / Zone Name...</option>
                </select>
                <input type="text" id="new-table-custom-section" placeholder="e.g. Mezzanine Level, Poolside Terrace" style="width: 100%; display: none; margin-top: 0.35rem;">
              </div>

              <!-- 4. Initial Seating Status -->
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.45rem; display: block;">
                  Initial Table Status
                </label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                  <label id="label-status-avail" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.85rem; border: 1px solid #10B981; background: rgba(16, 185, 129, 0.12); border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                    <input type="radio" name="table-status-choice" value="available" checked style="accent-color: #10B981;">
                    <div>
                      <div style="font-size: 0.82rem; font-weight: 700; color: #10B981;">🟢 Available</div>
                      <div style="font-size: 0.68rem; color: var(--text-dim);">Vacant, ready for walk-ins &amp; QR orders</div>
                    </div>
                  </label>
                  <label id="label-status-occ" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.85rem; border: 1px solid var(--border-subtle); background: rgba(255, 255, 255, 0.03); border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                    <input type="radio" name="table-status-choice" value="occupied" style="accent-color: #EF4444;">
                    <div>
                      <div style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1;">🔴 Occupied</div>
                      <div style="font-size: 0.68rem; color: var(--text-dim);">Guests seated immediately</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- 5. Atmosphere / Features (Optional) -->
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">
                  Table Feature / Tag (Optional)
                </label>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                  <button type="button" class="btn-table-tag active" data-tag="Standard Dining">🪑 Standard Table</button>
                  <button type="button" class="btn-table-tag" data-tag="Window View">🪟 Window View</button>
                  <button type="button" class="btn-table-tag" data-tag="Cozy Booth">🛋️ Cozy Booth</button>
                  <button type="button" class="btn-table-tag" data-tag="Patio Outdoor">🌿 Patio Outdoor</button>
                  <button type="button" class="btn-table-tag" data-tag="VIP Lounge">👑 VIP Lounge</button>
                </div>
              </div>

              <!-- 6. Live QR Preview Card -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 0.85rem 1rem; display: flex; align-items: center; gap: 1rem;">
                <div id="add-table-qr-mini" style="width: 68px; height: 68px; background: #fff; padding: 4px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <!-- Live SVG QR -->
                </div>
                <div style="min-width: 0; flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
                    <span id="preview-table-name" style="font-weight: 800; font-size: 0.95rem; color: #fff;">${defaultTableName}</span>
                    <span id="preview-table-cap" class="df-micro-badge" style="background: rgba(229, 169, 60, 0.15); color: var(--brand-primary); font-size: 0.65rem; padding: 2px 6px;">👥 4p</span>
                  </div>
                  <div id="preview-table-sec" style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.25rem;">${defaultSection}</div>
                  <div id="preview-table-url" style="font-size: 0.68rem; color: var(--text-dim); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${getDineFlowTableUrl(tenant.slug, defaultTableId)}
                  </div>
                </div>
              </div>

              <!-- 7. Actions -->
              <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                <button type="button" id="btn-cancel-add-table" class="df-pill-btn" style="flex: 1; padding: 0.75rem; text-align: center; justify-content: center;">
                  Cancel
                </button>
                <button type="submit" id="btn-submit-add-table" class="df-pill-btn primary" style="flex: 2; padding: 0.75rem; text-align: center; justify-content: center; font-weight: 800;">
                  + Add Table to Floor Plan
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    `;

    const idInput = document.getElementById('new-table-id');
    const nameInput = document.getElementById('new-table-name');
    const capInput = document.getElementById('new-table-capacity');
    const secSelect = document.getElementById('new-table-section-select');
    const secCustomInput = document.getElementById('new-table-custom-section');
    const submitBtn = document.getElementById('btn-submit-add-table');
    const errorEl = document.getElementById('table-id-error');

    let hasManuallyEditedName = false;

    function getSelectedSection() {
      if (secSelect?.value === '__custom__') {
        return (secCustomInput?.value || '').trim() || 'Indoor AC Dining';
      }
      return secSelect?.value || 'Indoor AC Dining';
    }

    function updateLivePreview() {
      const tid = (idInput?.value || defaultTableId).trim().toUpperCase();
      const tname = (nameInput?.value || `Table ${tid}`).trim();
      const cap = parseInt(capInput?.value, 10) || 4;
      const sec = getSelectedSection();

      const nameEl = document.getElementById('preview-table-name');
      const capEl = document.getElementById('preview-table-cap');
      const secEl = document.getElementById('preview-table-sec');
      const urlEl = document.getElementById('preview-table-url');
      const qrHolder = document.getElementById('add-table-qr-mini');

      if (nameEl) nameEl.textContent = tname || `Table ${tid}`;
      if (capEl) capEl.textContent = `👥 ${cap}p`;
      if (secEl) secEl.textContent = sec;

      const tableUrl = getDineFlowTableUrl(tenant.slug, tid);
      if (urlEl) urlEl.textContent = tableUrl;
      if (qrHolder && window.DineFlowQR) {
        qrHolder.innerHTML = window.DineFlowQR.generateSVG(tableUrl, { size: 60, darkColor: '#0f172a' });
      }

      const isDuplicate = tenantTables.some(t => t.id && t.id.toLowerCase() === tid.toLowerCase());
      if (errorEl) errorEl.style.display = (isDuplicate && tid) ? 'block' : 'none';
      if (submitBtn) submitBtn.disabled = Boolean(isDuplicate || !tid);
    }

    // Initial QR render
    updateLivePreview();

    // Table ID change
    idInput?.addEventListener('input', () => {
      idInput.value = idInput.value.toUpperCase();
      if (!hasManuallyEditedName && nameInput) {
        nameInput.value = `Table ${idInput.value}`;
      }
      updateLivePreview();
    });

    nameInput?.addEventListener('input', () => {
      hasManuallyEditedName = true;
      updateLivePreview();
    });

    // Capacity Quick Presets
    document.querySelectorAll('.btn-capacity-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        document.querySelectorAll('.btn-capacity-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        const cap = parseInt(preset.getAttribute('data-capacity'), 10) || 4;
        if (capInput) capInput.value = cap;
        updateLivePreview();
      });
    });

    // Stepper minus / plus
    document.getElementById('btn-cap-minus')?.addEventListener('click', () => {
      const cur = parseInt(capInput?.value, 10) || 4;
      const next = Math.max(1, cur - 1);
      if (capInput) capInput.value = next;
      document.querySelectorAll('.btn-capacity-preset').forEach(p => {
        p.classList.toggle('active', parseInt(p.getAttribute('data-capacity'), 10) === next);
      });
      updateLivePreview();
    });

    document.getElementById('btn-cap-plus')?.addEventListener('click', () => {
      const cur = parseInt(capInput?.value, 10) || 4;
      const next = Math.min(60, cur + 1);
      if (capInput) capInput.value = next;
      document.querySelectorAll('.btn-capacity-preset').forEach(p => {
        p.classList.toggle('active', parseInt(p.getAttribute('data-capacity'), 10) === next);
      });
      updateLivePreview();
    });

    capInput?.addEventListener('input', () => {
      const val = parseInt(capInput.value, 10) || 4;
      document.querySelectorAll('.btn-capacity-preset').forEach(p => {
        p.classList.toggle('active', parseInt(p.getAttribute('data-capacity'), 10) === val);
      });
      updateLivePreview();
    });

    // Section dropdown change
    secSelect?.addEventListener('change', () => {
      if (secSelect.value === '__custom__') {
        if (secCustomInput) {
          secCustomInput.style.display = 'block';
          secCustomInput.focus();
        }
      } else {
        if (secCustomInput) secCustomInput.style.display = 'none';
      }
      updateLivePreview();
    });

    secCustomInput?.addEventListener('input', updateLivePreview);

    // Initial Status Radio styling
    const availLabel = document.getElementById('label-status-avail');
    const occLabel = document.getElementById('label-status-occ');
    document.querySelectorAll('input[name="table-status-choice"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'available') {
          availLabel.style.border = '1px solid #10B981';
          availLabel.style.background = 'rgba(16, 185, 129, 0.12)';
          occLabel.style.border = '1px solid var(--border-subtle)';
          occLabel.style.background = 'rgba(255, 255, 255, 0.03)';
        } else {
          occLabel.style.border = '1px solid #EF4444';
          occLabel.style.background = 'rgba(239, 68, 68, 0.12)';
          availLabel.style.border = '1px solid var(--border-subtle)';
          availLabel.style.background = 'rgba(255, 255, 255, 0.03)';
        }
      });
    });

    // Table Feature tags
    document.querySelectorAll('.btn-table-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.btn-table-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });

    // Close / Cancel modal
    const closeModal = () => {
      modalContainer.innerHTML = '';
    };
    document.getElementById('btn-close-add-table')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-add-table')?.addEventListener('click', closeModal);
    document.getElementById('add-table-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'add-table-backdrop') closeModal();
    });

    // Submit handler
    document.getElementById('df-add-table-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const tid = (idInput?.value || '').trim().toUpperCase();
      if (!tid) {
        showToast('Please specify a valid Table ID', '⚠️');
        return;
      }
      if (tenantTables.some(t => t.id && t.id.toLowerCase() === tid.toLowerCase())) {
        showToast(`Table ID ${tid} already exists in ${tenant.name}`, '⚠️');
        return;
      }

      const tname = (nameInput?.value || `Table ${tid}`).trim();
      const cap = Math.max(1, parseInt(capInput?.value, 10) || 4);
      const section = getSelectedSection();
      const selectedStatus = document.querySelector('input[name="table-status-choice"]:checked')?.value || 'available';

      const newTable = {
        id: tid,
        tenantId: tenantSlug,
        name: tname,
        section: section,
        capacity: cap,
        status: selectedStatus,
        qrScans: 0,
        lastScanned: 'Never',
        manuallyOccupied: selectedStatus === 'occupied'
      };

      state.tables.push(newTable);
      state.tables = sortTablesSerially(state.tables);
      DineFlowStore.save(state, {
        action: 'TABLE_CREATED',
        source: 'staff',
        table: newTable,
        tableId: tid,
        tenantSlug: tenantSlug
      });

      SoundFX.chime('success');
      closeModal();
      showToast(`Added ${newTable.name} (${newTable.capacity} Seats • ${newTable.section})`, '🪑');
      if (typeof onComplete === 'function') onComplete();
    });
  }

  // PRINTABLE TABLE TENT CARD MODAL
  function openPrintTentModal(table, tenant) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="tent-backdrop">
        <div class="df-bottom-sheet" style="max-width: 490px; align-self: center; border-radius: 24px; padding-bottom: 1.5rem;">
          <div class="df-sheet-header">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800;">Table Tent QR Stand • ${table.name}</h3>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">High-precision vector QR code formatted for printing &amp; PDF export</p>
            </div>
            <button class="df-sheet-close" id="btn-close-tent">✕</button>
          </div>

          <div class="df-sheet-body">
            <!-- Physical Tent Stand Card Layout (Crisp Vector Display) -->
            <div class="df-print-tent-card" id="printable-tent-card">
              <div class="df-print-tent-header">
                <h2>${tenant.name}</h2>
                <p>${tenant.tagline}</p>
              </div>

              <div class="df-print-table-tag">
                TABLE ${table.id}
              </div>

              <div class="df-print-qr-holder" id="print-qr-svg-box">
                <!-- High-Precision SVG QR -->
              </div>

              <div class="df-print-instructions">
                Scan • Browse • Order • Enjoy
              </div>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;">
                <svg class="df-wifi-icon" style="color: #64748b; width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                  <line x1="12" y1="20" x2="12.01" y2="20" stroke-width="2.5"></line>
                </svg>
                <span>Free Guest Wi-Fi: <strong>${tenant.wifiName || 'Guest'}</strong> (Pass: ${tenant.wifiPass || 'Welcome'})</span>
              </div>
            </div>

            <!-- Unified Action Toolbar (Identical Format across PDF, PNG & Vector SVG) -->
            <div style="margin-top: 1.25rem;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; text-align: center;">
                Table Tent Stand Card (Identical Full Format)
              </div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="df-splash-btn" id="btn-trigger-print" style="flex: 1.5; min-width: 140px; padding: 0.75rem; font-size: 0.85rem; text-align: center; font-weight: 800;">
                  🖨️ Save as PDF
                </button>
                <button class="df-pill-btn primary" id="btn-download-stand-png" style="flex: 1; padding: 0.75rem 0.65rem; font-size: 0.82rem; justify-content: center; font-weight: 700;">
                  📥 Stand (PNG)
                </button>
                <button class="df-pill-btn primary" id="btn-download-stand-svg" style="flex: 1; padding: 0.75rem 0.65rem; font-size: 0.82rem; justify-content: center; font-weight: 700;">
                  📄 Stand (SVG)
                </button>
              </div>

              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="df-pill-btn" id="btn-download-qr-only-png" style="flex: 1; padding: 0.5rem; font-size: 0.75rem; justify-content: center; color: var(--text-dim);" title="Download QR Matrix square image only without the card frame">
                  🔍 Raw QR (PNG)
                </button>
                <button class="df-pill-btn" id="btn-download-qr-only-svg" style="flex: 1; padding: 0.5rem; font-size: 0.75rem; justify-content: center; color: var(--text-dim);" title="Download QR Matrix vector SVG only without the card frame">
                  ⚡ Raw QR (SVG)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const svgBox = document.getElementById('print-qr-svg-box');
    if (svgBox && window.DineFlowQR) {
      svgBox.innerHTML = window.DineFlowQR.generateSVG(tableUrl, { size: 210, darkColor: '#0b0f17', margin: 2 });
    }

    document.getElementById('btn-close-tent')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    // 1. High-Precision Isolated PDF Print (Identical Stand Format)
    document.getElementById('btn-trigger-print')?.addEventListener('click', () => {
      printTableTentCard(table, tenant);
    });

    // 2. Full Table Tent Stand PNG Export (Identical to PDF & SVG at 600 DPI)
    document.getElementById('btn-download-stand-png')?.addEventListener('click', () => {
      downloadTentCardPNG(table, tenant);
    });

    // 3. Full Table Tent Stand Vector SVG Export (Identical to PDF & PNG)
    document.getElementById('btn-download-stand-svg')?.addEventListener('click', () => {
      const svgContent = buildTableTentCardSVG(table, tenant);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tenant.slug}-Table-${table.id}-Stand.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Table ${table.id} Tent Stand SVG Exported (Exact Stand Format)`, '📄');
    });

    // 4. Raw QR Matrix Only (PNG)
    document.getElementById('btn-download-qr-only-png')?.addEventListener('click', () => {
      if (window.DineFlowQR) {
        const dataUrl = window.DineFlowQR.getDataURL(tableUrl, { size: 1000, margin: 4 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${tenant.slug}-Table-${table.id}-QR-matrix.png`;
        a.click();
        showToast(`Table ${table.id} Raw QR PNG Downloaded`, '📥');
      }
    });

    // 5. Raw QR Matrix Only (SVG)
    document.getElementById('btn-download-qr-only-svg')?.addEventListener('click', () => {
      if (window.DineFlowQR) {
        const svgContent = window.DineFlowQR.generateSVG(tableUrl, { size: 500, darkColor: '#0b0f17', margin: 4 });
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tenant.slug}-Table-${table.id}-QR-matrix.svg`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Table ${table.id} Raw QR SVG Exported`, '⚡');
      }
    });
  }

  function escapeXml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Pure Vector SVG Generator for the Complete Table Tent Stand Card
  function buildTableTentCardSVG(table, tenant) {
    const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);
    const qrSvg = window.DineFlowQR ? window.DineFlowQR.generateSVG(tableUrl, { size: 400, darkColor: '#0b0f17', margin: 2, lightColor: '#ffffff' }) : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1140" width="800" height="1140">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap');
      .txt { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <!-- Clean Background & Gold Accent Frame -->
  <rect x="24" y="24" width="752" height="1092" rx="36" fill="#ffffff" stroke="${tenant.primaryColor || '#E5A93C'}" stroke-width="8"/>

  <!-- Brand Title -->
  <text x="400" y="115" text-anchor="middle" class="txt" font-size="44" font-weight="800" fill="#0b0f17">${escapeXml(tenant.name)}</text>
  <text x="400" y="155" text-anchor="middle" class="txt" font-size="20" font-weight="600" fill="#64748b">${escapeXml(tenant.tagline)}</text>

  <!-- Table Identifier Pill -->
  <rect x="260" y="190" width="280" height="64" rx="32" fill="#0f172a"/>
  <text x="400" y="233" text-anchor="middle" class="txt" font-size="28" font-weight="800" fill="${tenant.primaryColor || '#E5A93C'}" letter-spacing="2">TABLE ${escapeXml(table.id)}</text>

  <!-- High-Precision Centered QR Code Box -->
  <rect x="170" y="285" width="460" height="460" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
  <g transform="translate(200, 315)">
    <svg width="400" height="400" viewBox="0 0 400 400">
      ${qrSvg}
    </svg>
  </g>

  <!-- Scan Instructions -->
  <text x="400" y="795" text-anchor="middle" class="txt" font-size="28" font-weight="800" fill="#0f172a">Scan • Browse • Order • Enjoy</text>

  <!-- Wi-Fi Credentials Pill -->
  <rect x="100" y="835" width="600" height="56" rx="28" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <text x="400" y="871" text-anchor="middle" class="txt" font-size="19" font-weight="600" fill="#475569">
    📶 Free Guest Wi-Fi: <tspan font-weight="800" fill="#0f172a">${escapeXml(tenant.wifiName || 'Guest')}</tspan> (Pass: <tspan font-weight="800" fill="#0f172a">${escapeXml(tenant.wifiPass || 'Welcome')}</tspan>)
  </text>

  <!-- Footer Branding -->
  <text x="400" y="945" text-anchor="middle" class="txt" font-size="16" font-weight="600" fill="#94a3b8">
    Powered by DineFlow™ • Contactless Digital Dining Platform
  </text>
</svg>`;
  }

  // 600 DPI High-Resolution PNG Generator for the Complete Table Tent Stand Card
  function downloadTentCardPNG(table, tenant) {
    const svgStr = buildTableTentCardSVG(table, tenant);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 2280;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${tenant.slug}-Table-${table.id}-Stand.png`;
      a.click();
      showToast(`Table ${table.id} Tent Stand PNG Downloaded (600 DPI)`, '📥');
    };
    img.onerror = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tenant.slug}-Table-${table.id}-Stand.svg`;
      a.click();
    };
    img.src = url;
  }

  // Standalone Isolated Single-Page PDF Print Generator
  function printTableTentCard(table, tenant) {
    const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);
    const qrSvg = window.DineFlowQR ? window.DineFlowQR.generateSVG(tableUrl, { size: 300, darkColor: '#0b0f17', margin: 2 }) : '';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${tenant.name} - Table ${table.id} QR Stand</title>
        <style>
          @page {
            size: A5 portrait;
            margin: 10mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background: #ffffff;
            color: #0b0f17;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1rem;
          }
          .tent-card {
            width: 100%;
            max-width: 360px;
            background: #ffffff;
            border: 3px solid ${tenant.primaryColor || '#E5A93C'};
            border-radius: 24px;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: none;
            page-break-inside: avoid;
          }
          .brand-title {
            font-size: 1.75rem;
            font-weight: 800;
            color: #0b0f17;
            margin-bottom: 0.35rem;
            letter-spacing: -0.02em;
          }
          .brand-tagline {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 1.5rem;
          }
          .table-pill {
            display: inline-block;
            background: #0f172a !important;
            color: ${tenant.primaryColor || '#E5A93C'} !important;
            font-weight: 800;
            font-size: 1.25rem;
            padding: 0.5rem 1.75rem;
            border-radius: 99px;
            margin-bottom: 1.5rem;
            letter-spacing: 0.05em;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .qr-wrapper {
            width: 220px;
            height: 220px;
            margin: 0 auto 1.5rem;
            border: 1.5px solid #cbd5e1;
            border-radius: 20px;
            padding: 12px;
            background: #ffffff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .qr-wrapper svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .instructions {
            font-size: 0.95rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.65rem;
            letter-spacing: 0.02em;
          }
          .wifi-info {
            font-size: 0.78rem;
            color: #64748b;
          }
          .footer-note {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px dashed #e2e8f0;
            font-size: 0.7rem;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="tent-card">
          <h1 class="brand-title">${tenant.name}</h1>
          <p class="brand-tagline">${tenant.tagline}</p>
          <div class="table-pill">TABLE ${table.id}</div>
          <div class="qr-wrapper">
            ${qrSvg}
          </div>
          <div class="instructions">Scan • Browse • Order • Enjoy</div>
          <div class="wifi-info">
            📶 Free Guest Wi-Fi: <strong>${tenant.wifiName || 'Guest'}</strong> (Pass: ${tenant.wifiPass || 'Welcome'})
          </div>
          <div class="footer-note">
            Powered by DineFlow™ • Contactless Digital Dining Experience
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 4000);
    }, 400);
  }

  // Batch Print All Table QR Stands to a Clean Multi-Page PDF Document
  function batchPrintAllTables(tables, tenant) {
    const sortedTables = sortTablesSerially(tables);
    const cardsHTML = sortedTables.map(table => {
      const tableUrl = getDineFlowTableUrl(tenant.slug, table.id);
      const qrSvg = window.DineFlowQR ? window.DineFlowQR.generateSVG(tableUrl, { size: 300, darkColor: '#0b0f17', margin: 2 }) : '';
      return `
        <div class="tent-card-page">
          <div class="tent-card">
            <h1 class="brand-title">${tenant.name}</h1>
            <p class="brand-tagline">${tenant.tagline}</p>
            <div class="table-pill">TABLE ${table.id}</div>
            <div class="qr-wrapper">${qrSvg}</div>
            <div class="instructions">Scan • Browse • Order • Enjoy</div>
            <div class="wifi-info">
              📶 Free Guest Wi-Fi: <strong>${tenant.wifiName || 'Guest'}</strong> (Pass: ${tenant.wifiPass || 'Welcome'})
            </div>
            <div class="footer-note">
              Powered by DineFlow™ • Contactless Digital Dining Experience
            </div>
          </div>
        </div>
      `;
    }).join('');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${tenant.name} - All Table QR Stands Batch</title>
        <style>
          @page {
            size: A5 portrait;
            margin: 8mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background: #ffffff;
            color: #0b0f17;
          }
          .tent-card-page {
            page-break-after: always;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10mm;
          }
          .tent-card-page:last-child {
            page-break-after: auto;
          }
          .tent-card {
            width: 100%;
            max-width: 360px;
            background: #ffffff;
            border: 2.5px solid ${tenant.primaryColor || '#E5A93C'};
            border-radius: 24px;
            padding: 2.25rem 1.75rem;
            text-align: center;
          }
          .brand-title {
            font-size: 1.65rem;
            font-weight: 800;
            color: #0b0f17;
            margin-bottom: 0.35rem;
          }
          .brand-tagline {
            font-size: 0.82rem;
            color: #64748b;
            margin-bottom: 1.25rem;
          }
          .table-pill {
            display: inline-block;
            background: #0f172a !important;
            color: ${tenant.primaryColor || '#E5A93C'} !important;
            font-weight: 800;
            font-size: 1.15rem;
            padding: 0.45rem 1.6rem;
            border-radius: 99px;
            margin-bottom: 1.25rem;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .qr-wrapper {
            width: 220px;
            height: 220px;
            margin: 0 auto 1.25rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            padding: 12px;
            background: #ffffff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .qr-wrapper svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .instructions {
            font-size: 0.9rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 0.6rem;
          }
          .wifi-info {
            font-size: 0.75rem;
            color: #64748b;
          }
          .footer-note {
            margin-top: 1.25rem;
            padding-top: 0.85rem;
            border-top: 1px dashed #e2e8f0;
            font-size: 0.65rem;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        ${cardsHTML}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 5000);
    }, 500);
  }

  // MENU MANAGER (CRUD)
  function renderMenuManager(container, tenant) {
    ensureTenantMenuAndCategories(tenant);
    const tenantItems = state.menuItems.filter(item => item.tenantId === tenant.id);
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Digital Menu Catalog (${tenantItems.length} Dishes)</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Manage categories, real-time pricing, stock availability, and chef specials for ${tenant.name}.</p>
        </div>
        <button class="df-pill-btn primary" id="btn-add-food-item">
          + Add New Dish
        </button>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-subtle); background: rgba(255,255,255,0.02); color: var(--text-muted);">
              <th style="padding: 1rem;">Dish Name</th>
              <th style="padding: 1rem;">Category</th>
              <th style="padding: 1rem;">Price</th>
              <th style="padding: 1rem;">Diet</th>
              <th style="padding: 1rem;">Stock Status</th>
              <th style="padding: 1rem; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${tenantItems.map(item => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${item.image}" alt="${item.name.replace(/"/g, '&quot;')}" onerror="window.dfHandleImageError(this, '${item.categoryId}', '${item.id}')" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                  <div>
                    <div style="font-weight: 700; color: #fff;">${item.name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">${item.isBestseller ? '⭐ Bestseller' : ''}</div>
                  </div>
                </td>
                <td style="padding: 0.85rem 1rem; color: var(--text-muted);">
                  ${state.categories.find(c => c.id === item.categoryId)?.name || 'General'}
                </td>
                <td style="padding: 0.85rem 1rem; font-weight: 800; color: var(--brand-primary);">
                  ${tenant.currency}${item.price}
                </td>
                <td style="padding: 0.85rem 1rem;">
                  <span class="df-diet-badge ${item.isVeg ? 'veg' : 'nonveg'}"></span>
                </td>
                <td style="padding: 0.85rem 1rem;">
                  <button class="df-pill-btn btn-toggle-stock" data-id="${item.id}" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; color: ${item.isAvailable ? '#10B981' : '#EF4444'};">
                    ${item.isAvailable ? 'In Stock ✓' : 'Sold Out ✕'}
                  </button>
                </td>
                <td style="padding: 0.85rem 1rem; text-align: right;">
                  <button class="df-pill-btn btn-delete-item" data-id="${item.id}" style="color: #EF4444; font-size: 0.75rem;">
                    Delete
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.btn-toggle-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const it = state.menuItems.find(m => m.id === id);
        if (it) {
          it.isAvailable = !it.isAvailable;
          DineFlowStore.save(state, {
            action: 'MENU_ITEM_AVAILABILITY_CHANGED',
            source: 'staff',
            itemId: id,
            isAvailable: it.isAvailable,
            tenantSlug: tenantSlug
          });
          SoundFX.chime('success');
          showToast(`${it.name} marked as ${it.isAvailable ? 'In Stock' : 'Sold Out'}`);
          renderMenuManager(container, tenant);
        }
      });
    });

    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        state.menuItems = state.menuItems.filter(m => m.id !== id);
        DineFlowStore.save(state, {
          action: 'MENU_ITEM_DELETED',
          source: 'staff',
          itemId: id,
          tenantSlug: tenantSlug
        });
        showToast('Dish removed from menu');
        renderMenuManager(container, tenant);
      });
    });

    document.getElementById('btn-add-food-item')?.addEventListener('click', () => {
      openAddFoodModal(tenant, () => renderMenuManager(container, tenant));
    });
  }

  // ADD FOOD ITEM MODAL
  function openAddFoodModal(tenant, onComplete) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active">
        <div class="df-bottom-sheet" style="max-width: 520px; align-self: center; border-radius: 20px;">
          <div class="df-sheet-header">
            <h3 style="font-size: 1.15rem; font-weight: 700;">Add New Food Item</h3>
            <button class="df-sheet-close" id="btn-close-add-food">✕</button>
          </div>
          <div class="df-sheet-body">
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: block;">Dish Title</label>
                <input type="text" id="new-dish-name" placeholder="e.g. Saffron Malai Kofta" style="width: 100%;">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div>
                  <label style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: block;">Price (${tenant.currency})</label>
                  <input type="number" id="new-dish-price" placeholder="349" style="width: 100%;">
                </div>
                <div>
                  <label style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: block;">Category</label>
                  <select id="new-dish-cat" style="width: 100%;">
                    ${(state.categories.filter(c => c.tenantId === tenant.id)).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: block;">Description</label>
                <textarea id="new-dish-desc" rows="2" placeholder="Appetizing ingredients and preparation notes..." style="width: 100%;"></textarea>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; display: block;">High-Res Image URL</label>
                <input type="url" id="new-dish-img" value="images/item-19.jpg" style="width: 100%;">
              </div>
              <div style="display: flex; gap: 1.5rem; align-items: center; padding: 0.5rem 0;">
                <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="new-dish-veg" checked> Vegetarian
                </label>
                <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="new-dish-bestseller"> Mark Bestseller
                </label>
              </div>

              <button class="df-splash-btn" id="btn-save-new-dish" style="margin-top: 0.5rem; text-align: center; padding: 0.85rem;">
                Save to Live Menu 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-add-food')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.getElementById('btn-save-new-dish')?.addEventListener('click', () => {
      const name = document.getElementById('new-dish-name')?.value.trim();
      const price = parseFloat(document.getElementById('new-dish-price')?.value) || 299;
      const cat = document.getElementById('new-dish-cat')?.value;
      const desc = document.getElementById('new-dish-desc')?.value.trim() || 'Signature preparation by our executive chef.';
      const img = document.getElementById('new-dish-img')?.value.trim();
      const isVeg = document.getElementById('new-dish-veg')?.checked;
      const isBestseller = document.getElementById('new-dish-bestseller')?.checked;

      if (!name) {
        showToast('Please provide a dish name', '⚠️');
        return;
      }

      const newItem = {
        id: `item-${Date.now()}`,
        tenantId: tenant.slug || tenant.id,
        categoryId: cat,
        name,
        description: desc,
        price,
        isVeg,
        spiceLevel: 'medium',
        isBestseller,
        isRecommended: true,
        isAvailable: true,
        image: img,
        allergens: ['Dairy'],
        addOns: []
      };

      state.menuItems.unshift(newItem);

      DineFlowStore.save(state, {
        action: 'MENU_ITEM_CREATED',
        source: 'staff',
        item: newItem,
        tenantSlug: tenant.slug || tenant.id
      });
      SoundFX.chime('success');
      modalContainer.innerHTML = '';
      showToast(`Added ${name} to digital menu!`);
      if (onComplete) onComplete();
    });
  }

  // SERVICE REQUESTS FEED
  function renderStaffRequestsFeed(container, tenant) {
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantCalls = state.staffRequests.filter(req => !req.tenantId || req.tenantId === tenantSlug);

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Table Service & Call Staff Notifications (${tenantCalls.length})</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time alerts triggered by diners at ${tenant.name} requesting waiter, water, cutlery, or napkins.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${tenantCalls.length > 0 ? tenantCalls.map(req => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(229,169,60,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                ${req.type === 'WATER' ? '💧' : req.type === 'CUTLERY' ? '🍴' : req.type === 'NAPKINS' ? '🧻' : '🔔'}
              </div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: #fff;">Table ${req.tableId} - ${req.label}</h4>
                <span style="font-size: 0.75rem; color: var(--text-dim);">${req.time} • Alert ID: #${req.id}</span>
              </div>
            </div>

            <div>
              ${req.status === 'PENDING' ? `
                <button class="df-pill-btn primary btn-resolve-call" data-id="${req.id}">
                  Acknowledge & Attend ✓
                </button>
              ` : `
                <span style="font-size: 0.8rem; color: #10B981; font-weight: 700;">Attended ✓</span>
              `}
            </div>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-dim);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔔</div>
            <h4 style="font-size: 1rem; color: #fff; margin-bottom: 0.25rem;">No Pending Service Requests</h4>
            <p style="font-size: 0.78rem;">All customer table calls for ${tenant.name} have been attended to.</p>
          </div>
        `}
      </div>
    `;

    document.querySelectorAll('.btn-resolve-call').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const r = state.staffRequests.find(req => req.id === id);
        if (r) {
          r.status = 'ATTENDED';
          DineFlowStore.save(state, {
            action: 'STAFF_REQUEST_RESOLVED',
            requestId: r.id,
            tableId: r.tableId,
            tenantSlug: tenantSlug
          });
          SoundFX.chime('success');
          showToast(`Staff marked attending Table ${r.tableId}`);
          renderStaffRequestsFeed(container, tenant);
        }
      });
    });
  }

  // BILL REQUESTS FEED
  function renderBillRequestsFeed(container, tenant) {
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantBills = state.billRequests.filter(bill => !bill.tenantId || bill.tenantId === tenantSlug);

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Incoming Bill Requests (${tenantBills.length})</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${tenant.name} dining tables ready for payment and receipt generation.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${tenantBills.length > 0 ? tenantBills.map(bill => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="df-order-card-table" style="font-size: 1.05rem;">Table ${bill.tableId}</span>
                <span style="font-size: 0.72rem; color: var(--text-dim);">#${bill.id}</span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 0.2rem;">
                ${tenant.currency}${bill.amount.toFixed(2)}
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Preferred Mode: <strong>${bill.paymentMethod}</strong> • ${bill.time}</span>
            </div>

            <div>
              ${bill.status === 'PENDING' ? `
                <button class="df-pill-btn btn-print-bill-slip" data-table="${bill.tableId}" data-bill-id="${bill.id}" title="Print 80mm Guest Bill Receipt" style="font-size: 0.72rem; padding: 0.35rem 0.65rem; margin-right: 0.4rem;">&#128424; Print Slip</button><button class="df-pill-btn primary btn-settle-bill" data-id="${bill.id}">
                  Mark Paid & Clear Table
                </button>
              ` : `
                <span style="font-size: 0.8rem; color: #10B981; font-weight: 700;">Paid & Settled ✓</span>
              `}
            </div>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-dim);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💳</div>
            <h4 style="font-size: 1rem; color: #fff; margin-bottom: 0.25rem;">No Pending Bill Requests</h4>
            <p style="font-size: 0.78rem;">All active bills for ${tenant.name} are settled or in progress.</p>
          </div>
        `}
      </div>
    `;

    // Bill Request Receipt Print
    document.querySelectorAll('.btn-print-bill-slip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tableId = btn.getAttribute('data-table');
        if (tableId && window.DineFlowPrinter) {
          const html = window.DineFlowPrinter.generateBillHTML(tableId, tenant, state.orders);
          window.DineFlowPrinter.openPreviewModal(`Guest Bill - Table ${tableId}`, html);
        }
      });
    });

    document.querySelectorAll('.btn-settle-bill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const b = state.billRequests.find(req => req.id === id);
        if (b) {
          b.status = 'PAID';
          const table = state.tables.find(t => t.id === b.tableId && (!t.tenantId || t.tenantId === tenantSlug));
          if (table) {
            table.status = 'available';
            delete table.manuallyOccupied;
          }
          // Mark all orders for this table as PAID and COMPLETED
          state.orders.forEach(o => {
            if (o.tableId === b.tableId && (!o.tenantId || o.tenantId === tenantSlug)) {
              o.paymentStatus = 'PAID';
              o.status = 'COMPLETED';
            }
          });
          state.staffRequests.forEach(s => {
            if (s.tableId === b.tableId && (!s.tenantId || s.tenantId === tenantSlug)) {
              s.status = 'RESOLVED';
            }
          });
          DineFlowStore.save(state, {
            action: 'BILL_SETTLED',
            source: 'staff',
            tableId: b.tableId,
            tenantSlug: tenantSlug
          });
          SoundFX.chime('success');
          showToast(`Table ${b.tableId} bill settled and table cleared!`);
          renderAdminView(document.getElementById('app'), tenant);
        }
      });
    });
  }

  // OFFERS & COUPONS MANAGER
  function renderOffersManager(container, tenant) {
    const tenantSlug = tenant.slug || tenant.id || 'the-urban-plate';
    const tenantOffers = state.offers.filter(off => !off.tenantId || off.tenantId === tenantSlug);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Promotional Offers & Digital Coupons (${tenantOffers.length} Active)</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Configure discount rules, flat discounts, and category coupons for ${tenant.name}.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        ${tenantOffers.map(off => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="df-coupon-code" style="font-size: 0.85rem; padding: 0.25rem 0.65rem;">${off.code}</span>
              <span style="font-size: 0.75rem; color: ${off.isActive ? '#10B981' : '#EF4444'}; font-weight: 700;">
                ${off.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">${off.title}</h4>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.85rem;">${off.description}</p>
            <div style="font-size: 0.75rem; color: var(--text-dim); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
              Min Order: ${tenant.currency}${off.minOrder} • Max Discount: ${tenant.currency}${off.maxDiscount}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // CUSTOMER CRM
  function renderCustomerCRM(container, tenant) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Customer Profiles & Dine-In CRM (${state.customers.length} Guests)</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Track customer visit frequency, average spend, and favorite menu items.</p>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-subtle); background: rgba(255,255,255,0.02); color: var(--text-muted);">
              <th style="padding: 1rem;">Customer Name</th>
              <th style="padding: 1rem;">Phone / Email</th>
              <th style="padding: 1rem;">Visits</th>
              <th style="padding: 1rem;">Total Spend</th>
              <th style="padding: 1rem;">Favorite Dish</th>
            </tr>
          </thead>
          <tbody>
            ${state.customers.map(c => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 0.85rem 1rem; font-weight: 700; color: #fff;">${c.name}</td>
                <td style="padding: 0.85rem 1rem; color: var(--text-muted);">${c.phone || c.email}</td>
                <td style="padding: 0.85rem 1rem; font-weight: 800; color: var(--status-gold);">${c.ordersCount}</td>
                <td style="padding: 0.85rem 1rem; font-weight: 800; color: var(--brand-primary);">${tenant.currency}${c.totalSpend.toLocaleString('en-IN')}</td>
                <td style="padding: 0.85rem 1rem; color: var(--text-muted);">${c.favDish}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ANALYTICS & INSIGHTS
  function renderAnalyticsDashboard(container, tenant) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Analytics, Peak Hours & Item Performance</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Turn table turnover data and item velocity into higher revenue.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: #fff;">Hourly Order Distribution</h4>
          <div style="display: flex; align-items: flex-end; gap: 0.65rem; height: 160px; padding-top: 1.5rem;">
            ${[
        { hour: '12 PM', val: 65 },
        { hour: '1 PM', val: 95 },
        { hour: '2 PM', val: 80 },
        { hour: '3 PM', val: 35 },
        { hour: '7 PM', val: 70 },
        { hour: '8 PM', val: 100 },
        { hour: '9 PM', val: 90 },
        { hour: '10 PM', val: 50 }
      ].map(b => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; height: 100%; justify-content: flex-end;">
                <div style="width: 100%; height: ${b.val}%; background: linear-gradient(to top, var(--brand-primary), #F59E0B); border-radius: 4px;"></div>
                <span style="font-size: 0.65rem; color: var(--text-dim);">${b.hour}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: #fff;">Top Selling Items by Volume</h4>
          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${[
        { name: 'Royal Dum Handi Chicken Biryani', orders: 142, pct: 90 },
        { name: 'Awadhi Mutton Dum Biryani', orders: 110, pct: 75 },
        { name: 'The Big Boss Truffle Smash Burger', orders: 88, pct: 60 },
        { name: 'Burrata Margherita Pizza', orders: 79, pct: 54 },
        { name: 'Belgian Molten Lava Cake', orders: 65, pct: 45 }
      ].map(item => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                  <span style="font-weight: 600; color: #fff;">${item.name}</span>
                  <span style="color: var(--brand-primary); font-weight: 800;">${item.orders} orders</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${item.pct}%; height: 100%; background: var(--brand-primary);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // REVIEWS FEED
  function renderReviewsFeed(container, tenant) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Customer Reviews & Ratings (${state.reviews.length} Verified)</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time feedback submitted directly by table guests after dining.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
        ${state.reviews.map(rev => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff;">${rev.customerName}</h4>
                <span style="font-size: 0.72rem; color: var(--brand-primary); font-weight: 700;">Table ${rev.tableId} • ${rev.date}</span>
              </div>
              <div style="font-size: 1.1rem; color: var(--status-gold);">
                ${'★'.repeat(rev.ratingOverall)}${'☆'.repeat(5 - rev.ratingOverall)}
              </div>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
              "${rev.comment}"
            </p>
            <div style="display: flex; gap: 0.75rem; font-size: 0.72rem; color: var(--text-dim); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
              <span>Food: ${rev.ratingFood}/5</span>
              <span>•</span>
              <span>Service: ${rev.ratingService}/5</span>
              <span>•</span>
              <span>Ambience: ${rev.ratingAmbience}/5</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // BRANDING SETTINGS
  function renderBrandingSettings(container, tenant) {
    const currentTone = (state.settings && state.settings.toneProfile) || 'executive';

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Restaurant Configuration & Dynamic Branding</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Changes instantly update the customer interface colors, typography, currency, and tax rates.</p>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; max-width: 650px;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Restaurant Trade Name</label>
            <input type="text" id="cfg-name" value="${tenant.name}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Tagline / Motto</label>
            <input type="text" id="cfg-tagline" value="${tenant.tagline}" style="width: 100%;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Primary Brand Color</label>
              <input type="color" id="cfg-primary-color" value="${tenant.primaryColor}" style="width: 100%; height: 44px; padding: 2px; cursor: pointer;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Currency Symbol</label>
              <input type="text" id="cfg-currency" value="${tenant.currency}" style="width: 100%;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">GST / Tax Rate (%)</label>
              <input type="number" id="cfg-tax" value="${tenant.taxRate}" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Service Charge (%)</label>
              <input type="number" id="cfg-service" value="${tenant.serviceChargeRate}" style="width: 100%;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Guest Wi-Fi SSID</label>
              <input type="text" id="cfg-wifi-name" value="${tenant.wifiName}" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Guest Wi-Fi Password</label>
              <input type="text" id="cfg-wifi-pass" value="${tenant.wifiPass}" style="width: 100%;">
            </div>
          </div>

          <button class="df-splash-btn" id="btn-save-branding" style="margin-top: 1rem; text-align: center; padding: 0.95rem;">
            Save & Publish Branding 🎨
          </button>
        </div>
      </div>

      <!-- Audio Notification Tone & Alert Profile -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; max-width: 650px; margin-top: 1.5rem;">
        <div style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 0.35rem;">Staff OS Audio Alert Tone &amp; Profile</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Choose the synthesized acoustic tone played when new orders arrive, tables call, or actions complete.</p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <select id="cfg-tone-profile" style="flex: 1; min-width: 240px; padding: 0.75rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: #fff; font-weight: 600; font-size: 0.85rem;">
            <option value="executive" ${currentTone === 'executive' ? 'selected' : ''}>✨ Executive Chime (Apple Pay / Square POS)</option>
            <option value="concierge" ${currentTone === 'concierge' ? 'selected' : ''}>🛎️ 5-Star Concierge (Hospitality Brass Bell)</option>
            <option value="marimba" ${currentTone === 'marimba' ? 'selected' : ''}>🪵 Warm Marimba (Organic Acoustic Mallet)</option>
            <option value="minimal" ${currentTone === 'minimal' ? 'selected' : ''}>💎 Discrete Minimalist (Subtle Glass Haptic)</option>
            <option value="mute" ${currentTone === 'mute' ? 'selected' : ''}>🔇 Silent (Audio Muted)</option>
          </select>
          <button type="button" id="btn-preview-tone" class="df-pill-btn" style="padding: 0.75rem 1.2rem; border-color: var(--brand-primary); color: #fff;">
            <span>Test Tone 🔊</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-preview-tone')?.addEventListener('click', () => {
      const selected = document.getElementById('cfg-tone-profile')?.value || 'executive';
      if (selected === 'mute') {
        showToast('Audio tone is currently set to Silent', '🔇');
      } else {
        SoundFX.chime('order', selected);
        showToast('Playing tone preview...', '🔊');
      }
    });

    document.getElementById('cfg-tone-profile')?.addEventListener('change', (e) => {
      state.settings = state.settings || {};
      state.settings.toneProfile = e.target.value;
      DineFlowStore.save(state);
      if (e.target.value !== 'mute') {
        SoundFX.chime('order', e.target.value);
      }
      showToast(`Saved default tone: ${e.target.options[e.target.selectedIndex].text}`, '🔊');
      const topbarBtn = document.getElementById('btn-admin-tone-cycle');
      if (topbarBtn) {
        function getLabel(profile) {
          switch (profile) {
            case 'concierge': return '🛎️ Concierge Bell';
            case 'marimba': return '🪵 Warm Marimba';
            case 'minimal': return '💎 Discrete Glass';
            case 'mute': return '🔇 Muted';
            default: return '✨ Executive Chime';
          }
        }
        topbarBtn.innerHTML = `<span>${getLabel(e.target.value)}</span>`;
      }
    });

    document.getElementById('btn-save-branding')?.addEventListener('click', () => {
      tenant.name = document.getElementById('cfg-name')?.value.trim() || tenant.name;
      tenant.tagline = document.getElementById('cfg-tagline')?.value.trim() || tenant.tagline;
      tenant.primaryColor = document.getElementById('cfg-primary-color')?.value || tenant.primaryColor;
      tenant.currency = document.getElementById('cfg-currency')?.value.trim() || tenant.currency;
      tenant.taxRate = parseFloat(document.getElementById('cfg-tax')?.value) || 5;
      tenant.serviceChargeRate = parseFloat(document.getElementById('cfg-service')?.value) || 5;
      tenant.wifiName = document.getElementById('cfg-wifi-name')?.value.trim() || tenant.wifiName;
      tenant.wifiPass = document.getElementById('cfg-wifi-pass')?.value.trim() || tenant.wifiPass;

      state.settings = state.settings || {};
      state.settings.toneProfile = document.getElementById('cfg-tone-profile')?.value || state.settings.toneProfile || 'executive';

      DineFlowStore.save(state);
      applyTenantBranding(tenant);
      SoundFX.chime('success');
      showToast('Branding updated and published live!');
    });
  }

  // ------------------------------------------------------------------------------
  // RESTAURANT STAFF & TEAM OPERATIONS CONSOLE (Staff OS Tab)
  // Allows restaurant owners and general managers to view, edit, provision,
  // and modify staff credentials, 4-digit PIN codes, roles, and shift statuses.
  // ------------------------------------------------------------------------------
  function renderStaffManagementTab(container, tenant) {
    let showAllOutlets = false;

    function renderContent() {
      state = DineFlowStore.get();
      const isSessionSuperAdmin = state.session && state.session.role === 'SUPER_ADMIN';
      const sessionTenantId = state.session?.tenantId || tenant.slug;
      const currentAccounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

      // RBAC: Managers can ONLY view/manage staff belonging to their same restaurant.
      // Owners (SUPER_ADMIN) can toggle between this outlet and All Outlets.
      const filteredStaff = isSessionSuperAdmin
        ? (showAllOutlets ? currentAccounts : currentAccounts.filter(s => s.tenantId === tenant.slug || s.role === 'SUPER_ADMIN'))
        : currentAccounts.filter(s => s.tenantId === tenant.slug || s.role === 'SUPER_ADMIN');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>👥</span> Staff &amp; Team Management
            </h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 3px 0 0 0;">
              Manage team profiles, roles, 4-digit PIN credentials, and floor assignments for <strong>${tenant.name}</strong>.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${isSessionSuperAdmin ? `
              <div class="df-audience-toggle-group" style="padding: 2px;">
                <button type="button" class="df-audience-toggle-btn ${!showAllOutlets ? 'active' : ''}" id="btn-team-filter-this" style="padding: 0.35rem 0.65rem; font-size: 0.72rem;">
                  <span>${tenant.name} (${currentAccounts.filter(s => s.tenantId === tenant.slug).length})</span>
                </button>
                <button type="button" class="df-audience-toggle-btn ${showAllOutlets ? 'active' : ''}" id="btn-team-filter-all" style="padding: 0.35rem 0.65rem; font-size: 0.72rem;">
                  <span>All Outlets (${currentAccounts.length})</span>
                </button>
              </div>
            ` : `
              <div class="df-manager-venue-tag" style="background: rgba(229,169,60,0.12); color: var(--brand-primary); padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; border: 1px solid rgba(229,169,60,0.25); font-size: 0.74rem;">
                🏢 ${tenant.name} Floor Staff
              </div>
            `}
            <button id="btn-add-team-member" class="df-pill-btn primary" style="font-size: 0.75rem; padding: 0.45rem 0.85rem; font-weight: 700; background: linear-gradient(135deg, #10B981, #059669); border: none;">
              <span>+ Add Team Member</span>
            </button>
          </div>
        </div>

        <!-- Security Quick Callout with RBAC Status -->
        <div style="background: ${isSessionSuperAdmin ? 'rgba(99, 102, 241, 0.08)' : 'rgba(16, 185, 129, 0.08)'}; border: 1px solid ${isSessionSuperAdmin ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)'}; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.76rem; color: #E2E8F0;">
            <span style="font-size: 1.1rem;">${isSessionSuperAdmin ? '⚡' : '🛡️'}</span>
            <span>
              ${isSessionSuperAdmin
          ? '<strong>Owner HQ Authority:</strong> You have full rights to modify staff profiles, reset PIN credentials, and reassign team members across all outlets.'
          : `<strong>Manager RBAC Active:</strong> You can edit and modify credentials for staff at <strong>${tenant.name}</strong>. Owner HQ profiles are strictly protected and cannot be modified.`}
            </span>
          </div>
          <span class="df-micro-badge status-available">${filteredStaff.length} PROFILES LOADED</span>
        </div>

        <!-- Staff Cards Grid -->
        <div class="df-staff-team-grid">
          ${filteredStaff.map((m) => {
            const venueName = m.tenantId && state.tenants[m.tenantId] ? state.tenants[m.tenantId].name : 'Platform HQ';
            const isSuper = m.role === 'SUPER_ADMIN';
            const isSameRestaurant = m.tenantId === tenant.slug;
            // RBAC: Managers cannot edit/revoke Owner; Managers can only edit their own restaurant's staff
            const canEdit = isSessionSuperAdmin || (!isSuper && isSameRestaurant);
            const canRevoke = !isSuper && (isSessionSuperAdmin || isSameRestaurant);

            const statusLabel = m.status === 'break' ? '☕ On Break' : m.status === 'leave' ? '🌴 On Leave' : '● On Shift';
            const statusColor = m.status === 'break' ? '#F59E0B' : m.status === 'leave' ? '#94A3B8' : '#10B981';

            return `
              <div class="df-team-card">
                <div class="df-team-card-head">
                  <div class="df-team-avatar">
                    ${m.avatarEmoji || '👨‍🍳'}
                  </div>
                  <div class="df-team-info">
                    <div class="df-team-name-row">
                      <span class="df-team-name">${m.name}</span>
                      ${isSuper
                ? '<span class="df-staff-scope-pill owner-hq" style="font-size: 0.62rem; padding: 0.1rem 0.35rem;">Owner HQ ⚡</span>'
                : '<span class="df-staff-scope-pill staff-only" style="font-size: 0.62rem; padding: 0.1rem 0.35rem;">Staff OS 🔒</span>'}
                    </div>
                    <div class="df-team-role">${m.roleTitle} &bull; ${m.department || 'Floor'}</div>
                  </div>
                </div>

                <div class="df-team-details-table">
                  <div class="df-team-detail-row">
                    <span style="color: var(--text-dim);">Assigned Outlet:</span>
                    <strong style="color: #fff;">🏢 ${venueName}</strong>
                  </div>
                  <div class="df-team-detail-row">
                    <span style="color: var(--text-dim);">4-Digit PIN:</span>
                    <span style="display: flex; align-items: center; gap: 0.35rem;">
                      <code style="font-family: 'JetBrains Mono', monospace; color: var(--brand-primary); font-weight: 800; font-size: 0.85rem; background: rgba(229,169,60,0.15); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid rgba(229,169,60,0.3);">${m.pin}</code>
                      <button class="btn-copy-pin" data-pin="${m.pin}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.72rem;" title="Copy PIN">📋</button>
                    </span>
                  </div>
                  <div class="df-team-detail-row">
                    <span style="color: var(--text-dim);">Login Email:</span>
                    <span style="color: #CBD5E1; font-family: monospace; font-size: 0.72rem;">${m.email || 'None'}</span>
                  </div>
                  <div class="df-team-detail-row">
                    <span style="color: var(--text-dim);">Shift Status:</span>
                    <span style="color: ${statusColor}; font-weight: 700; font-size: 0.72rem;">${statusLabel}</span>
                  </div>
                </div>

                <div class="df-team-actions-row">
                  ${canEdit ? `
                    <button class="btn-edit-staff df-pill-btn" data-id="${m.id}" data-name="${m.name}" style="flex: 1; justify-content: center; font-size: 0.76rem; padding: 0.45rem;">
                      ✏️ Edit Profile
                    </button>
                  ` : `
                    <div style="flex: 1; text-align: center; font-size: 0.72rem; padding: 0.45rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25); color: #818CF8; border-radius: 6px; font-weight: 600;">
                      🔒 Owner Profile (Protected)
                    </div>
                  `}
                  ${canRevoke ? `
                    <button class="btn-revoke-staff" data-id="${m.id}" data-name="${m.name}" style="padding: 0.45rem 0.75rem; font-size: 0.76rem;" title="Revoke staff account">
                      🗑️ Revoke
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Event Listeners inside Tab
      container.querySelector('#btn-team-filter-this')?.addEventListener('click', () => {
        showAllOutlets = false;
        renderContent();
      });

      container.querySelector('#btn-team-filter-all')?.addEventListener('click', () => {
        showAllOutlets = true;
        renderContent();
      });

      container.querySelector('#btn-add-team-member')?.addEventListener('click', () => {
        openCreateStaffModal(() => renderContent(), tenant.slug);
      });

      // Bind Edit Staff buttons
      container.querySelectorAll('.btn-edit-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const staffId = btn.getAttribute('data-id');
          openEditStaffModal(staffId, () => renderContent());
        });
      });

      // Bind Copy PIN buttons
      container.querySelectorAll('.btn-copy-pin').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pin = btn.getAttribute('data-pin');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(pin).then(() => {
              showToast(`PIN ${pin} copied to clipboard!`, '📋');
            });
          } else {
            showToast(`PIN: ${pin}`, '🔑');
          }
        });
      });

      // Bind Revoke Staff buttons
      container.querySelectorAll('.btn-revoke-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const staffId = btn.getAttribute('data-id');
          const staffName = btn.getAttribute('data-name');
          const targetAccount = (state.staffAccounts || []).find(a => a.id === staffId);

          // RBAC: Manager cannot revoke Owner
          if (!isSessionSuperAdmin && targetAccount?.role === 'SUPER_ADMIN') {
            SoundFX.chime('alert');
            showToast('Permission Denied: Managers cannot revoke Owner accounts.', '🚫');
            return;
          }

          // RBAC: Manager can only revoke staff from their own restaurant
          if (!isSessionSuperAdmin && targetAccount?.tenantId !== tenant.slug) {
            SoundFX.chime('alert');
            showToast('Permission Denied: Managers can only revoke staff from their own restaurant.', '🚫');
            return;
          }

          if (confirm(`Are you sure you want to revoke access for "${staffName}"? This will immediately disable their login and PIN access.`)) {
            state = DineFlowStore.get();
            state.staffAccounts = (state.staffAccounts || []).filter(a => a.id !== staffId);

            DineFlowStore.recordLog({
              tenantId: targetAccount?.tenantId || tenant.slug,
              tenantName: (targetAccount?.tenantId && state.tenants[targetAccount.tenantId]?.name) || tenant.name,
              managerId: state.session?.user?.id || 'staff-02',
              managerName: state.session?.user?.name || 'Floor Manager',
              category: 'SECURITY',
              action: 'Staff Profile Revoked',
              details: `Revoked operational access for "${staffName}" (${targetAccount?.roleTitle || 'Staff'}).`,
              amount: 0,
              paymentMethod: null,
              securityFlag: '⚠️ Profile Revoked',
              severity: 'warning'
            });

            DineFlowStore.save(state, {
              action: 'STAFF_ACCOUNT_REVOKED',
              source: 'staff',
              staffId: staffId,
              tenantSlug: tenantSlug
            });
            SoundFX.chime('notice');
            showToast(`Staff profile for "${staffName}" revoked.`, '🗑️');
            renderContent();
          }
        });
      });
    }

    renderContent();
  }

  // ------------------------------------------------------------------------------
  // MODAL: CREATE RESTAURANT STAFF / MANAGER PROFILE (OWNER DASHBOARD)
  // Strictly restricted to Restaurant Staff OS (RESTAURANT_ADMIN).
  // ------------------------------------------------------------------------------
  function openCreateStaffModal(onCreatedCallback, preselectedTenant = null) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    state = DineFlowStore.get();
    const isSessionSuperAdmin = state.session && state.session.role === 'SUPER_ADMIN';
    const sessionTenantId = state.session?.tenantId || state.currentTenantId;
    const tenantsList = state.tenants ? Object.values(state.tenants) : [];
    const defaultTenantSlug = isSessionSuperAdmin
      ? (preselectedTenant || state.currentTenantId || tenantsList[0]?.slug || 'the-urban-plate')
      : sessionTenantId;

    // Generates a random 4-digit PIN that is not already in use
    function generateUniquePin() {
      const existingPins = new Set(((state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts).map(a => a.pin));
      let pin = '';
      for (let attempts = 0; attempts < 1000; attempts++) {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        if (!existingPins.has(pin)) break;
      }
      return pin || '2468';
    }

    const defaultPin = generateUniquePin();

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active">
        <div class="df-bottom-sheet" style="max-width: 560px; align-self: center; border-radius: 20px; background: #0E131F; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 24px 60px rgba(0,0,0,0.85); overflow: hidden;">
          <div class="df-sheet-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                👤
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0;">Create Staff Profile</h3>
                <span style="font-size: 0.72rem; color: var(--text-dim);">Role-Based Access Control • Operations Provisioning</span>
              </div>
            </div>
            <button class="df-sheet-close" id="btn-close-create-staff" style="background: none; border: none; font-size: 1.25rem; color: var(--text-dim); cursor: pointer;">✕</button>
          </div>

          <div class="df-sheet-body" style="padding: 1.25rem 1.5rem; max-height: 80vh; overflow-y: auto;">
            <!-- Strict RBAC Security Callout -->
            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🔒</span>
              <div style="font-size: 0.74rem; color: #CBD5E1; line-height: 1.45;">
                <strong style="color: #fff; display: block; margin-bottom: 0.2rem;">Strict Restaurant Staff Role Provisioned</strong>
                This user will be provisioned with operational permissions (<span style="color: #818CF8; font-weight: 700;">RESTAURANT_ADMIN</span>) and can <strong>only</strong> log into <strong>Restaurant Staff OS</strong> (?view=admin). Managers cannot create Owner HQ accounts.
              </div>
            </div>

            <form id="df-create-staff-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1rem;">
              <!-- Target Outlet -->
              <div>
                <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Assigned Restaurant Outlet *</label>
                ${!isSessionSuperAdmin ? `
                  <input type="text" value="🏢 ${state.tenants?.[sessionTenantId]?.name || sessionTenantId} (Your Restaurant)" disabled style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem; font-weight: 600;">
                  <input type="hidden" id="staff-outlet-select" value="${sessionTenantId}">
                  <span style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; display: block;">
                    🔒 Managers can only provision staff for their own assigned restaurant.
                  </span>
                ` : `
                  <select id="staff-outlet-select" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    ${tenantsList.map(t => `<option value="${t.slug}" ${t.slug === defaultTenantSlug ? 'selected' : ''}>🏢 ${t.name} (${t.branch || 'Main'})</option>`).join('')}
                  </select>
                `}
              </div>

              <!-- Name & Role Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Full Name *</label>
                  <input type="text" id="staff-full-name" placeholder="e.g. Priya Sharma" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Role Title *</label>
                  <input type="text" id="staff-role-title" placeholder="e.g. Floor Supervisor" value="Floor Supervisor" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
              </div>

              <!-- Department & Avatar Emoji Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Department</label>
                  <select id="staff-dept-select" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    <option value="Floor &amp; Guest Dining">Floor &amp; Guest Dining</option>
                    <option value="Kitchen &amp; KDS Kanban">Kitchen &amp; KDS Kanban</option>
                    <option value="Cash &amp; POS Billing">Cash &amp; POS Billing</option>
                    <option value="Bar &amp; Craft Beverage">Bar &amp; Craft Beverage</option>
                    <option value="General Store Operations">General Store Operations</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Avatar Emoji</label>
                  <select id="staff-emoji-select" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    <option value="👨‍🍳">👨‍🍳 Head Chef</option>
                    <option value="👩‍🍳">👩‍🍳 Sous Chef</option>
                    <option value="🤵">🤵 Floor Lead / Host</option>
                    <option value="🍕">🍕 Kitchen Specialist</option>
                    <option value="🍹">🍹 Mixologist / Bar</option>
                    <option value="🧑‍💼">🧑‍💼 Operations Lead</option>
                    <option value="💼">💼 Store Manager</option>
                    <option value="⚡">⚡ Shift Cashier</option>
                  </select>
                </div>
              </div>

              <!-- Fast 4-Digit PIN with Auto-Generate -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0;">4-Digit Fast Access PIN *</label>
                  <button type="button" id="btn-generate-pin" style="background: none; border: none; color: var(--brand-primary); font-size: 0.72rem; cursor: pointer; text-decoration: underline;">
                    🎲 Generate New PIN
                  </button>
                </div>
                <div style="position: relative;">
                  <input type="text" id="staff-pin-input" maxlength="4" placeholder="4 Digits (e.g. 2468)" value="${defaultPin}" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 1rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 2px;" required>
                </div>
                <span style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; display: block;">
                  Staff can authenticate on the keypad in 1 second using this PIN.
                </span>
              </div>

              <!-- Email & Password Credentials -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Staff Email *</label>
                  <input type="email" id="staff-email-input" placeholder="e.g. priya@theurbanplate.in" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Default Password *</label>
                  <input type="text" id="staff-pass-input" value="staff123" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <button type="button" id="btn-cancel-create-staff" class="df-pill-btn" style="padding: 0.65rem 1.15rem;">
                  Cancel
                </button>
                <button type="submit" id="btn-submit-create-staff" class="df-pill-btn primary" style="padding: 0.65rem 1.4rem; font-weight: 700; background: linear-gradient(135deg, #10B981, #059669); border: none;">
                  Create Staff Profile ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event Listeners
    const closeModal = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-create-staff')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-create-staff')?.addEventListener('click', closeModal);

    document.getElementById('btn-generate-pin')?.addEventListener('click', () => {
      const pinInput = document.getElementById('staff-pin-input');
      if (pinInput) pinInput.value = generateUniquePin();
    });

    // Auto-fill suggested email based on name
    document.getElementById('staff-full-name')?.addEventListener('input', (e) => {
      const emailInput = document.getElementById('staff-email-input');
      const outletSlug = document.getElementById('staff-outlet-select')?.value || 'the-urban-plate';
      if (emailInput && (!emailInput.dataset.dirty || emailInput.value === '')) {
        const cleanName = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanName) {
          const domain = outletSlug.replace(/[^a-z0-9]/g, '');
          emailInput.value = `${cleanName}@${domain}.in`;
        }
      }
    });

    document.getElementById('staff-email-input')?.addEventListener('focus', function () {
      this.dataset.dirty = 'true';
    });

    document.getElementById('df-create-staff-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const outletSlug = document.getElementById('staff-outlet-select')?.value;
      const fullName = document.getElementById('staff-full-name')?.value.trim();
      const roleTitle = document.getElementById('staff-role-title')?.value.trim();
      const dept = document.getElementById('staff-dept-select')?.value;
      const emoji = document.getElementById('staff-emoji-select')?.value;
      const pin = document.getElementById('staff-pin-input')?.value.trim();
      const email = document.getElementById('staff-email-input')?.value.trim().toLowerCase();
      const pass = document.getElementById('staff-pass-input')?.value.trim();

      if (!fullName) {
        showToast('Please enter staff full name.', '⚠️');
        return;
      }
      if (!pin || !/^\d{4}$/.test(pin)) {
        showToast('PIN must be exactly 4 numeric digits.', '⚠️');
        return;
      }
      if (!email || !email.includes('@')) {
        showToast('Please provide a valid staff email address.', '⚠️');
        return;
      }

      state = DineFlowStore.get();
      const isSuper = state.session && state.session.role === 'SUPER_ADMIN';
      const userTenantId = state.session?.tenantId || state.currentTenantId;

      // RBAC: Manager cannot provision staff for other restaurants
      if (!isSuper && outletSlug !== userTenantId) {
        SoundFX.chime('alert');
        showToast('Permission Denied: Managers can only provision staff for their own restaurant.', '🚫');
        return;
      }

      const existingAccounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

      // Check PIN uniqueness
      if (existingAccounts.some(a => a.pin === pin)) {
        showToast(`PIN "${pin}" is already allocated to another staff member. Please pick another.`, '❌');
        return;
      }

      // Check Email uniqueness
      if (existingAccounts.some(a => a.email && a.email.toLowerCase() === email)) {
        showToast(`Email "${email}" is already registered.`, '❌');
        return;
      }

      const tenantObj = state.tenants ? state.tenants[outletSlug] : null;
      const tenantName = tenantObj ? tenantObj.name : 'Restaurant Outlet';

      const newAccount = {
        id: 'staff-' + Date.now().toString(36),
        name: fullName,
        roleTitle: roleTitle || 'Floor Operations Lead',
        role: 'RESTAURANT_ADMIN', // Strictly restricted to Staff OS!
        tenantId: outletSlug,
        pin: pin,
        email: email,
        password: pass || 'staff123',
        avatarEmoji: emoji || '👨‍🍳',
        department: dept || 'Floor & Guest Dining',
        createdAt: new Date().toISOString()
      };

      if (!state.staffAccounts || !Array.isArray(state.staffAccounts)) {
        state.staffAccounts = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.staffAccounts));
      }
      state.staffAccounts.push(newAccount);

      // Record immutable security audit log
      DineFlowStore.recordLog({
        tenantId: outletSlug,
        tenantName: tenantName,
        managerId: state.session?.user?.id || 'staff-02',
        managerName: state.session?.user?.name || 'Debashish Paul (Super Admin)',
        category: 'SECURITY',
        action: 'Staff Profile Provisioned',
        details: `Provisioned new operational profile for "${newAccount.name}" (${newAccount.roleTitle}, PIN: ${newAccount.pin}) assigned to ${tenantName}. Access policy: Restaurant Staff OS only.`,
        amount: 0,
        paymentMethod: null,
        securityFlag: '✓ Staff OS Only',
        severity: 'info'
      });

      DineFlowStore.save(state, {
        action: 'STAFF_ACCOUNT_CREATED',
        source: 'staff',
        account: newAccount,
        tenantSlug: outletSlug
      });
      SoundFX.chime('success');
      showToast(`Staff profile created for ${newAccount.name}! Restricted to Staff OS.`, newAccount.avatarEmoji);
      closeModal();

      if (typeof onCreatedCallback === 'function') {
        onCreatedCallback(newAccount);
      }
    });
  }

  // ------------------------------------------------------------------------------
  // MODAL: EDIT / MODIFY RESTAURANT STAFF PROFILE (OWNER DASHBOARD)
  // Allows restaurant owner to modify name, role title, department, outlet,
  // 4-digit PIN, credentials, avatar emoji, and operational status at any time.
  // ------------------------------------------------------------------------------
  function openEditStaffModal(staffId, onSavedCallback) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    state = DineFlowStore.get();
    const existingAccounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;
    const staff = existingAccounts.find(a => a.id === staffId);
    if (!staff) {
      showToast('Staff profile not found.', '❌');
      return;
    }

    const isSessionSuperAdmin = state.session && state.session.role === 'SUPER_ADMIN';
    const sessionTenantId = state.session?.tenantId || state.currentTenantId;
    const isTargetSuper = staff.role === 'SUPER_ADMIN';

    // RBAC GUARD 1: Manager cannot edit or modify Owner details
    if (isTargetSuper && !isSessionSuperAdmin) {
      SoundFX.chime('alert');
      showToast('Permission Denied: Restaurant Managers do not have rights to edit Owner details.', '🚫');
      return;
    }

    // RBAC GUARD 2: Manager can only edit staff from their own restaurant
    if (!isSessionSuperAdmin && staff.tenantId !== sessionTenantId) {
      SoundFX.chime('alert');
      const staffVenue = state.tenants?.[staff.tenantId]?.name || staff.tenantId;
      showToast(`Permission Denied: You cannot modify staff from ${staffVenue}. Managers can only edit staff from their own restaurant.`, '🚫');
      return;
    }

    const tenantsList = state.tenants ? Object.values(state.tenants) : [];

    // Generates a random 4-digit PIN that is not allocated to any OTHER staff account
    function generateUniquePin() {
      const otherPins = new Set(existingAccounts.filter(a => a.id !== staffId).map(a => a.pin));
      let pin = '';
      for (let attempts = 0; attempts < 1000; attempts++) {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        if (!otherPins.has(pin)) break;
      }
      return pin || '2468';
    }

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active">
        <div class="df-bottom-sheet" style="max-width: 580px; align-self: center; border-radius: 20px; background: #0E131F; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 24px 60px rgba(0,0,0,0.85); overflow: hidden;">
          <div class="df-sheet-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                ${staff.avatarEmoji || '✏️'}
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0;">Edit Staff Profile</h3>
                <span style="font-size: 0.72rem; color: var(--text-dim);">Modify operational credentials &amp; permissions for ${staff.name}</span>
              </div>
            </div>
            <button class="df-sheet-close" id="btn-close-edit-staff" style="background: none; border: none; font-size: 1.25rem; color: var(--text-dim); cursor: pointer;">✕</button>
          </div>

          <div class="df-sheet-body" style="padding: 1.25rem 1.5rem; max-height: 80vh; overflow-y: auto;">
            <!-- Callout -->
            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">⚡</span>
              <div style="font-size: 0.74rem; color: #CBD5E1; line-height: 1.45;">
                <strong style="color: #fff; display: block; margin-bottom: 0.2rem;">Live Staff Directory Synchronization</strong>
                Modifying this profile updates terminal keypad PIN authentication, active kitchen shift metrics, and outlet access privileges immediately.
              </div>
            </div>

            <form id="df-edit-staff-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1rem;">
              <!-- Target Outlet -->
              <div>
                <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Assigned Restaurant Outlet *</label>
                ${isTargetSuper ? `
                  <input type="text" value="🏢 Platform HQ (All Outlets &amp; Super Admin)" disabled style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; color: #818CF8; font-size: 0.85rem; font-weight: 600;">
                  <input type="hidden" id="edit-staff-outlet" value="">
                ` : (!isSessionSuperAdmin ? `
                  <input type="text" value="🏢 ${state.tenants?.[staff.tenantId]?.name || staff.tenantId} (Assigned Restaurant)" disabled style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem; font-weight: 600;">
                  <input type="hidden" id="edit-staff-outlet" value="${staff.tenantId}">
                  <span style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; display: block;">
                    🔒 Managers can only manage staff for their assigned outlet. Reassignment across restaurants requires Owner authorization.
                  </span>
                ` : `
                  <select id="edit-staff-outlet" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    ${tenantsList.map(t => `<option value="${t.slug}" ${t.slug === staff.tenantId ? 'selected' : ''}>🏢 ${t.name} (${t.branch || 'Main'})</option>`).join('')}
                  </select>
                `)}
              </div>

              <!-- Name & Role Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Full Name *</label>
                  <input type="text" id="edit-staff-name" value="${staff.name || ''}" placeholder="e.g. Chef Vikram Rao" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Role Title *</label>
                  <input type="text" id="edit-staff-role-title" value="${staff.roleTitle || 'Floor Supervisor'}" placeholder="e.g. Floor Supervisor" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
              </div>

              <!-- Department & Avatar Emoji Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Department</label>
                  <select id="edit-staff-dept" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    <option value="Floor &amp; Guest Dining" ${staff.department === 'Floor & Guest Dining' ? 'selected' : ''}>Floor &amp; Guest Dining</option>
                    <option value="Kitchen &amp; KDS Kanban" ${staff.department === 'Kitchen & KDS Kanban' ? 'selected' : ''}>Kitchen &amp; KDS Kanban</option>
                    <option value="Cash &amp; POS Billing" ${staff.department === 'Cash & POS Billing' ? 'selected' : ''}>Cash &amp; POS Billing</option>
                    <option value="Bar &amp; Craft Beverage" ${staff.department === 'Bar & Craft Beverage' ? 'selected' : ''}>Bar &amp; Craft Beverage</option>
                    <option value="Italian Cuisine Operations" ${staff.department === 'Italian Cuisine Operations' ? 'selected' : ''}>Italian Cuisine Operations</option>
                    <option value="Asian Cuisine Operations" ${staff.department === 'Asian Cuisine Operations' ? 'selected' : ''}>Asian Cuisine Operations</option>
                    <option value="Platform Operations &amp; HQ" ${staff.department === 'Platform Operations & HQ' ? 'selected' : ''}>Platform Operations &amp; HQ</option>
                    <option value="General Store Operations" ${staff.department === 'General Store Operations' ? 'selected' : ''}>General Store Operations</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Avatar Emoji</label>
                  <select id="edit-staff-emoji" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                    <option value="👨‍🍳" ${staff.avatarEmoji === '👨‍🍳' ? 'selected' : ''}>👨‍🍳 Head Chef</option>
                    <option value="👩‍🍳" ${staff.avatarEmoji === '👩‍🍳' ? 'selected' : ''}>👩‍🍳 Sous Chef</option>
                    <option value="🤵" ${staff.avatarEmoji === '🤵' ? 'selected' : ''}>🤵 Floor Lead / Host</option>
                    <option value="🍕" ${staff.avatarEmoji === '🍕' ? 'selected' : ''}>🍕 Pizza Specialist</option>
                    <option value="🍱" ${staff.avatarEmoji === '🍱' ? 'selected' : ''}>🍱 Asian Culinary Lead</option>
                    <option value="🍣" ${staff.avatarEmoji === '🍣' ? 'selected' : ''}>🍣 Sushi Master</option>
                    <option value="🍷" ${staff.avatarEmoji === '🍷' ? 'selected' : ''}>🍷 Sommelier / Cellar</option>
                    <option value="🍹" ${staff.avatarEmoji === '🍹' ? 'selected' : ''}>🍹 Mixologist / Bar</option>
                    <option value="🧑‍💼" ${staff.avatarEmoji === '🧑‍💼' ? 'selected' : ''}>🧑‍💼 Operations Lead</option>
                    <option value="💼" ${staff.avatarEmoji === '💼' ? 'selected' : ''}>💼 Store Manager</option>
                    <option value="⚡" ${staff.avatarEmoji === '⚡' ? 'selected' : ''}>⚡ Shift Cashier</option>
                    <option value="🍰" ${staff.avatarEmoji === '🍰' ? 'selected' : ''}>🍰 Pastry &amp; Bakery</option>
                  </select>
                </div>
              </div>

              <!-- Fast 4-Digit PIN with Auto-Generate -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0;">4-Digit Fast Access PIN *</label>
                  <button type="button" id="btn-edit-generate-pin" style="background: none; border: none; color: var(--brand-primary); font-size: 0.72rem; cursor: pointer; text-decoration: underline;">
                    🎲 Generate New PIN
                  </button>
                </div>
                <div style="position: relative;">
                  <input type="text" id="edit-staff-pin" maxlength="4" value="${staff.pin || ''}" placeholder="4 Digits (e.g. 2468)" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 1rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 2px;" required>
                </div>
                <span style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; display: block;">
                  PIN is used for instant 1-tap keypad login on tablet or mobile.
                </span>
              </div>

              <!-- Email & Password Credentials -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Staff Email *</label>
                  <input type="email" id="edit-staff-email" value="${staff.email || ''}" placeholder="staff@restaurant.in" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
                <div>
                  <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Password *</label>
                  <input type="text" id="edit-staff-pass" value="${staff.password || 'admin'}" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;" required>
                </div>
              </div>

              <!-- Operational Status -->
              <div>
                <label style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0; margin-bottom: 0.35rem; display: block;">Operational Shift Status</label>
                <select id="edit-staff-status" style="width: 100%; padding: 0.7rem 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-size: 0.85rem;">
                  <option value="active" ${staff.status !== 'break' && staff.status !== 'leave' ? 'selected' : ''}>● Active (On Duty &amp; Available on Floor)</option>
                  <option value="break" ${staff.status === 'break' ? 'selected' : ''}>☕ On Break / Standby</option>
                  <option value="leave" ${staff.status === 'leave' ? 'selected' : ''}>🌴 On Scheduled Leave / Off Duty</option>
                </select>
              </div>

              <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <button type="button" id="btn-cancel-edit-staff" class="df-pill-btn" style="padding: 0.65rem 1.15rem;">
                  Cancel
                </button>
                <button type="submit" id="btn-submit-edit-staff" class="df-pill-btn primary" style="padding: 0.65rem 1.4rem; font-weight: 700; background: linear-gradient(135deg, #38BDF8, #2563EB); border: none; color: #fff;">
                  Save Changes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event Listeners
    const closeModal = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-edit-staff')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-edit-staff')?.addEventListener('click', closeModal);

    document.getElementById('btn-edit-generate-pin')?.addEventListener('click', () => {
      const pinInput = document.getElementById('edit-staff-pin');
      if (pinInput) pinInput.value = generateUniquePin();
    });

    document.getElementById('df-edit-staff-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const outletSlug = document.getElementById('edit-staff-outlet')?.value;
      const fullName = document.getElementById('edit-staff-name')?.value.trim();
      const roleTitle = document.getElementById('edit-staff-role-title')?.value.trim();
      const dept = document.getElementById('edit-staff-dept')?.value;
      const emoji = document.getElementById('edit-staff-emoji')?.value;
      const pin = document.getElementById('edit-staff-pin')?.value.trim();
      const email = document.getElementById('edit-staff-email')?.value.trim().toLowerCase();
      const pass = document.getElementById('edit-staff-pass')?.value.trim();
      const status = document.getElementById('edit-staff-status')?.value;

      if (!fullName) {
        showToast('Please enter staff full name.', '⚠️');
        return;
      }
      if (!pin || !/^\d{4}$/.test(pin)) {
        showToast('PIN must be exactly 4 numeric digits.', '⚠️');
        return;
      }
      if (!email || !email.includes('@')) {
        showToast('Please provide a valid staff email address.', '⚠️');
        return;
      }

      state = DineFlowStore.get();
      const accounts = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

      // Check PIN uniqueness (against other accounts)
      if (accounts.some(a => a.id !== staffId && a.pin === pin)) {
        showToast(`PIN "${pin}" is already allocated to another staff member. Please choose another PIN.`, '❌');
        return;
      }

      // Check Email uniqueness (against other accounts)
      if (accounts.some(a => a.id !== staffId && a.email && a.email.toLowerCase() === email)) {
        showToast(`Email "${email}" is already registered to another staff member.`, '❌');
        return;
      }

      // Find staff in state
      if (!state.staffAccounts || !Array.isArray(state.staffAccounts)) {
        state.staffAccounts = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.staffAccounts));
      }
      const target = state.staffAccounts.find(a => a.id === staffId);
      if (!target) {
        showToast('Staff member not found in database.', '❌');
        return;
      }

      // Enforce RBAC on submit
      const isSubmitSuperAdmin = state.session && state.session.role === 'SUPER_ADMIN';
      const submitSessionTenantId = state.session?.tenantId || state.currentTenantId;

      if (target.role === 'SUPER_ADMIN' && !isSubmitSuperAdmin) {
        SoundFX.chime('alert');
        showToast('Permission Denied: Managers cannot modify Owner profiles.', '🚫');
        return;
      }
      if (!isSubmitSuperAdmin && target.tenantId !== submitSessionTenantId) {
        SoundFX.chime('alert');
        showToast('Permission Denied: Managers can only modify staff from their own restaurant.', '🚫');
        return;
      }

      const prevOutlet = target.tenantId;
      target.name = fullName;
      target.roleTitle = roleTitle || target.roleTitle;
      target.department = dept || target.department;
      if (target.role !== 'SUPER_ADMIN' && outletSlug) {
        target.tenantId = outletSlug;
      }
      target.avatarEmoji = emoji || target.avatarEmoji;
      target.pin = pin;
      target.email = email;
      target.password = pass || target.password;
      target.status = status;
      target.updatedAt = new Date().toISOString();

      // If active session belongs to this staff, update live session credentials
      if (state.session && state.session.user && state.session.user.id === staffId) {
        state.session.user.name = target.name;
        state.session.user.roleTitle = target.roleTitle;
        state.session.user.avatarEmoji = target.avatarEmoji;
        state.session.user.department = target.department;
        state.session.user.pin = target.pin;
        state.session.user.email = target.email;
        if (target.role !== 'SUPER_ADMIN' && target.tenantId) {
          state.session.tenantId = target.tenantId;
          state.currentTenantId = target.tenantId;
        }
      }

      const tenantObj = target.tenantId && state.tenants ? state.tenants[target.tenantId] : null;
      const tenantName = tenantObj ? tenantObj.name : 'Platform HQ';

      // Record immutable security audit log
      DineFlowStore.recordLog({
        tenantId: target.tenantId || 'the-urban-plate',
        tenantName: tenantName,
        managerId: state.session?.user?.id || 'staff-02',
        managerName: state.session?.user?.name || 'Owner / Super Admin',
        category: 'SECURITY',
        action: 'Staff Profile Modified',
        details: `Owner modified staff profile for "${target.name}" (${target.roleTitle}, PIN: ${target.pin}, Venue: ${tenantName}${prevOutlet !== target.tenantId ? `, Reassigned from ${prevOutlet}` : ''}).`,
        amount: 0,
        paymentMethod: null,
        securityFlag: '✏️ Profile Modified',
        severity: 'info'
      });

      DineFlowStore.save(state);
      SoundFX.chime('success');
      showToast(`Staff profile for "${target.name}" updated successfully!`, target.avatarEmoji);
      closeModal();

      if (typeof onSavedCallback === 'function') {
        onSavedCallback(target);
      }
    });
  }

  // ------------------------------------------------------------------------------
  // 3. SUPER ADMIN PLATFORM VIEW (Multi-Tenant Overview)
  // ------------------------------------------------------------------------------
  function renderSuperAdminView(container) {
    document.title = 'DineFlow - Platform Super Admin & Owner Audit Intelligence';
    state = DineFlowStore.get();
    const tenantsList = state.tenants ? Object.values(state.tenants) : [];
    const totalOrdersRev = (state.orders || []).reduce((a, b) => a + (b.total || 0), 0);

    let activeSuperTab = 'logs'; // 'logs' | 'outlets'
    let selectedBranch = 'all';
    let selectedManager = 'all';
    let selectedCategory = 'all';
    let searchQuery = '';

    function getFilteredLogs() {
      let logs = Array.isArray(state.auditLogs) ? state.auditLogs : (DINEFLOW_DEFAULT_DATA.auditLogs || []);
      if (selectedBranch !== 'all') {
        logs = logs.filter(l => l.tenantId === selectedBranch);
      }
      if (selectedManager !== 'all') {
        logs = logs.filter(l => l.managerId === selectedManager);
      }
      if (selectedCategory !== 'all') {
        logs = logs.filter(l => l.category === selectedCategory);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        logs = logs.filter(l =>
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.managerName && l.managerName.toLowerCase().includes(q)) ||
          (l.tenantName && l.tenantName.toLowerCase().includes(q)) ||
          (l.orderId && l.orderId.toLowerCase().includes(q))
        );
      }
      return logs;
    }

    function renderMain() {
      const logs = getFilteredLogs();
      const allManagers = (state.staffAccounts && state.staffAccounts.length) ? state.staffAccounts : DINEFLOW_DEFAULT_DATA.staffAccounts;

      // Calculate dynamic KPIs from logs
      const totalAmount = logs.reduce((sum, l) => sum + (l.amount || 0), 0) || (totalOrdersRev * 12);
      const ordersCount = logs.filter(l => l.category === 'PAYMENT' || l.category === 'DISCOUNT').length || 248;

      const upiLogs = logs.filter(l => l.paymentMethod === 'UPI');
      const cardLogs = logs.filter(l => l.paymentMethod === 'Card');
      const cashLogs = logs.filter(l => l.paymentMethod === 'Cash');

      const upiAmount = upiLogs.reduce((s, l) => s + (l.amount || 0), 0) || Math.round(totalAmount * 0.68);
      const cardAmount = cardLogs.reduce((s, l) => s + (l.amount || 0), 0) || Math.round(totalAmount * 0.22);
      const cashAmount = cashLogs.reduce((s, l) => s + (l.amount || 0), 0) || Math.round(totalAmount * 0.10);

      const upiPct = Math.round((upiAmount / (totalAmount || 1)) * 100) || 68;
      const cardPct = Math.round((cardAmount / (totalAmount || 1)) * 100) || 22;
      const cashPct = Math.max(0, 100 - upiPct - cardPct) || 10;

      container.innerHTML = `
        <header class="df-topbar">
          <div class="df-brand-badge">
            <div class="df-brand-icon" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">⚡</div>
            <div class="df-brand-text">
              <h1>DineFlow Platform Super Admin</h1>
              <span class="df-brand-tagline">Multi-Tenant SaaS Operations & Owner HQ</span>
            </div>
          </div>
          <div class="df-top-actions">
            <div class="df-session-status-badge" style="border-color: rgba(99, 102, 241, 0.35); background: rgba(99, 102, 241, 0.08);">
              <span>⚡</span>
              <span style="font-weight: 600; color: #fff;">${state.session?.user?.name || 'Super Admin'}</span>
              <span class="df-role-tag" style="background: rgba(99, 102, 241, 0.2); color: #818CF8;">OWNER HQ</span>
            </div>
            <button id="btn-open-create-user-modal" class="df-pill-btn" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #10B981; font-weight: 700;" title="Create new restaurant staff profile">
              <span>+ Create Staff Profile</span>
            </button>
            <a href="?view=onboarding" class="df-pill-btn primary">
              + Onboard Restaurant
            </a>
            <a href="?view=admin" class="df-pill-btn">
              Restaurant OS
            </a>
            <button id="btn-superadmin-logout" class="df-pill-btn danger" title="Sign Out of Super Admin">
              <span>🔒 Logout</span>
            </button>
          </div>
        </header>

        <main class="df-superadmin-layout" style="padding-top: 90px; padding-bottom: 4rem; padding-left: 2rem; padding-right: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; min-height: 100vh; box-sizing: border-box;">
          
          <!-- Top Tab Navigation -->
          <div class="df-superadmin-tabs-bar">
            <button class="df-superadmin-tab-btn ${activeSuperTab === 'logs' ? 'active' : ''}" data-tab="logs">
              <span>📜</span> Manager Activity &amp; Audit Logs
            </button>
            <button class="df-superadmin-tab-btn ${activeSuperTab === 'outlets' ? 'active' : ''}" data-tab="outlets">
              <span>🏢</span> Managed Outlets (${tenantsList.length})
            </button>
          </div>

          ${activeSuperTab === 'logs' ? `
            <!-- Filter & Action Bar -->
            <div class="df-audit-filter-bar">
              <div class="df-audit-filters-group">
                <label style="font-size: 0.75rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Filters:</label>
                
                <!-- Restaurant Branch Selector -->
                <select id="filter-branch" class="df-audit-select">
                  <option value="all" ${selectedBranch === 'all' ? 'selected' : ''}>🏢 All Outlets (${tenantsList.length})</option>
                  ${tenantsList.map(t => `<option value="${t.slug}" ${selectedBranch === t.slug ? 'selected' : ''}>${t.name} (${t.branch || 'Main'})</option>`).join('')}
                </select>

                <!-- Manager Selector -->
                <select id="filter-manager" class="df-audit-select">
                  <option value="all" ${selectedManager === 'all' ? 'selected' : ''}>👨‍🍳 All Managers</option>
                  ${allManagers.map(m => `<option value="${m.id}" ${selectedManager === m.id ? 'selected' : ''}>${m.name} (${m.roleTitle})</option>`).join('')}
                </select>

                <!-- Category Selector -->
                <select id="filter-category" class="df-audit-select">
                  <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>📑 All Event Types</option>
                  <option value="DISCOUNT" ${selectedCategory === 'DISCOUNT' ? 'selected' : ''}>🚨 Discounts &amp; Comps</option>
                  <option value="PAYMENT" ${selectedCategory === 'PAYMENT' ? 'selected' : ''}>💳 Bill Settlements</option>
                  <option value="OVERRIDE" ${selectedCategory === 'OVERRIDE' ? 'selected' : ''}>⚠️ Table Overrides</option>
                  <option value="STOCK" ${selectedCategory === 'STOCK' ? 'selected' : ''}>📦 Menu Item 86ed</option>
                  <option value="RECONCILIATION" ${selectedCategory === 'RECONCILIATION' ? 'selected' : ''}>🔒 Cash Reconciled</option>
                  <option value="SHIFT" ${selectedCategory === 'SHIFT' ? 'selected' : ''}>⏱️ Shift Clock-ins</option>
                </select>
              </div>

              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <span class="df-micro-badge" style="background: rgba(255,255,255,0.06); color: var(--text-muted); padding: 0.45rem 0.75rem;">
                  📅 Today - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button id="btn-export-audit-csv" class="df-pill-btn primary" style="font-size: 0.78rem; padding: 0.45rem 0.95rem;" title="Export filtered records to spreadsheet">
                  📥 Export CSV
                </button>
              </div>
            </div>

            <!-- Top 4 Financial & Operational KPI Cards -->
            <div class="df-audit-kpis-grid">
              <div class="df-audit-kpi-card">
                <div class="df-audit-kpi-header">
                  <span class="df-audit-kpi-title">Total Orders</span>
                  <div class="df-audit-kpi-icon" style="background: rgba(99, 102, 241, 0.15); color: #818CF8;">🛒</div>
                </div>
                <div class="df-audit-kpi-value">${ordersCount} orders</div>
                <div class="df-audit-kpi-sub">
                  <span>Gross GMV: ₹${totalAmount.toLocaleString('en-IN')}</span>
                  <span style="color: #10B981; font-weight: 700;">↑ Live Active</span>
                </div>
              </div>

              <div class="df-audit-kpi-card">
                <div class="df-audit-kpi-header">
                  <span class="df-audit-kpi-title">UPI Payments</span>
                  <div class="df-audit-kpi-icon" style="background: rgba(16, 185, 129, 0.15); color: #10B981;">📱</div>
                </div>
                <div class="df-audit-kpi-value" style="color: #10B981;">${upiPct}%</div>
                <div class="df-audit-kpi-sub">
                  <span>₹${upiAmount.toLocaleString('en-IN')} Settled</span>
                  <span style="color: var(--text-dim);">Direct QR</span>
                </div>
              </div>

              <div class="df-audit-kpi-card">
                <div class="df-audit-kpi-header">
                  <span class="df-audit-kpi-title">Card / POS</span>
                  <div class="df-audit-kpi-icon" style="background: rgba(129, 140, 248, 0.15); color: #818CF8;">💳</div>
                </div>
                <div class="df-audit-kpi-value" style="color: #818CF8;">${cardPct}%</div>
                <div class="df-audit-kpi-sub">
                  <span>₹${cardAmount.toLocaleString('en-IN')} Settled</span>
                  <span style="color: var(--text-dim);">EDC Terminal</span>
                </div>
              </div>

              <div class="df-audit-kpi-card">
                <div class="df-audit-kpi-header">
                  <span class="df-audit-kpi-title">Cash Reconciled</span>
                  <div class="df-audit-kpi-icon" style="background: rgba(229, 169, 60, 0.15); color: #E5A93C;">🔒</div>
                </div>
                <div class="df-audit-kpi-value" style="color: #E5A93C;">${cashPct}%</div>
                <div class="df-audit-kpi-sub">
                  <span>₹${cashAmount.toLocaleString('en-IN')} In Drawer</span>
                  <span style="color: #10B981; font-weight: 700;">✓ 0 Discrepancy</span>
                </div>
              </div>
            </div>

            <!-- Split View: Left Manager Shifts vs Right Live Audit Logs -->
            <div class="df-audit-split-view">
              
              <!-- Left Column: Manager Shift & Payment Ledger -->
              <div class="df-manager-ledger-col">
                <div class="df-ledger-header">
                  <div class="df-ledger-header-text">
                    <h3 class="df-ledger-title">Manager Shift Ledger</h3>
                    <p class="df-ledger-subtitle">Staff operational accounts &amp; payment custody</p>
                  </div>
                  <div class="df-ledger-header-actions">
                    <button id="btn-add-staff-from-ledger" class="df-pill-btn primary" style="font-size: 0.72rem; padding: 0.35rem 0.65rem;" title="Provision new staff member">
                      + Add Staff
                    </button>
                    <span class="df-micro-badge status-available" style="white-space: nowrap;">${allManagers.length} ACTIVE</span>
                  </div>
                </div>

                ${allManagers.map((m, idx) => {
        const mLogs = logs.filter(l => l.managerId === m.id);
        const mOrdersCount = mLogs.length ? mLogs.length : (21 - idx * 4);
        const mUpi = 65 + (idx % 2 === 0 ? 5 : -5);
        const mCard = 22 + (idx % 2 === 0 ? -3 : 4);
        const mCash = 100 - mUpi - mCard;
        const shiftTime = idx === 0 ? '5h 14m' : idx === 1 ? '4h 30m' : '3h 45m';
        const venueName = m.tenantId && state.tenants[m.tenantId] ? state.tenants[m.tenantId].name : 'Platform Operations';

        return `
                    <div class="df-manager-card-item">
                      <div class="df-manager-header-row">
                        <div class="df-manager-identity">
                          <div class="df-manager-avatar">${m.avatarEmoji || '👨‍🍳'}</div>
                          <div style="min-width: 0; flex: 1;">
                            <div class="df-manager-name-line">
                              <span class="df-manager-name">${m.name}</span>
                              ${m.role === 'SUPER_ADMIN'
            ? '<span class="df-staff-scope-pill owner-hq" style="font-size: 0.62rem; padding: 0.12rem 0.4rem; white-space: nowrap;">Owner HQ ⚡</span>'
            : '<span class="df-staff-scope-pill staff-only" style="font-size: 0.62rem; padding: 0.12rem 0.4rem; white-space: nowrap;">Staff OS 🔒</span>'}
                            </div>
                            <div class="df-manager-sub" title="${m.roleTitle} • ${m.department || 'Floor Operations'}">${m.roleTitle} &bull; ${m.department || 'Floor'}</div>
                          </div>
                        </div>
                        <div class="df-manager-actions">
                          <span class="df-manager-status-pill">Active (${shiftTime})</span>
                          <button class="btn-edit-staff" data-id="${m.id}" data-name="${m.name}" title="Edit staff profile & credentials">
                            ✏️ Edit
                          </button>
                          ${m.role !== 'SUPER_ADMIN' ? `
                            <button class="btn-revoke-staff" data-id="${m.id}" data-name="${m.name}" title="Revoke staff account">
                              🗑️ Revoke
                            </button>
                          ` : ''}
                        </div>
                      </div>

                      <div class="df-manager-meta-bar">
                        <span class="df-manager-venue-tag" title="${venueName}">🏢 ${venueName}</span>
                        <span class="df-manager-pin-badge">PIN: ${m.pin}</span>
                      </div>

                      <div class="df-manager-stats-row">
                        <span>Orders Processed: <strong style="color: #fff;">${mOrdersCount}</strong></span>
                        <span>Shift Status: <strong style="color: #10B981;">On Floor</strong></span>
                      </div>

                      <!-- Payment Method Breakdown Progress Bar -->
                      <div class="df-payment-split-bar" title="Payment custody split: UPI ${mUpi}%, Card ${mCard}%, Cash ${mCash}%">
                        <div class="df-split-seg upi" style="width: ${mUpi}%;"></div>
                        <div class="df-split-seg card" style="width: ${mCard}%;"></div>
                        <div class="df-split-seg cash" style="width: ${mCash}%;"></div>
                      </div>

                      <div class="df-split-legend">
                        <span style="color: #10B981;">● UPI: ${mUpi}%</span>
                        <span style="color: #818CF8;">● Card: ${mCard}%</span>
                        <span style="color: #E5A93C;">● Cash: ${mCash}%</span>
                      </div>
                    </div>
                  `;
      }).join('')}
              </div>

              <!-- Right Column: Live Audit & Security Stream -->
              <div class="df-audit-logs-col">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <h3 class="df-ledger-title">Live Audit &amp; Activity Log</h3>
                    <span style="font-size: 0.72rem; color: var(--text-dim);">Immutable operations stream with security flags</span>
                  </div>
                  <span class="df-micro-badge" style="background: rgba(99, 102, 241, 0.15); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.35);">
                    ${logs.length} RECORDS
                  </span>
                </div>

                <!-- Instant Search Input -->
                <div class="df-audit-search-bar">
                  <input type="text" id="input-audit-search" class="df-audit-search-input" placeholder="🔍 Search records by manager, action, table, or order ID..." value="${searchQuery}">
                </div>

                <!-- Scrollable Audit Table -->
                <div class="df-audit-table-wrap">
                  <table class="df-audit-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Manager &amp; Outlet</th>
                        <th>Action &amp; Event</th>
                        <th>Order / Ref</th>
                        <th>Amount</th>
                        <th>Security Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${logs.length ? logs.map(l => {
        let badgeClass = 'payment';
        if (l.category === 'DISCOUNT') badgeClass = 'discount';
        else if (l.category === 'OVERRIDE') badgeClass = 'override';
        else if (l.category === 'STOCK') badgeClass = 'stock';
        else if (l.category === 'SHIFT' || l.category === 'RECONCILIATION') badgeClass = 'shift';

        let flagClass = 'verified';
        if (l.severity === 'alert') flagClass = 'alert';
        else if (l.severity === 'warning') flagClass = 'warning';

        return `
                          <tr>
                            <td style="white-space: nowrap; color: var(--text-muted); font-size: 0.75rem;">
                              ${l.timestamp}
                            </td>
                            <td>
                              <div style="font-weight: 700; color: #fff; font-size: 0.8rem;">${l.managerName}</div>
                              <div style="font-size: 0.7rem; color: var(--text-dim);">${l.tenantName || 'Outlet'}</div>
                            </td>
                            <td>
                              <div style="margin-bottom: 0.25rem;">
                                <span class="df-audit-badge ${badgeClass}">${l.action}</span>
                              </div>
                              <div style="font-size: 0.72rem; color: var(--text-muted); max-width: 280px; line-height: 1.3;">
                                ${l.details}
                              </div>
                            </td>
                            <td style="white-space: nowrap; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">
                              ${l.orderId || '—'}
                            </td>
                            <td style="white-space: nowrap; font-weight: 700; font-size: 0.82rem; color: ${l.amount ? '#fff' : 'var(--text-dim)'};">
                              ${l.amount ? '₹' + l.amount.toLocaleString('en-IN') : '—'}
                            </td>
                            <td style="white-space: nowrap;">
                              <span class="df-sec-flag ${flagClass}">${l.securityFlag || '✓ Verified'}</span>
                            </td>
                          </tr>
                        `;
      }).join('') : `
                        <tr>
                          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                            No audit records found matching your filters.
                          </td>
                        </tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ` : `
            <!-- Outlets Management View -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <div>
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #fff;">Managed Restaurant Partners</h2>
                <span style="font-size: 0.78rem; color: var(--text-dim);">Multi-tenant workspace operations and governance</span>
              </div>
              <a href="?view=onboarding" class="df-pill-btn primary">+ Launch 10-Step Onboarding</a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
              ${tenantsList.map(t => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <span style="font-size: 1.75rem;">${t.logoEmoji || '🍽️'}</span>
                      <div>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff;">${t.name}</h3>
                        <span style="font-size: 0.75rem; color: var(--text-dim);">${t.branch}</span>
                      </div>
                    </div>
                    <span class="df-micro-badge chef" style="text-transform: uppercase;">${t.plan}</span>
                  </div>

                  <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
                    ${t.tagline}
                  </p>

                  <!-- Assigned Staff Mini Roster -->
                  <div style="margin-bottom: 1rem; padding: 0.65rem 0.85rem; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.4rem; display: flex; justify-content: space-between; align-items: center;">
                      <span>👥 Assigned Staff (${allManagers.filter(m => m.tenantId === t.slug).length})</span>
                      <span style="font-size: 0.68rem; color: #38BDF8;">Click to edit</span>
                    </div>
                    <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                      ${allManagers.filter(m => m.tenantId === t.slug).length === 0 ? '<span style="font-size: 0.72rem; color: #64748B;">No staff assigned yet</span>' : allManagers.filter(m => m.tenantId === t.slug).map(s => `
                        <button class="btn-edit-staff" data-id="${s.id}" data-name="${s.name}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;" title="Edit ${s.name} (${s.roleTitle})">
                          ${s.avatarEmoji || '👨‍🍳'} ${s.name} (PIN: ${s.pin}) ✏️
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                    <button class="df-pill-btn primary btn-switch-tenant" data-slug="${t.slug}" style="flex: 1; justify-content: center; font-size: 0.78rem;">
                      Switch & Manage
                    </button>
                    <button class="df-pill-btn btn-add-outlet-staff" data-slug="${t.slug}" style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.15); color: #10B981; border-color: rgba(16, 185, 129, 0.35);" title="Add staff member to this outlet">
                      + Staff
                    </button>
                    <a href="?r=${t.slug}&t=T12" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
                      QR View ↗
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `}

          <!-- Super Admin Footer -->
          <footer class="df-superadmin-footer" style="margin-top: 3.5rem; padding-top: 1.75rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              Designed &amp; Engineered by <a href="../" class="df-credit-link" style="color: var(--brand-primary); font-weight: 700;">Debashish Paul</a> • DineFlow SaaS Platform
            </div>
            <a href="../projects" class="df-back-portfolio-btn">
              <span>← Back to Portfolio</span>
            </a>
          </footer>
        </main>
      `;

      // Event Listeners for Tabs
      container.querySelectorAll('.df-superadmin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeSuperTab = btn.getAttribute('data-tab');
          renderMain();
        });
      });

      // Filter Change Listeners
      const branchSel = container.querySelector('#filter-branch');
      if (branchSel) {
        branchSel.addEventListener('change', (e) => {
          selectedBranch = e.target.value;
          renderMain();
        });
      }

      const managerSel = container.querySelector('#filter-manager');
      if (managerSel) {
        managerSel.addEventListener('change', (e) => {
          selectedManager = e.target.value;
          renderMain();
        });
      }

      const catSel = container.querySelector('#filter-category');
      if (catSel) {
        catSel.addEventListener('change', (e) => {
          selectedCategory = e.target.value;
          renderMain();
        });
      }

      // Search Input
      const searchInput = container.querySelector('#input-audit-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          const tbody = container.querySelector('.df-audit-table tbody');
          if (tbody) {
            const currentFiltered = getFilteredLogs();
            tbody.innerHTML = currentFiltered.length ? currentFiltered.map(l => {
              let badgeClass = 'payment';
              if (l.category === 'DISCOUNT') badgeClass = 'discount';
              else if (l.category === 'OVERRIDE') badgeClass = 'override';
              else if (l.category === 'STOCK') badgeClass = 'stock';
              else if (l.category === 'SHIFT' || l.category === 'RECONCILIATION') badgeClass = 'shift';

              let flagClass = 'verified';
              if (l.severity === 'alert') flagClass = 'alert';
              else if (l.severity === 'warning') flagClass = 'warning';

              return `
                <tr>
                  <td style="white-space: nowrap; color: var(--text-muted); font-size: 0.75rem;">
                    ${l.timestamp}
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 0.8rem;">${l.managerName}</div>
                    <div style="font-size: 0.7rem; color: var(--text-dim);">${l.tenantName || 'Outlet'}</div>
                  </td>
                  <td>
                    <div style="margin-bottom: 0.25rem;">
                      <span class="df-audit-badge ${badgeClass}">${l.action}</span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); max-width: 280px; line-height: 1.3;">
                      ${l.details}
                    </div>
                  </td>
                  <td style="white-space: nowrap; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">
                    ${l.orderId || '—'}
                  </td>
                  <td style="white-space: nowrap; font-weight: 700; font-size: 0.82rem; color: ${l.amount ? '#fff' : 'var(--text-dim)'};">
                    ${l.amount ? '₹' + l.amount.toLocaleString('en-IN') : '—'}
                  </td>
                  <td style="white-space: nowrap;">
                    <span class="df-sec-flag ${flagClass}">${l.securityFlag || '✓ Verified'}</span>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No audit records found matching "${searchQuery}".
                </td>
              </tr>
            `;
          }
        });
      }

      // Export CSV Listener
      const btnExport = container.querySelector('#btn-export-audit-csv');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const exportLogs = getFilteredLogs();
          const headers = ['Log ID', 'Timestamp', 'Restaurant', 'Manager', 'Category', 'Action', 'Details', 'Order Ref', 'Amount (INR)', 'Payment Method', 'Security Status'];
          const rows = exportLogs.map(l => [
            `"${l.id}"`,
            `"${l.timestamp}"`,
            `"${(l.tenantName || l.tenantId || '').replace(/"/g, '""')}"`,
            `"${(l.managerName || '').replace(/"/g, '""')}"`,
            `"${l.category || ''}"`,
            `"${(l.action || '').replace(/"/g, '""')}"`,
            `"${(l.details || '').replace(/"/g, '""')}"`,
            `"${l.orderId || 'N/A'}"`,
            l.amount || 0,
            `"${l.paymentMethod || 'N/A'}"`,
            `"${l.securityFlag || 'Verified'}"`
          ]);
          const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `dineflow_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('Audit logs exported to CSV successfully!', '📥');
        });
      }

      // Open Create Staff Modal
      container.querySelector('#btn-open-create-user-modal')?.addEventListener('click', () => {
        openCreateStaffModal(() => renderMain());
      });

      container.querySelector('#btn-add-staff-from-ledger')?.addEventListener('click', () => {
        openCreateStaffModal(() => renderMain());
      });

      container.querySelectorAll('.btn-add-outlet-staff').forEach(btn => {
        btn.addEventListener('click', () => {
          const slug = btn.getAttribute('data-slug');
          openCreateStaffModal(() => renderMain(), slug);
        });
      });

      // Edit Staff Profile Listener (Owner HQ)
      container.querySelectorAll('.btn-edit-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const staffId = btn.getAttribute('data-id');
          openEditStaffModal(staffId, () => renderMain());
        });
      });

      // Revoke Staff Profile Listener
      container.querySelectorAll('.btn-revoke-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const staffId = btn.getAttribute('data-id');
          const staffName = btn.getAttribute('data-name');
          if (confirm(`Are you sure you want to revoke staff access for "${staffName}"? This will immediately disable their login and PIN access to Restaurant Staff OS.`)) {
            state = DineFlowStore.get();
            const targetAccount = (state.staffAccounts || []).find(a => a.id === staffId);
            state.staffAccounts = (state.staffAccounts || []).filter(a => a.id !== staffId);

            // Record security audit log
            DineFlowStore.recordLog({
              tenantId: targetAccount?.tenantId || 'the-urban-plate',
              tenantName: (targetAccount?.tenantId && state.tenants[targetAccount.tenantId]?.name) || 'Outlet',
              managerId: state.session?.user?.id || 'staff-02',
              managerName: state.session?.user?.name || 'Debashish Paul (Super Admin)',
              category: 'SECURITY',
              action: 'Staff Profile Revoked',
              details: `Revoked operational access for "${staffName}" (${targetAccount?.roleTitle || 'Staff'}). Account deleted from staff directory.`,
              amount: 0,
              paymentMethod: null,
              securityFlag: '⚠️ Profile Revoked',
              severity: 'warning'
            });

            DineFlowStore.save(state, {
              action: 'STAFF_ACCOUNT_REVOKED',
              source: 'staff',
              staffId: staffId,
              tenantSlug: tenantSlug
            });
            SoundFX.chime('notice');
            showToast(`Staff profile for "${staffName}" revoked.`, '🗑️');
            renderMain();
          }
        });
      });

      // Switch Tenant Listener
      container.querySelectorAll('.btn-switch-tenant').forEach(btn => {
        btn.addEventListener('click', () => {
          const slug = btn.getAttribute('data-slug');
          state.currentTenantId = slug;
          DineFlowStore.save(state);
          navigateTo({ view: 'admin' });
          showToast(`Switched active tenant to ${state.tenants[slug].name}`);
        });
      });

      // Logout Listener
      container.querySelector('#btn-superadmin-logout')?.addEventListener('click', () => {
        state = DineFlowStore.get();
        state.session = {
          isAuthenticated: false,
          role: 'CUSTOMER',
          user: null,
          tenantId: 'the-urban-plate'
        };
        DineFlowStore.save(state);
        SoundFX.chime('notice');
        showToast('Signed out of Platform Super Admin.', '🔒');
        navigateTo({ view: 'login' });
      });
    }

    renderMain();
  }

  // ------------------------------------------------------------------------------
  // 4. RESTAURANT ONBOARDING WIZARD VIEW (10 Steps)
  // ------------------------------------------------------------------------------
  function renderOnboardingView(container) {
    let currentStep = 1;
    const totalSteps = 10;

    const stepTitles = [
      'Restaurant Name & Concept',
      'Logo & Cover Photo',
      'Contact Information',
      'Location & Address',
      'Branch Identifiers',
      'Tables & Seating Plan',
      'Menu Catalog Setup',
      'Brand Palette & Theme',
      'Batch QR Generation',
      'Ready to Launch!'
    ];

    function renderStep() {
      container.innerHTML = `
        <header class="df-topbar">
          <div class="df-brand-badge">
            <div class="df-brand-icon">🚀</div>
            <div class="df-brand-text">
              <h1>Partner Restaurant Onboarding</h1>
              <span class="df-brand-tagline">Step ${currentStep} of ${totalSteps} - ${stepTitles[currentStep - 1]}</span>
            </div>
          </div>
          <div class="df-top-actions">
            <a href="?view=super-admin" class="df-pill-btn">✕ Exit</a>
          </div>
        </header>

        <main class="df-onboarding-layout" style="padding-top: 96px; padding-bottom: 4rem; padding-left: 1.25rem; padding-right: 1.25rem; max-width: 640px; margin: 0 auto; width: 100%; min-height: 100vh; box-sizing: border-box;">
          <!-- Progress Bar -->
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin-bottom: 2rem; overflow: hidden;">
            <div style="width: ${(currentStep / totalSteps) * 100}%; height: 100%; background: linear-gradient(90deg, #E5A93C, #10B981); transition: width 0.3s ease;"></div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-lg);">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--brand-primary); text-transform: uppercase; margin-bottom: 0.35rem;">
              Step ${currentStep} of ${totalSteps}
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">
              ${stepTitles[currentStep - 1]}
            </h2>

            <div id="onboarding-step-body" style="min-height: 200px;">
              ${getStepFormHTML(currentStep)}
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
              <button class="df-pill-btn" id="btn-onboard-prev" ${currentStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>
                ← Previous
              </button>
              <button class="df-splash-btn" id="btn-onboard-next" style="padding: 0.75rem 1.75rem; font-size: 0.88rem;">
                ${currentStep === totalSteps ? 'Launch Restaurant 🚀' : 'Next Step →'}
              </button>
            </div>
          </div>
        </main>
      `;

      document.getElementById('btn-onboard-prev')?.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          renderStep();
        }
      });

      document.getElementById('btn-onboard-next')?.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          currentStep++;
          SoundFX.chime('success');
          renderStep();
        } else {
          // Final Step: Complete Onboarding & Redirect
          SoundFX.chime('success');
          showToast('New Restaurant successfully onboarded to DineFlow!');
          navigateTo({ view: 'super-admin' });
        }
      });
    }

    function getStepFormHTML(step) {
      switch (step) {
        case 1:
          return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Restaurant Trade Name</label>
                <input type="text" value="Royal Bengal Club" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Tagline & Cuisine Type</label>
                <input type="text" value="Heritage Gastronomy & Colonial Teas" style="width: 100%;">
              </div>
            </div>
          `;
        case 2:
          return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Logo Icon / Emoji</label>
                <input type="text" value="🐯" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Cover Photography URL</label>
                <input type="url" value="images/cover-the-urban-plate.jpg" style="width: 100%;">
              </div>
            </div>
          `;
        case 3:
          return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Contact Phone</label>
                <input type="tel" value="+91 98300 11223" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Inquiry Email</label>
                <input type="email" value="contact@royalbengal.in" style="width: 100%;">
              </div>
            </div>
          `;
        case 4:
          return `
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Physical Street Address</label>
              <textarea rows="3" style="width: 100%;">14/2 Shakespeare Sarani, Theatre Road, Kolkata 700071</textarea>
            </div>
          `;
        case 5:
          return `
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Branch Identifier</label>
              <input type="text" value="Theatre Road Flagship" style="width: 100%;">
            </div>
          `;
        case 6:
          return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Initial Number of Dining Tables</label>
                <input type="number" value="15" style="width: 100%;">
              </div>
              <p style="font-size: 0.8rem; color: var(--text-muted);">Unique QR codes will be auto-provisioned for tables T01 through T15.</p>
            </div>
          `;
        case 7:
          return `
            <div style="text-align: center; padding: 1.5rem 0;">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📥</div>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Import starter gourmet catalog or customize later from Admin.</p>
              <button class="df-pill-btn primary" style="margin-top: 0.75rem;">Seed Standard Continental & Biryani Menu ✓</button>
            </div>
          `;
        case 8:
          return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Brand Primary Color</label>
                <input type="color" value="#E5A93C" style="width: 100%; height: 45px; padding: 2px;">
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem; display: block;">Secondary Color</label>
                <input type="color" value="#0F172A" style="width: 100%; height: 45px; padding: 2px;">
              </div>
            </div>
          `;
        case 9:
          return `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="font-size: 0.85rem; color: #10B981; font-weight: 700; margin-bottom: 0.5rem;">
                ✓ 15 Branded High-Resolution Table QR Codes Generated
              </p>
              <p style="font-size: 0.78rem; color: var(--text-muted);">Print-ready tent stand templates prepared for all dining zones.</p>
            </div>
          `;
        case 10:
          return `
            <div style="text-align: center; padding: 1rem 0;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">Onboarding Complete!</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Click below to launch the restaurant and start receiving QR table orders.</p>
            </div>
          `;
        default:
          return '';
      }
    }

    renderStep();
  }

  // ------------------------------------------------------------------------------
  // INITIALIZATION & CROSS-TAB SYNC
  // ------------------------------------------------------------------------------
  window.addEventListener('hashchange', renderApp);
  window.addEventListener('popstate', renderApp);

  // Cross-tab & Multi-Channel synchronization hook (with deduplication)
  const __recentSyncEventKeys = new Map();

  window.onDineFlowRemoteSync = function (event) {
    const metaCheck = (event && event.meta) || {};
    if (metaCheck.action) {
      const eventSignature = `${metaCheck.action}_${metaCheck.orderId || metaCheck.tableId || ''}_${metaCheck.newStatus || metaCheck.status || ''}`;
      const nowTs = Date.now();
      const lastTs = __recentSyncEventKeys.get(eventSignature) || 0;
      if (nowTs - lastTs < 1200) {
        // Redundant channel echo arriving within 1.2s: suppress duplicate toast & chime
        return;
      }
      __recentSyncEventKeys.set(eventSignature, nowTs);
      if (__recentSyncEventKeys.size > 80) {
        __recentSyncEventKeys.forEach((ts, k) => { if (nowTs - ts > 8000) __recentSyncEventKeys.delete(k); });
      }
    }

    // Preserve local session so customer broadcasts never log staff out
    const currentSession = state && state.session ? { ...state.session } : null;

    // 1. Sync in-memory state directly from broadcast payload or storage
    if (event && event.payload) {
      state = event.payload;
      if (currentSession && currentSession.isAuthenticated) {
        state.session = currentSession;
      }
    } else {
      state = DineFlowStore.get();
      if (currentSession && currentSession.isAuthenticated) {
        state.session = currentSession;
      }
    }

    const route = parseRoute();
    const meta = (event && event.meta) || {};

    if (route.view === 'admin') {
      const tenant = getCurrentTenant(meta.tenantSlug || (state.session && state.session.tenantId));

      // Re-render Admin View (updates metrics, kanban cards, and call counts instantly)
      const appEl = document.getElementById('app');
      if (appEl) {
        renderAdminView(appEl, tenant);
      }

      // If action is order status change (card moved), suppress duplicate echo toast & chime on staff OS
      if (meta.action === 'ORDER_STATUS_CHANGED') {
        return;
      }

      // Audio notification & toasts for incoming customer actions only
      if (meta.action === 'NEW_ORDER') {
        SoundFX.chime('order');
        showToast(`New Order #${meta.orderId || ''} received from Table ${meta.tableId || ''}! 🛎️`, '📥');
      } else if (meta.action === 'STAFF_CALL') {
        SoundFX.chime('notice');
        showToast(`Table ${meta.tableId || ''} requests ${meta.requestLabel || 'Staff Assistance'}!`, '⚠️');
      } else if (meta.action === 'BILL_REQUEST') {
        SoundFX.chime('notice');
        showToast(`Table ${meta.tableId || ''} requested their bill!`, '💳');
      }
    } else if (route.view === 'customer') {
      // Filter out notifications meant for other dining tables
      if (meta.tableId && route.tableId && meta.tableId !== route.tableId) {
        return;
      }
      if (meta.orderId) {
        const targetOrder = (state.orders || []).find(o => o.id === meta.orderId);
        if (targetOrder && targetOrder.tableId && route.tableId && targetOrder.tableId !== route.tableId) {
          return;
        }
      }

      const tenant = getCurrentTenant(route.tenantSlug || meta.tenantSlug);
      const table = state.tables.find(t => t.id === route.tableId) || { id: route.tableId, name: `Table ${route.tableId}`, section: 'Indoor' };

      // Chime & toast for customer only on their order status transition or bill settlement
      if (meta.action === 'ORDER_STATUS_CHANGED') {
        SoundFX.chime('success');
        const statusMap = {
          RECEIVED: 'Order Received by Kitchen 📥',
          CONFIRMED: 'Chef Confirmed your Order! 👨‍🍳',
          PREPARING: 'Now Cooking in the Kitchen! 🍳',
          READY: 'Plated & Ready for Delivery! 🔔',
          SERVED: 'Delivered to your Table! Enjoy! 🍽️',
          COMPLETED: 'Order Completed. Thank you! ⭐'
        };
        showToast(statusMap[meta.newStatus] || `Order #${meta.orderId}: ${meta.newStatus}`, '👨‍🍳');
      } else if (meta.action === 'BILL_SETTLED') {
        SoundFX.chime('success');
        showToast('Your bill has been settled. Thank you for dining with us! ⭐', '💳');
      }

      // Re-render customer background (dishes, badges, cart count)
      const appEl = document.getElementById('app');
      if (appEl) {
        renderCustomerView(appEl, route.tenantSlug, route.tableId);
      }

      // PRESERVE AND UPDATE THE ORDER TRACKING MODAL IF OPEN (NO AUTO-CLOSING!)
      if (activeTrackingOrderId || document.getElementById('orders-backdrop')) {
        openOrdersModal(tenant, table, activeTrackingOrderId || meta.orderId);
      }
      // REFRESH BILL MODAL LIVE IF OPEN WHEN BILL IS SETTLED BY STAFF
      if (document.getElementById('bill-backdrop')) {
        openRequestBillModal(tenant, table);
      }
    } else {
      renderApp();
    }
  };

  // Resume & reconnect MQTT instantly when phone/tab wakes from sleep or background
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.DineFlowCloudSync && !window.DineFlowCloudSync.isConnected) {
      window.DineFlowCloudSync.connect();
    }
  });

  // Register PWA Service Worker (Auto-checks for latest updates)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=2.3.1').then(reg => {
        reg.update();
      }).catch(err => {
        console.warn('Service Worker registration skipped', err);
      });
    });
  }

  // Intercept internal query links for instant SPA transitions without full page reloads
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    if (link.target === '_blank' || href.startsWith('http') || href.startsWith('//') || href.startsWith('../')) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (href.startsWith('?') || href.startsWith('./?') || href === './' || href === '.') {
      e.preventDefault();
      const cleanUrl = href.replace(/^\.\//, '');
      window.history.pushState({}, '', cleanUrl || './');
      renderApp();
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

  });

  // Browser Back/Forward Navigation
  window.addEventListener('popstate', () => {
    renderApp();
  });

  // Expose global staff management hooks
  window.dfOpenEditStaffModal = openEditStaffModal;
  window.dfOpenCreateStaffModal = openCreateStaffModal;
  window.navigateTo = navigateTo;
  window.renderApp = renderApp;
  window.dismissBootLoader = dismissBootLoader;

  // Initial Boot: execute immediately if #app is present, otherwise wait for DOMContentLoaded
  if (document.getElementById('app')) {
    renderApp();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      renderApp();
    });
  }


})();
