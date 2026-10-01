/**
 * NEXUS ENGINEERING & ADVISORY SERVICES
 * Architectural, Structural & Interior Engineering Experience Controller
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. STICKY HEADER & MOBILE DRAWER NAVIGATION
  // ==========================================================================
  const header = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const backToTopBtn = document.getElementById('backToTop');

  // Sticky header on scroll
  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollY > 600) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    const closeDrawer = () => {
      mobileToggle.classList.remove('active');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') && 
          !mobileDrawer.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        mobileToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Back to top click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ScrollSpy for Active Nav Links
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const observeSections = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.25 });

    sections.forEach(sec => observer.observe(sec));
  };
  observeSections();

  // ==========================================================================
  // 2. ANIMATED STATISTICS COUNTERS
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-count');
  let statsCounted = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const step = 25;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  };

  const statsSection = document.getElementById('about');
  if (statsSection && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(num => countUp(num));
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // ==========================================================================
  // 3. SERVICES CATEGORIZED TAB SWITCHER
  // ==========================================================================
  const serviceTabs = document.querySelectorAll('.service-tab-btn');
  const servicePanels = document.querySelectorAll('.services-content-panel');

  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCategory = tab.getAttribute('data-service-category');

      serviceTabs.forEach(t => t.classList.remove('active'));
      servicePanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(`service-panel-${targetCategory}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Clicking on a service card pre-selects service in contact form & scrolls
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const serviceName = card.querySelector('.service-card-title')?.textContent.trim();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        // Highlight matching checkbox
        const checkboxes = document.querySelectorAll('input[name="services"]');
        checkboxes.forEach(cb => {
          if (cb.value.toLowerCase().includes(serviceName.toLowerCase()) || 
              serviceName.toLowerCase().includes(cb.value.toLowerCase())) {
            cb.checked = true;
          }
        });
      }
    });
  });

  // ==========================================================================
  // 4. PORTFOLIO DATA & INTERACTIVE FILTERING + MODAL
  // ==========================================================================
  const projectsData = [
    {
      id: 'the-solarium-penthouse',
      title: 'The Solarium Penthouse',
      category: 'Residential',
      subCategory: 'Apartment',
      location: 'South Kensington, London',
      area: '4,600 sq.ft.',
      year: '2025',
      duration: '7 Months',
      coverImg: 'assets/img_6.jpg',
      shortDesc: 'A double-height duplex penthouse celebrating raw travertine, smoked European oak, and architectural perimeter glazing.',
      concept: 'Harmonizing brutalist architectural lines with warm tactile textiles and bespoke Italian monolithic joinery.',
      challenge: 'Managing double-height acoustic resonance and optimizing natural daylight without glare on custom walnut paneling.',
      solution: 'Engineered acoustic micro-perforated ceiling panels, integrated flush motorized solar blinds, and sculptural bouclé upholstery.',
      materials: ['Navona Roman Travertine', 'Smoked European White Oak', 'Brushed Champagne Brass', 'Belgian Oatmeal Linen'],
      colors: ['#282624', '#c8a97e', '#dfd7cc', '#85786b'],
      gallery: [
        'assets/img_22.jpg',
        'assets/img_23.jpg',
        'assets/img_4.jpg'
      ]
    },
    {
      id: 'villa-terracotta',
      title: 'Villa Terracotta',
      category: 'Residential',
      subCategory: 'Villa',
      location: 'Bandra West, Mumbai',
      area: '7,200 sq.ft.',
      year: '2024',
      duration: '11 Months',
      coverImg: 'assets/img_24.jpg',
      shortDesc: 'A Mediterranean coastal villa fusing lime-washed plaster, hand-cut terracotta floor tiles, and private garden verandahs.',
      concept: 'Biophilic cross-ventilation paired with understated Indian Contemporary woodwork and indoor courtyard water gardens.',
      challenge: 'High coastal humidity requiring moisture-resistant sustainable hardwoods and salt-tolerant bronze exterior joinery.',
      solution: 'Custom seasoned teakwood with organic wax finishes, honed Kota stone borders, and lime plaster wall finishes.',
      materials: ['Handmade Terracotta Tiles', 'Seasoned CP Teak', 'Honed Green Kota Stone', 'Linen Gauze Drapery'],
      colors: ['#c97a5b', '#e8dfd3', '#394038', '#ab8a66'],
      gallery: [
        'assets/img_25.jpg',
        'assets/img_26.jpg'
      ]
    },
    {
      id: 'monolith-culinary-suite',
      title: 'Monolith Culinary Suite',
      category: 'Kitchen',
      subCategory: 'Living Room',
      location: 'Tribeca, New York',
      area: '1,250 sq.ft.',
      year: '2025',
      duration: '4 Months',
      coverImg: 'assets/img_27.jpg',
      shortDesc: 'A sculptural chef’s kitchen anchored by a seamless 14-foot quartzite waterfall island and concealed pocket bar.',
      concept: 'Discreet luxury where all appliances vanish behind architectural bookmatched fluted timber cabinetry.',
      challenge: 'Structural weight distribution for a 1.8-ton solid Taj Mahal quartzite monolith on loft floor joists.',
      solution: 'Custom steel load-dispersing substructure integrated seamlessly beneath radiant heated microcement flooring.',
      materials: ['Taj Mahal Quartzite', 'Ebonized Ash Millwork', 'Aged Gunmetal Fixtures', 'Fluted Glass Screens'],
      colors: ['#1e1f24', '#d8d4cd', '#9e978e', '#665f57'],
      gallery: [
        'assets/img_1.jpg',
        'assets/img_25.jpg'
      ]
    },
    {
      id: 'lumina-legal-headquarters',
      title: 'Lumina Capital Partners',
      category: 'Commercial',
      subCategory: 'Office',
      location: 'Mayfair, London',
      area: '9,800 sq.ft.',
      year: '2024',
      duration: '8 Months',
      coverImg: 'assets/img_28.jpg',
      shortDesc: 'A private wealth & legal boardroom suite expressing discreet authority with tailored leather and acoustic slats.',
      concept: 'High-focus acoustic sanctuary combining residential hospitality intimacy with enterprise video-conferencing technology.',
      challenge: 'Speech confidentiality standards (NC-25) across glass-fronted executive meeting spaces.',
      solution: 'Double-glazed switchable privacy partitions and acoustic micro-slatted walnut walls backing sound-dampening wool felts.',
      materials: ['Bookmatched American Walnut', 'Cognac Saddle Leather', 'Nero Marquina Marble', 'Acoustic Wool Felt'],
      colors: ['#171920', '#a36d42', '#dcd8cf', '#2e3340'],
      gallery: [
        'assets/img_29.jpg',
        'assets/img_22.jpg'
      ]
    },
    {
      id: 'botanica-bistro-lounge',
      title: 'Botanica Pavilion & Bistro',
      category: 'Commercial',
      subCategory: 'Restaurant',
      location: 'Indiranagar, Bengaluru',
      area: '3,800 sq.ft.',
      year: '2024',
      duration: '5 Months',
      coverImg: 'assets/img_30.jpg',
      shortDesc: 'A botanical culinary sanctuary featuring custom arched plaster niches, sage velvet banquettes, and brass bistro lights.',
      concept: 'Atmospheric day-to-night transformation powered by circadian-responsive lighting and lush tropical indoor flora.',
      challenge: 'Maximizing covers while safeguarding intimate acoustics and clear server service corridors.',
      solution: 'Bespoke high-backed acoustic velvet booths forming quiet private pods and overhead brass suspension planters.',
      materials: ['Hand-Rubbed Brass', 'Forest Green Velvet', 'Terrazzo Flooring', 'Exposed Reclaimed Brick'],
      colors: ['#233a30', '#c8a97e', '#dfd5c6', '#69412f'],
      gallery: [
        'assets/img_25.jpg',
        'assets/img_31.jpg'
      ]
    },
    {
      id: 'serenity-master-suite',
      title: 'The Serenity Sanctuary',
      category: 'Residential',
      subCategory: 'Bedroom',
      location: 'Alipore, Kolkata',
      area: '950 sq.ft.',
      year: '2025',
      duration: '3 Months',
      coverImg: 'assets/img_32.jpg',
      shortDesc: 'A master sanctuary dedicated to restorative sleep, wrapped in warm Japandi slatted woodwork, bouclé, and soft wash lights.',
      concept: 'Zero visual clutter, concealed flush-to-wall wardrobe doors, and organic tactile layers.',
      challenge: 'Integrating an expansive walk-in dressing lounge and open spa ensuite without diminishing bedroom calm.',
      solution: 'Smoked glass fluted sliding partitions with recessed ceiling tracks and ambient hidden perimeter warm LEDs (2400K).',
      materials: ['Natural White Oak Slats', 'Ivory Bouclé Fabric', 'Calacatta Gold Marble', 'Brushed Bronze Hardware'],
      colors: ['#d7cfc5', '#8a7e72', '#222327', '#c8a97e'],
      gallery: [
        'assets/img_26.jpg',
        'assets/img_1.jpg'
      ]
    },
    {
      id: 'curated-art-home-decor',
      title: 'L’Objet Décor Residence',
      category: 'Décor',
      subCategory: 'Living Room',
      location: 'Chelsea, London',
      area: '2,900 sq.ft.',
      year: '2025',
      duration: '3 Months',
      coverImg: 'assets/img_33.jpg',
      shortDesc: 'An art collector’s apartment furnished with sculptural Pierre Paulin armchairs, antique kilim rugs, and gallery lighting.',
      concept: 'Curated home décor styling celebrating balance between collectible design pieces and everyday domestic comfort.',
      challenge: 'Displaying oversized modern canvas art without making the space feel like a stark commercial gallery.',
      solution: 'Layered warm linen textiles, bespoke fluted pedestal plinths, and museum-grade color-true CRI 98 accent spot lighting.',
      materials: ['Wool & Silk Hand-Knotted Rugs', 'Ceramic Sculptural Vessels', 'Raw Travertine Plinths', 'Custom Linen Curtains'],
      colors: ['#e4ded5', '#2a2b30', '#c29d6d', '#615349'],
      gallery: [
        'assets/img_22.jpg',
        'assets/img_23.jpg'
      ]
    },
    {
      id: 'atrium-study-retreat',
      title: 'Atrium Study & Library',
      category: 'Residential',
      subCategory: 'Office',
      location: 'Koregaon Park, Pune',
      area: '650 sq.ft.',
      year: '2024',
      duration: '2.5 Months',
      coverImg: 'assets/img_34.jpg',
      shortDesc: 'A floor-to-ceiling brass-ladder private library with an integrated leather writing desk and garden light well.',
      concept: 'An introspective reading room with moody charcoal lacquer and warm brass joinery details.',
      challenge: 'Storing over 2,000 architectural volumes while maintaining a light, uncluttered visual rhythm.',
      solution: 'Cantilevered steel-reinforced joinery shelves with recessed dimmable book lighting and hidden cable wireway management.',
      materials: ['Smoked Charcoal Walnut', 'Patinated Brass Ladder', 'Full-Grain English Leather', 'Honed Green Slate'],
      colors: ['#17181c', '#ab9273', '#94959c', '#403831'],
      gallery: [
        'assets/img_22.jpg',
        'assets/img_4.jpg'
      ]
    }
  ];

  // Render Projects Grid
  const projectsGrid = document.getElementById('projectsGrid');
  const filterButtons = document.querySelectorAll('.portfolio-filter-btn');

  const renderProjects = (filter = 'all') => {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    const filtered = projectsData.filter(item => {
      if (filter === 'all') return true;
      const f = filter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cat = item.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sub = item.subCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return cat.includes(f) || sub.includes(f) || f.includes(cat) || f.includes(sub);
    });

    filtered.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('data-id', project.id);
      card.innerHTML = `
        <div class="project-media-wrap">
          <span class="project-badge-float">${project.category} &bull; ${project.subCategory}</span>
          <img src="${project.coverImg}" alt="${project.title}" class="project-img" loading="lazy" onerror="this.src='assets/img_1.jpg'">
        </div>
        <div class="project-info">
          <div class="project-meta-row">
            <span class="project-location">${project.location}</span>
            <span class="project-location">${project.area}</span>
          </div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.shortDesc}</p>
          <span class="project-action-link">
            Explore Project Case
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </span>
        </div>
      `;

      card.addEventListener('click', () => openProjectModal(project));
      projectsGrid.appendChild(card);
    });
  };

  // Filter Buttons Interaction
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderProjects(filter);
    });
  });

  // Initial render
  renderProjects('all');

  // ==========================================================================
  // 5. PROJECT DETAIL MODAL CONTROLLER
  // ==========================================================================
  const modalBackdrop = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalHeroImg = document.getElementById('modalHeroImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalLocation = document.getElementById('modalLocation');
  const modalArea = document.getElementById('modalArea');
  const modalDuration = document.getElementById('modalDuration');
  const modalYear = document.getElementById('modalYear');
  const modalConcept = document.getElementById('modalConcept');
  const modalChallenge = document.getElementById('modalChallenge');
  const modalSolution = document.getElementById('modalSolution');
  const modalMaterialsList = document.getElementById('modalMaterialsList');
  const modalPaletteRow = document.getElementById('modalPaletteRow');
  const modalGalleryGrid = document.getElementById('modalGalleryGrid');

  const openProjectModal = (proj) => {
    if (!modalBackdrop) return;

    modalHeroImg.src = proj.coverImg;
    modalHeroImg.alt = proj.title;
    modalCategory.textContent = `${proj.category} · ${proj.subCategory}`;
    modalTitle.textContent = proj.title;
    modalLocation.textContent = proj.location;
    modalArea.textContent = proj.area;
    modalDuration.textContent = proj.duration;
    modalYear.textContent = proj.year;

    modalConcept.textContent = proj.concept;
    modalChallenge.textContent = proj.challenge;
    modalSolution.textContent = proj.solution;

    // Materials list
    modalMaterialsList.innerHTML = '';
    proj.materials.forEach(mat => {
      const li = document.createElement('li');
      li.style.cssText = 'font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem;';
      li.innerHTML = `<span style="width: 5px; height: 5px; border-radius: 50%; background: var(--accent-gold); display: inline-block;"></span> ${mat}`;
      modalMaterialsList.appendChild(li);
    });

    // Palette Chips
    modalPaletteRow.innerHTML = '';
    proj.colors.forEach(col => {
      const chip = document.createElement('div');
      chip.className = 'palette-chip';
      chip.style.backgroundColor = col;
      chip.title = `Swatch: ${col}`;
      modalPaletteRow.appendChild(chip);
    });

    // Gallery
    modalGalleryGrid.innerHTML = '';
    proj.gallery.forEach(imgUrl => {
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'height: 180px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle);';
      imgWrap.innerHTML = `<img src="${imgUrl}" alt="${proj.title} detail" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">`;
      modalGalleryGrid.appendChild(imgWrap);
    });

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeProjectModal();
    }
  });

  // ==========================================================================
  // 6. BEFORE & AFTER INTERACTIVE DRAGGABLE SLIDER
  // ==========================================================================
  const baSlider = document.getElementById('baSlider');
  const baAfterLayer = document.getElementById('baAfterLayer');
  const baHandleLine = document.getElementById('baHandleLine');
  const baBeforeImg = document.getElementById('baBeforeImg');
  const baAfterImg = document.getElementById('baAfterImg');
  const baTabs = document.querySelectorAll('.ba-tab-btn');

  const baPairs = {
    penthouse: {
      before: 'assets/img_5.jpg',
      after: 'assets/img_6.jpg',
      title: 'South Kensington Penthouse Living Room'
    },
    kitchen: {
      before: 'assets/img_35.jpg',
      after: 'assets/img_27.jpg',
      title: 'Tribeca Monolith Chef Kitchen'
    },
    suite: {
      before: 'assets/img_36.jpg',
      after: 'assets/img_32.jpg',
      title: 'Alipore Serenity Master Suite'
    }
  };

  // Slider Dragging Logic
  if (baSlider && baAfterLayer && baHandleLine) {
    let isDragging = false;

    const setSliderPosition = (clientX) => {
      const rect = baSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;

      baAfterLayer.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      baHandleLine.style.left = `${percentage}%`;
    };

    baSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events for mobile
    baSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Multi-room Switcher
    baTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        baTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const roomKey = tab.getAttribute('data-ba');
        const pair = baPairs[roomKey];
        if (pair) {
          baBeforeImg.src = pair.before;
          baAfterImg.src = pair.after;
          // Reset slider to center
          baAfterLayer.style.clipPath = `polygon(0 0, 50% 0, 50% 100%, 0 100%)`;
          baHandleLine.style.left = '50%';
        }
      });
    });
  }

  // ==========================================================================
  // 7. TESTIMONIALS CAROUSEL ENGINE
  // ==========================================================================
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('testimonialDots');

  if (slides.length > 0) {
    let currentSlide = 0;
    let autoSlideTimer = null;

    // Create dots
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    const goToSlide = (idx) => {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');

      currentSlide = (idx + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto Play with pause on hover
    const startAutoPlay = () => {
      autoSlideTimer = setInterval(nextSlide, 7000);
    };

    const stopAutoPlay = () => {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
    };

    const sliderBox = document.querySelector('.testimonials-slider-box');
    if (sliderBox) {
      sliderBox.addEventListener('mouseenter', stopAutoPlay);
      sliderBox.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
  }

  // ==========================================================================
  // 8. CONSULTATION / ENQUIRY MULTI-FIELD FORM CONTROLLER
  // ==========================================================================
  const form = document.getElementById('consultationForm');
  const submitBtn = document.getElementById('formSubmitBtn');
  const successModal = document.getElementById('successModal');
  const successCloseBtn = document.getElementById('successCloseBtn');
  const clientSuccessName = document.getElementById('clientSuccessName');
  const fileInput = document.getElementById('floorPlanInput');
  const fileStatus = document.getElementById('fileStatus');

  // File Upload Status Display
  if (fileInput && fileStatus) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        fileStatus.style.display = 'block';
        fileStatus.textContent = `✓ Selected: ${file.name} (${sizeMb} MB) — Ready for submission`;
      } else {
        fileStatus.style.display = 'none';
      }
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const city = document.getElementById('clientCity').value.trim();

      if (!name || !phone || !email || !city) {
        alert('Please complete all required fields.');
        return;
      }

      // Simulate submission state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span>Securing Your Consultation Slot...</span>
        <svg style="width:16px;height:16px;animation:spin 0.8s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (clientSuccessName) clientSuccessName.textContent = name;
        if (successModal) successModal.classList.add('show');
        form.reset();
        if (fileStatus) fileStatus.style.display = 'none';
      }, 900);
    });
  }

  if (successCloseBtn && successModal) {
    successCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('show');
    });
  }

  // Keyframes injection for spinner
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

});
