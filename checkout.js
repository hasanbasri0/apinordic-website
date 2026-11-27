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
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!Object.keys(C.items()).length) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = name => (data.get(name) || '').toString().trim();
    if (!get('firstName') || !get('lastName')) {
      status.textContent = C.text('Täytä pakolliset kentät.', 'Complete the required fields.');
      return;
    }
    const lines = Object.entries(C.items()).map(([id, qty]) => C.products[id][C.language()] + ': ' + qty + ' × ' + C.money(C.products[id].price));
    const body = [
      C.text('Hei APINORDIC! Haluaisin tiedustella seuraavia tuotteita:', 'Hello APINORDIC! I would like to enquire about these products:'),
      C.text('Tämä on sitoumukseton tilauspyyntö. Pyydän vahvistamaan tuotteiden saatavuuden.', 'This is a non-binding order request. Please confirm product availability.'),
      C.text('Toimitustoive: ', 'Delivery preference: ') + (get('delivery') === 'pickup' ? C.text('Nouto Turussa 0 €', 'Collection in Turku, free') : C.text('Posti, hinta vahvistetaan', 'Posti, price to be confirmed')),
      ...lines, '', C.text('Tuotteet yhteensä (ilman toimituskuluja): ', 'Product subtotal (excluding delivery): ') + C.money(C.total()),
      C.text('Pyydän vahvistamaan saatavuuden, lopullisen hinnan veroineen, toimituskulut, toimitusajan ja maksutavan.', 'Please confirm availability, the final price including applicable taxes, delivery costs, delivery time and payment method.'),
      '', get('firstName') + ' ' + get('lastName'), get('email'), get('message'), '',
      C.text('Olen lukenut tilauspyynnön ehdot (27.11.2026). Tämä on sitoumukseton tiedustelu.', 'I have read the request terms (27 November 2026). This is a non-binding enquiry.')
    ].join('\n');
    $('#request-text').value = body;
    $('#request-output').hidden = false;
    $('#request-text').focus();
    $('#email-request').href = 'mailto:info@apinordic.com?subject=' + encodeURIComponent(C.text('Tilauspyyntö – APINORDIC', 'Order request – APINORDIC')) + '&body=' + encodeURIComponent(body);
    status.textContent = C.text('Teksti on valmis alla. Mitään ei ole lähetetty.', 'Your text is ready below. Nothing has been sent.');
  });
  form.addEventListener('input', () => { $('#request-output').hidden = true; $('#copy-status').textContent = ''; });
  $('#copy-request').addEventListener('click', async () => {
    const field = $('#request-text');
    try { await navigator.clipboard.writeText(field.value); $('#copy-status').textContent = C.text('Kopioitu. Liitä viesti omaan sähköpostiisi.', 'Copied. Paste the message into your email.'); }
    catch { field.focus(); field.select(); $('#copy-status').textContent = C.text('Valitse ja kopioi teksti yllä olevasta kentästä.', 'Select and copy the text in the field above.'); }
  });
  window.addEventListener('apinordic-cart', () => { $('#request-output').hidden = true; });
  new MutationObserver(() => { $('#request-output').hidden = true; }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('apinordic-cart', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
