/**
 * Leaf & Life — Café & Bistro (Action Area III, New Town, Kolkata)
 * Unique Interactive Controller: Mood Switcher, Matchmaker, Chalkboard Docket & Live Ticket Engine
 * Designed & Engineered by Debashish Paul
 */

// =============================================================================
// ⚠️ MAINTENANCE MODE TOGGLE
// Set to `true` to activate the Maintenance Screen for all visitors.
// Set to `false` for normal live operation.
// =============================================================================
const MAINTENANCE_MODE = false;

if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
  window.location.replace('maintenance.html');
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileDrawer();
    initMoodSwitcher();
    initVibeMatchmaker();
    initBlackboardDocket();
    initLiveTicketPass();
    initModalControls();
    initSmoothScroll();
  });
}

/**
 * 1. Sticky Header Elevation on Scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 35) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Mobile Navigation Drawer
 */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggleBtn || !drawer) return;

  const toggleDrawer = (forceClose = false) => {
    const isOpen = forceClose ? false : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  const drawerLinks = drawer.querySelectorAll('.drawer-item');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(true));
  });

  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleDrawer(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleDrawer(true);
    }
  });
}

/**
 * 3. Interactive Mood Switcher (Morning / Golden Hour / Neon Night)
 */
function initMoodSwitcher() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const tickerTitle = document.getElementById('tickerTitle');
  const tickerQuote = document.getElementById('tickerQuote');

  const moodData = {
    morning: {
      title: 'Morning Brew & Waffles Vibe',
      quote: '"Sunlight streaming through garden vines, fresh espresso aroma, and calm morning conversations."'
    },
    evening: {
      title: 'Golden Hour & Board Games Vibe',
      quote: '"Blush velvet armchairs, fresh coolers on ice, and heated Ludo matches under hanging floral lights."'
    },
    night: {
      title: 'Neon Lights & Wok Sizzlers Vibe',
      quote: '"Glowing crimson Love Booth, smoky Dragon Chicken wok sizzlers, and late-night laughter till 11:30 PM."'
    }
  };

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mood = btn.getAttribute('data-mood');
      document.body.classList.remove('mood-morning', 'mood-night');

      if (mood === 'morning') {
        document.body.classList.add('mood-morning');
      } else if (mood === 'night') {
        document.body.classList.add('mood-night');
      }

      if (moodData[mood] && tickerTitle && tickerQuote) {
        tickerTitle.style.opacity = '0';
        tickerQuote.style.opacity = '0';
        setTimeout(() => {
          tickerTitle.textContent = moodData[mood].title;
          tickerQuote.textContent = moodData[mood].quote;
          tickerTitle.style.opacity = '1';
          tickerQuote.style.opacity = '1';
        }, 150);
      }
    });
  });
}

/**
 * 4. Interactive Vibe & Bite Matchmaker
 */
function initVibeMatchmaker() {
  const companionBtns = document.querySelectorAll('#companionChoices .choice-pill');
  const cravingBtns = document.querySelectorAll('#cravingChoices .choice-pill');
  const resZone = document.getElementById('resZone');
  const resDish = document.getElementById('resDish');
  const resGame = document.getElementById('resGame');
  const resPrice = document.getElementById('resPrice');
  const applyBtn = document.getElementById('applyMatchToPassBtn');

  function updateMatchmaker() {
    const activeCompanion = document.querySelector('#companionChoices .choice-pill.active');
    const activeCraving = document.querySelector('#cravingChoices .choice-pill.active');

    if (!activeCompanion || !activeCraving) return;

    const zone = activeCompanion.getAttribute('data-zone');
    const game = activeCompanion.getAttribute('data-game');
    const dish = activeCraving.getAttribute('data-dish');
    const drink = activeCraving.getAttribute('data-drink');
    const price = activeCraving.getAttribute('data-price');

    if (resZone) resZone.textContent = zone;
    if (resDish) resDish.textContent = `${dish} & ${drink}`;
    if (resGame) resGame.textContent = game;
    if (resPrice) resPrice.textContent = `${price} (est.)`;
  }

  companionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      companionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateMatchmaker();
    });
  });

  cravingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cravingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateMatchmaker();
    });
  });

  // Apply to pass button: scrolls to table pass and pre-selects
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const activeCompanion = document.querySelector('#companionChoices .choice-pill.active');
      const activeCraving = document.querySelector('#cravingChoices .choice-pill.active');
      const passZone = document.getElementById('passZone');
      const passNotes = document.getElementById('passNotes');

      if (passZone && activeCompanion) {
        const zoneText = activeCompanion.getAttribute('data-zone');
        // match zone to select option
        Array.from(passZone.options).forEach(opt => {
          if (zoneText.includes('Love Booth') && opt.value.includes('Love Booth')) {
            passZone.value = opt.value;
          } else if (zoneText.includes('Lounge') && opt.value.includes('Blush Velvet')) {
            passZone.value = opt.value;
          } else if (zoneText.includes('Patio') && opt.value.includes('Patio')) {
            passZone.value = opt.value;
          } else if (zoneText.includes('Game') && opt.value.includes('Board Games')) {
            passZone.value = opt.value;
          }
        });
        // trigger change event to sync with live ticket
        passZone.dispatchEvent(new Event('change'));
      }

      if (passNotes && activeCraving && activeCompanion) {
        passNotes.value = `Matchmaker Pairing: ${activeCraving.getAttribute('data-dish')} + Activity: ${activeCompanion.getAttribute('data-game')}`;
      }

      // Smooth scroll to table pass
      const passSection = document.getElementById('table-pass');
      if (passSection) {
        passSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  updateMatchmaker();
}

/**
 * 5. Chalkboard Docket Filter & Live Dish Spotlight
 */
function initBlackboardDocket() {
  const tabs = document.querySelectorAll('.chalk-tab');
  const items = document.querySelectorAll('.docket-item');
  const spotlightImg = document.getElementById('spotlightImg');
  const spotlightTitle = document.getElementById('spotlightTitle');
  const spotlightPrice = document.getElementById('spotlightPrice');
  const spotlightDesc = document.getElementById('spotlightDesc');

  // Filter docket items by category
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCat = tab.getAttribute('data-tab');

      items.forEach(item => {
        const itemCat = item.getAttribute('data-cat');
        if (filterCat === 'all' || itemCat === filterCat) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Spotlight update on hover or click
  items.forEach(item => {
    const updateSpotlight = () => {
      items.forEach(i => i.classList.remove('active-dish'));
      item.classList.add('active-dish');

      const img = item.getAttribute('data-img');
      const dish = item.getAttribute('data-dish');
      const price = item.getAttribute('data-price');
      const desc = item.getAttribute('data-desc');

      if (spotlightImg && img) spotlightImg.src = img;
      if (spotlightTitle && dish) spotlightTitle.textContent = dish;
      if (spotlightPrice && price) spotlightPrice.textContent = price;
      if (spotlightDesc && desc) spotlightDesc.textContent = desc;
    };

    item.addEventListener('mouseenter', updateSpotlight);
    item.addEventListener('click', updateSpotlight);
  });
}

/**
 * 6. Live Café Boarding Pass / Ticket Engine
 */
function initLiveTicketPass() {
  const form = document.getElementById('bistroPassForm');
  const nameInput = document.getElementById('passName');
  const partySelect = document.getElementById('passParty');
  const zoneSelect = document.getElementById('passZone');
  const dateInput = document.getElementById('passDate');
  const timeSelect = document.getElementById('passTime');

  // Live ticket preview nodes
  const tGuestName = document.getElementById('tGuestName');
  const tPartySize = document.getElementById('tPartySize');
  const tZone = document.getElementById('tZone');
  const tDateTime = document.getElementById('tDateTime');
  const tPassId = document.getElementById('tPassId');
  const ticketStatusStamp = document.getElementById('ticketStatusStamp');
  const confirmedBanner = document.getElementById('ticketConfirmedBanner');

  // Set default date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Live updates
  const updateTicketPreview = () => {
    if (tGuestName) {
      tGuestName.textContent = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Guest Diner';
    }
    if (tPartySize) {
      tPartySize.textContent = partySelect ? partySelect.value.split(' ')[0] + ' ' + partySelect.value.split(' ')[1] : '2 Guests';
    }
    if (tZone) {
      tZone.textContent = zoneSelect ? zoneSelect.value.replace('★ ', '') : 'The Red Love Booth Corner';
    }
    if (tDateTime) {
      const dateVal = dateInput && dateInput.value ? dateInput.value : 'Today';
      const timeVal = timeSelect ? timeSelect.value.split(' ')[0] + ' ' + timeSelect.value.split(' ')[1] : '07:30 PM';
      tDateTime.textContent = `${dateVal} • ${timeVal}`;
    }
  };

  if (nameInput) nameInput.addEventListener('input', updateTicketPreview);
  if (partySelect) partySelect.addEventListener('change', updateTicketPreview);
  if (zoneSelect) zoneSelect.addEventListener('change', updateTicketPreview);
  if (dateInput) dateInput.addEventListener('change', updateTicketPreview);
  if (timeSelect) timeSelect.addEventListener('change', updateTicketPreview);

  updateTicketPreview();

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const guestName = nameInput ? nameInput.value.trim() : 'Valued Diner';
      const zoneChoice = zoneSelect ? zoneSelect.value.replace('★ ', '') : 'The Red Love Booth';
      const dateChoice = dateInput ? dateInput.value : 'Upcoming';
      const timeChoice = timeSelect ? timeSelect.value : 'Evening';
      const passId = `LL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update pass UI
      if (tPassId) tPassId.textContent = passId;
      if (ticketStatusStamp) {
        ticketStatusStamp.textContent = '✓ RESERVED';
        ticketStatusStamp.style.borderColor = '#047857';
        ticketStatusStamp.style.color = '#047857';
      }
      if (confirmedBanner) confirmedBanner.style.display = 'flex';

      // Open modal
      openConfirmationModal(passId, guestName, zoneChoice, `${dateChoice} at ${timeChoice}`);
    });
  }
}

/**
 * 7. Confirmation Modal Controls
 */
function openConfirmationModal(passId, name, zone, dateTime) {
  const modal = document.getElementById('bookingModalBackdrop');
  if (!modal) return;

  const mSumId = document.getElementById('mSumId');
  const mSumName = document.getElementById('mSumName');
  const mSumZone = document.getElementById('mSumZone');
  const mSumDateTime = document.getElementById('mSumDateTime');

  if (mSumId) mSumId.textContent = passId;
  if (mSumName) mSumName.textContent = name;
  if (mSumZone) mSumZone.textContent = zone;
  if (mSumDateTime) mSumDateTime.textContent = dateTime;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function initModalControls() {
  const modal = document.getElementById('bookingModalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');
  const doneBtn = document.getElementById('modalDoneBtn');
  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/**
 * 8. Smooth Scrolling with Header Offset
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.length <= 1) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const header = document.getElementById('siteHeader');
        const headerHeight = header ? header.offsetHeight : 70;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 15;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
