(function () {
  const TG_URL = 'https://t.me/grand_cleaning';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // header shadow + mobile menu
  const header = $('.header');
  const nav = $('.nav');
  const burger = $('.burger');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  // service tabs
  $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-tab]').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== btn.dataset.tab; });
  }));

  // room checklist tabs
  $$('[data-room]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-room]').forEach(b => b.classList.toggle('is-active', b === btn));
    $$('[data-list]').forEach(l => { l.hidden = l.dataset.list !== btn.dataset.room; });
  }));

  // preselect service in the order form
  const orderService = $('#orderService');
  $$('[data-service]').forEach(el => el.addEventListener('click', () => {
    const name = el.dataset.service;
    const opt = Array.from(orderService.options).find(o => name.startsWith(o.text) || o.text.startsWith(name));
    orderService.value = opt ? opt.text : 'Другое';
  }));

  // calculator
  const fmt = n => n.toLocaleString('ru-RU') + ' ₽';
  const type = $('#calcType'), area = $('#calcArea'), win = $('#calcWin'), first = $('#calcFirst');
  const MIN_ORDER = 3000, WIN_PRICE = 450;
  function calc() {
    $('#areaVal').textContent = area.value;
    $('#winVal').textContent = win.value;
    let total = Math.max(MIN_ORDER, +type.value * +area.value) + +win.value * WIN_PRICE;
    if (first.checked) total *= 0.9;
    total = Math.round(total / 50) * 50;
    $('#calcTotal').textContent = fmt(total);
    return total;
  }
  [type, area, win, first].forEach(el => el.addEventListener('input', calc));
  calc();
  $('#calcOrder').addEventListener('click', () => {
    const label = type.options[type.selectedIndex].text.split(' — ')[0];
    const map = { 'Поддерживающая': 'Поддерживающая уборка', 'Генеральная': 'Генеральная уборка', 'После ремонта': 'Уборка после ремонта', 'Дом / коттедж': 'Уборка дома' };
    orderService.value = map[label] || 'Другое';
    $('#order textarea').value = `${label}, ${area.value} м², окон: ${win.value}. Расчёт: ${$('#calcTotal').textContent}`;
  });

  // lead forms (test mode: no backend — copy request text and open Telegram)
  $$('.js-lead').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const lines = [`Заявка: ${form.dataset.source}`];
    if (data.get('name')) lines.push(`Имя: ${data.get('name')}`);
    lines.push(`Телефон: ${data.get('phone')}`);
    if (data.get('service')) lines.push(`Услуга: ${data.get('service')}`);
    if (data.get('comment')) lines.push(`Комментарий: ${data.get('comment')}`);
    const text = lines.join('\n');
    try { await navigator.clipboard.writeText(text); } catch (_) {}
    const msg = form.querySelector('.form-msg');
    if (msg) msg.textContent = 'Спасибо! Текст заявки скопирован — вставьте его в чат Telegram, который сейчас откроется.';
    else alert('Спасибо! Текст заявки скопирован — вставьте его в чат Telegram.');
    window.open(TG_URL, '_blank', 'noopener');
    form.reset();
  }));

  // phone mask
  $$('input[type=tel]').forEach(inp => inp.addEventListener('input', () => {
    let d = inp.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    inp.value = out;
  }));

  // reveal on scroll
  const targets = $$('.section__head, .feature, .card, .steps li, .review, details, .calc__box, .price-list, .gallery img');
  targets.forEach(t => t.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    targets.forEach(t => io.observe(t));
  } else targets.forEach(t => t.classList.add('is-visible'));

  $('#year').textContent = new Date().getFullYear();
})();
