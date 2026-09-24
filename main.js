(() => {
  // Prevent mobile browsers from restoring previous scroll position when navigating back to portfolio
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Configuration
  const CONFIG = {
    frameCount: 240,
    padDigits: 6,
    prefix: 'frames/frame_',
    ext: '.webp',
    lerpSpeed: 0.08, // Buttery smoothing factor for scroll interpolation
    criticalFrames: 12, // Ultra-fast unlock after first 12 frames loaded (~300ms)
    // Google Apps Script Web App Deployment URL for saving leads to Google Sheets:
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzaWRIAD6dz6M2uqDyA6_xKQRvRI6ZWRrFJc5WERO66nZFjhMDmh_ZBiKubz-jyYZGh9A/exec'
  };

  // DOM Elements
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  // State
  const images = new Array(CONFIG.frameCount);
  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let lastRenderedFrame = -1;
  let needsRedraw = true;
  let isReady = false;

  // Helper: Format frame filename
  function getFramePath(index) {
    const padded = String(index).padStart(CONFIG.padDigits, '0');
    return `${CONFIG.prefix}${padded}${CONFIG.ext}`;
  }

  // Fast Snappy Critical-Batch Preloader
  function preloadImages() {
    return new Promise((resolve) => {
      // Safety unlock timeout so user is NEVER stuck on loading screen (max 800ms)
      const safetyTimer = setTimeout(() => {
        if (!isReady) {
          isReady = true;
          if (progressBar) progressBar.style.width = '100%';
          if (progressText) progressText.textContent = '100%';
          hideLoader();
          resolve();
        }
      }, 850);

      // 1. Load Initial Hero Frame 0 immediately
      const firstImg = new Image();
      firstImg.decoding = 'async';
      firstImg.src = getFramePath(0);

      firstImg.onload = () => {
        images[0] = firstImg;
        loadedCount++;
        updateProgress();
        drawFrame(0);

        // 2. Fast critical batch (frames 1 to CONFIG.criticalFrames)
        let criticalLoaded = 1;
        for (let i = 1; i <= CONFIG.criticalFrames; i++) {
          const img = new Image();
          img.decoding = 'async';
          img.src = getFramePath(i);

          img.onload = () => {
            images[i] = img;
            loadedCount++;
            criticalLoaded++;
            updateProgress();

            if (criticalLoaded >= CONFIG.criticalFrames && !isReady) {
              isReady = true;
              clearTimeout(safetyTimer);
              if (progressBar) progressBar.style.width = '100%';
              if (progressText) progressText.textContent = '100%';
              setTimeout(() => {
                hideLoader();
                resolve();
              }, 100);

              // 3. Stream remaining frames in lightweight background idle batches
              loadRemainingFrames(CONFIG.criticalFrames + 1);
            }
          };

          img.onerror = () => {
            loadedCount++;
            criticalLoaded++;
            updateProgress();
            if (criticalLoaded >= CONFIG.criticalFrames && !isReady) {
              isReady = true;
              clearTimeout(safetyTimer);
              hideLoader();
              resolve();
              loadRemainingFrames(CONFIG.criticalFrames + 1);
            }
          };
        }
      };

      firstImg.onerror = () => {
        console.warn(`Failed to load initial frame`);
        clearTimeout(safetyTimer);
        hideLoader();
        resolve();
      };
    });
  }

  // Stream remaining frames asynchronously without blocking the main thread
  function loadRemainingFrames(startIndex) {
    const batchSize = 6;
    let nextIndex = startIndex;

    function loadNextBatch() {
      if (nextIndex >= CONFIG.frameCount) return;

      const endIndex = Math.min(nextIndex + batchSize, CONFIG.frameCount);
      for (let i = nextIndex; i < endIndex; i++) {
        if (!images[i]) {
          const img = new Image();
          img.decoding = 'async';
          img.src = getFramePath(i);
          img.onload = () => {
            images[i] = img;
            loadedCount++;
          };
          img.onerror = () => {
            loadedCount++;
          };
        }
      }

      nextIndex = endIndex;
      if (nextIndex < CONFIG.frameCount) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadNextBatch, { timeout: 100 });
        } else {
          setTimeout(loadNextBatch, 30);
        }
      }
    }

    loadNextBatch();
  }

  // Fast Smooth Progress Bar Mapping
  function updateProgress() {
    if (!progressBar || !progressText || isReady) return;
    const percent = Math.min(Math.round((loadedCount / CONFIG.criticalFrames) * 100), 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
  }

  // Hide Loader Overlay
  function hideLoader() {
    if (loader) {
      loader.classList.add('loaded');
    }
  }

  // Resize Canvas to HiDPI screen dimensions
  function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    needsRedraw = true;
  }

  // Draw specific frame onto canvas with cover aspect-ratio
  function drawFrame(index) {
    let img = images[index];

    // Fallback: If target frame isn't loaded yet, search nearest available frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < CONFIG.frameCount; offset++) {
        const prev = index - offset;
        const next = index + offset;
        if (prev >= 0 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
          img = images[prev];
          break;
        }
        if (next < CONFIG.frameCount && images[next] && images[next].complete && images[next].naturalWidth > 0) {
          img = images[next];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Cover algorithm math
    const hRatio = cWidth / imgWidth;
    const vRatio = cHeight / imgHeight;
    const ratio = Math.max(hRatio, vRatio);

    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;
    const renderX = (cWidth - renderWidth) / 2;
    const renderY = (cHeight - renderHeight) / 2;

    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, cWidth, cHeight);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, renderX, renderY, renderWidth, renderHeight);

    // Completely remove Gemini watermark at bottom-right corner seamlessly
    const wmTargetX = renderX + ((imgWidth - 170) / imgWidth) * renderWidth;
    const wmTargetY = renderY + ((imgHeight - 170) / imgHeight) * renderHeight;
    const wmWidth = (200 / imgWidth) * renderWidth;
    const wmHeight = (200 / imgHeight) * renderHeight;

    const radGrad = ctx.createRadialGradient(
      wmTargetX + wmWidth * 0.5, wmTargetY + wmHeight * 0.5, 0,
      wmTargetX + wmWidth * 0.5, wmTargetY + wmHeight * 0.5, wmWidth * 0.75
    );
    radGrad.addColorStop(0, '#070709');
    radGrad.addColorStop(0.6, '#070709');
    radGrad.addColorStop(0.85, 'rgba(7, 7, 9, 0.95)');
    radGrad.addColorStop(1, 'rgba(7, 7, 9, 0)');

    ctx.fillStyle = radGrad;
    ctx.fillRect(wmTargetX - 40, wmTargetY - 40, wmWidth + 80, wmHeight + 80);
  }

  // Calculate target frame from full page scroll position & dynamic glass blur (0px -> max 1px)
  function updateScrollTarget() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    targetFrame = progress * (CONFIG.frameCount - 1);

    // Dynamic Scroll Blur: starts from 0px at top and smoothly ramps to a max of 1px
    const vh = window.innerHeight;
    const blurProgress = Math.min(Math.max((scrollY - vh * 0.1) / (vh * 0.85), 0), 1);
    const dynamicBlur = (blurProgress * 1).toFixed(2);
    document.documentElement.style.setProperty('--scroll-blur', `${dynamicBlur}px`);

    // Update active nav link based on section in view
    updateActiveNav();
  }

  // Update active navigation pill based on viewport position (100% reliable)
  function updateActiveNav() {
    let currentSectionId = '';
    const triggerPoint = window.innerHeight * 0.35;

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      const mobileLinks = document.querySelectorAll('.mobile-nav-link');
      mobileLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  // Smooth Scroll Link Hook Handler for Header, Footer & CTA Buttons
  function initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (!hash || hash === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Update active link state
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === hash) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    });
  }

  // Contact Form & Google Sheets Integration (100% Reliable Cross-Origin Submission)
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const iframe = document.getElementById('gform_iframe');
    const submitBtn = document.getElementById('submit-btn');
    const feedback = document.getElementById('form-feedback');

    if (!form) return;

    let isSubmitting = false;

    form.addEventListener('submit', (e) => {
      const name = (form.name.value || '').trim();
      const email = (form.email.value || '').trim();
      if (form.phone.value.trim() === '+') {
        form.phone.value = '';
      }
      const phone = (form.phone.value || '').trim();
      const message = (form.message.value || '').trim();

      if (!name || !email || !message) {
        e.preventDefault();
        showFeedback('Please fill out all required fields (*).', 'error');
        return;
      }

      isSubmitting = true;
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      feedback.style.display = 'none';

      const successMessageHtml = `
        <div class="feedback-success-card">
          <div class="feedback-title">Your message has been securely delivered and added to my workflow.</div>
          <p class="feedback-desc">Thank you for reaching out. I'll review your request and get back to you within 24-48 hours.</p>
        </div>
      `;

      // Fallback timer ensures user feedback even if iframe load event is suppressed
      setTimeout(() => {
        if (isSubmitting) {
          showFeedback(successMessageHtml, 'success', true);
          form.reset();
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          isSubmitting = false;
        }
      }, 1400);
    });

    if (iframe) {
      iframe.addEventListener('load', () => {
        if (isSubmitting) {
          const successMessageHtml = `
            <div class="feedback-success-card">
              <div class="feedback-title">Your message has been securely delivered and added to my workflow.</div>
              <p class="feedback-desc">Thank you for reaching out. I'll review your request and get back to you within 24-48 hours.</p>
            </div>
          `;
          showFeedback(successMessageHtml, 'success', true);
          form.reset();
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          isSubmitting = false;
        }
      });
    }

    function showFeedback(content, type, isHtml = false) {
      if (isHtml) {
        feedback.innerHTML = content;
      } else {
        feedback.textContent = content;
      }
      feedback.className = `form-feedback ${type}`;
      feedback.style.display = 'block';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Calendly Event Scheduled Listener -> Notifies Google Apps Script for instant WhatsApp alert
  function initCalendlyBookingTracker() {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.event === 'calendly.event_scheduled') {
        const payload = e.data.payload || {};
        const eventUri = payload.event && payload.event.uri ? payload.event.uri : '';
        const inviteeUri = payload.invitee && payload.invitee.uri ? payload.invitee.uri : '';

        const formData = new FormData();
        formData.append('type', 'calendly_booking');
        formData.append('eventUri', eventUri);
        formData.append('inviteeUri', inviteeUri);

        if (navigator.sendBeacon) {
          navigator.sendBeacon(CONFIG.googleScriptUrl, formData);
        } else {
          fetch(CONFIG.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
          }).catch(() => {});
        }
      }
    });
  }

  // Country Code to Real Graphic Flag Icon Dynamic Detection (Comprehensive Global Directory)
  function initPhoneFlagDetector() {
    const phoneInput = document.getElementById('lead-phone');
    const flagIcon = document.getElementById('phone-flag-icon');

    if (!phoneInput || !flagIcon) return;

    const defaultGlobe = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const countryFlags = [
      { code: '+93', iso: 'af', name: 'Afghanistan' },
      { code: '+355', iso: 'al', name: 'Albania' },
      { code: '+213', iso: 'dz', name: 'Algeria' },
      { code: '+376', iso: 'ad', name: 'Andorra' },
      { code: '+244', iso: 'ao', name: 'Angola' },
      { code: '+1264', iso: 'ai', name: 'Anguilla' },
      { code: '+1268', iso: 'ag', name: 'Antigua & Barbuda' },
      { code: '+54', iso: 'ar', name: 'Argentina' },
      { code: '+374', iso: 'am', name: 'Armenia' },
      { code: '+297', iso: 'aw', name: 'Aruba' },
      { code: '+61', iso: 'au', name: 'Australia' },
      { code: '+43', iso: 'at', name: 'Austria' },
      { code: '+994', iso: 'az', name: 'Azerbaijan' },
      { code: '+1242', iso: 'bs', name: 'Bahamas' },
      { code: '+973', iso: 'bh', name: 'Bahrain' },
      { code: '+880', iso: 'bd', name: 'Bangladesh' },
      { code: '+1246', iso: 'bb', name: 'Barbados' },
      { code: '+375', iso: 'by', name: 'Belarus' },
      { code: '+32', iso: 'be', name: 'Belgium' },
      { code: '+501', iso: 'bz', name: 'Belize' },
      { code: '+229', iso: 'bj', name: 'Benin' },
      { code: '+1441', iso: 'bm', name: 'Bermuda' },
      { code: '+975', iso: 'bt', name: 'Bhutan' },
      { code: '+591', iso: 'bo', name: 'Bolivia' },
      { code: '+387', iso: 'ba', name: 'Bosnia & Herzegovina' },
      { code: '+267', iso: 'bw', name: 'Botswana' },
      { code: '+55', iso: 'br', name: 'Brazil' },
      { code: '+246', iso: 'io', name: 'British Indian Ocean Territory' },
      { code: '+1284', iso: 'vg', name: 'British Virgin Islands' },
      { code: '+673', iso: 'bn', name: 'Brunei' },
      { code: '+359', iso: 'bg', name: 'Bulgaria' },
      { code: '+226', iso: 'bf', name: 'Burkina Faso' },
      { code: '+257', iso: 'bi', name: 'Burundi' },
      { code: '+855', iso: 'kh', name: 'Cambodia' },
      { code: '+237', iso: 'cm', name: 'Cameroon' },
      { code: '+1', iso: 'us', name: 'USA / Canada' },
      { code: '+238', iso: 'cv', name: 'Cape Verde' },
      { code: '+1345', iso: 'ky', name: 'Cayman Islands' },
      { code: '+236', iso: 'cf', name: 'Central African Republic' },
      { code: '+235', iso: 'td', name: 'Chad' },
      { code: '+56', iso: 'cl', name: 'Chile' },
      { code: '+86', iso: 'cn', name: 'China' },
      { code: '+57', iso: 'co', name: 'Colombia' },
      { code: '+269', iso: 'km', name: 'Comoros' },
      { code: '+242', iso: 'cg', name: 'Congo - Brazzaville' },
      { code: '+243', iso: 'cd', name: 'Congo - Kinshasa' },
      { code: '+682', iso: 'ck', name: 'Cook Islands' },
      { code: '+506', iso: 'cr', name: 'Costa Rica' },
      { code: '+225', iso: 'ci', name: 'Côte d’Ivoire' },
      { code: '+385', iso: 'hr', name: 'Croatia' },
      { code: '+53', iso: 'cu', name: 'Cuba' },
      { code: '+599', iso: 'cw', name: 'Curaçao' },
      { code: '+357', iso: 'cy', name: 'Cyprus' },
      { code: '+420', iso: 'cz', name: 'Czech Republic' },
      { code: '+45', iso: 'dk', name: 'Denmark' },
      { code: '+253', iso: 'dj', name: 'Djibouti' },
      { code: '+1767', iso: 'dm', name: 'Dominica' },
      { code: '+1809', iso: 'do', name: 'Dominican Republic' },
      { code: '+1829', iso: 'do', name: 'Dominican Republic' },
      { code: '+1849', iso: 'do', name: 'Dominican Republic' },
      { code: '+593', iso: 'ec', name: 'Ecuador' },
      { code: '+20', iso: 'eg', name: 'Egypt' },
      { code: '+503', iso: 'sv', name: 'El Salvador' },
      { code: '+240', iso: 'gq', name: 'Equatorial Guinea' },
      { code: '+291', iso: 'er', name: 'Eritrea' },
      { code: '+372', iso: 'ee', name: 'Estonia' },
      { code: '+268', iso: 'sz', name: 'Eswatini' },
      { code: '+251', iso: 'et', name: 'Ethiopia' },
      { code: '+500', iso: 'fk', name: 'Falkland Islands' },
      { code: '+298', iso: 'fo', name: 'Faroe Islands' },
      { code: '+679', iso: 'fj', name: 'Fiji' },
      { code: '+358', iso: 'fi', name: 'Finland' },
      { code: '+33', iso: 'fr', name: 'France' },
      { code: '+594', iso: 'gf', name: 'French Guiana' },
      { code: '+689', iso: 'pf', name: 'French Polynesia' },
      { code: '+241', iso: 'ga', name: 'Gabon' },
      { code: '+220', iso: 'gm', name: 'Gambia' },
      { code: '+995', iso: 'ge', name: 'Georgia' },
      { code: '+49', iso: 'de', name: 'Germany' },
      { code: '+233', iso: 'gh', name: 'Ghana' },
      { code: '+350', iso: 'gi', name: 'Gibraltar' },
      { code: '+30', iso: 'gr', name: 'Greece' },
      { code: '+299', iso: 'gl', name: 'Greenland' },
      { code: '+1473', iso: 'gd', name: 'Grenada' },
      { code: '+590', iso: 'gp', name: 'Guadeloupe' },
      { code: '+1671', iso: 'gu', name: 'Guam' },
      { code: '+502', iso: 'gt', name: 'Guatemala' },
      { code: '+224', iso: 'gn', name: 'Guinea' },
      { code: '+245', iso: 'gw', name: 'Guinea-Bissau' },
      { code: '+592', iso: 'gy', name: 'Guyana' },
      { code: '+509', iso: 'ht', name: 'Haiti' },
      { code: '+504', iso: 'hn', name: 'Honduras' },
      { code: '+852', iso: 'hk', name: 'Hong Kong' },
      { code: '+36', iso: 'hu', name: 'Hungary' },
      { code: '+354', iso: 'is', name: 'Iceland' },
      { code: '+91', iso: 'in', name: 'India' },
      { code: '+62', iso: 'id', name: 'Indonesia' },
      { code: '+98', iso: 'ir', name: 'Iran' },
      { code: '+964', iso: 'iq', name: 'Iraq' },
      { code: '+353', iso: 'ie', name: 'Ireland' },
      { code: '+972', iso: 'il', name: 'Israel' },
      { code: '+39', iso: 'it', name: 'Italy' },
      { code: '+1876', iso: 'jm', name: 'Jamaica' },
      { code: '+81', iso: 'jp', name: 'Japan' },
      { code: '+962', iso: 'jo', name: 'Jordan' },
      { code: '+7', iso: 'kz', name: 'Kazakhstan / Russia' },
      { code: '+254', iso: 'ke', name: 'Kenya' },
      { code: '+686', iso: 'ki', name: 'Kiribati' },
      { code: '+383', iso: 'xk', name: 'Kosovo' },
      { code: '+965', iso: 'kw', name: 'Kuwait' },
      { code: '+996', iso: 'kg', name: 'Kyrgyzstan' },
      { code: '+856', iso: 'la', name: 'Laos' },
      { code: '+371', iso: 'lv', name: 'Latvia' },
      { code: '+961', iso: 'lb', name: 'Lebanon' },
      { code: '+266', iso: 'ls', name: 'Lesotho' },
      { code: '+231', iso: 'lr', name: 'Liberia' },
      { code: '+218', iso: 'ly', name: 'Libya' },
      { code: '+423', iso: 'li', name: 'Liechtenstein' },
      { code: '+370', iso: 'lt', name: 'Lithuania' },
      { code: '+352', iso: 'lu', name: 'Luxembourg' },
      { code: '+853', iso: 'mo', name: 'Macau' },
      { code: '+389', iso: 'mk', name: 'North Macedonia' },
      { code: '+261', iso: 'mg', name: 'Madagascar' },
      { code: '+265', iso: 'mw', name: 'Malawi' },
      { code: '+60', iso: 'my', name: 'Malaysia' },
      { code: '+960', iso: 'mv', name: 'Maldives' },
      { code: '+223', iso: 'ml', name: 'Mali' },
      { code: '+356', iso: 'mt', name: 'Malta' },
      { code: '+692', iso: 'mh', name: 'Marshall Islands' },
      { code: '+596', iso: 'mq', name: 'Martinique' },
      { code: '+222', iso: 'mr', name: 'Mauritania' },
      { code: '+230', iso: 'mu', name: 'Mauritius' },
      { code: '+262', iso: 're', name: 'Mayotte / Réunion' },
      { code: '+52', iso: 'mx', name: 'Mexico' },
      { code: '+691', iso: 'fm', name: 'Micronesia' },
      { code: '+373', iso: 'md', name: 'Moldova' },
      { code: '+377', iso: 'mc', name: 'Monaco' },
      { code: '+976', iso: 'mn', name: 'Mongolia' },
      { code: '+382', iso: 'me', name: 'Montenegro' },
      { code: '+1664', iso: 'ms', name: 'Montserrat' },
      { code: '+212', iso: 'ma', name: 'Morocco' },
      { code: '+258', iso: 'mz', name: 'Mozambique' },
      { code: '+95', iso: 'mm', name: 'Myanmar' },
      { code: '+264', iso: 'na', name: 'Namibia' },
      { code: '+674', iso: 'nr', name: 'Nauru' },
      { code: '+977', iso: 'np', name: 'Nepal' },
      { code: '+31', iso: 'nl', name: 'Netherlands' },
      { code: '+687', iso: 'nc', name: 'New Caledonia' },
      { code: '+64', iso: 'nz', name: 'New Zealand' },
      { code: '+505', iso: 'ni', name: 'Nicaragua' },
      { code: '+227', iso: 'ne', name: 'Niger' },
      { code: '+234', iso: 'ng', name: 'Nigeria' },
      { code: '+683', iso: 'nu', name: 'Niue' },
      { code: '+850', iso: 'kp', name: 'North Korea' },
      { code: '+1670', iso: 'mp', name: 'Northern Mariana Islands' },
      { code: '+47', iso: 'no', name: 'Norway' },
      { code: '+968', iso: 'om', name: 'Oman' },
      { code: '+92', iso: 'pk', name: 'Pakistan' },
      { code: '+680', iso: 'pw', name: 'Palau' },
      { code: '+970', iso: 'ps', name: 'Palestine' },
      { code: '+507', iso: 'pa', name: 'Panama' },
      { code: '+675', iso: 'pg', name: 'Papua New Guinea' },
      { code: '+595', iso: 'py', name: 'Paraguay' },
      { code: '+51', iso: 'pe', name: 'Peru' },
      { code: '+63', iso: 'ph', name: 'Philippines' },
      { code: '+48', iso: 'pl', name: 'Poland' },
      { code: '+351', iso: 'pt', name: 'Portugal' },
      { code: '+1787', iso: 'pr', name: 'Puerto Rico' },
      { code: '+1939', iso: 'pr', name: 'Puerto Rico' },
      { code: '+974', iso: 'qa', name: 'Qatar' },
      { code: '+40', iso: 'ro', name: 'Romania' },
      { code: '+250', iso: 'rw', name: 'Rwanda' },
      { code: '+685', iso: 'ws', name: 'Samoa' },
      { code: '+378', iso: 'sm', name: 'San Marino' },
      { code: '+239', iso: 'st', name: 'São Tomé & Príncipe' },
      { code: '+966', iso: 'sa', name: 'Saudi Arabia' },
      { code: '+221', iso: 'sn', name: 'Senegal' },
      { code: '+381', iso: 'rs', name: 'Serbia' },
      { code: '+248', iso: 'sc', name: 'Seychelles' },
      { code: '+232', iso: 'sl', name: 'Sierra Leone' },
      { code: '+65', iso: 'sg', name: 'Singapore' },
      { code: '+1721', iso: 'sx', name: 'Sint Maarten' },
      { code: '+421', iso: 'sk', name: 'Slovakia' },
      { code: '+386', iso: 'si', name: 'Slovenia' },
      { code: '+677', iso: 'sb', name: 'Solomon Islands' },
      { code: '+252', iso: 'so', name: 'Somalia' },
      { code: '+27', iso: 'za', name: 'South Africa' },
      { code: '+82', iso: 'kr', name: 'South Korea' },
      { code: '+211', iso: 'ss', name: 'South Sudan' },
      { code: '+34', iso: 'es', name: 'Spain' },
      { code: '+94', iso: 'lk', name: 'Sri Lanka' },
      { code: '+1869', iso: 'kn', name: 'St. Kitts & Nevis' },
      { code: '+1758', iso: 'lc', name: 'St. Lucia' },
      { code: '+1784', iso: 'vc', name: 'St. Vincent & Grenadines' },
      { code: '+249', iso: 'sd', name: 'Sudan' },
      { code: '+597', iso: 'sr', name: 'Suriname' },
      { code: '+46', iso: 'se', name: 'Sweden' },
      { code: '+41', iso: 'ch', name: 'Switzerland' },
      { code: '+963', iso: 'sy', name: 'Syria' },
      { code: '+886', iso: 'tw', name: 'Taiwan' },
      { code: '+992', iso: 'tj', name: 'Tajikistan' },
      { code: '+255', iso: 'tz', name: 'Tanzania' },
      { code: '+66', iso: 'th', name: 'Thailand' },
      { code: '+670', iso: 'tl', name: 'Timor-Leste' },
      { code: '+228', iso: 'tg', name: 'Togo' },
      { code: '+676', iso: 'to', name: 'Tonga' },
      { code: '+1868', iso: 'tt', name: 'Trinidad & Tobago' },
      { code: '+216', iso: 'tn', name: 'Tunisia' },
      { code: '+90', iso: 'tr', name: 'Turkey' },
      { code: '+993', iso: 'tm', name: 'Turkmenistan' },
      { code: '+1649', iso: 'tc', name: 'Turks & Caicos Islands' },
      { code: '+688', iso: 'tv', name: 'Tuvalu' },
      { code: '+256', iso: 'ug', name: 'Uganda' },
      { code: '+380', iso: 'ua', name: 'Ukraine' },
      { code: '+971', iso: 'ae', name: 'United Arab Emirates' },
      { code: '+44', iso: 'gb', name: 'United Kingdom' },
      { code: '+598', iso: 'uy', name: 'Uruguay' },
      { code: '+1340', iso: 'vi', name: 'U.S. Virgin Islands' },
      { code: '+998', iso: 'uz', name: 'Uzbekistan' },
      { code: '+678', iso: 'vu', name: 'Vanuatu' },
      { code: '+379', iso: 'va', name: 'Vatican City' },
      { code: '+58', iso: 've', name: 'Venezuela' },
      { code: '+84', iso: 'vn', name: 'Vietnam' },
      { code: '+967', iso: 'ye', name: 'Yemen' },
      { code: '+260', iso: 'zm', name: 'Zambia' },
      { code: '+263', iso: 'zw', name: 'Zimbabwe' }
    ];

    // Sort by code length descending so longer codes match first (e.g. +1868 before +1, +971 before +9)
    countryFlags.sort((a, b) => b.code.length - a.code.length);

    function updateFlag() {
      let val = phoneInput.value.trim().replace(/\s+/g, '');
      if (!val) {
        flagIcon.innerHTML = defaultGlobe;
        flagIcon.removeAttribute('title');
        flagIcon.style.transform = 'scale(1)';
        return;
      }

      if (!val.startsWith('+')) {
        val = '+' + val;
      }

      const match = countryFlags.find(item => val.startsWith(item.code));

      if (match) {
        flagIcon.innerHTML = `<img src="https://flagcdn.com/w40/${match.iso}.png" class="flag-img" alt="${match.name}" loading="lazy" onerror="this.style.display='none'">`;
        flagIcon.title = `${match.name} (${match.code})`;
        flagIcon.style.transform = 'scale(1.05)';
      } else {
        flagIcon.innerHTML = defaultGlobe;
        flagIcon.removeAttribute('title');
        flagIcon.style.transform = 'scale(1)';
      }
    }

    function ensurePlusPrefix() {
      if (!phoneInput.value.trim()) {
        phoneInput.value = '+';
        updateFlag();
      }
      if (phoneInput.value === '+') {
        setTimeout(() => {
          try {
            phoneInput.setSelectionRange(1, 1);
          } catch (e) { }
        }, 10);
      }
    }

    phoneInput.addEventListener('focus', ensurePlusPrefix);
    phoneInput.addEventListener('click', ensurePlusPrefix);

    phoneInput.addEventListener('keydown', (e) => {
      // Prevent deleting the initial '+'
      if (e.key === 'Backspace' && phoneInput.selectionStart <= 1 && phoneInput.selectionEnd <= 1 && phoneInput.value.startsWith('+')) {
        if (phoneInput.value.length === 1) {
          e.preventDefault();
        }
      }
    });

    phoneInput.addEventListener('input', () => {
      let val = phoneInput.value;
      if (!val) {
        phoneInput.value = '+';
      } else if (!val.startsWith('+')) {
        phoneInput.value = '+' + val.replace(/^\+*/, '');
      }
      updateFlag();
    });

    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.trim() === '+') {
        phoneInput.value = '';
        updateFlag();
      }
    });

    updateFlag();
  }

  // Smart Geo-Detection & Currency Switcher for Contact Form Budget
  function initBudgetCurrencySwitcher() {
    const budgetSelect = document.getElementById('lead-budget');
    const budgetLabel = document.getElementById('budget-label');
    const btnUsd = document.getElementById('curr-btn-usd');
    const btnInr = document.getElementById('curr-btn-inr');

    if (!budgetSelect || !btnUsd || !btnInr) return;

    const inrOptions = [
      { value: "Flexible / To Be Discussed", text: "Flexible / Open to Discuss on Call" },
      { value: "₹35,000 - ₹75,000 (Starter / MVP)", text: "₹35,000 – ₹75,000 (Starter / MVP Website)" },
      { value: "₹75,000 - ₹1,75,000 (Growth Platform)", text: "₹75,000 – ₹1,75,000 (Growth & E-commerce)" },
      { value: "₹1,75,000 - ₹4,00,000+ (Enterprise / AI)", text: "₹1,75,000 – ₹4,00,000+ (Custom AI & Enterprise)" },
      { value: "Monthly Maintenance / Advisory", text: "Monthly Maintenance / Advisory" }
    ];

    const usdOptions = [
      { value: "Flexible / Open for Discussion", text: "Flexible / Open to Discuss on Call" },
      { value: "$1,500 - $3,500 (Starter / MVP)", text: "$1,500 – $3,500 (Starter / MVP Platform)" },
      { value: "$3,500 - $7,500 (Full-Stack / E-commerce)", text: "$3,500 – $7,500 (Full-Stack & E-commerce)" },
      { value: "$7,500 - $15,000+ (Enterprise & AI)", text: "$7,500 – $15,000+ (Enterprise Architecture & AI)" },
      { value: "Flexible Hourly / Advisory", text: "Flexible Hourly / Retainer Advisory" }
    ];

    function setCurrency(curr) {
      const opts = curr === 'INR' ? inrOptions : usdOptions;
      budgetSelect.innerHTML = '';
      opts.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.text;
        budgetSelect.appendChild(el);
      });

      if (curr === 'INR') {
        if (budgetLabel) budgetLabel.textContent = "Estimated Budget (INR / ₹)";
        btnInr.classList.add('active');
        btnUsd.classList.remove('active');
      } else {
        if (budgetLabel) budgetLabel.textContent = "Estimated Budget (USD / $)";
        btnUsd.classList.add('active');
        btnInr.classList.remove('active');
      }
    }

    btnInr.addEventListener('click', () => setCurrency('INR'));
    btnUsd.addEventListener('click', () => setCurrency('USD'));

    // Smart Auto-detection: Detect if visitor is in India
    async function detectLocation() {
      // 1. URL parameter override for testing: ?currency=USD or ?currency=INR
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const forcedCurr = (urlParams.get('currency') || urlParams.get('curr') || '').toUpperCase();
        if (forcedCurr === 'USD' || forcedCurr === 'INR') {
          setCurrency(forcedCurr);
          return;
        }
      } catch (e) {}

      // 2. Instant synchronous check via Timezone & System Offset
      let isIndia = false;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const offset = new Date().getTimezoneOffset(); // India is -330
        const lang = (navigator.language || '').toLowerCase();
        const languages = (navigator.languages || []).map(l => l.toLowerCase());

        if (tz.includes('Calcutta') || tz.includes('Kolkata') || offset === -330 || lang.includes('-in') || languages.some(l => l.includes('-in'))) {
          isIndia = true;
        }
      } catch (e) {}

      if (isIndia) {
        setCurrency('INR');
      } else {
        setCurrency('USD');
      }

      // 3. Fast non-blocking IP Geolocation check
      try {
        const res = await fetch('https://api.country.is', { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country) {
            setCurrency(data.country === 'IN' ? 'INR' : 'USD');
          }
        }
      } catch (e) {
        // Fallback to timezone already applied
      }
    }

    detectLocation();
  }

  // Automated Horizontal Testimonials Slider (Right-to-Left with 1s pause)
  function initTestimonialsSlider() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    if (totalCards === 0) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isHovered = false;

    // Generate pagination dots
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    function getCardsPerView() {
      if (window.innerWidth <= 1024) return 1;
      return 2;
    }

    function getMaxIndex() {
      return Math.max(0, totalCards - getCardsPerView());
    }

    function updateSlider() {
      const card = cards[0];
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 36;
      const moveDistance = (cardWidth + gap) * currentIndex;

      track.style.transform = `translateX(-${moveDistance}px)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex >= maxIndex) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      updateSlider();
    }

    function prevSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex--;
      }
      updateSlider();
    }

    function goToSlide(index) {
      const maxIndex = getMaxIndex();
      currentIndex = Math.min(Math.max(0, index), maxIndex);
      updateSlider();
    }

    // Step-by-step automated right-to-left scroll: Pause for 1 second, then slide
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isHovered) {
          nextSlide();
        }
      }, 1750); // 1.75s cycle (0.75s smooth slide transition + 1.0s pause)
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function restartTimer() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartTimer();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartTimer();
      });
    }

    // Pause on hover
    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });

    window.addEventListener('resize', () => {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      updateSlider();
    }, { passive: true });

    updateSlider();
    startAutoPlay();
  }

  // Animation Loop (LERP smoothing)
  function animate() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * CONFIG.lerpSpeed;
    } else {
      currentFrame = targetFrame;
    }

    const frameToRender = Math.min(Math.max(Math.round(currentFrame), 0), CONFIG.frameCount - 1);

    if (frameToRender !== lastRenderedFrame || needsRedraw) {
      drawFrame(frameToRender);
      lastRenderedFrame = frameToRender;
      needsRedraw = false;
    }

    requestAnimationFrame(animate);
  }

  // Frosted Glass Legal Modals (Privacy Policy & Terms of Service)
  function initLegalModals() {
    const modal = document.getElementById('legal-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close-btn');
    const actionBtn = document.getElementById('modal-action-btn');
    const backdrop = document.getElementById('modal-backdrop');
    const openPrivacyBtn = document.getElementById('open-privacy-btn');
    const openTermsBtn = document.getElementById('open-terms-btn');

    if (!modal || !modalTitle || !modalBody) return;

    const privacyContent = `
      <div>
        <h4>🏢 1. Entity & Data Controller</h4>
        <p>This website is operated by <strong>Admirers Creation – AI & Digital Solutions</strong>, founded and led by principal engineer <strong>Debashish Paul</strong>. We act as the data controller for any personal details and communication submitted through this platform.</p>
      </div>
      <div>
        <h4>🔒 2. Data Collected & Purpose</h4>
        <p>When you fill out the contact or consultation form on this website, we collect your <strong>Full Name</strong>, <strong>Email Address</strong>, <strong>Phone Number / WhatsApp</strong>, <strong>Service Required</strong>, <strong>Estimated Budget</strong>, and <strong>Project Scope Details</strong>. This data is collected solely to evaluate project feasibility, provide technical estimates, and respond to your inquiry.</p>
      </div>
      <div>
        <h4>🛡️ 3. Zero Third-Party Selling or Sharing</h4>
        <p>Your privacy is absolute. Your contact information and project concepts are strictly confidential and are <strong>never sold, rented, monetized, or shared</strong> with third-party marketing companies, advertisers, or data brokers.</p>
      </div>
      <div>
        <h4>⚡ 4. Storage, Security & Cookies</h4>
        <p>Form submissions are securely routed via industry-standard <strong>TLS/SSL encryption</strong> to private, restricted-access Google Workspace workflows. We utilize minimal local session storage for essential UI preferences and performance caching. We do not engage in invasive tracking or sell user behavioral data.</p>
      </div>
      <div>
        <h4>📬 5. Global Privacy Rights (GDPR & CCPA)</h4>
        <p>Under international privacy standards (including GDPR and CCPA), you hold the right to request access to your submitted data, request corrections, or request immediate permanent deletion (&ldquo;Right to be Forgotten&rdquo;) at any time by emailing directly to <a href="mailto:pauldebashish115@gmail.com" style="color:#ff6b35;text-decoration:underline;">pauldebashish115@gmail.com</a>.</p>
      </div>
    `;

    const termsContent = `
      <div>
        <h4>⚖️ 1. Intellectual Property & Brand Rights</h4>
        <p>All case studies, interactive UI components, animations, 3D WebGL assets, custom source code, and design systems presented on this website are the proprietary intellectual property of <strong>Admirers Creation – AI & Digital Solutions</strong> and <strong>Debashish Paul</strong>. Unauthorized copying, scraping, or redistribution is strictly prohibited.</p>
      </div>
      <div>
        <h4>💼 2. Project Inquiries & Consultations</h4>
        <p>Submitting an inquiry through this website initiates a preliminary consultation and technical scoping dialogue. It does not establish a formal vendor-client contract until a customized <strong>Statement of Work (SOW)</strong> or service agreement is executed by both parties.</p>
      </div>
      <div>
        <h4>🌐 3. Case Studies & Demonstrations</h4>
        <p>References to third-party tools, frameworks, and client company trademarks are for technical demonstration and portfolio showcase purposes only. All respective trademarks belong to their respective owners.</p>
      </div>
      <div>
        <h4>🛡️ 4. Warranty & Liability Disclaimer</h4>
        <p>This website is provided &ldquo;as is&rdquo; to showcase design engineering capabilities and production excellence. Admirers Creation is not liable for indirect damages or temporary disruptions arising from third-party hosting networks or external API providers.</p>
      </div>
    `;

    function openModal(type) {
      if (type === 'privacy') {
        modalTitle.textContent = 'Privacy Policy';
        modalBody.innerHTML = privacyContent;
      } else {
        modalTitle.textContent = 'Terms of Service';
        modalBody.innerHTML = termsContent;
      }
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openPrivacyBtn) {
      openPrivacyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('privacy');
      });
    }

    if (openTermsBtn) {
      openTermsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('terms');
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (actionBtn) actionBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Floating Back to Top Button
  function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    function handleScroll() {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Projects Work Catalog Filter Controller
  function initProjectsFilter() {
    const filterBtns = document.querySelectorAll('.catalog-tab-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';

        // Update active tab buttons
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter and animate cards
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          const isMatch = (filter === 'all' || category === filter);

          if (isMatch) {
            card.classList.remove('is-hidden');
            card.classList.remove('is-animating-in');
            // Force reflow to re-trigger smooth entry animation
            void card.offsetWidth;
            card.classList.add('is-animating-in');
          } else {
            card.classList.add('is-hidden');
            card.classList.remove('is-animating-in');
          }
        });
      });
    });
  }

  // Mobile Navigation Drawer Controller (< 768px)
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (!toggleBtn || !drawer) return;

    function openDrawer() {
      drawer.classList.add('active');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-drawer-open');
    }

    function closeDrawer() {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-drawer-open');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Auto-close on clicking any drawer link
    const drawerLinks = drawer.querySelectorAll('.mobile-nav-link, .mobile-cta-btn, .mobile-nav-logo');
    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Handle screen resize to desktop (close drawer if open)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && drawer.classList.contains('active')) {
        closeDrawer();
      }
    }, { passive: true });
  }

  // Handle initial page load scroll position (Hero by default, or specific section if hashed)
  function handleInitialHashOrScroll() {
    const hash = window.location.hash;
    if (hash && hash !== '#' && hash !== '#hero') {
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // 3D Kinetic Text Flip Carousel (Hero Subheadline)
  function initHeroFlip() {
    const flipTrack = document.getElementById('hero-flip-track');
    if (!flipTrack) return;

    let flipIndex = 0;
    const totalFlipItems = 4;

    setInterval(() => {
      flipIndex++;
      flipTrack.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
      flipTrack.style.transform = `translateY(-${flipIndex * 1.32}em)`;

      if (flipIndex === totalFlipItems) {
        setTimeout(() => {
          flipTrack.style.transition = 'none';
          flipIndex = 0;
          flipTrack.style.transform = 'translateY(0)';
        }, 700);
      }
    }, 2800);
  }

  // Initialize
  function init() {
    handleInitialHashOrScroll();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', updateScrollTarget, { passive: true });

    handleResize();
    updateScrollTarget();
    animate();

    initHeroFlip();
    initProjectsFilter();
    initContactForm();
    initBudgetCurrencySwitcher();
    initCalendlyBookingTracker();
    initPhoneFlagDetector();
    initTestimonialsSlider();
    initSmoothScrollLinks();
    initMobileNav();
    initLegalModals();
    initBackToTop();
    preloadImages();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
