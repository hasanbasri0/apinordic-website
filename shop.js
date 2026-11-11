(() => {
  const C = window.ApinordicCart;
  const $ = selector => document.querySelector(selector);
  const form = $('#order-form');
  const status = $('#order-status');
  function element(tag, content, className) {
    const node = document.createElement(tag);
    node.textContent = content;
    if (className) node.className = className;
    return node;
  }
  function render() {
    const active = document.activeElement;
    const focusId = active?.dataset.focusId;
    const cart = C.items();
    const ids = Object.keys(cart);
    const box = $('#cart-items');
    box.replaceChildren();
    $('#order-lines').replaceChildren();
    if (!ids.length) box.append(element('p', C.text('Ostoskori on tyhjä. Lisää tuotteita yllä olevasta valikoimasta.', 'Your basket is empty. Add products from the range above.'), 'basket-empty'));
    else {
      const table = document.createElement('table');
      table.className = 'basket-table';
      const caption = element('caption', C.text('Ostoskorin tuotteet', 'Basket products'), 'visually-hidden');
      table.append(caption);
      const header = document.createElement('thead');
      const heading = document.createElement('tr');
      for (const label of [C.text('Tuote', 'Product'), C.text('Hinta', 'Price'), C.text('Määrä', 'Quantity'), C.text('Välisumma', 'Subtotal')]) {
        const th = element('th', label);
        th.scope = 'col';
        heading.append(th);
      }
      header.append(heading);
      table.append(header);
      const body = document.createElement('tbody');
      for (const id of ids) {
        const product = C.products[id], qty = cart[id];
        const row = document.createElement('tr');
        const info = document.createElement('td');
        const details = element('div', '', 'basket-product');
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = '';
        const name = element('a', product[C.language()]);
        name.href = '#hunaja-' + id;
        const remove = element('button', C.text('Poista', 'Remove'), 'link-btn');
        remove.type = 'button';
        remove.dataset.focusId = id + '-remove';
        remove.setAttribute('aria-label', C.text('Poista ', 'Remove ') + product[C.language()]);
        remove.addEventListener('click', () => {
          C.set(id, 0);
          const next = box.querySelector('button');
          if (next) next.focus();
          else { $('#cart-title').tabIndex = -1; $('#cart-title').focus(); }
        });
        const copy = document.createElement('div');
        copy.append(name, remove);
        details.append(image, copy);
        info.append(details);
        const price = element('td', C.money(product.price));
        price.dataset.label = C.text('Hinta', 'Price');
        const quantity = document.createElement('td');
        quantity.dataset.label = C.text('Määrä', 'Quantity');
        const controls = element('div', '', 'qty');
        const input = document.createElement('input');
        input.type = 'number'; input.min = 1; input.max = 50; input.value = qty;
        input.dataset.focusId = id + '-quantity';
        input.setAttribute('aria-label', C.text('Määrä: ', 'Quantity: ') + product[C.language()]);
        input.addEventListener('change', () => {
          const value = Number(input.value);
          C.set(id, Number.isFinite(value) && value >= 1 ? value : 1);
        });
        for (const delta of [-1, 1]) {
          const button = element('button', delta === -1 ? '−' : '+');
          button.type = 'button';
          button.dataset.focusId = id + (delta === -1 ? '-minus' : '-plus');
          button.setAttribute('aria-label', C.text(delta === -1 ? 'Vähennä määrää' : 'Lisää määrää', delta === -1 ? 'Decrease quantity' : 'Increase quantity'));
          button.disabled = delta === -1 ? qty <= 1 : qty >= 50;
          button.addEventListener('click', () => C.set(id, qty + delta));
          controls.append(button);
          if (delta === -1) controls.append(input);
        }
        quantity.append(controls);
        const subtotal = element('td', C.money(qty * product.price));
        subtotal.dataset.label = C.text('Välisumma', 'Subtotal');
        row.append(info, price, quantity, subtotal);
        body.append(row);
        const line = element('div', '', 'order-line');
        line.append(element('span', product[C.language()] + ' × ' + qty), element('strong', C.money(qty * product.price)));
        $('#order-lines').append(line);
      }
      table.append(body);
      box.append(table);
    }
    for (const id of ['#cart-total', '#order-total']) $(id).textContent = C.money(C.total());
    $('#checkout-link').hidden = !ids.length;
    $('#send-btn').disabled = !ids.length;
    document.querySelectorAll('.shop-card').forEach(card => {
      card.querySelector('[data-price]').textContent = C.money(C.products[card.dataset.id].price);
    });
    if (focusId) box.querySelector('[data-focus-id="' + focusId + '"]')?.focus();
  }
  let feedbackTimer;
  const feedback = element('div', '', 'toast');
  feedback.setAttribute('role', 'status');
  document.body.append(feedback);
  document.querySelectorAll('.shop-card').forEach(card => {
    const input = card.querySelector('[data-qty-input]');
    const quantity = () => Math.min(20, Math.max(1, parseInt(input.value, 10) || 1));
    card.querySelectorAll('[data-qty]').forEach(button => button.addEventListener('click', () => {
      input.value = Math.min(20, Math.max(1, quantity() + Number(button.dataset.qty)));
    }));
    card.querySelector('[data-add]').addEventListener('click', () => {
      const id = card.dataset.id;
      C.set(id, (C.items()[id] || 0) + quantity());
      status.textContent = '';
      const view = element('button', C.text('Näytä kori', 'View basket'));
      view.type = 'button';
      view.addEventListener('click', C.open);
      feedback.replaceChildren(element('span', C.text('Ostoskori päivitetty', 'Basket updated')), view);
      feedback.classList.add('show');
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => feedback.classList.remove('show'), 4000);
    });
  });
  const delivery = form.elements.namedItem('delivery');
  function updateDelivery() {
    const isDelivery = delivery.value === 'delivery';
    $('#delivery-fields').hidden = !isDelivery;
    $('#delivery-fields').querySelectorAll('input').forEach(input => {
      input.disabled = !isDelivery;
      input.required = isDelivery;
    });
  }
  delivery.addEventListener('change', updateDelivery);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!Object.keys(C.items()).length) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = name => (data.get(name) || '').toString().trim();
    if (!get('firstName') || !get('lastName') || (delivery.value === 'delivery' && ['street', 'postal', 'city'].some(name => !get(name)))) {
      status.textContent = C.text('Täytä pakolliset kentät.', 'Complete the required fields.');
      return;
    }
    const lines = Object.entries(C.items()).map(([id, qty]) => C.products[id][C.language()] + ': ' + qty + ' × ' + C.money(C.products[id].price));
    const address = delivery.value === 'delivery' ? [get('street'), get('postal'), get('city')].join(', ') : C.text('Nouto sopimuksen mukaan', 'Pick-up by arrangement');
    const body = [
      C.text('Hei APINORDIC! Haluaisin tiedustella seuraavia tuotteita:', 'Hello APINORDIC! I would like to enquire about these products:'),
      ...lines, '', C.text('Tuotteiden esimerkkihinta yhteensä: ', 'Illustrative product subtotal: ') + C.money(C.total()),
      C.text('Pyydän vahvistamaan saatavuuden, lopullisen hinnan veroineen, toimituskulut, toimitusajan ja maksutavan.', 'Please confirm availability, the final price including applicable taxes, delivery costs, delivery time and payment method.'),
      '', get('firstName') + ' ' + get('lastName'), get('company'), get('email'), get('phone'), address, get('message'), '',
      C.text('Olen lukenut tilauspyynnön ehdot (11.11.2026). Tämä on sitoumukseton tiedustelu.', 'I have read the request terms (11 November 2026). This is a non-binding enquiry.')
    ].join('\n');
    window.location.href = 'mailto:info@apinordic.com?subject=' + encodeURIComponent(C.text('Tilauspyyntö – APINORDIC', 'Order request – APINORDIC')) + '&body=' + encodeURIComponent(body);
    status.textContent = C.text('Lähetä luonnos sähköpostiohjelmassasi. Jos ohjelma ei avaudu, ota yhteyttä: info@apinordic.com.', 'Send the draft in your email app. If it does not open, contact info@apinordic.com.');
  });
  window.addEventListener('apinordic-cart', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  updateDelivery();
  render();
})();
