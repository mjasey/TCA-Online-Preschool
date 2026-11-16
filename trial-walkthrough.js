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
  window.TCATrialWalkthrough = {eligibleDates,ageFromDOB,mount};
  function mount() {
    const dialog=document.createElement('dialog');dialog.className='trial-dialog walkthrough-dialog';
    document.body.append(dialog);
    let request=null,confirmed=false,mailed=false,attended=0,step=0,pendingTestId=null,savedRow=null;
    function show(html,title) {
      dialog.innerHTML=`<div class="trial-dialog-inner"><button class="trial-dialog-close" aria-label="Close trial walkthrough" type="button">×</button>${html}</div>`;
      dialog.setAttribute('aria-labelledby',title);
      dialog.querySelector('.trial-dialog-close').onclick=()=>dialog.close();
      dialog.scrollTop=0;
      if(dialog.open)dialog.querySelector('h2')?.focus();
    }
    const tag = label => `<span class="eyebrow">${label}</span>`;
    const demo = text => `<p class="trial-demo-note">Preview only · ${text}</p>`;
    const heading = (id,text) => `<h2 id="${id}" tabindex="-1">${text}</h2>`;
    function open() { request=null;confirmed=false;mailed=false;attended=0;step=0;pendingTestId=null;savedRow=null;signup();dialog.showModal(); }
    document.querySelectorAll('[data-open-trial]').forEach(button=>button.addEventListener('click',open));
    dialog.addEventListener('click',event=>{
      if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
    });
    function signup() {
      const dates=eligibleDates();
      const options=dates.slice(0,-1).map(date=>`<option value="${date}">${labelDate(date)}</option>`).join('');
      show(`${tag('Two Thursday classes · 5:30–6:15 PM Eastern')}${heading('signup-title','A little about your <em>little learner.</em>')}
        ${demo('Use fictional details only. Submitting saves a real test row in the Free Trial Test spreadsheet tab. No email, booking, or shipment is created.')}
        <button class="demo-fill" type="button" data-action="sample">Fill with sample details</button>
        <ol class="form-progress" aria-label="Signup progress"><li data-progress="0">1. Your family</li><li data-progress="1">2. Materials</li><li data-progress="2">3. Class dates</li></ol>
        <form class="trial-form" id="trial-signup" novalidate>
          <fieldset data-step="0"><legend>Your family</legend>
            <label>Parent or guardian’s full name<input name="parentName" required maxlength="100" autocomplete="off"></label>
            <div class="trial-field-pair"><label>Email address<input name="email" type="email" required maxlength="254" autocomplete="off"></label><label>Phone number (optional)<input name="phone" type="tel" maxlength="40" autocomplete="off"></label></div>
            <label>Child’s full name<input name="childName" required maxlength="100" autocomplete="off"></label>
            <div class="trial-field-pair"><label>Child’s date of birth<input name="dob" type="date" required max="${easternToday()}"></label><label>Child’s age<input name="childAge" readonly aria-describedby="age-note" placeholder="Calculated from date of birth"></label></div>
            <p id="age-note" class="field-note">Age is calculated automatically. Our preschool program is for ages 3–5.</p>
            <label>Child’s likes and interests<textarea name="interests" required maxlength="1000" rows="3" placeholder="Favorite animals, stories, songs, activities…"></textarea></label>
            <label class="test-consent"><input type="checkbox" name="testConsent" required> I’m using fictional sample details and understand this test will be saved to Google Sheets.</label>
          </fieldset>
          <fieldset data-step="1" hidden><legend>Where should we send class materials?</legend>
            <p>We’ll mail the hands-on supplies your child needs for the two trial classes.</p>
            <label>Street address<input name="street" required maxlength="160" autocomplete="off"></label>
            <label>Apartment, suite, or unit (optional)<input name="unit" maxlength="60" autocomplete="off"></label>
            <div class="trial-field-pair"><label>City<input name="city" required maxlength="80" autocomplete="off"></label><label>State / region<input name="region" required maxlength="80" autocomplete="off"></label></div>
            <div class="trial-field-pair"><label>ZIP / postal code<input name="postal" required maxlength="20" autocomplete="off"></label><label>Country<input name="country" required maxlength="80" value="United States" autocomplete="off"></label></div>
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
      f('dob').onchange=()=>{const age=ageFromDOB(f('dob').value);f('childAge').value=age===''?'':`${age} years old`;};
      f('class1').onchange=updateSecond;
      function validStep(){for(const el of form.querySelectorAll(`[data-step="${step}"] input,[data-step="${step}"] select,[data-step="${step}"] textarea`)){if(!el.checkValidity()){el.reportValidity();return false;}}return true;}
      dialog.querySelector('[data-action=next]').onclick=()=>{if(validStep()){step++;showStep();dialog.querySelector(`[data-step="${step}"] input,[data-step="${step}"] select`)?.focus();}};
      dialog.querySelector('[data-action=back]').onclick=()=>{step--;showStep();};
      form.onkeydown=event=>{if(event.key==='Enter'&&event.target.tagName!=='TEXTAREA'&&step<2){event.preventDefault();dialog.querySelector('[data-action=next]').click();}};
      dialog.querySelector('[data-action=sample]').onclick=()=>{
        const sample={parentName:'Demo Parent',email:'demo@example.com',phone:'',childName:'Demo Learner',dob:'2022-06-15',interests:'Dinosaurs, building blocks, singing, and Bible stories.',street:'100 Example Lane',unit:'',city:'Sampletown',region:'NJ',postal:'08855',country:'United States'};
        Object.entries(sample).forEach(([key,value])=>f(key).value=value);f('testConsent').checked=true;f('dob').onchange();f('class1').value=dates[0];updateSecond();f('class2').value=dates[1];
      };
      form.onsubmit=async event=>{
        event.preventDefault();if(!validStep())return;
        const eligible=eligibleDates();
        if(!eligible.includes(f('class1').value)||!eligible.includes(f('class2').value)||f('class2').value<=f('class1').value){dialog.querySelector('#trial-error').textContent='Please choose two available Thursdays, with your second class after the first.';return;}
        const previousStep=step;
        for(step=0;step<3;step++){showStep();if(!validStep())return;}
        step=previousStep;showStep();
        const button=form.querySelector('[type=submit]');
        const errorBox=dialog.querySelector('#trial-error');
        errorBox.textContent='';button.disabled=true;button.textContent='Saving test to spreadsheet…';
        pendingTestId ||= crypto.randomUUID();
        const submission={...Object.fromEntries(new FormData(form)),testId:pendingTestId,testOnly:true};
        try {
          const response=await fetch('/api/trial-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(submission)});
          const result=await response.json();
          if(!response.ok||!result.ok)throw new Error(result.error||'The test could not be saved. Please retry.');
          request=submission;savedRow=result.row;confirmation();
        } catch(error){errorBox.textContent=error.message||'The test could not be saved. Please retry.';}
        finally{button.disabled=false;button.textContent='Request My Free Classes';}
      };
      showStep();
    }
    function dateSummary() {return `<div class="trial-dates"><div><small>First trial class</small><strong>${safe(labelDate(request.class1))}</strong></div><div><small>Second trial class</small><strong>${safe(labelDate(request.class2))}</strong></div><p>Both classes · 5:30–6:15 PM Eastern</p></div>`;}
    function confirmation(){
      show(`${tag('Parent view · Request received')}${heading('confirmation-title','Let the discovery <em>begin.</em>')}
        <p>Thank you, ${safe(request.parentName)}! Sherri will review your requested dates and contact you at <strong>${safe(request.email)}</strong> to confirm your two classes.</p>${dateSummary()}
        <div class="trial-next"><ol><li>Sherri confirms your dates and mailing address.</li><li>Your class materials are mailed to your home.</li><li>You receive instructions for joining class. After both trial classes, you’ll have the option to register.</li></ol></div>
        <div class="trial-test-saved" role="status"><strong>✓ Test saved to Google Sheets · Row ${safe(savedRow)}</strong><a href="https://docs.google.com/spreadsheets/d/1q0nGGA6CpFyhQYY0hvNnNjHo_hoP86zSzUBDuE5aF3o/edit#gid=9182026" target="_blank" rel="noopener">Open the Free Trial Test tab ↗</a></div>
        ${demo('The sample details were saved in the test tab. No email, shipment, or booking has been created. Next, try Sherri’s side of the process below.')}
        <button class="btn btn-primary" data-action="owner" type="button">Preview Sherri’s next steps →</button>`, 'confirmation-title');
      dialog.querySelector('[data-action=owner]').onclick=owner;
    }
    function owner(){
      const address=[request.street,request.unit,request.city,request.region,request.postal,request.country].filter(Boolean).join(', ');
      show(`${tag('Owner walkthrough · Example Free Trials record')}${heading('owner-title','One family. <em>Two first steps.</em>')}
        ${demo('These controls simulate how Sherri would manage a request. They do not change the owner portal, send messages, or save attendance.')}
        <dl class="trial-record"><div><dt>Parent</dt><dd>${safe(request.parentName)} · ${safe(request.email)}</dd></div><div><dt>Child</dt><dd>${safe(request.childName)} · DOB ${safe(request.dob)} · ${safe(request.childAge)}</dd></div><div><dt>Likes / interests</dt><dd>${safe(request.interests)}</dd></div><div><dt>Mail materials to</dt><dd>${safe(address)}</dd></div>${request.phone?`<div><dt>Phone</dt><dd>${safe(request.phone)}</dd></div>`:''}${request.notes?`<div><dt>Notes</dt><dd>${safe(request.notes)}</dd></div>`:''}</dl>
        ${dateSummary()}
        <div class="owner-checklist"><div><strong>${confirmed?'✓ Dates confirmed':'1. Review the request'}</strong><p>Check availability, holidays, and delivery time. Requested dates can be arranged with the parent before confirmation.</p><button class="btn btn-outline" type="button" data-action="confirm" ${confirmed?'disabled':''}>${confirmed?'Confirmed in this demo':'Simulate confirming dates'}</button></div>
        <div><strong>${mailed?'✓ Materials mailed':'2. Prepare and mail materials'}</strong><p>Pack activities based on the child’s age and interests, then send the class joining instructions.</p><button class="btn btn-outline" type="button" data-action="mail" ${!confirmed||mailed?'disabled':''}>${mailed?'Marked mailed in this demo':'Simulate materials mailed'}</button></div>
        <div><strong>3. Record actual attendance · ${attended}/2 classes</strong><p>The invitation becomes available after both classes have been attended, rather than just because their dates have passed.</p><button class="btn btn-outline" type="button" data-action="attendance" ${!confirmed||attended===2?'disabled':''}>${attended===2?'Both classes attended':`Simulate class ${attended+1} attended`}</button></div></div>
        ${attended===2?'<button class="btn btn-primary" type="button" data-action="invitation">Preview the parent’s registration invitation →</button>':'<p class="field-note">Complete the attendance steps above to unlock the parent’s registration invitation.</p>'}`, 'owner-title');
      dialog.querySelector('[data-action=confirm]').onclick=()=>{confirmed=true;owner();};
      dialog.querySelector('[data-action=mail]').onclick=()=>{mailed=true;owner();};
      dialog.querySelector('[data-action=attendance]').onclick=()=>{if(confirmed&&attended<2){attended++;owner();}};
      const invitationButton=dialog.querySelector('[data-action=invitation]');if(invitationButton)invitationButton.onclick=invitation;
    }
    function invitation(){
      if(attended!==2)return;
      show(`${tag('Parent view · After two attended classes')}${heading('invitation-title','Keep the curiosity <em>growing.</em>')}
        <p>We loved learning with ${safe(request.childName)}! Your two free classes are complete. We’d love to welcome your family to TCA.</p>
        <div class="trial-next"><h3>Ready for your next chapter?</h3><p>Register when you’re ready to continue. You’ll choose an enrollment plan, complete payment, and finish the existing registration form.</p><p><strong>No automatic charge.</strong> Your trial ends without starting a paid subscription.</p></div>
        <button class="btn btn-primary" type="button" data-action="register">Register for TCA →</button>
        ${demo('This represents the invitation parents receive after Sherri records both classes as attended. No email has been sent.')}
        <button class="demo-fill" type="button" data-action="restart">Start the walkthrough again</button>`, 'invitation-title');
      dialog.querySelector('[data-action=register]').onclick=registration;
      dialog.querySelector('[data-action=restart]').onclick=()=>{request=null;confirmed=false;mailed=false;attended=0;step=0;signup();};
    }
    function registration(){
      show(`${tag('Enrollment preview · Your next steps')}${heading('registration-title','Make TCA part of <em>your week.</em>')}
        <p>Here’s how you can continue after your trial:</p><div class="trial-next"><ol><li><strong>Choose your plan.</strong> One session a week, two sessions a week, or eight sessions a month.</li><li><strong>Complete payment through Stripe.</strong> Your first payment includes the one-time $60 registration fee.</li><li><strong>Finish the Google registration form.</strong> It opens after successful checkout.</li></ol></div>
        <a class="btn btn-primary" href="enroll.html#plans">View enrollment plans →</a>
        ${demo('You can explore the enrollment page. Payment buttons are disabled in this preview, so you cannot be charged.')}`, 'registration-title');
    }
  }
})();
