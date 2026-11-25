(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const output = document.querySelector('#contact-output');
  const message = document.querySelector('#contact-text');
  const status = document.querySelector('#contact-status');
  const t = (fi, en) => document.documentElement.lang === 'en' ? en : fi;
  const topicParam = new URLSearchParams(location.search).get('topic');
  if ([...form.elements.topic.options].some(option => option.value === topicParam)) form.elements.topic.value = topicParam;
  function clear() { output.hidden = true; message.value = ''; status.textContent = ''; document.querySelector('#contact-email').removeAttribute('href'); }
  form.addEventListener('input', clear);
  new MutationObserver(clear).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const topic = form.elements.topic.selectedOptions[0].textContent;
    message.value = `${t('Hei APINORDIC!', 'Hello APINORDIC!')}\n\n${topic}\n\n${form.elements.message.value.trim()}\n\n${form.elements.name.value.trim()}\n${form.elements.email.value.trim()}\n\n${t('Tämä on sitoumukseton tiedustelu.', 'This is a non-binding enquiry.')}`;
    document.querySelector('#contact-email').href = 'mailto:info@apinordic.com?subject=' + encodeURIComponent('APINORDIC – ' + topic) + '&body=' + encodeURIComponent(message.value);
    output.hidden = false;
    message.focus();
  });
  document.querySelector('#contact-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(message.value); status.textContent = t('Kopioitu. Lähetä viesti omasta sähköpostistasi.', 'Copied. Send the message from your email account.'); }
    catch { message.focus(); message.select(); status.textContent = t('Valitse Kopioi laitteesi valikosta.', 'Choose Copy from your device menu.'); }
  });
})();
