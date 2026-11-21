const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4184';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   const page=await browser.newPage({viewport});let calls=[];
   await page.route('**/api/free-trial',async route=>{
    calls.push(route.request().postDataJSON());
    const status=calls.length===1?502:200;
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{ok:true}:{ok:false,error:'Please retry.'})});
   });
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   await page.locator('.trial-flyer').evaluate(i=>i.decode());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert(await page.evaluate(()=>!!(document.querySelector('#foundation').compareDocumentPosition(document.querySelector('#free-trial'))&Node.DOCUMENT_POSITION_FOLLOWING)));
   assert.equal(await page.locator('.preview-ribbon').count(),0);
   await page.locator('[data-open-trial]').click();
   assert.equal(await page.locator('[data-action=sample]').count(),0);
   await page.locator('[data-action=next]').click();assert(await page.locator('[name=parentName]').isVisible());
   const data={parentName:'TCA Browser Test',email:'demo@example.com',childName:'Sample Learner',dob:'2022-06-15',interests:'Building blocks',street:'100 Example Lane',city:'Sampletown',region:'NJ',postal:'08855'};
   for(const name of ['parentName','email','childName','dob','interests'])await page.locator(`#trial-signup [name=${name}]`).fill(data[name]);
   await page.locator('[name=testConsent]').check();
   await page.locator('[data-action=next]').click();
   for(const name of ['street','city','region','postal'])await page.locator(`[name=${name}]`).fill(data[name]);
   await page.locator('[data-action=next]').click();
   const dates=await page.locator('[name=class1] option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean));
   await page.locator('[name=class1]').selectOption(dates[0]);await page.locator('[name=class2]').selectOption(dates[1]);
   await page.locator('#trial-signup [type=submit]').click();await page.locator('#trial-error').filter({hasText:'Please retry.'}).waitFor();
   assert.equal(await page.locator('[name=postal]').inputValue(),'08855');
   await page.locator('#trial-signup [type=submit]').click();await page.locator('#confirmation-title').waitFor();
   assert.equal(calls.length,2);assert.equal(calls[0].requestId,calls[1].requestId);assert.equal(calls[0].consent,true);
   assert(!(await page.locator('.trial-dialog').innerText()).includes('Google Sheets'));
   await page.locator('[data-action=close]').click();
   await page.goto(base+'/enroll.html',{waitUntil:'domcontentloaded'});
   await page.locator('.trial-flyer').evaluate(i=>i.decode());
   assert.equal(await page.locator('.schedule-card').count(),2);
   assert.equal(await page.locator('.plans-grid .plan > a[href^="https://buy.stripe.com"]').count(),3);
   console.log(`PASS: ${viewport.width}px layout, flyer, validation, retry, confirmation, and paid enrollment links.`);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
