/**
 * Across The Street — The Dining Room (New Town, Kolkata)
 * Serene Editorial Dining Sanctuary Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileDrawer();
  initConciergeDock();
  initPavilionCards();
  initMenuFiltering();
  initReservationEngine();
  initSmoothScroll();
});

/**
 * 1. Sticky Header Elevation on Scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
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
 * 3. Quick-Reserve Concierge Dock Syncer
 */
function initConciergeDock() {
  const dockBtn = document.getElementById('dockSubmitBtn');
  const dockDate = document.getElementById('dockDate');
  const dockSlot = document.getElementById('dockSlot');
  const dockParty = document.getElementById('dockParty');
  const dockZone = document.getElementById('dockZone');

  const formDate = document.getElementById('bookingDate');
  const formSlot = document.getElementById('bookingSlot');
  const formParty = document.getElementById('partySize');
  const formZone = document.getElementById('diningZone');
  const formName = document.getElementById('guestName');

  // Set default & min date to today (YYYY-MM-DD)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${year}-${month}-${day}`;

  if (dockDate) {
    dockDate.min = minDateStr;
    dockDate.value = minDateStr;
  }
  if (formDate) {
    formDate.min = minDateStr;
    formDate.value = minDateStr;
  }

  if (!dockBtn) return;

  dockBtn.addEventListener('click', () => {
    // Sync values to main reservation form
    if (dockDate && formDate && dockDate.value) formDate.value = dockDate.value;
    if (dockSlot && formSlot && dockSlot.value) formSlot.value = dockSlot.value;
    if (dockParty && formParty && dockParty.value) formParty.value = dockParty.value;
    if (dockZone && formZone && dockZone.value) formZone.value = dockZone.value;

    // Smooth scroll to reservation form
    const resSection = document.getElementById('reservations');
    if (resSection) {
      const headerOffset = 80;
      const elementPosition = resSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Focus guest name
      setTimeout(() => {
        if (formName) {
          formName.focus();
          formName.parentElement.style.transition = 'transform 0.3s ease';
          formName.parentElement.style.transform = 'scale(1.02)';
          setTimeout(() => {
            formName.parentElement.style.transform = 'scale(1)';
          }, 400);
        }
      }, 500);
    }
  });
}

/**
 * 3b. Interactive Pavilion Cards Selection
 */
function initPavilionCards() {
  const pavilionBtns = document.querySelectorAll('.pavilion-action-btn');
  const formZone = document.getElementById('diningZone');
  const dockZone = document.getElementById('dockZone');
  const formName = document.getElementById('guestName');

  pavilionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const zone = btn.getAttribute('data-zone');
      if (zone) {
        if (formZone) formZone.value = zone;
        if (dockZone) dockZone.value = zone;
      }

      // Smooth scroll to reservation form
      const resSection = document.getElementById('reservations');
      if (resSection) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = resSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        setTimeout(() => {
          if (formName) formName.focus();
        }, 500);
      }
    });
  });
}

/**
 * 4. Curated Menu Category Filtering with Staggered Fluid Animation
 */
function initMenuFiltering() {
  const tabs = document.querySelectorAll('.menu-tab');
  const items = document.querySelectorAll('.menu-item-card');
  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCat = tab.getAttribute('data-category');
      let visibleIndex = 0;

      items.forEach(card => {
        const itemCat = card.getAttribute('data-cat');
        if (targetCat === 'all' || itemCat === targetCat) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          
          setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, visibleIndex * 50);
          
          visibleIndex++;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 5. Interactive Table Reservation Engine & Dining Pass Modal
 */
function initReservationEngine() {
  const form = document.getElementById('reservationForm');
  const modal = document.getElementById('reserveModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const submitBtn = document.getElementById('reserveSubmitBtn');
  const spinner = document.getElementById('reserveSpinner');
  const dateInput = document.getElementById('bookingDate');

  if (!form || !modal) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${year}-${month}-${day}`;

  const clearErrors = () => {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('has-error'));
  };

  const showError = (fieldId, errorId, message) => {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
    if (field) field.classList.add('has-error');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('guestName')?.value.trim() || '';
    const phone = document.getElementById('guestPhone')?.value.trim() || '';
    const party = document.getElementById('partySize')?.value || '';
    const date = document.getElementById('bookingDate')?.value || '';
    const slot = document.getElementById('bookingSlot')?.value || '';
    const zone = document.getElementById('diningZone')?.value || 'The Chandelier Grand Hall';

    let hasError = false;
    let firstInvalid = null;

    if (!name || name.length < 2) {
      showError('guestName', 'nameError', 'Please enter your full name (minimum 2 characters).');
      hasError = true;
      if (!firstInvalid) firstInvalid = document.getElementById('guestName');
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showError('guestPhone', 'phoneError', 'Please enter a valid 10-digit mobile or WhatsApp number.');
      hasError = true;
      if (!firstInvalid) firstInvalid = document.getElementById('guestPhone');
    }

    if (!party) {
      showError('partySize', 'partyError', 'Please select your estimated party size.');
      hasError = true;
      if (!firstInvalid) firstInvalid = document.getElementById('partySize');
    }

    if (!date) {
      showError('bookingDate', 'dateError', 'Please choose a dining date.');
      hasError = true;
      if (!firstInvalid) firstInvalid = document.getElementById('bookingDate');
    }

    if (!slot) {
      showError('bookingSlot', 'slotError', 'Please select a preferred dining time slot.');
      hasError = true;
      if (!firstInvalid) firstInvalid = document.getElementById('bookingSlot');
    }

    if (hasError) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';

    setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = 'none';

      const randomRef = 'ATS-' + year + '-' + Math.floor(1000 + Math.random() * 9000);

      const modalRef = document.getElementById('modalRef');
      const modalName = document.getElementById('modalName');
      const modalParty = document.getElementById('modalParty');
      const modalSlot = document.getElementById('modalSlot');

      if (modalRef) modalRef.textContent = randomRef;
      if (modalName) modalName.textContent = name;
      if (modalParty) modalParty.textContent = `${party.split(' ')[0]} Guests • ${zone}`;
      if (modalSlot) modalSlot.textContent = `${date} • ${slot.split(' ')[0]}`;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      form.reset();
      if (dateInput) dateInput.value = minDateStr;
    }, 600);
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/**
 * 6. Smooth Scroll for In-Page Anchor Links
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
