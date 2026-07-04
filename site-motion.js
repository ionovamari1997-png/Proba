(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('motion-ready');

  const revealItems = [...document.querySelectorAll(
    '.bio-item, .gallery-grid .ph, .acc-item, .step-card, .vcarousel, .contact-links a, .phones, .foot-note'
  )];
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
  });

  const photoItems = [...document.querySelectorAll('.gallery-grid .ph, .ph-grid-uniform .ph')];
  photoItems.forEach((photo, photoIndex) => {
    const particles = document.createElement('span');
    particles.className = 'particle-burst';
    for (let i = 0; i < 34; i++) {
      const particle = document.createElement('i');
      const angle = (i / 34) * Math.PI * 2 + photoIndex * 0.37;
      const distance = 42 + ((i * 29 + photoIndex * 17) % 120);
      particle.style.setProperty('--px', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--py', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--ps', `${2 + (i % 5)}px`);
      particle.style.setProperty('--pd', `${(i % 9) * 24}ms`);
      particles.appendChild(particle);
    }
    photo.appendChild(particles);
  });

  function animateNumber(element) {
    if (element.dataset.counted || reduceMotion) return;
    element.dataset.counted = 'true';
    element.classList.add('is-counting');
    const original = element.textContent.trim();
    const target = Number(original.replace(/[^0-9]/g, ''));
    if (!target) return;
    const prefix = original.includes('>') ? '>' : '';
    const duration = 2200;
    const start = performance.now();
    const format = value => Math.round(value).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = prefix + format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        element.textContent = original;
        setTimeout(() => element.classList.remove('is-counting'), 420);
      }
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const number = entry.target.matches('.bio-item') ? entry.target.querySelector('.num') : null;
        if (number) animateNumber(number);
      } else if (entry.target.matches('.bio-item')) {
        const number = entry.target.querySelector('.num');
        if (number) delete number.dataset.counted;
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach(item => observer.observe(item));
  photoItems.forEach(item => observer.observe(item));

  let ticking = false;
  function updateScrollEffects() {
    ticking = false;
    const viewport = innerHeight;
    photoItems.forEach(photo => {
      const rect = photo.getBoundingClientRect();
      const leaving = Math.max(0, Math.min(1, -rect.top / Math.max(220, rect.height * 0.8)));
      const approaching = Math.max(0, Math.min(1, (viewport - rect.top) / Math.max(260, viewport * 0.55)));
      photo.style.setProperty('--depart', leaving.toFixed(3));
      photo.style.setProperty('--approach', approaching.toFixed(3));
      const image = photo.querySelector('img');
      if (image && !reduceMotion) {
        image.style.opacity = String(1 - leaving * 0.58);
        image.style.transform = `translate3d(0,${-leaving * 46}px,0) scale(${1.035 - leaving * 0.06})`;
        image.style.filter = `blur(${leaving * 10}px) saturate(${0.9 + approaching * 0.1})`;
      }
    });
    document.documentElement.style.setProperty('--page-scroll', (scrollY / Math.max(1, document.documentElement.scrollHeight - viewport)).toFixed(4));
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollEffects); }
  }, { passive: true });
  updateScrollEffects();

  document.querySelectorAll('[data-acc-trigger]').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.acc-item');
      document.querySelectorAll('.acc-item').forEach(other => other.classList.toggle('is-background', other !== item));
      setTimeout(() => item?.classList.toggle('is-scene-open', item.classList.contains('open')), 60);
    });
  });

  document.querySelectorAll('.vslide video').forEach(video => {
    video.addEventListener('pointerenter', () => {
      if (!video.closest('.vslide')?.classList.contains('active')) return;
      video.muted = true;
      video.play().catch(() => {});
    });
    video.addEventListener('pointerleave', () => video.pause());
  });
})();
