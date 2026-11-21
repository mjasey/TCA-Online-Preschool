(() => {
  'use strict';
  const enrollment = location.pathname.endsWith('enroll.html');
  const section = document.createElement('section');
  section.id = 'free-trial';
  section.className = 'trial-section';
  section.setAttribute('aria-labelledby', 'trial-title');
  section.innerHTML = `
    <div class="container">
      <div class="trial-layout">
        <div class="trial-flyer-frame">
          <img class="trial-flyer" src="trial-flyer-960.webp" srcset="trial-flyer-480.webp 480w, trial-flyer-960.webp 960w" sizes="(max-width: 820px) 330px, 380px" width="960" height="1706" loading="eager" fetchpriority="high" decoding="async" alt="TCA offers two free trial classes for ages 3–5: interactive 45-minute sessions, kindergarten readiness, hands-on learning, Bible stories and faith. Paid sessions are $25 after the free trial.">
        </div>
        <div class="trial-invitation">
          <span class="eyebrow">A warm welcome to TCA · Ages 3–5</span>
          <h2 id="trial-title">Their first two classes.<br><em>Absolutely free.</em></h2>
          <p>Meet the teacher. Explore hands-on activities. Experience Christ-centered preschool together before choosing a plan.</p>
          <div class="trial-promise"><span>No card required</span><span>No registration fee</span></div>
          <p>Tell us about your little learner and where to send their class materials. Choose two Thursday evenings, and Sherri will confirm the dates and send everything you need.</p>
          <ul class="trial-session-list">
            <li>Thursday trial classes<span>5:30–6:15 PM Eastern · Two live, 45-minute classes</span></li>
            <li>Time to prepare<span>We skip the next Thursday so your materials have time to arrive.</span></li>
          </ul>
          <button class="btn" type="button" data-open-trial>Request My Free Classes →</button>
          <p class="trial-footnote">Dates are confirmed personally, subject to available seats.</p>
        </div>
      </div>
      <div class="trial-steps" aria-label="How the free trial works">
        <div class="trial-step"><b>1</b><div><strong>Tell us about your child</strong><p>Share their interests, your mailing address, and two preferred Thursday dates.</p></div></div>
        <div class="trial-step"><b>2</b><div><strong>Get ready to learn</strong><p>Sherri confirms the dates, mails your class materials, and shares class instructions.</p></div></div>
        <div class="trial-step"><b>3</b><div><strong>Try two classes, then decide</strong><p>After attending both classes, you’ll receive an invitation to register for TCA.</p></div></div>
      </div>
    </div>`;
  const anchor = enrollment ? document.querySelector('.next') : document.querySelector('#foundation');
  if (enrollment) anchor.before(section); else anchor.after(section);
  const floating = document.createElement('a');
  floating.href = '#free-trial';
  floating.className = 'trial-floating';
  floating.innerHTML = '<span>Try 2 Free Classes</span><span aria-hidden="true">↗</span>';
  document.body.append(floating);
  const signupButton = section.querySelector('[data-open-trial]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => { floating.hidden = entry.isIntersecting; }, {threshold:0.5});
    observer.observe(signupButton);
  }
  const heroActions = document.querySelector('.hero-actions');
  if (heroActions) {
    const trialCTA = document.createElement('a');
    trialCTA.className = 'btn btn-primary';
    trialCTA.href = '#free-trial';
    trialCTA.textContent = 'Try 2 Classes Free';
    const existing = heroActions.querySelector('.btn-primary');
    if (existing) existing.className = 'btn btn-outline-light';
    heroActions.querySelector('a[href="#foundation"]')?.remove();
    heroActions.prepend(trialCTA);
    const eyebrow = document.querySelector('.hero-content .eyebrow');
    if(eyebrow)eyebrow.textContent='Start with 2 free preschool classes';
    const intro = document.querySelector('.hero-content .lede');
    if(intro)intro.textContent='Discover our Christ-centered online preschool with two free, 45-minute Thursday classes. Small groups, caring teachers, and hands-on learning for ages 3–5.';
    trialCTA.classList.add('trial-hero-cta');
  } else {
    const hero = document.querySelector('.enroll-hero .hero-content');
    const a = document.createElement('a');
    a.href = '#free-trial'; a.className = 'btn btn-gilt'; a.textContent = 'Try 2 Classes Free';
    a.style.margin = '12px'; hero?.append(a);
    const eyebrow=hero?.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Try two free classes · Then choose your plan';
  }
  const nav = document.querySelector('.nav-links');
  if (nav) {
    const link = document.createElement('a'); link.className = 'trial-nav-link'; link.href = '#free-trial'; link.textContent = 'Try Free Classes';
    if (nav.tagName === 'UL') { const li = document.createElement('li'); li.append(link); nav.insertBefore(li,nav.lastElementChild); }
    else nav.insertBefore(link,nav.lastElementChild);
  }
  if (enrollment) {
    const cards = document.querySelectorAll('.schedule-card');
    const slots = [['Monday–Friday','10:00–10:45 AM'],['Thursday','5:30–6:15 PM']];
    slots.forEach((slot,i) => { if(cards[i]){cards[i].querySelector('.day').textContent=slot[0];cards[i].querySelector('.time').textContent=slot[1];} });
    cards[2]?.remove();
    const grid = document.querySelector('.schedule-grid'); if(grid)grid.style.gridTemplateColumns='repeat(auto-fit,minmax(min(100%,280px),1fr))';
  }
  window.TCATrialSignup.mount();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav-links')?.classList.remove('open');document.querySelector('.nav-toggle')?.setAttribute('aria-expanded','false');}));
})();
