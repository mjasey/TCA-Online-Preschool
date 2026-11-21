(() => {
  'use strict';
  // Calendar arithmetic uses Eastern calendar dates, never the visitor's timezone.
  const easternToday = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const dateValue = date => date.toISOString().slice(0,10);
  const parseDate = value => new Date(`${value}T12:00:00Z`);
  function eligibleDates(today = easternToday()) {
    const first = parseDate(today);
    const untilNextThursday = (4 - first.getUTCDay() + 7) % 7 || 7;
    first.setUTCDate(first.getUTCDate() + untilNextThursday + 7);
    return Array.from({length:12},(_,i) => {const d=new Date(first);d.setUTCDate(d.getUTCDate()+i*7);return dateValue(d);});
  }
  const labelDate = value => new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(parseDate(value));
  function ageFromDOB(dob,today=easternToday()) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)||dob>today)return '';
    const [year,month,day]=dob.split('-').map(Number);const [y,m,d]=today.split('-').map(Number);
    return y-year-(m<month||(m===month&&d<day)?1:0);
  }
  const safe = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  window.TCATrialSignup = {eligibleDates,ageFromDOB,mount};
  function mount() {
    const dialog=document.createElement('dialog');dialog.className='trial-dialog walkthrough-dialog';
    document.body.append(dialog);
    let request=null,step=0,pendingTestId=null,submitting=false;
    function show(html,title) {
      dialog.innerHTML=`<div class="trial-dialog-inner"><button class="trial-dialog-close" aria-label="Close free class request" type="button">×</button>${html}</div>`;
      dialog.setAttribute('aria-labelledby',title);
      dialog.querySelector('.trial-dialog-close').onclick=()=>dialog.close();
      dialog.scrollTop=0;
      if(dialog.open)dialog.querySelector('h2')?.focus();
    }
    const tag = label => `<span class="eyebrow">${label}</span>`;
    const heading = (id,text) => `<h2 id="${id}" tabindex="-1">${text}</h2>`;
    function open() { request=null;step=0;pendingTestId=null;signup();dialog.showModal();dialog.querySelector('h2').focus(); }
    dialog.addEventListener('cancel',event=>{if(submitting)event.preventDefault();});
    document.querySelectorAll('[data-open-trial]').forEach(button=>button.addEventListener('click',open));
    dialog.addEventListener('click',event=>{
      if(event.target===dialog){const r=dialog.getBoundingClientRect();if(!submitting&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();}
    });
    function signup() {
      const dates=eligibleDates();
      const options=dates.slice(0,-1).map(date=>`<option value="${date}">${labelDate(date)}</option>`).join('');
      show(`${tag('Two Thursday classes · 5:30–6:15 PM Eastern')}${heading('signup-title','A little about your <em>little learner.</em>')}
        <p>No payment card or registration fee required. Sherri will personally confirm your requested dates.</p>
        
        <ol class="form-progress" aria-label="Signup progress"><li data-progress="0">1. Your family</li><li data-progress="1">2. Materials</li><li data-progress="2">3. Class dates</li></ol>
        <form class="trial-form" id="trial-signup" novalidate>
          <fieldset data-step="0"><legend>Your family</legend>
            <label>Parent or guardian’s full name<input name="parentName" required maxlength="100" autocomplete="on"></label>
            <div class="trial-field-pair"><label>Email address<input name="email" type="email" required maxlength="254" autocomplete="on"></label><label>Phone number (optional)<input name="phone" type="tel" maxlength="40" autocomplete="on"></label></div>
            <label>Child’s full name<input name="childName" required maxlength="100" autocomplete="on"></label>
            <div class="trial-field-pair"><label>Child’s date of birth<input name="dob" type="date" required max="${easternToday()}"></label><label>Child’s age<input name="childAge" type="number" required min="0" max="18" step="1" inputmode="numeric" aria-describedby="age-note" placeholder="Age in years"></label></div>
            <p id="age-note" class="field-note">Age fills in from the date of birth. You can change it if needed. Our preschool program is for ages 3–5.</p>
            <label>Child’s likes and interests<textarea name="interests" required maxlength="1000" rows="3" placeholder="Favorite animals, stories, songs, activities…"></textarea></label>
            <label class="test-consent"><input type="checkbox" name="testConsent" required> I am the child’s parent or guardian and agree that TCA may use these details to arrange trial classes and mail materials.</label>
          </fieldset>
          <fieldset data-step="1" hidden><legend>Where should we send class materials?</legend>
            <p>We’ll mail the hands-on supplies your child needs for the two trial classes.</p>
            <label>Street address<input name="street" required maxlength="160" autocomplete="on"></label>
            <label>Apartment, suite, or unit (optional)<input name="unit" maxlength="60" autocomplete="on"></label>
            <div class="trial-field-pair"><label>City<input name="city" required maxlength="80" autocomplete="on"></label><label>State / region<input name="region" required maxlength="80" autocomplete="on"></label></div>
            <div class="trial-field-pair"><label>ZIP / postal code<input name="postal" required maxlength="20" autocomplete="on"></label><label>Country<input name="country" required maxlength="80" value="United States" autocomplete="on"></label></div>
          </fieldset>
          <fieldset data-step="2" hidden><legend>Choose your two Thursdays</legend>
            <p>Each class meets from <strong>5:30–6:15 PM Eastern</strong>. We skip the upcoming Thursday to allow time to mail your materials.</p>
            <label>First trial class<select name="class1" required><option value="">Choose a Thursday</option>${options}</select></label>
            <label>Second trial class<select name="class2" required><option value="">Choose a later Thursday</option></select></label>
            <p class="field-note">These are requested dates, not confirmed bookings. Sherri will check availability, holidays, and mailing time before confirming.</p>
            <label>Anything else you’d like Sherri to know? (optional)<textarea name="notes" rows="2" maxlength="1000"></textarea></label>
          </fieldset>
          <p id="trial-error" role="alert" class="trial-error"></p>
          <div class="form-buttons"><button class="btn btn-outline" type="button" data-action="back">Back</button><button class="btn btn-primary" type="button" data-action="next">Continue</button><button class="btn btn-primary" type="submit" hidden>Request My Free Classes</button></div>
        </form>`, 'signup-title');
      const form=dialog.querySelector('form');
      const f=name=>form.elements.namedItem(name);
      const showStep=()=>{
        dialog.querySelectorAll('[data-step]').forEach((el,i)=>el.hidden=i!==step);
        dialog.querySelectorAll('[data-progress]').forEach((el,i)=>{el.classList.toggle('current',i===step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
        dialog.querySelector('[data-action=back]').hidden=step===0;
        dialog.querySelector('[data-action=next]').hidden=step===2;
        form.querySelector('[type=submit]').hidden=step!==2;
        dialog.scrollTop=0;
      };
      const updateSecond=()=>{
        const old=f('class2').value;
        f('class2').innerHTML='<option value="">Choose a later Thursday</option>'+eligibleDates().filter(d=>d>f('class1').value&&f('class1').value).map(d=>`<option value="${d}">${labelDate(d)}</option>`).join('');
        if([...f('class2').options].some(o=>o.value===old))f('class2').value=old;
      };
      let calculatedAge='';
      f('dob').onchange=()=>{
        const age=String(ageFromDOB(f('dob').value));
        if(!f('childAge').value||f('childAge').value===calculatedAge)f('childAge').value=age;
        calculatedAge=age;
      };
      f('class1').onchange=updateSecond;
      function validStep(){for(const el of form.querySelectorAll(`[data-step="${step}"] input,[data-step="${step}"] select,[data-step="${step}"] textarea`)){if(!el.checkValidity()){el.reportValidity();return false;}}return true;}
      dialog.querySelector('[data-action=next]').onclick=()=>{if(validStep()){step++;showStep();dialog.querySelector(`[data-step="${step}"] input,[data-step="${step}"] select`)?.focus();}};
      dialog.querySelector('[data-action=back]').onclick=()=>{step--;showStep();};
      form.onkeydown=event=>{if(event.key==='Enter'&&event.target.tagName!=='TEXTAREA'&&step<2){event.preventDefault();dialog.querySelector('[data-action=next]').click();}};
      form.onsubmit=async event=>{
        event.preventDefault();if(submitting||!validStep())return;
        const eligible=eligibleDates();
        if(!eligible.includes(f('class1').value)||!eligible.includes(f('class2').value)||f('class2').value<=f('class1').value){dialog.querySelector('#trial-error').textContent='Please choose two available Thursdays, with your second class after the first.';return;}
        const previousStep=step;
        for(step=0;step<3;step++){showStep();if(!validStep())return;}
        step=previousStep;showStep();
        const button=form.querySelector('[type=submit]');
        const errorBox=dialog.querySelector('#trial-error');
        errorBox.textContent='';submitting=true;dialog.querySelectorAll('button').forEach(b=>b.disabled=true);button.textContent='Sending your request…';
        pendingTestId ||= crypto.randomUUID();
        const submission={...Object.fromEntries(new FormData(form)),requestId:pendingTestId,consent:f('testConsent').checked};
        try {
          const response=await fetch('/api/free-trial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(submission)});
          const result=await response.json();
          if(!response.ok||!result.ok)throw new Error(result.error||'Your request could not be sent. Please retry.');
          request=submission;confirmation();
        } catch(error){errorBox.textContent=error.message||'Your request could not be sent. Please retry.';}
        finally{submitting=false;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);button.textContent='Request My Free Classes';}
      };
      showStep();
    }
    function dateSummary() {return `<div class="trial-dates"><div><small>First requested class</small><strong>${safe(labelDate(request.class1))}</strong></div><div><small>Second requested class</small><strong>${safe(labelDate(request.class2))}</strong></div><p>Both classes · 5:30–6:15 PM Eastern</p></div>`;}
    function confirmation(){
      show(`${tag('Request received')}${heading('confirmation-title','Let the discovery <em>begin.</em>')}
        <p>Thank you, ${safe(request.parentName)}! Sherri will review your requested dates and contact you at <strong>${safe(request.email)}</strong> to confirm your two classes.</p>${dateSummary()}
        <div class="trial-next"><ol><li>Sherri confirms your dates and mailing address.</li><li>Your class materials are mailed to your home.</li><li>You receive instructions for joining class. After both trial classes, you’ll have the option to register.</li></ol></div>
        <p>No payment is due, and your trial does not start a paid subscription.</p>
        <button class="btn btn-primary" data-action="close" type="button">Back to TCA</button>`, 'confirmation-title');
      dialog.querySelector('[data-action=close]').onclick=()=>dialog.close();
      dialog.querySelector('h2').focus();
    }
  }
})();
