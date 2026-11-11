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

(() => {
  const products = {
    '250': { price: 8.90, image: 'assets/honey-bottle.webp', fi: 'Hunaja 250 g, puristuspullo', en: 'Honey 250 g, squeeze bottle' },
    '500': { price: 14.90, image: 'assets/honey-jar.webp', fi: 'Hunaja 500 g, lasipurkki', en: 'Honey 500 g, glass jar' },
    'duo': { price: 29.80, image: 'assets/honey-duo.webp', fi: 'Hunajalahja 2 × 500 g', en: 'Honey gift set 2 × 500 g' }
  };
  const key = 'apinordic-cart';
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'fi';
  const text = (fi, en) => language() === 'fi' ? fi : en;
  const money = amount => new Intl.NumberFormat(language() === 'fi' ? 'fi-FI' : 'en-GB', { style: 'currency', currency: 'EUR' }).format(amount);
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      const result = {};
      for (const id of Object.keys(products)) {
        const count = Number(saved?.[id]);
        if (Number.isFinite(count) && count >= 1) result[id] = Math.min(50, Math.floor(count));
      }
      return result;
    } catch { return {}; }
  }
  let cart = read();
  function set(id, quantity) {
    if (!Object.hasOwn(products, id)) return;
    const count = Number(quantity);
    if (!Number.isFinite(count)) return;
    if (count < 1) delete cart[id];
    else cart[id] = Math.min(50, Math.floor(count));
    try { localStorage.setItem(key, JSON.stringify(cart)); } catch {}
    window.dispatchEvent(new Event('apinordic-cart'));
  }
  const total = () => Object.entries(cart).reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  function open() {
    window.location.href = 'ostoskori.html';
  }
  function updateCartCount() {
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; el.hidden = count === 0; });
  }
  window.ApinordicCart = { products, language, text, money, total, set, open, items: () => ({ ...cart }) };
  window.addEventListener('apinordic-cart', updateCartCount);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      cart = read();
      window.dispatchEvent(new Event('apinordic-cart'));
    }
  });
  new MutationObserver(updateCartCount).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  updateCartCount();
})();
