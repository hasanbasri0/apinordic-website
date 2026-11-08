(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const menuBtn = $('.menu'), nav = $('.nav nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    $$('.nav nav > a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Language toggle (FI/EN)
  const langButtons = $$('[data-lang]');
  const searchInput = $('#site-search');
  function setLang(lang) {
    document.documentElement.lang = lang;
    $$('[data-fi][data-en]').forEach(el => {
      const v = el.dataset[lang];
      if (v == null) return;
      if (v.includes('|')) {
        const [a, b] = v.split('|');
        el.textContent = '';
        el.append(a, document.createElement('br'));
        if (el.tagName === 'H1') {
          const em = document.createElement('em');
          em.textContent = b;
          el.append(em);
        } else el.append(b);
      } else el.textContent = v;
    });
    langButtons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    if (searchInput) {
      const key = 'placeholder' + lang.charAt(0).toUpperCase() + lang.slice(1);
      searchInput.placeholder = searchInput.dataset[key] || searchInput.placeholder;
    }
    try { localStorage.setItem('apinordic-lang', lang); } catch (e) {}
  }
  langButtons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  let saved = 'fi';
  try { saved = localStorage.getItem('apinordic-lang') || 'fi'; } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'fi');

  // Search
  const toggle = $('.search-toggle'), panel = $('.search-panel'),
        closeBtn = $('.search-close'), status = $('#search-status');
  if (toggle && panel && searchInput) {
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) setTimeout(() => searchInput.focus(), 50);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
    searchInput.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const lang = document.documentElement.lang;
      const q = searchInput.value.trim().toLocaleLowerCase(lang);
      if (!q) return;
      const hit = $$('main h1, main h2, main h3, main p, main blockquote')
        .find(el => el.textContent.toLocaleLowerCase(lang).includes(q));
      if (hit) {
        hit.scrollIntoView({ behavior: 'smooth', block: 'center' });
        status.textContent = lang === 'fi' ? 'Tulos löytyi.' : 'Result found.';
        panel.classList.remove('open');
      } else {
        status.textContent = lang === 'fi' ? 'Hakusanalla ei löytynyt sisältöä.' : 'No matching content found.';
      }
    });
  }

  // Active menu link
  const current = location.pathname.split('/').pop() || 'index.html';
  $$('.nav nav > a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();
