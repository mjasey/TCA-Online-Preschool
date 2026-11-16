(() => {
  'use strict';
  const enrollment = location.pathname.endsWith('enroll.html');
  const ribbon = document.createElement('div');
  ribbon.className = 'preview-ribbon';
  ribbon.innerHTML = '<strong>Design preview for Sherri</strong> · Two free classes · Forms are demonstrations only.<a href="#free-trial">View the trial offer ↓</a>';
  document.body.prepend(ribbon);
  const section = document.createElement('section');
  section.id = 'free-trial';
  section.className = 'trial-section';
  section.setAttribute('aria-labelledby', 'trial-title');
  section.innerHTML = `
    <div class="container">
      <div class="trial-layout">
        <div class="trial-copy">
          <span class="eyebrow">A warm welcome to TCA</span>
          <h2 id="trial-title">Little learners.<br>Big possibilities.<br><em>2 classes, on us.</em></h2>
          <p>Get to know our teachers and experience the joy of Christ-centered learning. Your child can join two live, 45-minute preschool classes before you choose a plan.</p>
          <div class="trial-promise"><span>Ages 3–5</span><span>No card required</span><span>No registration fee</span></div>
          <a href="trial-classes-flyer.png" target="_blank" rel="noopener" class="trial-flyer-link"><img class="trial-flyer" src="trial-classes-flyer.png" alt="TCA flyer: two free trial classes for ages 3–5 with interactive 45-minute sessions, kindergarten readiness, hands-on learning, Bible stories and faith. Paid sessions are $25 after the free trial." loading="lazy" width="941" height="1672"><span>View Sherri’s flyer ↗</span></a>
        </div>
        <div class="trial-invitation">
          <span class="eyebrow">Your first two classes are free</span>
          <h3>A little introduction.<br>A world of discovery.</h3>
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
  const anchor = enrollment ? document.querySelector('.next') : document.querySelector('.stats');
  if (enrollment) anchor.before(section); else anchor.after(section);
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
  } else {
    const hero = document.querySelector('.enroll-hero .hero-content');
    const a = document.createElement('a');
    a.href = '#free-trial'; a.className = 'btn btn-gilt'; a.textContent = 'Try 2 Classes Free';
    a.style.margin = '12px'; hero?.append(a);
  }
  const nav = document.querySelector('.nav-links');
  if (nav) {
    const link = document.createElement('a'); link.className = 'trial-nav-link'; link.href = '#free-trial'; link.textContent = '2 Free Classes';
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
  window.TCATrialWalkthrough.mount();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav-links')?.classList.remove('open');document.querySelector('.nav-toggle')?.setAttribute('aria-expanded','false');}));
  function notice(message){document.querySelector('.preview-toast')?.remove();const n=document.createElement('div');n.className='preview-toast';n.setAttribute('role','status');n.textContent=message;document.body.append(n);setTimeout(()=>n.remove(),7000);}
  document.addEventListener('submit',event=>{if(!event.target.matches('#trial-signup')){event.preventDefault();event.stopImmediatePropagation();notice('Preview only: this message was not sent. The free-trial form above demonstrates the proposed signup process.');}},true);
  document.addEventListener('click',event=>{const a=event.target.closest('a');if(a&&/^https:\/\/(buy\.stripe\.com|docs\.google\.com\/forms)/.test(a.href)){event.preventDefault();event.stopImmediatePropagation();notice('Preview only: checkout is disabled here. Paid enrollment will continue through the existing Stripe links when the trial is approved.');}},true);
})();
