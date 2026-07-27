document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================================
  // 1. THREE.JS — System Diagram Hero (Frontend / Backend / Database)
  // =============================================================
  let scene, camera, renderer, systemGroup;
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let packets = [];

  function initThreeScene() {
    const container = document.getElementById('three-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 6;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Parent group for mouse parallax
    systemGroup = new THREE.Group();
    scene.add(systemGroup);

    const blueprintColor = 0x5B8DEF;
    const amberColor = 0xF2A65A;

    // Node definitions
    const nodes = [
      { label: 'FRONTEND', x: -2.8, y: 1.4, z: 0 },
      { label: 'BACKEND',  x: 2.8, y: 1.4, z: 0 },
      { label: 'DATABASE', x: 0, y: -1.8, z: 0 },
    ];

    // Create node spheres + labels
    nodes.forEach((n) => {
      const sphereGeo = new THREE.SphereGeometry(0.45, 24, 16);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: blueprintColor,
        emissive: blueprintColor,
        emissiveIntensity: 0.15,
        metalness: 0.1,
        roughness: 0.5,
        transparent: true,
        opacity: 0.7,
        wireframe: false,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(n.x, n.y, n.z);
      systemGroup.add(sphere);

      // Wireframe overlay
      const wireGeo = new THREE.SphereGeometry(0.48, 16, 10);
      const wireMat = new THREE.MeshBasicMaterial({
        color: blueprintColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const wireframe = new THREE.Mesh(wireGeo, wireMat);
      wireframe.position.set(n.x, n.y, n.z);
      systemGroup.add(wireframe);

      // Label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#5B8DEF';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, 128, 32);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(n.x, n.y - 1.0, n.z);
      sprite.scale.set(2.2, 0.55, 1);
      systemGroup.add(sprite);
    });

    // Connection lines between nodes
    const connections = [
      [0, 1], // Frontend — Backend
      [0, 2], // Frontend — Database
      [1, 2], // Backend — Database
    ];

    const lineMat = new THREE.LineBasicMaterial({
      color: blueprintColor,
      transparent: true,
      opacity: 0.25,
    });

    connections.forEach(([i, j]) => {
      const points = [
        new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z),
        new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat);
      systemGroup.add(line);
    });

    // Animated data packets
    if (!prefersReducedMotion) {
      connections.forEach(([i, j]) => {
        const start = new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z);
        const end = new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z);

        const packetGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const packetMat = new THREE.MeshBasicMaterial({
          color: amberColor,
          transparent: true,
          opacity: 0.9,
        });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        packet.position.copy(start);
        systemGroup.add(packet);

        // Glow around packet
        const glowGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
          color: amberColor,
          transparent: true,
          opacity: 0.3,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(start);
        systemGroup.add(glow);

        packets.push({
          mesh: packet,
          glow: glow,
          start: start,
          end: end,
          t: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
        });
      });
    }

    if (prefersReducedMotion) {
      // Static rotation only, no continuous animation needed beyond a single frame
      renderer.render(scene, camera);
    } else {
      animate();
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    if (systemGroup) {
      systemGroup.rotation.x += (targetRotationX - systemGroup.rotation.x) * 0.05;
      systemGroup.rotation.y += (targetRotationY - systemGroup.rotation.y) * 0.05;
    }

    // Animate packets along connections
    packets.forEach((p) => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const x = p.start.x + (p.end.x - p.start.x) * p.t;
      const y = p.start.y + (p.end.y - p.start.y) * p.t;
      const z = p.start.z + (p.end.z - p.start.z) * p.t;
      p.mesh.position.set(x, y, z);
      p.glow.position.set(x, y, z);
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function onMouseMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = x * 0.3;
    targetRotationX = y * 0.2;
  }

  function onResize() {
    const container = document.getElementById('three-canvas-container');
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  const savedColor = localStorage.getItem('portfolio-primary-color');
  const primaryColor = savedColor || '#5B8DEF';

  function updateThreeColor(color) {
    // Update node materials in systemGroup
    if (!systemGroup) return;
    const c = new THREE.Color(color);
    systemGroup.children.forEach((child) => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.set(c);
        if (child.material.emissive) {
          child.material.emissive.set(c);
        }
      }
      // Update line colors
      if (child.isLine && child.material) {
        child.material.color.set(c);
      }
    });
  }

  updateThreeColor(primaryColor);

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  initThreeScene();

  // =============================================================
  // 2. SCROLL PROGRESS BAR
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
  // 3. STEP INDICATOR
  // =============================================================
  const stepDots = document.querySelectorAll('.step-dot');
  const sections = document.querySelectorAll('[data-scroll-section]');
  const navbarEl = document.querySelector('.navbar');
  let navH = navbarEl ? navbarEl.offsetHeight : 0;

  const sectionNames = ['Home', 'About', 'Experience', 'Portfolio', 'Testimonials', 'Contact'];

  function updateStepIndicator() {
    const scrollY = window.scrollY;
    let activeStep = 0;

    sections.forEach((section, i) => {
      const top = section.offsetTop - navH - 100;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        activeStep = i;
      }
    });

    stepDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeStep);
      dot.setAttribute('data-tooltip', sectionNames[i] || '');
    });
  }

  window.addEventListener('scroll', updateStepIndicator);

  stepDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.getAttribute('data-step'));
      const target = sections[step];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =============================================================
  // 4. GSAP SCROLLTRIGGER SCROLLYTELLING (simplified to fade-up)
  // =============================================================
  if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

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

    // Hero section parallax on scroll
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && systemGroup) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          const progress = self.progress;
          systemGroup.rotation.x = progress * 0.5;
          systemGroup.rotation.y = progress * 1.5;
        },
      });
    }

    // Portfolio stagger animation
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

      portfolioItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
        });
        item.addEventListener('mouseleave', () => {
          gsap.to(item, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
      });
    }
  } else {
    // Fallback: IntersectionObserver (when GSAP unavailable) or instant reveal (reduced motion)
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
  }

  // Independent reveal for form buttons (avoids GSAP inline-style fragility)
  var formBtns = document.querySelector('[data-form-buttons]');
  if (formBtns) {
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      var fbObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              formBtns.classList.add('visible');
              fbObserver.unobserve(formBtns);
            }
          });
        },
        { threshold: 0.1 }
      );
      fbObserver.observe(formBtns);
    } else {
      formBtns.classList.add('visible');
    }
  }

  // =============================================================
  // 5. 3D TILT EFFECT ON PORTFOLIO CARDS
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

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });

  // =============================================================
  // 6. ACTIVE NAV LINK ON SCROLL (Scrollspy)
  // =============================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionElements = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY;

    sectionElements.forEach((section) => {
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
    navH = navbarEl ? navbarEl.offsetHeight : 0;
  });

  // =============================================================
  // 7. DARK / LIGHT MODE TOGGLE
  // =============================================================
  const themeToggle = document.getElementById('theme-toggle');
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
  // 8. PORTFOLIO TABS / FILTER
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
  // 9. TESTIMONIALS CAROUSEL
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

    function startAutoplay(interval = 4000) {
      stopAutoplay();
      autoplayInterval = setInterval(nextSlide, interval);
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
  // 10. SIDEBAR CUSTOMIZER
  // =============================================================
  const customizerToggle = document.getElementById('customizer-toggle');
  const customizerSidebar = document.querySelector('.customizer-sidebar');

  if (customizerToggle && customizerSidebar) {
    customizerToggle.addEventListener('click', () => {
      customizerSidebar.classList.toggle('open');
    });

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', function () {
        const color = this.getAttribute('data-color');
        document.documentElement.style.setProperty('--primary-color', color);
        localStorage.setItem('portfolio-primary-color', color);
        updateThreeColor(color);
      });
    });

    const fontButtons = document.querySelectorAll('.font-btn');
    fontButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        const font = this.getAttribute('data-font');
        document.documentElement.style.setProperty('--main-font', font);
        localStorage.setItem('portfolio-main-font', font);
      });
    });

    const savedFont = localStorage.getItem('portfolio-main-font');
    if (savedFont) {
      document.documentElement.style.setProperty('--main-font', savedFont);
    }
  }

  // =============================================================
  // 11. SCROLL TO TOP BUTTON
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
  // 12. HERO ENTRANCE ANIMATION
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
  // 13. CORNER COORDINATE MARKS
  // =============================================================
  function addCornerMarks() {
    const sections = document.querySelectorAll('section[id]:not(#home)');
    const coords = ['X:140 Y:60', 'X:240 Y:80', 'X:360 Y:40', 'X:180 Y:90', 'X:200 Y:70'];
    sections.forEach((section, i) => {
      const mark = document.createElement('span');
      mark.className = 'corner-mark';
      mark.textContent = coords[i] || 'X:000 Y:000';
      section.prepend(mark);
    });
  }
  addCornerMarks();

  // =============================================================
  // 14. PORTFOLIO CATEGORY BADGES (spec sheet tags)
  // =============================================================
  function addProjectTags() {
    document.querySelectorAll('.portfolio-item').forEach((item) => {
      const category = item.getAttribute('data-category');
      if (!category) return;
      const info = item.querySelector('.info');
      if (!info) return;
      const tag = document.createElement('span');
      tag.className = 'project-tag';
      tag.textContent = `[ ${category.toUpperCase()} ]`;
      info.prepend(tag);
    });
  }
  addProjectTags();

  // =============================================================
  // 15. FORM BUTTON INTERACTIONS
  // =============================================================
  const contactForm = document.querySelector('.contact-form');
  const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  const resetBtn = contactForm ? contactForm.querySelector('button[type="reset"]') : null;
  const formBtnsContainer = contactForm ? contactForm.querySelector('.form-buttons') : null;

  if (contactForm) {
    // --- Reset feedback ---
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!prefersReducedMotion) {
          this.classList.add('resetting');
          setTimeout(() => this.classList.remove('resetting'), 500);
          contactForm.querySelectorAll('fieldset').forEach(function (fs) {
            fs.classList.remove('form-flash');
            void fs.offsetWidth;
            fs.classList.add('form-flash');
            setTimeout(function () { fs.classList.remove('form-flash'); }, 500);
          });
        }
        showClearedMessage();
      });
    }

    function showClearedMessage() {
      if (!formBtnsContainer) return;
      var msg = formBtnsContainer.querySelector('.form-cleared-msg');
      if (!msg) {
        msg = document.createElement('span');
        msg.className = 'form-cleared-msg';
        msg.textContent = '> Form cleared';
        formBtnsContainer.appendChild(msg);
      }
      msg.classList.add('show');
      setTimeout(function () { msg.classList.remove('show'); }, 2500);
    }

    // --- Submit animation ---
    if (submitBtn) {
      contactForm.addEventListener('submit', function (e) {
        if (!contactForm.reportValidity()) return;
        if (prefersReducedMotion) return;
        e.preventDefault();

        submitBtn.classList.add('sending');
        submitBtn.disabled = true;

        setTimeout(function () {
          submitBtn.classList.remove('sending');
          submitBtn.classList.add('sent');
          var svg = submitBtn.querySelector('svg');
          if (svg) {
            svg.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
          }
          var childNodes = submitBtn.childNodes;
          for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeType === 3) {
              childNodes[i].textContent = ' Sent';
            }
          }
          setTimeout(function () {
            contactForm.submit();
          }, 500);
        }, 800);
      });
    }
  }

  // =============================================================
  // 16. INIT UPDATES
  // =============================================================
  updateProgressBar();
  updateStepIndicator();
  updateActiveLink();

});
