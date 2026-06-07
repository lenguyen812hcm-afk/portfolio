/* ============================================================
   Portfolio interactions — Lê Hữu Nguyên
   (Three.js background lives as an inline module in index.html)
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- NAVBAR shadow ---------- */
  const navbar = $('#navbar');
  const onScrollNav = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const bar = $('.scroll-progress');
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- ACTIVE NAV LINK ---------- */
  const navLinks = $$('.nav-links a[href^="#"]');
  const sections = navLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch && !reduceMotion) {
    const glow = $('.cursor-glow');
    const dot  = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let gx = mx, gy = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      // dot + ring track the cursor instantly — set right in the event so they
      // never lag behind, regardless of the 3D scene's framerate
      if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; dot.style.opacity  = 1; }
      if (ring) { ring.style.left = mx + 'px'; ring.style.top = my + 'px'; ring.style.opacity = 1; }
      if (glow) glow.style.opacity = 1;
    });
    window.addEventListener('mouseleave', () => {
      [glow, dot, ring].forEach(el => el && (el.style.opacity = 0));
    });

    // only the big soft glow keeps a gentle trailing lerp (it's meant to lag)
    (function follow() {
      gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
      if (glow) { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; }
      requestAnimationFrame(follow);
    })();

    $$('a, button, .project-card, .tab-btn, .filter-btn, .contact-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring && ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovering'));
    });
    // "view" cursor over video thumbnails
    $$('.card-media').forEach(m => {
      m.addEventListener('mouseenter', () => ring && ring.classList.add('view'));
      m.addEventListener('mouseleave', () => ring && ring.classList.remove('view'));
    });
  }

  /* ---------- ROLE ROTATOR (typewriter) ---------- */
  const rotator = $('.hero-role .rotator');
  if (rotator) {
    const roles = [
      'TouchDesigner Developer',
      'Visual System Engineer',
      'Projection Mapping Artist',
      'Realtime / Interactive Media',
      'Creative Technologist',
    ];
    if (reduceMotion) {
      rotator.textContent = roles[0];
    } else {
      let ri = 0, ci = 0, deleting = false;
      (function type() {
        const word = roles[ri];
        rotator.textContent = word.slice(0, ci);
        if (!deleting && ci < word.length) { ci++; setTimeout(type, 70); }
        else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
        else if (deleting && ci > 0) { ci--; setTimeout(type, 35); }
        else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(type, 350); }
      })();
    }
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  const counters = $$('[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.target);
        const dur = 1500;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.childNodes[0].nodeValue = Math.round(target * eased).toString();
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cObs.observe(c));
  }

  /* ---------- 3D TILT ON CARDS ---------- */
  if (!isTouch && !reduceMotion) {
    $$('.project-card').forEach(card => {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
      let raf = null;
      const art = card.querySelector('.thumb-art');

      card.addEventListener('mouseenter', () => { if (art) art.style.transition = 'transform .15s ease-out'; });
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 9;
        const ry = (px - 0.5) * 11;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
          glare.style.setProperty('--mx', (px * 100) + '%');
          glare.style.setProperty('--my', (py * 100) + '%');
          if (art) art.style.transform = `scale(1.09) translate(${(px - 0.5) * -12}px, ${(py - 0.5) * -12}px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
        if (art) { art.style.transition = ''; art.style.transform = ''; }
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!isTouch && !reduceMotion) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.28}px, ${y * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- PROJECT FILTER ---------- */
  const catMap = {
    'theme-sand': 'installation', 'theme-touch': 'installation', 'theme-flash': 'installation',
    'theme-logo': 'brand', 'theme-product': 'brand', 'theme-boxes': 'brand', 'theme-lucky': 'brand',
    'theme-typo': 'art', 'theme-paint': 'art', 'theme-message': 'art', 'theme-smoke': 'art',
    'theme-litting': 'tracking', 'theme-lidar': 'tracking', 'theme-ppt': 'tracking',
    'theme-character': 'tracking', 'theme-fish': 'ai',
    'theme-car': '3d', 'theme-demo': '3d', 'theme-scale': 'ui', 'theme-ui': 'ui',
    'theme-resolume': 'mapping',
  };
  $$('.project-card').forEach(card => {
    const media = card.querySelector('.card-media');
    if (!media) return;
    const themeCls = Array.from(media.classList).find(c => c.startsWith('theme-'));
    card.dataset.cat = catMap[themeCls] || 'other';
  });

  /* ---------- AI / HUD overlay injected on every thumbnail ---------- */
  const catLabel = {
    installation: 'INSTALLATION', brand: 'BRAND', art: 'GENERATIVE', tracking: 'TRACKING',
    ai: 'AI · VISION', '3d': '3D · RENDER', ui: 'UI · HUD', mapping: 'MAPPING', other: 'REALTIME',
  };
  $$('.project-card').forEach((card, i) => {
    const media = card.querySelector('.card-media');
    if (!media || media.querySelector('.card-hud')) return;
    const cat = card.dataset.cat || 'other';
    const hud = document.createElement('div');
    hud.className = 'card-hud';
    hud.innerHTML =
      '<i class="hud-c tl"></i><i class="hud-c tr"></i><i class="hud-c bl"></i><i class="hud-c br"></i>' +
      '<span class="hud-tag"><b></b>' + (catLabel[cat] || 'REALTIME') + '</span>' +
      '<span class="hud-code">ID_' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="hud-foot">REALTIME · 60FPS</span>' +
      '<i class="hud-scan"></i><i class="hud-sheen"></i>';
    const art = media.querySelector('.thumb-art');
    if (art && art.nextSibling) media.insertBefore(hud, art.nextSibling);
    else media.insertBefore(hud, media.firstChild);
  });

  const filterBtns = $$('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      $$('.project-card').forEach((card, i) => {
        const show = f === 'all' || card.dataset.cat === f;
        if (show) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity .5s, transform .5s';
            card.style.opacity = '1';
            card.style.transform = '';
          }, 30 + i * 25);
        } else {
          card.style.transition = 'opacity .3s, transform .3s';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ============================================================
     VIDEO PLAYER LOGIC  (preserved from original)
     ============================================================ */
  function resetMedia(media) {
    media.classList.remove('playing');
    media.querySelectorAll('.yt-iframe').forEach(el => el.remove());
    media.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = 0; });
  }

  function playVideo(media, video) {
    document.querySelectorAll('.card-media.playing').forEach(m => { if (m !== media) resetMedia(m); });

    const ytId = video.dataset.yt;
    const gdId = video.dataset.gd;

    if (gdId) { window.open(`https://drive.google.com/file/d/${gdId}/view`, '_blank'); return; }

    media.classList.add('playing');

    if (ytId) {
      const iframe = document.createElement('iframe');
      iframe.className = 'yt-iframe';
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&color=white`;
      iframe.allow = 'autoplay; encrypted-media; fullscreen';
      iframe.allowFullscreen = true;
      media.appendChild(iframe);
    } else {
      video.play();
      video.addEventListener('ended', () => resetMedia(media), { once: true });
    }
  }

  $$('.card-media').forEach(media => {
    const videos = media.querySelectorAll('video');
    const playBtn = media.querySelector('.play-btn');
    if (videos.length > 0) videos[0].classList.add('active-video');

    media.addEventListener('click', e => {
      if (!media.classList.contains('playing')) return;
      if (e.target.tagName === 'VIDEO' || e.target.classList.contains('yt-iframe')) return;
      resetMedia(media);
    });

    if (playBtn) {
      playBtn.addEventListener('click', e => {
        e.stopPropagation();
        const active = media.querySelector('video.active-video') || videos[0];
        if (active) playVideo(media, active);
      });
    }
  });

  /* ---------- VIDEO TABS (group cards) ---------- */
  $$('.project-card.group-card').forEach(card => {
    const media  = card.querySelector('.card-media');
    const tabs   = card.querySelectorAll('.tab-btn');
    const videos = media.querySelectorAll('video');
    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        resetMedia(media);
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        videos.forEach((v, j) => v.classList.toggle('active-video', i === j));
      });
    });
  });

  /* ============================================================
     SCROLL REVEAL  (GSAP ScrollTrigger if present, else IO)
     ============================================================ */
  const revealEls = $$('[data-reveal], .project-card, .service-card, .stat, .contact-card, .section-head, .about-text, .about-side, .tl-item');

  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
    heroTl.from('.hero-badge', { y: 22, opacity: 0 })
          .from('.hero-name .line', { y: 46, opacity: 0, stagger: 0.12 }, '-=0.5')
          .from('.hero-role', { y: 20, opacity: 0 }, '-=0.4')
          .from('.hero-desc', { y: 20, opacity: 0 }, '-=0.55')
          .from('.hero-actions .btn', { y: 20, opacity: 0, stagger: 0.1 }, '-=0.5');

    revealEls.forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // gentle parallax on hero content as you scroll away
    const heroContent = $('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        y: -90, opacity: 0.0, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  } else {
    // fallback
    revealEls.forEach(el => el.classList.add('reveal'));
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 50);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      revealEls.forEach(el => obs.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('visible'));
    }
  }

  /* ---------- BACK TO TOP ---------- */
  const bt = $('.back-top');
  if (bt) bt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

})();
