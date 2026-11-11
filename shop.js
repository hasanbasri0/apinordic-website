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
    document.querySelectorAll('.shop-card').forEach(card => {
      card.querySelector('[data-price]').textContent = C.money(C.products[card.dataset.id].price);
    });
  }
  if (location.hash === '#kori') location.replace('ostoskori.html');
  if (location.hash === '#tilauspyynto') location.replace('tilauspyynto.html');
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
      const view = element('button', C.text('Näytä kori', 'View basket'));
      view.type = 'button';
      view.addEventListener('click', C.open);
      feedback.replaceChildren(element('span', C.text('Ostoskori päivitetty', 'Basket updated')), view);
      feedback.classList.add('show');
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => feedback.classList.remove('show'), 4000);
    });
  });
  window.addEventListener('apinordic-cart', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
