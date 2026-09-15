/**
 * Lawyer Alexander & Associates — Interactive Script
 * High-End Legal Platform Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerItems = document.querySelectorAll('.drawer-item');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    drawerItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target) && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // 2. Set Minimum Date for Consultation to Today
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // 3. Consultation Form Validation & Interactive Booking Modal
  const form = document.getElementById('consultationForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

  const modal = document.getElementById('confirmModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalClientName = document.getElementById('modalClientName');
  const modalCaseId = document.getElementById('modalCaseId');
  const modalPractice = document.getElementById('modalPractice');

  // Input Error Helper
  const setError = (id, message) => {
    const errEl = document.getElementById(id);
    if (errEl) errEl.textContent = message;
  };

  const clearErrors = () => {
    ['nameError', 'phoneError', 'emailError', 'areaError', 'summaryError'].forEach(id => {
      setError(id, '');
    });
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const practiceArea = document.getElementById('practiceArea').value;
      const summary = document.getElementById('caseSummary').value.trim();

      let isValid = true;

      if (!name) {
        setError('nameError', 'Please enter your full legal name');
        isValid = false;
      }

      if (!phone || phone.length < 7) {
        setError('phoneError', 'Please enter a valid telephone contact number');
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setError('emailError', 'Please enter a valid email address');
        isValid = false;
      }

      if (!practiceArea) {
        setError('areaError', 'Please select the relevant legal discipline');
        isValid = false;
      }

      if (!summary || summary.length < 15) {
        setError('summaryError', 'Please provide a brief description (at least 15 characters)');
        isValid = false;
      }

      if (!isValid) return;

      // Loading state
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Transmitting File Securely...';
      submitBtn.disabled = true;

      // Simulate secure transmission to attorney desk
      setTimeout(() => {
        if (btnSpinner) btnSpinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Submit Confidential Request';
        submitBtn.disabled = false;

        // Generate dynamic case ID
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const caseRef = `SV-${new Date().getFullYear()}-${randomNum}`;

        if (modalClientName) modalClientName.textContent = name;
        if (modalCaseId) modalCaseId.textContent = caseRef;
        if (modalPractice) modalPractice.textContent = practiceArea;

        // Open modal
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }

        form.reset();
      }, 900);
    });
  }

  // Close Modal
  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // 4. Header Shadow / Background Blur on Scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.7)';
        header.style.background = 'rgba(7, 9, 14, 0.95)';
      } else {
        header.style.boxShadow = 'none';
        header.style.background = 'rgba(7, 9, 14, 0.85)';
      }
    }
  }, { passive: true });
});
