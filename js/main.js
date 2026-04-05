/**
 * ERINE LOPEZ — Portfolio JS
 * UX/IX : navigation, accessibilité, animations, filtres, formulaire
 */

'use strict';

/* ─── 1. NAVIGATION MOBILE ─── */
(function initBurger() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('nav-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
    burger.setAttribute('aria-label', expanded ? 'Ouvrir le menu de navigation' : 'Fermer le menu de navigation');
  });

  // Ferme au clic sur un lien
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu de navigation');
    });
  });

  // Ferme avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  });
})();

/* ─── 2. SCROLL : navbar + indicateur de progression ─── */
(function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Barre de progression de lecture
  const progressBar = document.createElement('div');
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-label', 'Progression de lecture de la page');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; z-index: 101;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    transition: width 0.1s; width: 0%;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(pct));
    navbar.classList.toggle('scrolled', scrollTop > 60);
  }, { passive: true });
})();

/* ─── 3. RÉVÉLATION AU SCROLL (IntersectionObserver) ─── */
(function initReveal() {
  // Respecter prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.project-card, .about-card, .timeline-item, .section-title, .section-desc')
    .forEach((el, i) => {
      el.classList.add('reveal');
      if (i % 3 === 1) el.classList.add('reveal-delay-1');
      if (i % 3 === 2) el.classList.add('reveal-delay-2');
      observer.observe(el);
    });
})();

/* ─── 4. BARRES DE COMPÉTENCES ─── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  // Les barres démarrent à width:0 (CSS). On anime vers la valeur data-width
  // quand elles entrent dans le viewport.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bars.forEach(bar => { bar.style.width = (bar.dataset.width || '0') + '%'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = (bar.dataset.width || '0') + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ─── 5. FILTRES PROJETS ─── */
(function initFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // État aria + style actif
      btns.forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('active');
      });
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('active');

      // Filtrage des cartes avec animation d'entrée
      let visibleCount = 0;
      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.includes(filter);
        if (show) {
          card.classList.remove('filter-hidden', 'filter-entering');
          // Force reflow pour relancer l'animation si la carte était déjà visible
          void card.offsetWidth;
          card.classList.add('filter-entering');
          visibleCount++;
        } else {
          card.classList.add('filter-hidden');
          card.classList.remove('filter-entering');
        }
      });

      // Annonce pour les lecteurs d'écran
      const grid = document.getElementById('projects-grid');
      if (grid) {
        grid.setAttribute('aria-label',
          `${visibleCount} projet${visibleCount > 1 ? 's' : ''} affiché${visibleCount > 1 ? 's' : ''}`);
      }
    });
  });
})();

/* ─── 6. ACCESSIBILITÉ — BARRE D'OUTILS ─── */
(function initA11yTools() {
  let fontSize = 16;

  // Taille de police
  document.getElementById('btn-font-up')?.addEventListener('click', () => {
    fontSize = Math.min(fontSize + 2, 24);
    document.documentElement.style.fontSize = fontSize + 'px';
    announceToScreenReader(`Taille du texte augmentée à ${fontSize} pixels`);
  });

  document.getElementById('btn-font-down')?.addEventListener('click', () => {
    fontSize = Math.max(fontSize - 2, 12);
    document.documentElement.style.fontSize = fontSize + 'px';
    announceToScreenReader(`Taille du texte réduite à ${fontSize} pixels`);
  });

  // Contraste élevé
  document.getElementById('btn-contrast')?.addEventListener('click', () => {
    const active = document.body.classList.toggle('high-contrast');
    announceToScreenReader(active ? 'Contraste élevé activé' : 'Contraste élevé désactivé');
  });

  // Réduction animations
  let motionReduced = false;
  document.getElementById('btn-motion')?.addEventListener('click', () => {
    motionReduced = !motionReduced;
    document.body.classList.toggle('no-motion', motionReduced);
    const style = document.getElementById('motion-style') || (() => {
      const s = document.createElement('style');
      s.id = 'motion-style';
      document.head.appendChild(s);
      return s;
    })();
    style.textContent = motionReduced
      ? '* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }'
      : '';
    announceToScreenReader(motionReduced ? 'Animations réduites' : 'Animations restaurées');
  });
})();

/* ─── 7. ANNONCE LECTEUR D'ÉCRAN ─── */
function announceToScreenReader(message) {
  let el = document.getElementById('sr-announcer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sr-announcer';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(el);
  }
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}

/* ─── 8. VALIDATION FORMULAIRE CLIENT ─── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field)  field.setAttribute('aria-invalid', 'true');
    if (errEl)  errEl.textContent = msg;
  }
  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field)  field.removeAttribute('aria-invalid');
    if (errEl)  errEl.textContent = '';
  }

  function validateField(field) {
    clearError(field.id);
    if (field.required && !field.value.trim()) {
      showError(field.id, 'Ce champ est obligatoire.');
      return false;
    }
    if (field.type === 'email' && field.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(field.value.trim())) {
        showError(field.id, 'Adresse email invalide.');
        return false;
      }
    }
    return true;
  }

  // Validation à la sortie de chaque champ
  form.querySelectorAll('input[required], textarea[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    ['name', 'email', 'message'].forEach(id => {
      const f = document.getElementById(id);
      if (f && !validateField(f)) valid = false;
    });
    if (!valid) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    const btn    = form.querySelector('.btn-submit');
    const status = document.getElementById('form-status');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    status.textContent = '';
    status.className = 'form-status';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        status.textContent = '✓ Message envoyé ! Je vous répondrai très vite.';
        status.className = 'form-status success';
        form.reset();
        announceToScreenReader('Message envoyé avec succès.');
      } else {
        const msg = json.errors?.map(e => e.message).join(', ') || 'Erreur serveur';
        throw new Error(msg);
      }
    } catch (err) {
      status.textContent = '✗ Une erreur est survenue. Merci de me contacter directement par email.';
      status.className = 'form-status error';
      announceToScreenReader('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Envoyer le message';
    }
  });
})();

/* ─── 9. LIENS ACTIFS DANS LA NAV (scroll spy) ─── */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'true');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ─── 10. PARTICULES HERO (subtil, performant) ─── */
(function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.getElementById('particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 6 : 18;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 3 + 1.5;
    dot.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: rgba(99,102,241,${Math.random() * 0.5 + 0.15});
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 6 + 5}s ease-in-out infinite;
      animation-delay: ${Math.random() * 6}s;
    `;
    container.appendChild(dot);
  }
})();

/* ─── 11. THÈME SOMBRE / CLAIR (toggle optionnel) ─── */
(function initTheme() {
  // Réservé pour extension future : toggle light/dark mode
})();
