(() => {
  const data = window.PORTFOLIO;
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  $('.theme-toggle').addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  const roles = ['AI / ML developer', 'agent builder', 'Web3 developer', 'quant researcher', 'open-source contributor', 'hackathon builder'];
  const role = $('.role');
  if (!reduced) {
    let i = 0;
    setInterval(() => {
      role.classList.add('out');
      setTimeout(() => { i = (i + 1) % roles.length; role.textContent = roles[i]; role.classList.remove('out'); }, 250);
    }, 2600);
  }

  $('[data-count="projects"]').textContent = data.projects.length;

  const icon = id => ({
    ai: '<path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0-2 7.5V17a4 4 0 0 0 6 3.5A4 4 0 0 0 18 17v-1.5A4 4 0 0 0 16 8V7a4 4 0 0 0-4-4zM12 3v17.5"/>',
    agents: '<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/>',
    web3: '<path d="M12 2 4 6.5v11L12 22l8-4.5v-11zM4 6.5l8 4.5 8-4.5M12 11v11"/>',
    quant: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3M20 16V6"/>',
    systems: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  }[id]);
  const card = p => `
    <article class="card${p.featured ? ' featured' : ''}" data-dept="${p.dept}" data-text="${esc((p.title + ' ' + p.desc + ' ' + p.tags.join(' ')).toLowerCase())}">
      <div class="card-top">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '<span></span>'}
        ${p.featured ? '<span class="star" title="Featured">Featured</span>' : ''}
      </div>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.desc)}</p>
      <ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${p.link ? `<a class="card-link" href="${p.link}" target="_blank" rel="noopener">View code <span aria-hidden="true">↗</span></a>` : '<span class="card-link muted">Code not public</span>'}
    </article>`;

  const deptWrap = $('.departments');
  deptWrap.innerHTML = data.departments.map(d => {
    const items = data.projects.filter(p => p.dept === d.id).sort((a, b) => (b.featured || 0) - (a.featured || 0));
    return `
      <section class="dept" data-dept="${d.id}" style="--c:${d.color}" aria-labelledby="dept-${d.id}">
        <header class="dept-head">
          <span class="dept-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icon(d.id)}</svg></span>
          <h3 id="dept-${d.id}">${esc(d.name)}</h3>
          <span class="count">${items.length} projects</span>
        </header>
        <div class="cards">${items.map(card).join('')}</div>
      </section>`;
  }).join('');

  const tabs = $('.tabs');
  tabs.innerHTML = [{ id: 'all', short: 'All', n: data.projects.length },
    ...data.departments.map(d => ({ ...d, n: data.projects.filter(p => p.dept === d.id).length }))]
    .map((t, i) => `<button type="button" role="tab" class="tab${i ? '' : ' is-on'}" aria-selected="${!i}" data-tab="${t.id}">${esc(t.short)} <span>${t.n}</span></button>`).join('');
  let current = 'all';
  const input = $('.search input');
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll('.dept').forEach(sec => {
      const inTab = current === 'all' || sec.dataset.dept === current;
      let any = 0;
      sec.querySelectorAll('.card').forEach(c => {
        const ok = inTab && (!q || c.dataset.text.includes(q));
        c.hidden = !ok; if (ok) any++;
      });
      sec.hidden = !any; shown += any;
    });
    $('.empty').hidden = shown > 0;
  };
  tabs.addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    current = b.dataset.tab;
    tabs.querySelectorAll('.tab').forEach(t => { const on = t === b; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    apply();
  });
  input.addEventListener('input', apply);

  $('.timeline').innerHTML = data.experience.map(x => `
    <li>
      <span class="node" aria-hidden="true"></span>
      <div>
        ${x.when ? `<span class="when">${esc(x.when)}</span>` : ''}
        <h4>${esc(x.title)}</h4>
        <p class="org">${esc(x.org)}</p>
        ${x.text ? `<p class="muted">${esc(x.text)}</p>` : ''}
      </div>
    </li>`).join('');

  const tier = p => p === '1st' ? 'gold' : p === '2nd' ? 'silver' : p === '3rd' ? 'bronze' : '';
  $('.awards').innerHTML = data.achievements.map(a => `
    <article class="award ${tier(a.place)}">
      <span class="place">${esc(a.place)}</span>
      <h4>${esc(a.title)}</h4>
      <p class="muted">${esc(a.note)}</p>
    </article>`).join('');

  $('.skills').innerHTML = data.skills.map(s => `
    <div class="skill">
      <h4>${esc(s.group)}</h4>
      <ul>${s.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');

  if (!reduced && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.section-head, .about > *');
    els.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  // Highlight the nav link of the section in the middle of the viewport
  const links = [...document.querySelectorAll('.nav nav a')];
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) navObs.observe(s); });
})();
