(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle (remembers the choice when storage is available)
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    drawWeave(performance.now());
  });

  // Rotating focus line
  const lines = [
    'edge ML on ESP32 sensor nodes',
    'agents that explain but never overstep',
    'smart contracts on Stellar and Ethereum',
    'research that survives FDR control',
  ];
  const rot = document.querySelector('.rot-text');
  let i = 0;
  if (!reduced) {
    setInterval(() => {
      rot.style.opacity = 0;
      setTimeout(() => { i = (i + 1) % lines.length; rot.textContent = lines[i]; rot.style.opacity = 1; }, 300);
    }, 3200);
  }

  // Woven thread background
  const canvas = document.querySelector('.weave');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const color = name => getComputedStyle(root).getPropertyValue(name).trim();
  function drawWeave(t) {
    ctx.clearRect(0, 0, w, h);
    const x0 = w * (w < 720 ? 0.62 : 0.45);
    const cols = [color('--a1'), color('--a2'), color('--a3')];
    const phase = t / 2600;
    const fade = x => Math.min(1, Math.max(0, (x - x0) / (w * 0.25)));
    ctx.lineWidth = 1.3;
    for (let r = 0; r < 11; r++) {
      const base = (h / 11) * (r + 0.5);
      ctx.beginPath();
      for (let x = x0; x <= w; x += 8) {
        const y = base + 9 * Math.sin((x - x0) / 46 + r * 0.9 + phase);
        x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const g = ctx.createLinearGradient(x0, 0, w, 0);
      g.addColorStop(0, 'transparent'); g.addColorStop(0.35, cols[r % 3]); g.addColorStop(1, cols[(r + 1) % 3]);
      ctx.strokeStyle = g; ctx.globalAlpha = 0.45; ctx.stroke();
    }
    for (let c = 0; c < 16; c++) {
      const base = x0 + ((w - x0) / 16) * (c + 0.5);
      ctx.beginPath();
      for (let y = 0; y <= h; y += 8) {
        const x = base + 7 * Math.sin(y / 38 + c * 1.1 - phase);
        y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = cols[(c + 2) % 3]; ctx.globalAlpha = 0.3 * fade(base); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  resize();
  window.addEventListener('resize', () => { resize(); drawWeave(performance.now()); });
  if (reduced) {
    drawWeave(0);
  } else {
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    const loop = t => { if (visible) drawWeave(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // Pipeline dot travel distance matches each list's height
  document.querySelectorAll('.pipeline').forEach(p => {
    p.style.setProperty('--travel', `${p.offsetHeight - 64}px`);
  });

  // Project filters
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    cards.forEach(card => { card.hidden = f !== 'all' && !card.dataset.cat.split(' ').includes(f); });
  }));

  // Reveal on scroll
  if (!reduced && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section-head, .focus-card, .feature, .card, .wins li, .os > *, .tools div');
    targets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
  }
})();
