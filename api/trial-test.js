const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1q0nGGA6CpFyhQYY0hvNnNjHo_hoP86zSzUBDuE5aF3o/edit#gid=9182026';
const LIMITS = {testId:80,parentName:100,email:254,phone:40,childName:100,dob:10,childAge:30,interests:1000,street:160,unit:60,city:80,region:80,postal:20,country:80,class1:10,class2:10,notes:1000};
const required = ['testId','parentName','email','childName','dob','interests','street','city','region','postal','country','class1','class2'];
function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value ? date : null;
}
module.exports = async function trialTest(request, response) {
  response.setHeader('Cache-Control','no-store');
  if (request.method !== 'POST') {response.setHeader('Allow','POST');return response.status(405).json({ok:false});}
  if (process.env.VERCEL_ENV !== 'preview') return response.status(403).json({ok:false,error:'Test endpoint is available in the preview only.'});
  const origin = request.headers.origin;
  if (origin && origin !== `https://${request.headers.host}`) return response.status(403).json({ok:false});
  let body = request.body;
  if (typeof body === 'string') {try {body=JSON.parse(body);}catch {return response.status(400).json({ok:false});}}
  if (!body || typeof body!=='object' || body.testOnly!==true) return response.status(400).json({ok:false,error:'Test submission required.'});
  const trial = Object.fromEntries(Object.entries(LIMITS).map(([key,max])=>[key,String(body[key]??'').trim().slice(0,max)]));
  if (required.some(key=>!trial[key]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trial.email) || !/^[a-zA-Z0-9-]{10,80}$/.test(trial.testId)) return response.status(400).json({ok:false,error:'Please complete the required test fields.'});
  const todayString = new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const today=calendarDate(todayString), dob=calendarDate(trial.dob), first=calendarDate(trial.class1), second=calendarDate(trial.class2);
  const earliest=new Date(today); earliest.setUTCDate(earliest.getUTCDate()+((4-earliest.getUTCDay()+7)%7||7)+7);
  if(!dob||dob>today||!first||!second||first<earliest||second<=first||first.getUTCDay()!==4||second.getUTCDay()!==4)return response.status(400).json({ok:false,error:'Please check the birth date and choose eligible Thursday dates.'});
  const age=today.getUTCFullYear()-dob.getUTCFullYear()-(todayString.slice(5)<trial.dob.slice(5)?1:0);
  trial.childAge=`${age} years old`;
  const url=process.env.GOOGLE_APPS_SCRIPT_URL, secret=process.env.GOOGLE_APPS_SCRIPT_SECRET;
  if(!url||!secret)return response.status(503).json({ok:false,error:'The test spreadsheet connection is not configured.'});
  try {
    const result=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({secret,kind:'trial_preview',preview:'free-trial-review',trial}),signal:AbortSignal.timeout(20000)});
    const data=await result.json();
    if(!result.ok||!data.ok)throw new Error('Sheet write failed');
    return response.status(200).json({ok:true,row:data.row,testId:trial.testId,sheetUrl:SHEET_URL});
  } catch { return response.status(502).json({ok:false,error:'We could not save the test. Please retry; your details are still here.'}); }
};
