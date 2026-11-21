const LIMITS={requestId:80,parentName:100,email:254,phone:40,childName:100,dob:10,interests:1000,street:160,unit:60,city:80,region:80,postal:20,country:80,class1:10,class2:10,notes:1000};
const REQUIRED=['requestId','parentName','email','childName','dob','interests','street','city','region','postal','country','class1','class2'];
function calendarDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const d=new Date(`${value}T12:00:00Z`);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?d:null;
}
module.exports=async function freeTrial(request,response){
  response.setHeader('Cache-Control','no-store');
  if(request.method!=='POST'){response.setHeader('Allow','POST');return response.status(405).json({ok:false});}
  if(process.env.VERCEL_ENV==='preview')return response.status(403).json({ok:false,error:'Please submit your request on enroll.tcaarts.org.'});
  const origin=request.headers.origin;
  if(origin&&origin!==`https://${request.headers.host}`&&!(process.env.NODE_ENV==='test'&&origin===`http://${request.headers.host}`))return response.status(403).json({ok:false});
  let body=request.body;
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return response.status(400).json({ok:false});}}
  if(!body||typeof body!=='object'||Array.isArray(body)||body.consent!==true)return response.status(400).json({ok:false,error:'Please confirm that you are the child’s parent or guardian.'});
  const trial={};
  for(const [key,max]of Object.entries(LIMITS)){
    if((body[key]!=null&&typeof body[key]!=='string')||String(body[key]??'').length>max)return response.status(400).json({ok:false,error:'Please check the length of your details.'});
    trial[key]=String(body[key]??'').trim();
  }
  if(REQUIRED.some(k=>!trial[k])||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trial.email)||!/^[a-zA-Z0-9-]{10,80}$/.test(trial.requestId))return response.status(400).json({ok:false,error:'Please complete the required fields.'});
  const todayString=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const today=calendarDate(todayString),dob=calendarDate(trial.dob),first=calendarDate(trial.class1),second=calendarDate(trial.class2);
  const earliest=new Date(today);earliest.setUTCDate(earliest.getUTCDate()+((4-earliest.getUTCDay()+7)%7||7)+7);
  const latest=new Date(earliest);latest.setUTCDate(latest.getUTCDate()+11*7);
  if(!dob||dob>today||today.getUTCFullYear()-dob.getUTCFullYear()>18||!first||!second||first<earliest||second<=first||second>latest||first.getUTCDay()!==4||second.getUTCDay()!==4)return response.status(400).json({ok:false,error:'Please check the birth date and choose available Thursday dates.'});
  trial.childAge=`${today.getUTCFullYear()-dob.getUTCFullYear()-(todayString.slice(5)<trial.dob.slice(5)?1:0)} years old`;
  const url=process.env.GOOGLE_APPS_SCRIPT_URL,secret=process.env.GOOGLE_APPS_SCRIPT_SECRET;
  if(!url||!secret)return response.status(503).json({ok:false,error:'Please try again shortly or contact TCA at 908-738-1343.'});
  try{
    const result=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({secret,kind:'free_trial',trial}),signal:AbortSignal.timeout(25000)});
    const data=await result.json();if(!result.ok||!data.ok)throw new Error('Save failed');
    return response.status(200).json({ok:true,requestId:trial.requestId});
  }catch{return response.status(502).json({ok:false,error:'We could not send your request. Your details are still here. Please try again.'});}
};
