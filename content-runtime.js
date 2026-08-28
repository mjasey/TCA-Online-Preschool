(function () {
  const path = window.location.pathname.toLowerCase();
  const slug = path.endsWith('/enroll.html') ? 'enroll' : path.endsWith('/donate.html') ? 'donate' : 'home';
  const previewMode = new URLSearchParams(window.location.search).get('tca-preview') === '1' && window.parent !== window;

  const get = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
  const one = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const text = (selector, value) => { const element = one(selector); if (element && value != null) element.textContent = value; };
  const nthText = (selector, index, value) => { const element = all(selector)[index]; if (element && value != null) element.textContent = value; };
  const heading = (selector, title, accent) => {
    const element = one(selector);
    if (!element || title == null || accent == null) return;
    const emphasis = document.createElement('em');
    emphasis.textContent = accent;
    element.replaceChildren(document.createTextNode(`${title} `), emphasis);
  };
  const link = (selector, value) => { const element = one(selector); if (element && value) element.href = value; };
  const media = (selector, value) => {
    const source = one(selector);
    if (!source || !value || source.getAttribute('src') === value) return;
    source.setAttribute('src', value);
    const video = source.closest('video');
    if (video) {
      video.load();
      if (video.autoplay) video.play().catch(() => {});
    }
  };
  const image = (selector, value) => { const element = one(selector); if (element && value) element.src = value; };

  function applyHome(content) {
    text('.hero-content .eyebrow', get(content, 'hero.eyebrow'));
    heading('.hero-content h1', get(content, 'hero.title'), get(content, 'hero.accent'));
    text('.hero-content .lede', get(content, 'hero.intro'));
    media('.hero > video source', get(content, 'hero.video'));
    media('.founder-video-wrap video source', get(content, 'founder.video'));
    heading('.founder-grid > div:last-child h2', get(content, 'founder.title'), get(content, 'founder.accent'));
    [1, 2, 3, 4].forEach((number, index) => nthText('.promise-list li', index, get(content, `founder.promise${number}`)));
    text('.founder-quote', get(content, 'founder.quote'));
    text('.mission-statement', get(content, 'mission.statement'));
    text('.mission-scripture', get(content, 'mission.scripture'));
    text('.mission-attribution', get(content, 'mission.attribution'));
    image('.teacher-card:nth-child(1) .teacher-photo', get(content, 'teachers.sherriPhoto'));
    image('.teacher-card:nth-child(2) .teacher-photo', get(content, 'teachers.vanessaPhoto'));
    nthText('.teacher-card:nth-child(1) .teacher-body > p', 0, get(content, 'teachers.sherriBio'));
    nthText('.teacher-card:nth-child(2) .teacher-body > p', 0, get(content, 'teachers.vanessaBio'));
    media('#vanessa-video source', get(content, 'teachers.vanessaVideo'));
    text('.price-stack .num', get(content, 'tuition.registration'));
    text('.tuition-panel > p', get(content, 'tuition.description'));
    text('.contact-info > p', get(content, 'contact.intro'));
    const phone = get(content, 'contact.phone');
    const email = get(content, 'contact.email');
    text('.contact-list a[href^="tel:"]', phone);
    link('.contact-list a[href^="tel:"]', phone ? `tel:${String(phone).replace(/[^\d+]/g, '')}` : '');
    text('.contact-list a[href^="mailto:"]', email);
    link('.contact-list a[href^="mailto:"]', email ? `mailto:${email}` : '');
  }

  function applyEnroll(content) {
    text('.enroll-hero .eyebrow', get(content, 'hero.eyebrow'));
    heading('.enroll-hero h1', get(content, 'hero.title'), get(content, 'hero.accent'));
    text('.enroll-hero .hero-content > p', get(content, 'hero.intro'));
    media('.enroll-hero video source', get(content, 'hero.video'));
    text('.next .section-head > p', get(content, 'steps.intro'));
    [1, 2, 3].forEach((number, index) => {
      nthText('.steps-grid .step h3', index, get(content, `steps.step${number}Title`));
      nthText('.steps-grid .step p', index, get(content, `steps.step${number}Text`));
    });
    ['one', 'two', 'monthly'].forEach((name, index) => {
      nthText('.plans-grid .plan h3', index, get(content, `plans.${name}.name`));
      nthText('.plans-grid .plan .amount', index, get(content, `plans.${name}.price`));
      nthText('.plans-grid .plan .cadence', index, get(content, `plans.${name}.cadence`));
      nthText('.plans-grid .plan .first-pay strong', index, get(content, `plans.${name}.today`));
      const planLink = all('.plans-grid .plan > a')[index];
      if (planLink && get(content, `plans.${name}.link`)) planLink.href = get(content, `plans.${name}.link`);
    });
    text('.schedule .section-head > p', get(content, 'schedule.intro'));
    [1, 2, 3].forEach((number, index) => {
      const pieces = String(get(content, `schedule.class${number}`) || '').split('·').map(item => item.trim());
      const card = all('.schedule-card')[index];
      if (!card) return;
      if (pieces[0]) card.querySelector('.day').textContent = pieces[0];
      if (pieces[1]) card.querySelector('.time').textContent = pieces[1];
      if (pieces[2]) card.querySelector('.tz').textContent = pieces[2];
    });
  }

  function applyDonate(content) {
    text('.give-hero .eyebrow', get(content, 'hero.eyebrow'));
    heading('.give-hero h1', get(content, 'hero.title'), get(content, 'hero.accent'));
    text('.give-hero .mission-line', get(content, 'hero.intro'));
    media('.give-hero video source', get(content, 'hero.video'));
    text('.give .give-intro > p', get(content, 'gifts.intro'));
    [1, 2, 3].forEach((number, index) => {
      nthText('.amount-card .amount-num', index, get(content, `gifts.amount${number}`));
      const card = all('.amount-card')[index];
      if (card && get(content, `gifts.link${number}`)) card.href = get(content, `gifts.link${number}`);
    });
    nthText('.impact-card p', 0, get(content, 'impact.scholarships'));
    nthText('.impact-card p', 1, get(content, 'impact.curriculum'));
    text('.thanks .container-narrow > p:not(.signature)', get(content, 'impact.thanks'));
  }

  function apply(content) {
    if (!content || typeof content !== 'object') return;
    if (slug === 'home') applyHome(content);
    if (slug === 'enroll') applyEnroll(content);
    if (slug === 'donate') applyDonate(content);
  }

  async function loadPublished() {
    if (previewMode) return;
    try {
      const configResponse = await fetch('/api/cms-config', { headers: { Accept: 'application/json' } });
      if (!configResponse.ok) return;
      const config = await configResponse.json();
      if (!config.url || !config.publishableKey) return;
      const endpoint = `${config.url}/rest/v1/published_pages?slug=eq.${encodeURIComponent(slug)}&select=content`;
      const response = await fetch(endpoint, { headers: { apikey: config.publishableKey, Authorization: `Bearer ${config.publishableKey}` } });
      if (!response.ok) return;
      const rows = await response.json();
      if (rows[0]?.content) apply(rows[0].content);
    } catch (_) {
      // The hardcoded page remains the safe fallback when the content service is unavailable.
    }
  }

  if (previewMode) {
    window.addEventListener('message', event => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === 'tca-cms-preview' && event.data.slug === slug) apply(event.data.content);
    });
  }

  window.TCACmsApply = apply;
  loadPublished();
})();
