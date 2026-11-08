(() => {
  // ====== EDIT HERE: prices (EUR) – these are SAMPLE prices ======
  const PRICES = { '250': 8.90, '500': 14.90 };
  const EMAIL = 'info@apinordic.com';
  // ===============================================================
  const NAMES = {
    '250': { fi: 'Hunaja 250 g (puristuspullo)', en: 'Honey 250 g (squeeze bottle)' },
    '500': { fi: 'Hunaja 500 g (lasipurkki)', en: 'Honey 500 g (glass jar)' }
  };
  const T = {
    fi: { added: 'Lisätty koriin', view: 'Näytä kori', btnAdded: 'Lisätty ✓', empty: 'Koriisi ei ole vielä tuotteita.', remove: 'Poista', need: 'Lisää vähintään yksi tuote koriin.', fill: 'Täytä nimi, sähköposti ja osoite.',
          sent: 'Sähköpostiohjelmasi avautuu. Jos mitään ei tapahdu, lähetä tilaus osoitteeseen ' + EMAIL + '.', subject: 'Tilauspyyntö – APINORDIC',
          hello: 'Hei APINORDIC,', want: 'haluaisin tilata seuraavat tuotteet:', total: 'Yhteensä', det: 'Yhteystiedot', name: 'Nimi', email: 'Sähköposti', phone: 'Puhelin', addr: 'Toimitusosoite / nouto', msg: 'Viesti', thanks: 'Kiitos!' },
    en: { added: 'Added to basket', view: 'View basket', btnAdded: 'Added ✓', empty: 'Your basket is empty.', remove: 'Remove', need: 'Please add at least one product.', fill: 'Please fill in name, email and address.',
          sent: 'Your email app should open. If nothing happens, send the order to ' + EMAIL + '.', subject: 'Order request – APINORDIC',
          hello: 'Hello APINORDIC,', want: 'I would like to order the following:', total: 'Total', det: 'My details', name: 'Name', email: 'Email', phone: 'Phone', addr: 'Delivery address / pick-up', msg: 'Message', thanks: 'Thank you!' }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'fi');
  const money = n => new Intl.NumberFormat(lang() === 'fi' ? 'fi-FI' : 'en-GB', { style: 'currency', currency: 'EUR' }).format(n);

  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('apinordic-cart') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(k => { if (!(k in PRICES) || !(cart[k] > 0)) delete cart[k]; });
  const save = () => { try { localStorage.setItem('apinordic-cart', JSON.stringify(cart)); } catch (e) {} window.dispatchEvent(new Event('apinordic-cart')); };

  function render() {
    const L = lang(), box = $('#cart-items');
    $$('.shop-card').forEach(c => { const p = $('[data-price]', c); if (p) p.textContent = money(PRICES[c.dataset.id]); });
    const ids = Object.keys(cart);
    box.textContent = '';
    if (!ids.length) { const p = document.createElement('p'); p.className = 'cart-empty'; p.textContent = T[L].empty; box.append(p); }
    let total = 0;
    ids.forEach(id => {
      const qty = cart[id], line = qty * PRICES[id]; total += line;
      const row = document.createElement('div'); row.className = 'cart-row';
      const info = document.createElement('div');
      const n = document.createElement('strong'); n.textContent = NAMES[id][L];
      const q = document.createElement('span'); q.textContent = qty + ' × ' + money(PRICES[id]);
      info.append(n, q);
      const right = document.createElement('div'); right.className = 'cart-right';
      const s = document.createElement('span'); s.textContent = money(line);
      const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'link-btn'; rm.textContent = T[L].remove;
      rm.addEventListener('click', () => { delete cart[id]; save(); render(); });
      right.append(s, rm);
      row.append(info, right); box.append(row);
    });
    $('#cart-total').textContent = money(total);
  }

  // feedback after adding: button label + small toast
  let toast, toastTimer;
  function feedback(btn) {
    const L = lang();
    const old = btn.dataset[L];
    btn.textContent = T[L].btnAdded; btn.disabled = true;
    setTimeout(() => { btn.textContent = btn.dataset[lang()]; btn.disabled = false; }, 1400);
    if (!toast) {
      toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = '';
    const msg = document.createElement('span'); msg.textContent = T[L].added;
    const a = document.createElement('a'); a.href = '#kori'; a.textContent = T[L].view;
    toast.append(msg, a); toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // product cards
  $$('.shop-card').forEach(card => {
    const input = $('[data-qty-input]', card);
    $$('[data-qty]', card).forEach(b => b.addEventListener('click', () => {
      const v = Math.min(20, Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.qty, 10)));
      input.value = v;
    }));
    $('[data-add]', card).addEventListener('click', () => {
      const v = Math.min(20, Math.max(1, parseInt(input.value, 10) || 1));
      cart[card.dataset.id] = Math.min(50, (cart[card.dataset.id] || 0) + v);
      save(); render();
      const status = $('#order-status'); if (status) status.textContent = '';
      feedback($('[data-add]', card));
    });
  });

  // order form -> mailto
  const form = $('#order-form'), status = $('#order-status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const L = lang(), t = T[L], f = new FormData(form);
    const get = k => (f.get(k) || '').toString().trim();
    const ids = Object.keys(cart);
    if (!ids.length) { status.textContent = t.need; return; }
    if (!get('name') || !get('email') || !get('address') || !form.email.checkValidity()) { status.textContent = t.fill; return; }
    let total = 0;
    const lines = ids.map(id => { const l = cart[id] * PRICES[id]; total += l; return '- ' + NAMES[id][L] + ': ' + cart[id] + ' × ' + money(PRICES[id]) + ' = ' + money(l); });
    const body = [t.hello, '', t.want, '', ...lines, '', t.total + ': ' + money(total), '', t.det + ':',
      t.name + ': ' + get('name'), t.email + ': ' + get('email'), t.phone + ': ' + (get('phone') || '-'),
      t.addr + ': ' + get('address'), t.msg + ': ' + (get('message') || '-'), '', t.thanks].join('\n');
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(t.subject) + '&body=' + encodeURIComponent(body);
    status.textContent = t.sent;
  });

  // re-render when language toggles
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
