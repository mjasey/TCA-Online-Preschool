const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const handler=require('../api/free-trial');
process.env.VERCEL_ENV='production';
process.env.GOOGLE_APPS_SCRIPT_URL='https://example.invalid/test';
process.env.GOOGLE_APPS_SCRIPT_SECRET='fixture-secret';
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const earliest=new Date(today+'T12:00Z');earliest.setUTCDate(earliest.getUTCDate()+((4-earliest.getUTCDay()+7)%7||7)+7);
const second=new Date(earliest);second.setUTCDate(second.getUTCDate()+7);
const payload={requestId:'fixture-123456789',parentName:'Test Parent',email:'test@example.com',childName:'Test Child',dob:'2022-06-15',interests:'Blocks',street:'100 Test Lane',city:'Testtown',region:'NJ',postal:'08855',country:'United States',class1:earliest.toISOString().slice(0,10),class2:second.toISOString().slice(0,10),consent:true};
async function call(body=payload,headers={host:'enroll.tcaarts.org',origin:'https://enroll.tcaarts.org'},method='POST'){
 const response={setHeader(){},status(n){this.code=n;return this},json(data){this.data=data;return this}};
 await handler({body,headers,method},response);return response;
}
(async()=>{
 let forwarded;global.fetch=async(url,args)=>{forwarded=JSON.parse(args.body);return {ok:true,json:async()=>({ok:true,row:2})}};
 assert.equal((await call()).code,200);assert.equal(forwarded.kind,'free_trial');assert.equal(forwarded.trial.postal,'08855');assert.equal(forwarded.trial.childAge,'4 years old');
 assert.equal((await call({...payload,consent:false})).code,400);
 assert.equal((await call({...payload,dob:'2022-02-30'})).code,400);
 assert.equal((await call({...payload,class2:payload.class1})).code,400);
 assert.equal((await call({...payload,class1:today})).code,400);
 assert.equal((await call({...payload,notes:'x'.repeat(1001)})).code,400);
 assert.equal((await call(payload,{host:'enroll.tcaarts.org',origin:'https://other.example'})).code,403);
 assert.equal((await call(payload,{},'GET')).code,405);
 process.env.VERCEL_ENV='preview';assert.equal((await call()).code,403);process.env.VERCEL_ENV='production';
 global.fetch=async()=>{throw new Error('outage')};assert.equal((await call()).code,502);
 // Exercise the actual receiver's retry and alert behavior with a small Sheets fixture.
 const rows=[[]],alerts=[];let failEmail=false;
 const sheet={getLastRow:()=>Math.max(rows.length,1000),getMaxRows:()=>1000,getSheetId:()=>9212026,getRange:(row,col,count)=>({
  createTextFinder:id=>({matchEntireCell(){return this},findNext:()=>{const i=rows.findIndex((r,n)=>n>0&&r[25]===id);return i<0?null:{getRow:()=>i+1}}}),
  getValues:()=>Array.from({length:count},(_,i)=>[rows[row-1+i]?.[col-1]]),setValues:values=>{rows[row-1]=values[0]},setDataValidation(){return this},setNumberFormat(){return this},
  getValue:()=>rows[row-1][col-1],setValue:v=>{rows[row-1][col-1]=v},setWrap(){return this},setVerticalAlignment(){return this}
 })};
 const context={console,Date,cleanValue:(v,max)=>String(v||'').trim().slice(0,max),jsonResponse:v=>v,LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet,getUrl:()=>'https://docs.google.com/spreadsheets/d/fixture/edit'}),flush(){}},Utilities:{formatDate:()=>today+' 12:00:00'},MailApp:{sendEmail:m=>{if(failEmail)throw new Error('mail unavailable');alerts.push(m)}}};
 context.SpreadsheetApp.newDataValidation=()=>({requireCheckbox(){return this},build(){return {}}});
 rows[0][0]='Submitted';
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../google-apps-script/FreeTrials.gs'),'utf8'),context);
 const run=trial=>context.handleFreeTrial({trial});const data={...payload,childAge:'4 years old',interests:'=bad',notes:'@bad'};
 assert(run(data).ok);assert.equal(rows.length,2);assert.equal(alerts[0].to,'sherri.taylor@hotmail.com');assert(!alerts[0].body.includes(data.street));assert.equal(rows[1][21],"'08855");assert.equal(rows[1][16],"'=bad");
 assert(run(data).ok);assert.equal(rows.length,2);assert.equal(alerts.length,1);
 assert(run({...data,requestId:'second-123456789'}).ok);assert.equal(rows.length,3);assert.equal(alerts.length,2);
 failEmail=true;const retry={...data,requestId:'retry-123456789'};assert.equal(run(retry).ok,false);assert.equal(rows.length,4);
 failEmail=false;assert(run(retry).ok);assert.equal(rows.length,4);assert.equal(alerts.length,3);
 console.log('PASS: validation, eligible dates, preview protection, repeat submissions, retries, postal zeros, formula safety, and email destination.');
})().catch(e=>{console.error(e);process.exit(1)});
