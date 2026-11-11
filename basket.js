(() => {
  const C = window.ApinordicCart;
  const $ = selector => document.querySelector(selector);
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
    if (!ids.length) box.append(element('p', C.text('Ostoskori on tyhjä. Lisää tuotteita verkkokaupasta.', 'Your basket is empty. Add products from the shop.'), 'basket-empty'));
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
        name.href = 'verkkokauppa.html#hunaja-' + id;
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
      }
      table.append(body);
      box.append(table);
    }
    $('#cart-total').textContent = C.money(C.total());
    $('#checkout-link').hidden = !ids.length;
    if (focusId) box.querySelector('[data-focus-id="' + focusId + '"]')?.focus();
  }
  window.addEventListener('apinordic-cart', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
