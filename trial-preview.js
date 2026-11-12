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
          <img class="trial-photo" src="bro-sis.png" alt="Children enjoying hands-on learning together" loading="lazy" width="600" height="300">
        </div>
        <div class="trial-invitation">
          <span class="eyebrow">Your first two classes are free</span>
          <h3>A little introduction.<br>A world of discovery.</h3>
          <p>Tell us a little about your family and your preferred session. Sherri will be in touch to confirm two class dates and help you get ready.</p>
          <ul class="trial-session-list">
            <li>Monday–Friday<span>10:00–10:45 AM Eastern</span></li>
            <li>Thursday<span>5:30–6:15 PM Eastern</span></li>
          </ul>
          <button class="btn" type="button" data-open-trial>Request My Free Classes →</button>
          <p class="trial-footnote">Dates are confirmed personally, subject to available seats.</p>
        </div>
      </div>
      <div class="trial-steps" aria-label="How the free trial works">
        <div class="trial-step"><b>1</b><div><strong>Request your free classes</strong><p>Share your contact details and preferred session in a short form.</p></div></div>
        <div class="trial-step"><b>2</b><div><strong>Confirm your dates</strong><p>Sherri will arrange your classes, share the registration form, and send class instructions.</p></div></div>
        <div class="trial-step"><b>3</b><div><strong>Enjoy two classes together</strong><p>Meet the teacher, try the activities, and choose a paid plan when you’re ready.</p></div></div>
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
  const dialog = document.createElement('dialog');
  dialog.className = 'trial-dialog'; dialog.setAttribute('aria-labelledby','trial-dialog-title');
  dialog.innerHTML = `<div class="trial-dialog-inner">
    <button class="trial-dialog-close" aria-label="Close trial signup" type="button">×</button>
    <div id="trial-signup-panel">
      <span class="eyebrow">Two free classes · Ages 3–5</span>
      <h2 id="trial-dialog-title">Let’s meet your <em>little learner.</em></h2>
      <p>Share a few details and we’ll help you find the right class.</p>
      <p class="trial-demo-note">Preview only. Use sample details to try this form. No request is sent or saved.</p>
      <form class="trial-form" id="trial-signup" method="dialog">
        <label>Parent or guardian’s name<input name="parentName" autocomplete="off" required maxlength="100"></label>
        <div class="trial-field-pair"><label>Email address<input type="email" name="email" autocomplete="off" required maxlength="254"></label><label>Phone number (optional)<input type="tel" name="phone" autocomplete="off" maxlength="40"></label></div>
        <div class="trial-field-pair"><label>Child’s first name<input name="childName" autocomplete="off" required maxlength="60"></label><label>Child’s age<select name="childAge" required><option value="">Select age</option><option>3 years old</option><option>4 years old</option><option>5 years old</option></select></label></div>
        <label>Preferred session<select name="session" required><option value="">Choose a session</option><option>Weekday mornings · 10:00–10:45 AM Eastern</option><option>Thursday evening · 5:30–6:15 PM Eastern</option><option>I’d like help choosing a time</option></select></label>
        <label>Preferred days or questions (optional)<textarea name="notes" rows="2" maxlength="1000" placeholder="Tell us which weekdays work for your family."></textarea></label>
        <button class="btn" type="submit">Request My Free Classes</button>
        <p style="font-size:12px;margin:0">Your class dates will be confirmed by Sherri. No payment required.</p>
      </form>
    </div>
    <div id="trial-success-panel" hidden tabindex="-1">
      <span class="trial-success-icon" aria-hidden="true">✓</span>
      <span class="eyebrow">Your next chapter starts here</span>
      <h2 id="trial-success-title">You’re one step <em>closer.</em></h2>
      <p>Thank you! Your free-class request has been received. We’ll contact you to confirm your two class dates.</p>
      <div class="trial-next"><ol><li>Sherri confirms two dates that work for your family.</li><li>You complete the registration form and receive your class instructions.</li><li>Your little learner joins two free classes. You decide whether to enroll afterward.</li></ol></div>
      <p class="trial-demo-note">This is a sample confirmation. Nothing was sent or booked. In the finished version, the request would appear in Sherri’s Free Trials spreadsheet and she would receive an email notification.</p>
      <div class="trial-success-actions"><button class="btn btn-primary" data-restart-trial type="button">Try the form again</button><a class="btn btn-outline" href="enroll.html#plans">Explore enrollment plans</a></div>
    </div>
  </div>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const signup = dialog.querySelector('#trial-signup-panel');
  const success = dialog.querySelector('#trial-success-panel');
  function resetTrial(){form.reset();signup.hidden=false;success.hidden=true;dialog.setAttribute('aria-labelledby','trial-dialog-title');}
  document.querySelectorAll('[data-open-trial]').forEach(b => b.addEventListener('click',()=>{resetTrial();dialog.showModal();}));
  dialog.querySelector('.trial-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  form.addEventListener('submit',event=>{event.preventDefault();signup.hidden=true;success.hidden=false;form.reset();dialog.setAttribute('aria-labelledby','trial-success-title');success.focus();dialog.scrollTop=0;});
  dialog.querySelector('[data-restart-trial]').addEventListener('click',()=>{resetTrial();form.querySelector('input').focus();dialog.scrollTop=0;});
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav-links')?.classList.remove('open');document.querySelector('.nav-toggle')?.setAttribute('aria-expanded','false');}));
  function notice(message){document.querySelector('.preview-toast')?.remove();const n=document.createElement('div');n.className='preview-toast';n.setAttribute('role','status');n.textContent=message;document.body.append(n);setTimeout(()=>n.remove(),7000);}
  document.addEventListener('submit',event=>{if(event.target!==form){event.preventDefault();event.stopImmediatePropagation();notice('Preview only: this message was not sent. The free-trial form above demonstrates the proposed signup process.');}},true);
  document.addEventListener('click',event=>{const a=event.target.closest('a');if(a&&/^https:\/\/(buy\.stripe\.com|docs\.google\.com\/forms)/.test(a.href)){event.preventDefault();event.stopImmediatePropagation();notice('Preview only: checkout is disabled here. Paid enrollment will continue through the existing Stripe links when the trial is approved.');}},true);
})();
