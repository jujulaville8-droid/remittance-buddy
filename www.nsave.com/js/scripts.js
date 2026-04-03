// nsave.com — Scroll-driven IX2 animations (v3)
// Calibrated from frame-by-frame scroll capture at 1920x1080

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. LOAD SEQUENCE ───
  document.body.classList.add('loaded');

  // ─── 2. DOM REFS ───
  const heroHeading = document.querySelector('.home-hero-heading-wrap');
  const mockupAnimScroll = document.querySelector('.mockup-anim-scroll');
  const mockupAnimTarget = document.querySelector('.mockup-anim-target');
  const featuresWrap = document.querySelector('.features-wrap');
  const featureItems = document.querySelectorAll('.features-item');
  const screenFeatureItems = document.querySelectorAll('.screen-features-item');
  // pricing-inner fades out after scroll ~4200 on live site
  const pricingInner = document.querySelector('.pricing-scroll-inner');
  const pricingNumber = document.querySelector('.pricing-scroll-number');
  const pricingLabel = document.querySelector('.pricing-scroll-label');
  const cardHandImg = document.querySelector('.card-hand-img');
  const cardSectionCards = document.querySelector('.home-section-cards');
  const nav = document.querySelector('.nav');

  // ─── 3. UTILITIES ───
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ─── 4. SCROLL HANDLER ───
  let ticking = false;
  let pricingDone = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      updateHeroHeading(y);
      updateMockupScroll(y);
      updateFeaturesWrap(y);
      updateFeatureItems(y);
      updateMockupExit(y);
      updatePricing(y);
      updateCardHand(y);
      updatePricingInner(y);
      updateNav(y);
      ticking = false;
    });
  }

  // ── Hero heading: fade out 0→540 ──
  function updateHeroHeading(y) {
    if (!heroHeading) return;
    if (y <= 0) {
      heroHeading.style.opacity = '1';
      heroHeading.style.transform = 'translateY(0px)';
    } else if (y >= 540) {
      heroHeading.style.opacity = '0';
      heroHeading.style.transform = 'translateY(-162px)';
    } else {
      const t = y / 540;
      heroHeading.style.opacity = String(1 - t);
      heroHeading.style.transform = `translateY(${-162 * t}px)`;
    }
  }

  // ── Mockup scroll rotation: 0→1200 ──
  function updateMockupScroll(y) {
    if (!mockupAnimScroll) return;
    const t = clamp01(y / 1200);
    const rot = lerp(30, 10, t);
    const sc = lerp(1, 1.28, t);
    const tx = lerp(0, 469, t);
    const ty = lerp(0, 107, t);
    mockupAnimScroll.style.transform =
      `rotate(${rot}deg) scale(${sc}) translate(${tx}px, ${ty}px)`;
  }

  // ── Features wrap: fade in 400→900, hold, fade out 1700→2000 ──
  // Live site shows features-wrap=1.0 by scroll 500, so fade-in is earlier
  function updateFeaturesWrap(y) {
    if (!featuresWrap) return;
    if (y < 400) {
      featuresWrap.style.opacity = '0';
    } else if (y < 900) {
      featuresWrap.style.opacity = String(clamp01((y - 400) / 500));
    } else if (y < 1700) {
      featuresWrap.style.opacity = '1';
    } else if (y < 2000) {
      featuresWrap.style.opacity = String(1 - clamp01((y - 1700) / 300));
    } else {
      featuresWrap.style.opacity = '0';
    }
  }

  // ── Feature items: smooth crossfade ──
  function updateFeatureItems(y) {
    if (featureItems.length === 0) return;
    const ranges = [
      { fadeIn: 400, peak: 700, fadeOut: 1100, end: 1500 },
      { fadeIn: 1000, peak: 1150, fadeOut: 1300, end: 1600 },
      { fadeIn: 1200, peak: 1350, fadeOut: 1650, end: 1900 },
    ];
    let dominantIndex = -1;
    let maxOp = 0;

    featureItems.forEach((item, i) => {
      if (i >= ranges.length) return;
      const r = ranges[i];
      let op = 0.2;

      if (y < r.fadeIn) op = 0.2;
      else if (y < r.peak) op = lerp(0.2, 1.0, clamp01((y - r.fadeIn) / (r.peak - r.fadeIn)));
      else if (y < r.fadeOut) op = 1.0;
      else if (y < r.end) op = lerp(1.0, 0.2, clamp01((y - r.fadeOut) / (r.end - r.fadeOut)));
      else op = 0.2;

      if (y < 400) op = 0;
      if (y > 2000) op = 0;

      item.style.opacity = String(op);
      item.classList.toggle('active', op > 0.8);

      if (op > maxOp) { maxOp = op; dominantIndex = i; }
    });

    screenFeatureItems.forEach((screen, i) => {
      screen.style.display = (i === dominantIndex) ? 'block' : 'none';
    });
  }

  // ── Mockup exit: 1700→2100 ──
  function updateMockupExit(y) {
    if (!mockupAnimTarget) return;
    if (y < 1700) mockupAnimTarget.style.opacity = '1';
    else if (y >= 2100) mockupAnimTarget.style.opacity = '0';
    else mockupAnimTarget.style.opacity = String(1 - clamp01((y - 1700) / 400));
  }

  // ── Pricing: inner + number + label fade in 1900→2200 ──
  function updatePricing(y) {
    if (!pricingNumber) return;

    if (y < 1900) {
      pricingNumber.style.opacity = '0';
      pricingNumber.style.transform = 'translateY(64px)';
      if (pricingLabel) {
        pricingLabel.style.opacity = '0';
        pricingLabel.style.transform = 'translateY(64px)';
      }
      pricingDone = false;
    } else if (y >= 2200) {
      pricingNumber.style.opacity = '1';
      pricingNumber.style.transform = 'translateY(0px)';
      if (pricingLabel) {
        pricingLabel.style.opacity = '1';
        pricingLabel.style.transform = 'translateY(0px)';
      }
      if (!pricingDone) { pricingDone = true; animatePricingCounter(); }
    } else {
      const t = clamp01((y - 1900) / 300);
      const ty = lerp(64, 0, t);
      pricingNumber.style.opacity = String(t);
      pricingNumber.style.transform = `translateY(${ty}px)`;
      if (pricingLabel) {
        const tL = clamp01((y - 1950) / 250);
        pricingLabel.style.opacity = String(tL);
        pricingLabel.style.transform = `translateY(${lerp(64, 0, tL)}px)`;
      }
      if (!pricingDone && t > 0.8) { pricingDone = true; animatePricingCounter(); }
    }
  }

  function animatePricingCounter() {
    if (!pricingNumber) return;
    const stages = ['$9.99', '$7.99', '$4.99', '$2.99', '$0.99', '$0.00'];
    const dur = 1200;
    const start = performance.now();
    function tick(now) {
      const i = Math.min(stages.length - 1, Math.floor((now - start) / (dur / stages.length)));
      pricingNumber.textContent = stages[i];
      if (now - start < dur) requestAnimationFrame(tick);
      else pricingNumber.textContent = '$0.00';
    }
    requestAnimationFrame(tick);
  }

  // ── Card hand animation ──
  // Live site IX2 overrides the CSS translateY(20rem) to translateY(0) at all times,
  // then adds a gentle translateY drift (262px→426px) after scroll ~5000.
  // So the hand is at translateY(0) most of the page, then bobs down slightly at the end.
  function updateCardHand(y) {
    if (!cardHandImg) return;

    // Live data: card-hand-img transform is identity (0,0) from scroll 0 to ~4800,
    // then translateY(262) at scroll 5000, translateY(426.6) at scroll 5500.
    // The 426.6 = 20rem, meaning IX2 restores the CSS default at the very bottom.
    const driftStart = 4800;
    const driftEnd = 5500;

    if (y < driftStart) {
      // Override CSS translateY(20rem) — hand is at natural position
      cardHandImg.style.transform = 'translateY(0)';
    } else if (y >= driftEnd) {
      cardHandImg.style.transform = 'translateY(426.6px)';
    } else {
      // Drift down from 0 to 426.6px
      const t = clamp01((y - driftStart) / (driftEnd - driftStart));
      const eased = t * t; // ease-in
      cardHandImg.style.transform = `translateY(${426.6 * eased}px)`;
    }
  }

  // ── Pricing inner: fade out after section scrolls past ──
  function updatePricingInner(y) {
    if (!pricingInner) return;
    if (y < 4200) {
      pricingInner.style.opacity = '1';
    } else if (y >= 4800) {
      pricingInner.style.opacity = '0';
    } else {
      pricingInner.style.opacity = String(1 - clamp01((y - 4200) / 600));
    }
  }

  // ── Nav blur ──
  function updateNav(y) {
    if (!nav) return;
    if (y > 100) {
      nav.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
      nav.style.backdropFilter = 'blur(20px)';
      nav.style.webkitBackdropFilter = 'blur(20px)';
    } else {
      nav.style.backgroundColor = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.webkitBackdropFilter = 'none';
    }
  }

  // Start scroll handler
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial state

  // ─── 5. CARD SLIDER ───
  // Webflow uses display:block + inline-block slides, NOT flexbox
  const slider = document.querySelector('.slider-cards.w-slider');
  if (slider) {
    const mask = slider.querySelector('.w-slider-mask');
    const slides = slider.querySelectorAll('.w-slide');
    const leftArrow = slider.querySelector('.w-slider-arrow-left');
    const rightArrow = slider.querySelector('.w-slider-arrow-right');
    const dots = slider.querySelectorAll('.w-slider-dot');
    let currentSlide = 0;

    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, slides.length - 1));
      if (mask && slides.length > 0) {
        const slideW = slides[0].getBoundingClientRect().width;
        const ml = parseFloat(getComputedStyle(slides[0]).marginLeft) || 0;
        const mr = parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
        const offset = currentSlide * (slideW + ml + mr);
        mask.style.transform = `translateX(-${offset}px)`;
        mask.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
      dots.forEach((dot, i) => dot.classList.toggle('w-active', i === currentSlide));
    }

    if (leftArrow) leftArrow.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (rightArrow) rightArrow.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

    let touchStartX = 0;
    if (mask) {
      mask.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      mask.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1));
      }, { passive: true });
    }

    // Don't override display — keep Webflow's native block/inline-block
    goToSlide(0);
    window.addEventListener('resize', () => goToSlide(currentSlide));
  }

  // ─── 6. MODALS ───
  const modalWraps = document.querySelectorAll('.modal-wrap');
  const modalLinks = document.querySelectorAll('.feature-modal-link');

  modalLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = modalWraps[i];
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        const inner = modal.querySelector('.modal');
        if (inner && inner.getBoundingClientRect().height > window.innerHeight * 0.9)
          modal.classList.add('too-tall');
      }
    });
  });

  modalWraps.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    const bg = modal.querySelector('.modal-bg');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    if (bg) bg.addEventListener('click', () => closeModal(modal));
  });

  function closeModal(modal) {
    modal.classList.remove('open', 'too-tall');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modalWraps.forEach(m => closeModal(m));
  });

  // ─── 7. NAV DROPDOWNS ───
  document.querySelectorAll('.dropdownwrapper').forEach(wrapper => {
    const dropdown = wrapper.querySelector('.dropdowndesktop');
    let hideTimeout;
    if (!dropdown) return;

    wrapper.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
      dropdown.style.display = 'flex';
      dropdown.style.flexDirection = 'column';
      dropdown.style.gap = '20px';
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translateY(-8px)';
      requestAnimationFrame(() => {
        dropdown.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0)';
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translateY(-8px)';
      hideTimeout = setTimeout(() => { dropdown.style.display = 'none'; }, 200);
    });
  });

  // ─── 8. MOBILE MENU ───
  const menuBtn = document.querySelector('.menu-btn, .w-nav-button');
  const mobileOverlay = document.querySelector('.w-nav-overlay, .m-nav-overlay');
  const navMenu = document.querySelector('.nav-menu, .w-nav-menu');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('w--open');
      if (navMenu) {
        navMenu.style.display = isOpen ? 'block' : '';
        navMenu.classList.toggle('w--nav-menu-open', isOpen);
      }
      if (mobileOverlay) {
        mobileOverlay.style.display = isOpen ? 'block' : 'none';
        mobileOverlay.style.height = isOpen ? '100vh' : '0';
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // ─── 9. SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      try {
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      } catch (_) {}
    });
  });

  // ─── 10. COUNTRIES BANNER MARQUEE ───
  const countriesBanner = document.querySelector('.countries-banner');
  if (countriesBanner) {
    const wrap = countriesBanner.closest('.countries-banner-wrap');
    if (wrap) {
      wrap.style.overflow = 'hidden';
      const clone = countriesBanner.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      wrap.appendChild(clone);
      let pos = 0;
      function animBanner() {
        pos -= 0.5;
        if (Math.abs(pos) >= countriesBanner.offsetWidth) pos = 0;
        countriesBanner.style.transform = `translateX(${pos}px)`;
        clone.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(animBanner);
      }
      countriesBanner.style.display = 'inline-block';
      clone.style.display = 'inline-block';
      wrap.style.whiteSpace = 'nowrap';
      animBanner();
    }
  }

  // ─── 11. SECTION REVEALS ───
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.home-section-heading, .home-section-cards, .features-section, .footer-top'
  ).forEach(el => revealObs.observe(el));

  // Slider dot init
  const sliderDots = document.querySelectorAll('.w-slider-dot');
  if (sliderDots.length) sliderDots[0]?.classList.add('w-active');

});
