/**
 * ==============================================================================
 * DineFlow — Core Application Engine
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
      'cat-beverages': { icon: '🍹', label: 'Craft Beverage', g1: '#0e222a', g2: '#061116', accent: '#06B6D4' }
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

  // Sounds (Web Audio Synthesizer chimes with zero external audio assets!)
  const SoundFX = {
    ctx: null,
    init() {
      try {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
      } catch (e) { }
    },
    chime(type = 'success') {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'success') {
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
          osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
        } else if (type === 'alert') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        }
      } catch (e) { }
    }
  };

  // Toast Notification
  function showToast(message, icon = '✓') {
    let container = document.getElementById('df-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'df-toast-container';
      container.className = 'df-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'df-toast';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // Router Parser
  function parseRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/');

    // Handle /hub (Platform Showcase & Role Selector)
    if (parts[0] === 'hub' || parts[0] === '') {
      return { view: 'hub' };
    }

    // Handle /login
    if (parts[0] === 'login') {
      return { view: 'login', target: parts[1] || 'admin' };
    }

    // Handle /logout
    if (parts[0] === 'logout') {
      return { view: 'logout' };
    }

    // Handle /r/:slug/t/:tableId
    if (parts[0] === 'r' && parts[1]) {
      const tenantSlug = parts[1];
      const tableId = parts[2] === 't' && parts[3] ? parts[3] : 'T12';
      return { view: 'customer', tenantSlug, tableId };
    }

    // Admin Portals
    if (parts[0] === 'admin') {
      return { view: 'admin' };
    }
    if (parts[0] === 'super-admin') {
      return { view: 'super-admin' };
    }
    if (parts[0] === 'onboarding') {
      return { view: 'onboarding' };
    }

    // Default Route: Platform Showcase Hub
    return { view: 'hub' };
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
    let el = document.getElementById('df-floating-demo-bar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'df-floating-demo-bar';
      el.className = 'df-floating-demo-bar';
      document.body.appendChild(el);
    }
    el.style.display = 'block';
    el.innerHTML = `
      <div class="df-demo-bar-inner">
        <a href="#/hub" class="df-demo-bar-brand" title="Back to DineFlow Showcase Hub">
          <span class="live-dot"></span>
          <span>DineFlow Hub ↗</span>
        </a>
        <div class="df-demo-bar-links">
          <a href="#/r/the-urban-plate/t/T12" class="df-demo-link ${activeView === 'customer' ? 'active' : ''}" title="Guest QR Menu (Table T12)">
            <span>📱 Guest T12</span>
          </a>
          <a href="#/login" class="df-demo-link ${activeView === 'login' ? 'active' : ''}" title="Staff & Admin Login Portal">
            <span>🔐 Login</span>
          </a>
          <a href="#/admin" class="df-demo-link ${activeView === 'admin' ? 'active' : ''}" title="Kitchen Staff OS & KDS">
            <span>👨‍🍳 Staff OS</span>
          </a>
          <a href="#/super-admin" class="df-demo-link ${activeView === 'super-admin' ? 'active' : ''}" title="Platform Super Admin">
            <span>⚡ SaaS HQ</span>
          </a>
        </div>
      </div>
    `;
  }

  function removeFloatingRoleSwitcher() {
    const el = document.getElementById('df-floating-demo-bar');
    if (el) el.style.display = 'none';
  }

  // ==============================================================================
  // VIEW RENDERERS & ROUTE GUARDS
  // ==============================================================================

  function renderApp() {
    state = DineFlowStore.get();
    const route = parseRoute();
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const isStaffAuth = state.session && state.session.isAuthenticated && (state.session.role === 'RESTAURANT_ADMIN' || state.session.role === 'SUPER_ADMIN');
    const isSuperAuth = state.session && state.session.isAuthenticated && state.session.role === 'SUPER_ADMIN';

    if (route.view === 'hub') {
      removeFloatingRoleSwitcher();
      renderShowcaseHubView(appEl);
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
      SoundFX.chime('alert');
      showToast('Logged out of operations session.', '🔒');
      window.location.hash = '#/login';
      return;
    } else if (route.view === 'login') {
      renderLoginView(appEl, route.target === 'super-admin' ? '#/super-admin' : '#/admin');
      renderFloatingRoleSwitcher('login');
    } else if (route.view === 'admin') {
      if (!isStaffAuth) {
        removeFloatingRoleSwitcher();
        renderLoginView(appEl, '#/admin', 'RESTAURANT_ADMIN');
        return;
      }
      const tenant = getCurrentTenant();
      applyTenantBranding(tenant);
      renderAdminView(appEl, tenant);
      renderFloatingRoleSwitcher('admin');
    } else if (route.view === 'super-admin') {
      if (!isSuperAuth) {
        removeFloatingRoleSwitcher();
        renderLoginView(appEl, '#/super-admin', 'SUPER_ADMIN');
        return;
      }
      renderSuperAdminView(appEl);
      renderFloatingRoleSwitcher('super-admin');
    } else if (route.view === 'onboarding') {
      if (!isSuperAuth) {
        removeFloatingRoleSwitcher();
        renderLoginView(appEl, '#/onboarding', 'SUPER_ADMIN');
        return;
      }
      renderOnboardingView(appEl);
      removeFloatingRoleSwitcher();
    }
  }

  // ------------------------------------------------------------------------------
  // 00. INTERACTIVE PLATFORM SHOWCASE HUB VIEW (#/hub)
  // ------------------------------------------------------------------------------
  function renderShowcaseHubView(container) {
    document.title = 'DineFlow — QR Restaurant SaaS Platform Showcase & Operations Hub';

    container.innerHTML = `
      <header class="df-topbar df-hub-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon" style="background: linear-gradient(135deg, #E5A93C, #FF5E3A); color: #fff;">🍽️</div>
          <div class="df-brand-text">
            <h1>DineFlow &mdash; QR Restaurant SaaS</h1>
            <span class="df-brand-tagline">Multi-Tenant Hospitality Ecosystem &bull; Real-Time Operations</span>
          </div>
        </div>
        <div class="df-top-actions">
          <a href="../#projects" class="df-pill-btn" title="Back to Debashish Paul Portfolio">
            <span>← Back to Portfolio</span>
          </a>
          <a href="#/admin" class="df-pill-btn primary" title="Staff OS Login">
            <span>Staff Portal 🔒</span>
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
            Choose an interactive portal below to test the full lifecycle in real-time with cross-tab live synchronization:
          </p>
        </div>

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
              <a href="#/r/the-urban-plate/t/T12" class="df-pill-btn primary" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700;">
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
              <a href="#/admin" class="df-pill-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700; background: rgba(229,169,60,0.15); border-color: var(--brand-primary); color: #fff;">
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
              <a href="#/super-admin" class="df-pill-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700; background: rgba(99,102,241,0.15); border-color: #818CF8; color: #fff;">
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
            <a href="#/r/the-urban-plate/t/T12" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
              <span>Window 1: Guest T12 ↗</span>
            </a>
            <a href="#/admin" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
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
  function renderLoginView(container, redirectTarget = '#/admin', requestedRole = 'RESTAURANT_ADMIN') {
    let currentAuthMode = 'pin'; // 'pin' | 'password'
    let enteredPin = '';

    const targetTenant = getCurrentTenant();

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
      state.session = {
        isAuthenticated: true,
        role: account.role,
        user: account,
        tenantId: account.tenantId || 'the-urban-plate'
      };
      if (account.tenantId) {
        state.currentTenantId = account.tenantId;
      }
      DineFlowStore.save(state);
      SoundFX.chime('success');
      showToast(`Welcome, ${account.name}! Authenticated as ${account.roleTitle}`, account.avatarEmoji || '🔑');

      const targetHash = (account.role === 'SUPER_ADMIN') ? '#/super-admin' : '#/admin';

      setTimeout(() => {
        window.location.hash = targetHash;
        renderApp();
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
      if (match) {
        authenticateUser(match);
      } else {
        SoundFX.chime('alert');
        triggerShake();
        showToast('Invalid PIN. Demo PINs: 1234 (Staff) or 9999 (Super Admin)', '❌');
        enteredPin = '';
        updatePinDots();
      }
    }

    document.title = 'DineFlow — Operations & Staff Login Gateway';

    container.innerHTML = `
      <header class="df-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon" style="background: linear-gradient(135deg, #E5A93C, #F59E0B); color: #000;">🔐</div>
          <div class="df-brand-text">
            <h1>DineFlow Operations Gateway</h1>
            <span class="df-brand-tagline">Secure Role-Based Access for Kitchen, Floor &amp; Super Admin</span>
          </div>
        </div>
        <div class="df-top-actions">
          <a href="#/r/${targetTenant.slug}/t/T12" class="df-pill-btn" title="Return to Guest Ordering">
            <span>← Guest Dining</span>
          </a>
        </div>
      </header>

      <main class="df-login-container">
        <div class="df-login-card">
          <div class="df-login-header">
            <div class="df-login-icon-badge">🛡️</div>
            <h2 class="df-login-title">Operations Portal</h2>
            <p class="df-login-subtitle">
              Sign in to manage live orders, Kitchen Display System (KDS), or SaaS platform controls.
            </p>
          </div>

          <!-- Quick 1-Click Demo Profiles -->
          <div class="df-demo-box">
            <div class="df-demo-box-label">
              <span>⚡ One-Click Instant Demo Access</span>
              <span style="font-size: 0.65rem; color: var(--text-dim);">No typing needed</span>
            </div>
            <div class="df-demo-profile-btns">
              <button class="df-demo-btn btn-quick-login" data-pin="1234" title="Login as The Urban Plate Manager">
                <div class="df-demo-btn-info">
                  <span class="df-demo-btn-emoji">👨‍🍳</span>
                  <div>
                    <div class="df-demo-btn-title">Restaurant Staff / Kitchen OS</div>
                    <div class="df-demo-btn-sub">The Urban Plate • Kitchen Kanban &amp; Tables</div>
                  </div>
                </div>
                <div class="df-demo-btn-pin">PIN: 1234</div>
              </button>

              <button class="df-demo-btn btn-quick-login" data-pin="9999" title="Login as Platform Super Admin">
                <div class="df-demo-btn-info">
                  <span class="df-demo-btn-emoji">⚡</span>
                  <div>
                    <div class="df-demo-btn-title">SaaS Platform Super Admin</div>
                    <div class="df-demo-btn-sub">Multi-Tenant HQ • Analytics &amp; Onboarding</div>
                  </div>
                </div>
                <div class="df-demo-btn-pin">PIN: 9999</div>
              </button>

              <button class="df-demo-btn btn-quick-login" data-pin="5678" title="Login as Bella Vista Floor Manager">
                <div class="df-demo-btn-info">
                  <span class="df-demo-btn-emoji">🍕</span>
                  <div>
                    <div class="df-demo-btn-title">Bella Vista Trattoria Staff</div>
                    <div class="df-demo-btn-sub">Park Street Branch • POS &amp; Dining Room</div>
                  </div>
                </div>
                <div class="df-demo-btn-pin">PIN: 5678</div>
              </button>
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
              You can also use physical keyboard numbers to enter PIN
            </p>
          </div>

          <!-- Email & Password Mode -->
          <form id="df-password-view" class="df-login-form" style="${currentAuthMode === 'password' ? '' : 'display: none;'}" onsubmit="return false;">
            <div class="df-form-field">
              <label>Staff / Admin Email</label>
              <input type="email" id="login-email" placeholder="manager@theurbanplate.in" value="manager@theurbanplate.in" required>
            </div>
            <div class="df-form-field">
              <label>Password</label>
              <input type="password" id="login-password" placeholder="••••••••" value="admin" required>
            </div>
            <button class="df-pill-btn primary" id="btn-submit-password" style="width: 100%; justify-content: center; padding: 0.85rem; font-weight: 700;">
              Authenticate &amp; Enter Dashboard →
            </button>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim);">
            <span>🔒 Role-Based Access Control Protected</span>
            <a href="#/r/the-urban-plate/t/T12" style="color: var(--brand-primary); text-decoration: none; font-weight: 600;">Guest Menu</a>
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
      const match = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
      if (match) {
        authenticateUser(match);
      } else {
        SoundFX.chime('alert');
        showToast('Invalid credentials. Check email or use 1-Click Demo above', '❌');
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
    };
    window.addEventListener('hashchange', cleanup);
  }

  // ------------------------------------------------------------------------------
  // 1. CUSTOMER EXPERIENCE VIEW
  // ------------------------------------------------------------------------------
  function renderCustomerView(container, tenantSlug, tableId) {
    const tenant = getCurrentTenant(tenantSlug);
    const table = state.tables.find(t => t.id === tableId) || { id: tableId, name: `Table ${tableId}`, section: 'Indoor' };
    const offers = state.offers.filter(o => o.isActive);

    // Calculate cart item count
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Filter categories & menu items
    const tenantCategories = state.categories.filter(c => c.tenantId === tenant.id);
    let items = state.menuItems.filter(item => item.tenantId === tenant.id && item.isAvailable);

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
        <div class="df-top-actions">
          <button class="df-pill-btn" id="btn-call-staff-top">
            <span>🔔</span> Staff
          </button>
          <a href="#/admin" class="df-pill-btn primary" title="Open Restaurant Kitchen / Admin Portal">
            <span>Staff Portal ↗</span>
          </a>
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
                  <span>📍 ${table.section}</span>
                  <span>•</span>
                  <span>📶 Free Guest Wi-Fi: <strong>${tenant.wifiName}</strong></span>
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
            <button class="df-action-card" id="act-call-staff">
              <span class="df-action-icon">🔔</span>
              <span class="df-action-label">Call Staff</span>
            </button>
            <button class="df-action-card" id="act-track-orders">
              <span class="df-action-icon">📋</span>
              <span class="df-action-label">My Orders</span>
            </button>
            <button class="df-action-card" id="act-request-bill">
              <span class="df-action-icon">💳</span>
              <span class="df-action-label">Request Bill</span>
            </button>
          </div>

          <!-- Search & Veg Toggle -->
          <div class="df-search-wrapper">
            <div class="df-search-box">
              <span class="df-search-icon">🔍</span>
              <input type="text" id="df-search-input" class="df-search-input" placeholder="Search dishes, biryani, pizzas, desserts..." value="${searchQuery}">
              <span class="df-search-clear ${searchQuery ? 'active' : ''}" id="df-search-clear">✕</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.65rem;">
              <span style="font-size: 0.78rem; color: var(--text-muted);">
                Showing <strong>${items.length}</strong> delicacies
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
              <h3>${currentFilterCategory === 'all' ? 'Signature Menu' : tenantCategories.find(c => c.id === currentFilterCategory)?.name || 'Menu'}</h3>
              <span class="df-section-count">${items.length} items</span>
            </div>

            <div class="df-food-list">
              ${items.length ? items.map(item => {
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
              }).join('') : `
                <div style="text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
                  <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍽️</div>
                  <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.35rem;">No dishes match your filter</h4>
                  <p style="font-size: 0.85rem;">Try clearing your search query or toggling filters.</p>
                </div>
              `}
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
              <a href="../#projects" class="df-back-portfolio-btn" title="Return to Debashish Paul Portfolio">
                <span>← Back to Portfolio</span>
              </a>
            </div>

            <div class="df-footer-divider"></div>

            <div class="df-footer-bottom">
              <div class="df-footer-credit">
                Designed &amp; Engineered by <a href="../" class="df-credit-link">Debashish Paul</a>
              </div>
              <div class="df-footer-tech">
                <span>DineFlow Platform</span> • <span>QR Dining Experience</span>
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
        <h2 style="font-size: 1.85rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">
          Welcome to ${tenant.name}
        </h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 300px;">
          ${tenant.tagline}
        </p>
        <div class="df-splash-table-badge">
          <span>📍 Table ${table.id}</span>
          <span>•</span>
          <span>${table.section}</span>
        </div>
        <button class="df-splash-btn" id="btn-enter-menu">
          Explore Digital Menu ↗
        </button>
        <p style="font-size: 0.72rem; color: var(--text-dim); margin-top: 1.5rem;">
          Instant QR Dining Experience • Powered by DineFlow
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
      enterBtn.addEventListener('click', () => {
        splash.classList.add('hidden');
        sessionStorage.setItem('df_splash_dismissed', 'true');
        SoundFX.chime('success');
      });
    }

    // Category Tabs
    document.querySelectorAll('.df-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilterCategory = btn.getAttribute('data-cat');
        renderApp();
      });
    });

    // Search Input
    const searchInput = document.getElementById('df-search-input');
    const searchClear = document.getElementById('df-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.classList.toggle('active', searchQuery.length > 0);
        }
        renderApp();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchQuery = '';
        renderApp();
      });
    }

    // Veg Only Filter
    const vegBtn = document.getElementById('btn-toggle-veg');
    if (vegBtn) {
      vegBtn.addEventListener('click', () => {
        vegOnlyFilter = !vegOnlyFilter;
        renderApp();
      });
    }

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
            // Open modal to choose customizations
            openFoodDetailModal(item, tenant);
          } else {
            addToCart(item, 1, {}, '');
            SoundFX.chime('success');
            showToast(`Added ${item.name} to cart`);
            renderApp();
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
          renderApp();
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
          renderApp();
        }
      });
    });

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

        const newOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          tenantId: tenant.id,
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
        const targetTable = state.tables.find(t => t.id === table.id);
        if (targetTable) {
          targetTable.status = 'occupied';
          targetTable.qrScans++;
          targetTable.lastScanned = 'Just now';
        }

        // Save state and notify cross-tabs
        DineFlowStore.save(state, {
          action: 'NEW_ORDER',
          source: 'customer',
          orderId: newOrder.id,
          tableId: table.id,
          customerName: newOrder.customerName
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

        state.staffRequests.unshift({
          id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
          tableId: table.id,
          type,
          label,
          status: 'PENDING',
          time: 'Just now'
        });

        DineFlowStore.save(state, {
          action: 'STAFF_CALL',
          source: 'customer',
          tableId: table.id,
          requestLabel: label
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

    // Find table active orders
    const tableOrders = state.orders.filter(o => o.tableId === table.id && o.tenantId === tenant.id);
    const totalAmount = tableOrders.reduce((acc, o) => acc + o.total, 0) || 1161.6;

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
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
              <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Total Table Balance</span>
              <div style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-heading); color: var(--brand-primary); margin: 0.25rem 0 0.5rem;">
                ${tenant.currency}${totalAmount.toFixed(2)}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Includes 5% GST and 5% Service Charge</p>
            </div>

            <h4 class="df-option-title">Select Preferred Payment Mode</h4>
            <div class="df-choice-list" style="margin-bottom: 1.5rem;">
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
            <div id="upi-qr-preview-box" style="text-align: center; margin-bottom: 1.5rem; background: #fff; padding: 1.25rem; border-radius: 16px; color: #0b0f17;">
              <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a;">Scan to Pay via Any UPI App</div>
              <div id="upi-qr-holder" style="width: 160px; height: 160px; margin: 0 auto;"></div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">UPI ID: <strong>urbanplate@hdfcbank</strong></div>
            </div>

            <button class="df-splash-btn" id="btn-submit-bill-req" style="width: 100%; text-align: center; padding: 0.95rem;">
              Send Bill Request to Staff 💳
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

    document.getElementById('btn-submit-bill-req')?.addEventListener('click', () => {
      state.billRequests.unshift({
        id: `BILL-${Math.floor(100 + Math.random() * 900)}`,
        tableId: table.id,
        amount: totalAmount,
        paymentMethod: selectedPayment,
        status: 'PENDING',
        time: 'Just now'
      });

      DineFlowStore.save(state, {
        action: 'BILL_REQUEST',
        source: 'customer',
        tableId: table.id
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
      state.reviews.unshift({
        id: `rev-${Date.now()}`,
        customerName: 'Guest Diner',
        ratingOverall: ratings.overall,
        ratingFood: ratings.food,
        ratingService: ratings.service,
        ratingAmbience: ratings.ambience,
        comment,
        tableId: table.id,
        date: 'Just now'
      });

      DineFlowStore.save(state);
      SoundFX.chime('success');
      modalContainer.innerHTML = '';
      showToast('Thank you for your generous feedback!', '⭐');
    });
  }

  // ------------------------------------------------------------------------------
  // 2. RESTAURANT ADMIN PORTAL VIEW
  // ------------------------------------------------------------------------------
  function renderAdminView(container, tenant) {
    const todayOrdersCount = state.orders.length;
    const todayRevenue = state.orders.reduce((acc, o) => acc + o.total, 0);
    const activeTablesCount = state.tables.filter(t => t.status === 'occupied').length;
    const pendingOrders = state.orders.filter(o => o.status === 'RECEIVED' || o.status === 'CONFIRMED' || o.status === 'PREPARING');
    const pendingCalls = state.staffRequests.filter(r => r.status === 'PENDING').length;
    const pendingBills = state.billRequests.filter(b => b.status === 'PENDING').length;

    container.innerHTML = `
      <!-- Admin Topbar -->
      <header class="df-topbar df-staff-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon">${tenant.logoEmoji || '🍽️'}</div>
          <div class="df-brand-text">
            <h1 title="${tenant.name} Staff OS">${tenant.name} &mdash; Staff OS</h1>
            <span class="df-brand-tagline">${tenant.branch}</span>
          </div>
        </div>
        <div class="df-top-actions">
          <div class="df-session-status-badge" title="Active Session: ${state.session?.user?.roleTitle || 'Staff Member'}">
            <span>${state.session?.user?.avatarEmoji || '👨‍🍳'}</span>
            <span style="font-weight: 600; color: #fff;">${state.session?.user?.name || 'Staff User'}</span>
            <span class="df-role-tag">${state.session?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'STAFF'}</span>
          </div>
          <a href="#/r/${tenant.slug}/t/T12" target="_blank" class="df-pill-btn" title="Open Customer View for Table T12">
            <span>Customer QR ↗</span>
          </a>
          <a href="#/super-admin" class="df-pill-btn" title="Super Admin Platform">
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
            <button class="df-admin-nav-item ${currentAdminTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <span>⚙️</span> Restaurant Branding
            </button>
          </aside>

          <!-- Main Content Area -->
          <section class="df-admin-main" id="admin-main-content">
            <!-- Top Metric Stat Cards -->
            <div class="df-stats-grid">
              <div class="df-stat-card">
                <span class="df-stat-label">Today's Revenue</span>
                <div class="df-stat-val">${tenant.currency}${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <span class="df-stat-change">↑ +14.2% from yesterday</span>
              </div>
              <div class="df-stat-card">
                <span class="df-stat-label">Total Orders</span>
                <div class="df-stat-val">${todayOrdersCount}</div>
                <span class="df-stat-change">↑ 84 QR scans today</span>
              </div>
              <div class="df-stat-card">
                <span class="df-stat-label">Active Tables</span>
                <div class="df-stat-val">${activeTablesCount} / ${state.tables.length}</div>
                <span class="df-stat-change" style="color: var(--brand-primary);">${((activeTablesCount / state.tables.length) * 100).toFixed(0)}% Occupancy</span>
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
            <footer class="df-admin-footer" style="margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div style="font-size: 0.82rem; color: var(--text-dim);">
                Designed &amp; Engineered by <a href="../" class="df-credit-link" style="color: var(--brand-primary); font-weight: 700;">Debashish Paul</a> • DineFlow Restaurant OS
              </div>
              <a href="../#projects" class="df-back-portfolio-btn">
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Live Kitchen Display System (KDS)</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time status changes sync live to the customer's phone screen.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="df-pill-btn" id="btn-admin-refresh">🔄 Refresh Feed</button>
        </div>
      </div>

      <div class="df-kanban-board">
        ${cols.map(col => {
          const orders = state.orders.filter(o => o.status === col.key || (col.key === 'RECEIVED' && o.status === 'CONFIRMED'));
          return `
            <div class="df-kanban-col">
              <div class="df-kanban-col-header">
                <span class="df-kanban-col-title" style="color: ${col.color};">${col.title}</span>
                <span style="font-size: 0.8rem; font-weight: 800; background: rgba(255,255,255,0.08); padding: 0.15rem 0.5rem; border-radius: 99px;">
                  ${orders.length}
                </span>
              </div>
              <div class="df-kanban-cards">
                ${orders.length ? orders.map(order => `
                  <div class="df-order-admin-card">
                    <div class="df-order-card-header">
                      <span class="df-order-card-table">Table ${order.tableId}</span>
                      <span style="font-size: 0.72rem; color: var(--text-dim); font-weight: 700;">#${order.id}</span>
                    </div>
                    <div style="font-size: 0.82rem; font-weight: 700; color: #fff;">
                      ${order.customerName}
                    </div>
                    <div class="df-order-items-snippet">
                      ${order.items.map(it => `
                        <div>• ${it.quantity} × ${it.name} ${it.customizations?.spice ? `(${it.customizations.spice})` : ''}</div>
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
                `).join('') : `
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

    document.querySelectorAll('.btn-status-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        const nextStatus = btn.getAttribute('data-next');
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = nextStatus;
          DineFlowStore.save(state, {
            action: 'ORDER_STATUS_CHANGED',
            source: 'staff',
            orderId: order.id,
            newStatus: nextStatus,
            tableId: order.tableId
          });
          SoundFX.chime('success');
          showToast(`Order #${orderId} moved to ${nextStatus}`);
          renderKitchenKanban(container, tenant);
        }
      });
    });

    document.getElementById('btn-admin-refresh')?.addEventListener('click', () => {
      renderKitchenKanban(container, tenant);
      showToast('Kitchen feed refreshed');
    });
  }

  // TABLES & QR CODE MANAGEMENT
  function renderTablesAndQRs(container, tenant) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Table Management & QR Tent Cards</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Generate, preview, download, and print table tent cards with unique QR URLs.</p>
        </div>
        <button class="df-pill-btn primary" id="btn-add-table">
          + Add New Table
        </button>
      </div>

      <div class="df-tables-grid">
        ${state.tables.map(table => {
          // Construct target URL for table
          const tableUrl = `${window.location.origin}${window.location.pathname}#/r/${tenant.slug}/t/${table.id}`;
          return `
            <div class="df-table-admin-card">
              <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff;">${table.name}</h4>
                <span class="df-micro-badge ${table.status === 'occupied' ? 'bestseller' : 'chef'}" style="text-transform: uppercase;">
                  ${table.status}
                </span>
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

              <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: 0.35rem;">
                <button class="df-pill-btn btn-view-tent" data-id="${table.id}" style="flex: 1; font-size: 0.72rem; padding: 0.35rem; justify-content: center;">
                  🖨️ Print Tent
                </button>
                <a href="#/r/${tenant.slug}/t/${table.id}" target="_blank" class="df-pill-btn primary" style="font-size: 0.72rem; padding: 0.35rem 0.65rem;" title="Test Customer Experience">
                  ↗
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Generate real QR codes into each table preview box
    state.tables.forEach(table => {
      const el = document.getElementById(`qr-table-${table.id}`);
      if (el && window.DineFlowQR) {
        const tableUrl = `${window.location.origin}${window.location.pathname}#/r/${tenant.slug}/t/${table.id}`;
        el.innerHTML = window.DineFlowQR.generateSVG(tableUrl, { size: 140, darkColor: '#0f172a' });
      }
    });

    // View & Print Tent Card
    document.querySelectorAll('.btn-view-tent').forEach(btn => {
      btn.addEventListener('click', () => {
        const tableId = btn.getAttribute('data-id');
        const table = state.tables.find(t => t.id === tableId);
        if (table) openPrintTentModal(table, tenant);
      });
    });

    // Add Table
    document.getElementById('btn-add-table')?.addEventListener('click', () => {
      const nextId = `T${String(state.tables.length + 1).padStart(2, '0')}`;
      state.tables.push({
        id: nextId,
        name: `Table ${nextId}`,
        section: 'Indoor AC Dining',
        capacity: 4,
        status: 'available',
        qrScans: 0,
        lastScanned: 'Never'
      });
      DineFlowStore.save(state);
      SoundFX.chime('success');
      showToast(`Added ${nextId} to tables grid`);
      renderTablesAndQRs(container, tenant);
    });
  }

  // PRINTABLE TABLE TENT CARD MODAL
  function openPrintTentModal(table, tenant) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const tableUrl = `${window.location.origin}${window.location.pathname}#/r/${tenant.slug}/t/${table.id}`;

    modalContainer.innerHTML = `
      <div class="df-modal-backdrop active" id="tent-backdrop">
        <div class="df-bottom-sheet" style="max-width: 480px; align-self: center; border-radius: 24px; padding-bottom: 1.5rem;">
          <div class="df-sheet-header">
            <h3 style="font-size: 1.1rem; font-weight: 700;">Printable Table Tent Stand Card</h3>
            <button class="df-sheet-close" id="btn-close-tent">✕</button>
          </div>

          <div class="df-sheet-body">
            <!-- Physical Tent Stand Card Layout -->
            <div class="df-print-tent-card" id="printable-tent-card">
              <div class="df-print-tent-header">
                <h2>${tenant.name}</h2>
                <p>${tenant.tagline}</p>
              </div>

              <div class="df-print-table-tag">
                TABLE ${table.id}
              </div>

              <div class="df-print-qr-holder" id="print-qr-svg-box">
                <!-- SVG QR -->
              </div>

              <div class="df-print-instructions">
                Scan • Browse • Order • Enjoy
              </div>
              <div style="font-size: 0.7rem; color: #64748b; margin-top: 0.65rem;">
                Free Guest Wi-Fi: <strong>${tenant.wifiName}</strong> (Pass: ${tenant.wifiPass})
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
              <button class="df-splash-btn" id="btn-trigger-print" style="flex: 1; padding: 0.85rem; font-size: 0.9rem; text-align: center;">
                🖨️ Print Card
              </button>
              <button class="df-pill-btn" id="btn-download-qr-png" style="padding: 0.85rem 1.25rem; font-size: 0.85rem;">
                📥 Save PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const svgBox = document.getElementById('print-qr-svg-box');
    if (svgBox && window.DineFlowQR) {
      svgBox.innerHTML = window.DineFlowQR.generateSVG(tableUrl, { size: 190, darkColor: '#0b0f17' });
    }

    document.getElementById('btn-close-tent')?.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.getElementById('btn-trigger-print')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-download-qr-png')?.addEventListener('click', () => {
      if (window.DineFlowQR) {
        const dataUrl = window.DineFlowQR.getDataURL(tableUrl, { size: 600 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${tenant.slug}-Table-${table.id}-QR.png`;
        a.click();
        showToast('High-Res QR PNG Downloaded');
      }
    });
  }

  // MENU MANAGER (CRUD)
  function renderMenuManager(container, tenant) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Digital Menu Catalog (${state.menuItems.length} Dishes)</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Manage categories, real-time pricing, stock availability, and chef specials.</p>
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
            ${state.menuItems.map(item => `
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
          DineFlowStore.save(state);
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
        DineFlowStore.save(state);
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
                    ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
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

      state.menuItems.unshift({
        id: `item-${Date.now()}`,
        tenantId: tenant.id,
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
      });

      DineFlowStore.save(state);
      SoundFX.chime('success');
      modalContainer.innerHTML = '';
      showToast(`Added ${name} to digital menu!`);
      if (onComplete) onComplete();
    });
  }

  // SERVICE REQUESTS FEED
  function renderStaffRequestsFeed(container, tenant) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Table Service & Call Staff Notifications</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time alerts triggered by diners requesting waiter, water, cutlery, or napkins.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${state.staffRequests.map(req => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(229,169,60,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                ${req.type === 'WATER' ? '💧' : req.type === 'CUTLERY' ? '🍴' : req.type === 'NAPKINS' ? '🧻' : '🔔'}
              </div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: #fff;">Table ${req.tableId} &mdash; ${req.label}</h4>
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
        `).join('')}
      </div>
    `;

    document.querySelectorAll('.btn-resolve-call').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const r = state.staffRequests.find(req => req.id === id);
        if (r) {
          r.status = 'ATTENDED';
          DineFlowStore.save(state);
          SoundFX.chime('success');
          showToast(`Staff marked attending Table ${r.tableId}`);
          renderStaffRequestsFeed(container, tenant);
        }
      });
    });
  }

  // BILL REQUESTS FEED
  function renderBillRequestsFeed(container, tenant) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800;">Incoming Bill Requests</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Tables ready for payment and receipt generation.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${state.billRequests.map(bill => `
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
                <button class="df-pill-btn primary btn-settle-bill" data-id="${bill.id}">
                  Mark Paid & Clear Table
                </button>
              ` : `
                <span style="font-size: 0.8rem; color: #10B981; font-weight: 700;">Paid & Settled ✓</span>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.querySelectorAll('.btn-settle-bill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const b = state.billRequests.find(req => req.id === id);
        if (b) {
          b.status = 'PAID';
          const table = state.tables.find(t => t.id === b.tableId);
          if (table) table.status = 'available';
          DineFlowStore.save(state);
          SoundFX.chime('success');
          showToast(`Table ${b.tableId} bill settled and table cleared!`);
          renderBillRequestsFeed(container, tenant);
        }
      });
    });
  }

  // OFFERS & COUPONS MANAGER
  function renderOffersManager(container, tenant) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">Promotional Offers & Digital Coupons</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Configure discount rules, flat discounts, and category coupons for mobile diners.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        ${state.offers.map(off => `
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
    `;

    document.getElementById('btn-save-branding')?.addEventListener('click', () => {
      tenant.name = document.getElementById('cfg-name')?.value.trim() || tenant.name;
      tenant.tagline = document.getElementById('cfg-tagline')?.value.trim() || tenant.tagline;
      tenant.primaryColor = document.getElementById('cfg-primary-color')?.value || tenant.primaryColor;
      tenant.currency = document.getElementById('cfg-currency')?.value.trim() || tenant.currency;
      tenant.taxRate = parseFloat(document.getElementById('cfg-tax')?.value) || 5;
      tenant.serviceChargeRate = parseFloat(document.getElementById('cfg-service')?.value) || 5;
      tenant.wifiName = document.getElementById('cfg-wifi-name')?.value.trim() || tenant.wifiName;
      tenant.wifiPass = document.getElementById('cfg-wifi-pass')?.value.trim() || tenant.wifiPass;

      DineFlowStore.save(state);
      applyTenantBranding(tenant);
      SoundFX.chime('success');
      showToast('Branding updated and published live!');
    });

    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      state.session = {
        isAuthenticated: false,
        role: 'CUSTOMER',
        user: null,
        tenantId: tenant.slug
      };
      DineFlowStore.save(state);
      SoundFX.chime('alert');
      showToast('Signed out of Staff OS. Session secured.', '🔒');
      window.location.hash = '#/login';
    });
  }

  // ------------------------------------------------------------------------------
  // 3. SUPER ADMIN PLATFORM VIEW (Multi-Tenant Overview)
  // ------------------------------------------------------------------------------
  function renderSuperAdminView(container) {
    document.title = 'DineFlow — Platform Super Admin Operations & Analytics';
    state = DineFlowStore.get();
    const tenantsList = state.tenants ? Object.values(state.tenants) : [];
    const totalOrdersRev = (state.orders || []).reduce((a, b) => a + (b.total || 0), 0);

    container.innerHTML = `
      <header class="df-topbar">
        <div class="df-brand-badge">
          <div class="df-brand-icon" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">⚡</div>
          <div class="df-brand-text">
            <h1>DineFlow Platform Super Admin</h1>
            <span class="df-brand-tagline">Multi-Tenant SaaS Operations & Subscription Hub</span>
          </div>
        </div>
        <div class="df-top-actions">
          <div class="df-session-status-badge" style="border-color: rgba(99, 102, 241, 0.35); background: rgba(99, 102, 241, 0.08);">
            <span>⚡</span>
            <span style="font-weight: 600; color: #fff;">${state.session?.user?.name || 'Super Admin'}</span>
            <span class="df-role-tag" style="background: rgba(99, 102, 241, 0.2); color: #818CF8;">PLATFORM HQ</span>
          </div>
          <a href="#/onboarding" class="df-pill-btn primary">
            + Onboard Restaurant
          </a>
          <a href="#/admin" class="df-pill-btn">
            Restaurant OS
          </a>
          <button id="btn-superadmin-logout" class="df-pill-btn danger" title="Sign Out of Super Admin" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.08);">
            <span>🔒 Logout</span>
          </button>
        </div>
      </header>

      <main class="df-superadmin-layout" style="padding-top: 96px; padding-bottom: 4rem; padding-left: 2rem; padding-right: 2rem; max-width: 1280px; margin: 0 auto; width: 100%; min-height: 100vh; box-sizing: border-box;">
        <div class="df-stats-grid" style="margin-bottom: 2rem;">
          <div class="df-stat-card">
            <span class="df-stat-label">Total Restaurants</span>
            <div class="df-stat-val">${tenantsList.length}</div>
            <span class="df-stat-change">Active Partners</span>
          </div>
          <div class="df-stat-card">
            <span class="df-stat-label">Platform GMV (Processed)</span>
            <div class="df-stat-val">₹${(totalOrdersRev * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <span class="df-stat-change">↑ +28% YoY Growth</span>
          </div>
          <div class="df-stat-card">
            <span class="df-stat-label">Total QR Scans</span>
            <div class="df-stat-val">12,480</div>
            <span class="df-stat-change">Across all tables</span>
          </div>
          <div class="df-stat-card">
            <span class="df-stat-label">SaaS MRR</span>
            <div class="df-stat-val">₹45,000</div>
            <span class="df-stat-change">3 Active Subscriptions</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.35rem; font-weight: 800;">Managed Restaurant Partners</h2>
          <a href="#/onboarding" class="df-pill-btn primary">+ Launch 10-Step Onboarding</a>
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

              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                ${t.tagline}
              </p>

              <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                <button class="df-pill-btn primary btn-switch-tenant" data-slug="${t.slug}" style="flex: 1; justify-content: center; font-size: 0.78rem;">
                  Switch & Manage
                </button>
                <a href="#/r/${t.slug}/t/T12" target="_blank" class="df-pill-btn" style="font-size: 0.78rem;">
                  QR View ↗
                </a>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Super Admin Footer -->
        <footer class="df-superadmin-footer" style="margin-top: 3.5rem; padding-top: 1.75rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Designed &amp; Engineered by <a href="../" class="df-credit-link" style="color: var(--brand-primary); font-weight: 700;">Debashish Paul</a> • DineFlow SaaS Platform
          </div>
          <a href="../#projects" class="df-back-portfolio-btn">
            <span>← Back to Portfolio</span>
          </a>
        </footer>
      </main>
    `;

    document.querySelectorAll('.btn-switch-tenant').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-slug');
        state.currentTenantId = slug;
        DineFlowStore.save(state);
        window.location.hash = '#/admin';
        showToast(`Switched active tenant to ${state.tenants[slug].name}`);
      });
    });

    document.getElementById('btn-superadmin-logout')?.addEventListener('click', () => {
      state.session = {
        isAuthenticated: false,
        role: 'CUSTOMER',
        user: null,
        tenantId: 'the-urban-plate'
      };
      DineFlowStore.save(state);
      SoundFX.chime('alert');
      showToast('Signed out of Platform Super Admin.', '🔒');
      window.location.hash = '#/login';
    });
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
              <span class="df-brand-tagline">Step ${currentStep} of ${totalSteps} &mdash; ${stepTitles[currentStep - 1]}</span>
            </div>
          </div>
          <div class="df-top-actions">
            <a href="#/super-admin" class="df-pill-btn">✕ Exit</a>
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
          window.location.hash = '#/super-admin';
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

  // Cross-tab synchronization hook
  window.onDineFlowRemoteSync = function (event) {
    // 1. Sync in-memory state directly from broadcast payload or storage
    if (event && event.payload) {
      state = event.payload;
    } else {
      state = DineFlowStore.get();
    }

    const route = parseRoute();
    const meta = (event && event.meta) || {};

    if (route.view === 'admin') {
      const tenant = getCurrentTenant();

      // Audio notification for staff
      SoundFX.chime(meta.action === 'NEW_ORDER' ? 'alert' : 'chime');

      // Staff Toast
      if (meta.action === 'NEW_ORDER') {
        showToast(`New Order #${meta.orderId || ''} received from Table ${meta.tableId || ''}! 🛎️`, '📥');
      } else if (meta.action === 'STAFF_CALL') {
        showToast(`Table ${meta.tableId || ''} requests ${meta.requestLabel || 'Staff Assistance'}!`, '⚠️');
      } else if (meta.action === 'BILL_REQUEST') {
        showToast(`Table ${meta.tableId || ''} requested their bill!`, '💳');
      } else {
        showToast('Real-time order sync received from customer', '🔔');
      }

      // Re-render Admin View (updates metrics, kanban cards, and call counts instantly)
      const appEl = document.getElementById('app');
      if (appEl) {
        renderAdminView(appEl, tenant);
      }
    } else if (route.view === 'customer') {
      const tenant = getCurrentTenant(route.tenantSlug);
      const table = state.tables.find(t => t.id === route.tableId) || { id: route.tableId, name: `Table ${route.tableId}`, section: 'Indoor' };

      // Chime for customer
      SoundFX.chime('success');

      // Customer Toast
      if (meta.action === 'ORDER_STATUS_CHANGED') {
        const statusMap = {
          RECEIVED: 'Order Received by Kitchen 📥',
          CONFIRMED: 'Chef Confirmed your Order! 👨‍🍳',
          PREPARING: 'Now Cooking in the Kitchen! 🍳',
          READY: 'Plated & Ready for Delivery! 🔔',
          SERVED: 'Delivered to your Table! Enjoy! 🍽️',
          COMPLETED: 'Order Completed. Thank you! ⭐'
        };
        showToast(statusMap[meta.newStatus] || `Order #${meta.orderId}: ${meta.newStatus}`, '👨‍🍳');
      } else {
        showToast('Live order updates synced', '✓');
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
    } else {
      renderApp();
    }
  };

  // Register PWA Service Worker (Auto-checks for latest updates)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=1.6.0').then(reg => {
        reg.update();
      }).catch(err => {
        console.warn('Service Worker registration skipped', err);
      });
    });
  }

  // Initial Boot
  window.addEventListener('DOMContentLoaded', () => {
    // If no hash provided, route to Platform Showcase Hub
    if (!window.location.hash) {
      window.location.hash = '#/hub';
    } else {
      renderApp();
    }
  });

})();
