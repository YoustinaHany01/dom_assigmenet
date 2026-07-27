document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================================
  // 1. SCROLL PROGRESS BAR
  // =============================================================
  const progressBar = document.getElementById('scroll-progress');

  function updateProgressBar() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgressBar);

  // =============================================================
  // 2. ACTIVE NAV LINK ON SCROLL (Scrollspy)
  // =============================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const navbar = document.getElementById('header');
  let navH = navbar ? navbar.offsetHeight : 0;

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navH - 50;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  window.addEventListener('resize', () => {
    navH = navbar ? navbar.offsetHeight : 0;
  });

  // =============================================================
  // 3. THEME TOGGLE (Dark / Light Mode)
  // =============================================================
  const themeToggle = document.getElementById('theme-toggle-button');
  const htmlTag = document.documentElement;
  const DARK_CLASS = 'dark';
  const THEME_STORAGE_KEY = 'portfolio-theme';

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark') {
    htmlTag.classList.add(DARK_CLASS);
  } else {
    htmlTag.classList.remove(DARK_CLASS);
  }

  function toggleTheme() {
    const isDark = htmlTag.classList.toggle(DARK_CLASS);
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // =============================================================
  // 4. PORTFOLIO FILTER
  // =============================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portItems = document.querySelectorAll('.portfolio-item');

  function filterPortfolio(filterValue) {
    portItems.forEach((item) => {
      const category = item.getAttribute('data-category');
      if (filterValue === 'all' || category === filterValue) {
        item.classList.remove('hidden');
        item.style.display = '';
      } else {
        item.classList.add('hidden');
        item.style.display = 'none';
      }
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      filterButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const filterValue = this.getAttribute('data-filter');
      filterPortfolio(filterValue);
    });
  });

  // =============================================================
  // 5. TESTIMONIALS CAROUSEL
  // =============================================================
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dots = document.querySelectorAll('.carousel-dot');
  let currentIndex = 0;
  let autoplayInterval = null;

  if (track && slides.length) {
    function goToSlide(index) {
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    function startAutoplay(interval) {
      stopAutoplay();
      autoplayInterval = setInterval(nextSlide, interval || 4000);
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', () => startAutoplay());
    }

    startAutoplay();
  }

  // =============================================================
  // 6. SIDEBAR CUSTOMIZER — Theme Colors & Fonts
  // =============================================================
  const customizerToggle = document.getElementById('customizer-toggle');
  const customizerSidebar = document.getElementById('customizer-sidebar');

  if (customizerToggle && customizerSidebar) {
    // Toggle sidebar
    customizerToggle.addEventListener('click', () => {
      customizerSidebar.classList.toggle('open');
    });

    // Color swatches
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const PRIMARY_PROP = '--primary';
    const SECONDARY_PROP = '--secondary';
    const ACCENT_PROP = '--accent';

    // Color scheme presets
    const colorSchemes = {
      '#4a7cff': { primary: '#4a7cff', secondary: '#8b5cf6', accent: '#f59e0b' },
      '#8b5cf6': { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' },
      '#06b6d4': { primary: '#06b6d4', secondary: '#3b82f6', accent: '#10b981' },
      '#f59e0b': { primary: '#f59e0b', secondary: '#f97316', accent: '#ef4444' },
      '#ef4444': { primary: '#ef4444', secondary: '#ec4899', accent: '#f59e0b' },
      '#10b981': { primary: '#10b981', secondary: '#06b6d4', accent: '#8b5cf6' },
      '#ec4899': { primary: '#ec4899', secondary: '#8b5cf6', accent: '#f59e0b' },
      '#f97316': { primary: '#f97316', secondary: '#f59e0b', accent: '#ef4444' },
    };

    function applyColorScheme(primaryColor) {
      const scheme = colorSchemes[primaryColor] || colorSchemes['#4a7cff'];
      document.documentElement.style.setProperty(PRIMARY_PROP, scheme.primary);
      document.documentElement.style.setProperty(SECONDARY_PROP, scheme.secondary);
      document.documentElement.style.setProperty(ACCENT_PROP, scheme.accent);
      localStorage.setItem('portfolio-primary-color', scheme.primary);
      localStorage.setItem('portfolio-secondary-color', scheme.secondary);
      localStorage.setItem('portfolio-accent-color', scheme.accent);

      colorSwatches.forEach((swatch) => {
        swatch.classList.toggle('active', swatch.getAttribute('data-color') === primaryColor);
      });
    }

    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', function () {
        const color = this.getAttribute('data-color');
        applyColorScheme(color);
      });
    });

    // Font buttons
    const fontButtons = document.querySelectorAll('.font-btn');
    const BODY_FONT_PROP = '--body-font';

    function applyFont(fontFamily) {
      // fontFamily like "'Tajawal', sans-serif"
      document.documentElement.style.setProperty(BODY_FONT_PROP, fontFamily);
      localStorage.setItem('portfolio-body-font', fontFamily);

      fontButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-font') === fontFamily);
      });
    }

    fontButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        const font = this.getAttribute('data-font');
        applyFont(font);
      });
    });

    // Restore saved state
    const savedPrimary = localStorage.getItem('portfolio-primary-color');
    const savedSecondary = localStorage.getItem('portfolio-secondary-color');
    const savedAccent = localStorage.getItem('portfolio-accent-color');
    const savedFont = localStorage.getItem('portfolio-body-font');

    if (savedPrimary) {
      document.documentElement.style.setProperty(PRIMARY_PROP, savedPrimary);
      colorSwatches.forEach((swatch) => {
        swatch.classList.toggle('active', swatch.getAttribute('data-color') === savedPrimary);
      });
    }
    if (savedSecondary) document.documentElement.style.setProperty(SECONDARY_PROP, savedSecondary);
    if (savedAccent) document.documentElement.style.setProperty(ACCENT_PROP, savedAccent);
    if (savedFont) {
      document.documentElement.style.setProperty(BODY_FONT_PROP, savedFont);
      fontButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-font') === savedFont);
      });
    }

    // Reset button
    const resetBtn = document.getElementById('customizer-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        localStorage.removeItem('portfolio-primary-color');
        localStorage.removeItem('portfolio-secondary-color');
        localStorage.removeItem('portfolio-accent-color');
        localStorage.removeItem('portfolio-body-font');

        document.documentElement.style.removeProperty(PRIMARY_PROP);
        document.documentElement.style.removeProperty(SECONDARY_PROP);
        document.documentElement.style.removeProperty(ACCENT_PROP);
        document.documentElement.style.removeProperty(BODY_FONT_PROP);

        colorSwatches.forEach((sw) => sw.classList.remove('active'));
        colorSwatches[0].classList.add('active');

        fontButtons.forEach((fb) => fb.classList.remove('active'));
        document.querySelector('.font-btn[data-font="\'Tajawal\', sans-serif"]')?.classList.add('active');
      });
    }
  }

  // =============================================================
  // 7. SCROLL TO TOP
  // =============================================================
  const scrollTopBtn = document.getElementById('scroll-to-top');

  if (scrollTopBtn) {
    function toggleScrollTopButton() {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    }

    window.addEventListener('scroll', toggleScrollTopButton);

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =============================================================
  // 8. GSAP SCROLL ANIMATIONS
  // =============================================================
  if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade-up for scroll items
    document.querySelectorAll('[data-scroll-item]').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        },
        once: true,
      });
    });

    // Skill bar fill animation
    document.querySelectorAll('.skill-bar-fill').forEach((bar) => {
      const width = bar.style.width;
      gsap.set(bar, { width: '0%' });
      ScrollTrigger.create({
        trigger: bar.closest('.skill-card'),
        start: 'top 85%',
        onEnter: () => {
          gsap.to(bar, { width: width, duration: 1, ease: 'power3.out' });
        },
        once: true,
      });
    });

    // Portfolio stagger
    const portfolioItems = document.querySelectorAll('#portfolio .portfolio-item');
    if (portfolioItems.length) {
      ScrollTrigger.create({
        trigger: '#portfolio',
        start: 'top 80%',
        onEnter: () => {
          gsap.to(portfolioItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    }
  } else {
    // Fallback: IntersectionObserver
    var scrollItems = document.querySelectorAll('[data-scroll-item]');
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('scrolled');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      scrollItems.forEach(function (el) { observer.observe(el); });
    } else {
      scrollItems.forEach(function (el) { el.classList.add('scrolled'); });
    }

    // Skill bars fallback - set width directly
    document.querySelectorAll('.skill-bar-fill').forEach((bar) => {
      // Already has width set in HTML style, no GSAP needed
    });
  }

  // =============================================================
  // 9. 3D TILT EFFECT ON PORTFOLIO CARDS
  // =============================================================
  const tiltCards = document.querySelectorAll('.portfolio-item');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });

  // =============================================================
  // 10. HERO ENTRANCE ANIMATION
  // =============================================================
  const entranceElements = document.querySelectorAll('[data-entrance]');

  function staggerEntrance() {
    entranceElements.forEach((el, i) => {
      const delay = i * 200;
      setTimeout(() => {
        el.classList.add('entered');
      }, 300 + delay);
    });
  }

  if (entranceElements.length && !prefersReducedMotion) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        staggerEntrance();
      });
    });
  } else if (entranceElements.length) {
    entranceElements.forEach((el) => el.classList.add('entered'));
  }

  // =============================================================
  // 10. CONTACT FORM INTERACTIONS
  // =============================================================
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      if (!contactForm.reportValidity()) return;
      if (prefersReducedMotion) return;
      // Let the form submit normally to ./pages/done.html
      // No preventDefault — just let it go
    });
  }

  // =============================================================
  // 11. INIT UPDATES
  // =============================================================
  updateProgressBar();
  updateActiveLink();

});
