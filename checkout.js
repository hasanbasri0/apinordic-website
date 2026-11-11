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
    const cart = C.items();
    const ids = Object.keys(cart);
    $('#checkout-empty').hidden = ids.length > 0;
    $('#tilauspyynto').hidden = ids.length === 0;
    $('#send-btn').disabled = ids.length === 0;
    const lines = $('#order-lines');
    lines.replaceChildren();
    for (const id of ids) {
      const product = C.products[id], qty = cart[id];
      const line = element('div', '', 'order-line');
      line.append(element('span', product[C.language()] + ' × ' + qty), element('strong', C.money(qty * product.price)));
      lines.append(line);
    }
    $('#order-total').textContent = C.money(C.total());
  }
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
  updateDelivery();
  window.addEventListener('apinordic-cart', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
