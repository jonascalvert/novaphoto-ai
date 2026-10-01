import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
const instructions:Record<string,string>={
'Amélioration Pro':'Edit this exact photo professionally: natural exposure, white balance, contrast, color, clarity and sharpness. Preserve composition and every person identity, facial geometry, skin tone, age and expression. Do not add or remove people or objects.',
'Préserver le visage':'Edit this exact photo conservatively. Preserve every face and identity, facial geometry, skin tone, age, expression, hair and distinguishing features. Only improve lighting, color, noise and clarity. Do not beautify or redesign faces.',
'Upscale 4K':'Edit this exact image for high resolution with natural detail and clean edges. Preserve composition, text, people and facial identity. Do not invent details that change identity.',
'Arrière-plan':'Edit this exact image by isolating the main subject from the background. Preserve face, identity, hair and clothing.',
'T-shirt Ready':'Edit this exact image for professional T-shirt printing. Improve edge clarity and contrast while preserving the original design, text, people and identity.'
};
const json=(d:any,s=200)=>NextResponse.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function POST(req:NextRequest){try{
 const auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return json({error:'Connexion requise.',code:'AUTH_REQUIRED'},401);
 const sb='https://gcbqmdfjbsymlnesroxe.supabase.co';
 const apikey='sb_publishable_5AWge0dzpaF_fVNNpkfugg_BQaAAmD5';
 const userRes=await fetch(sb+'/auth/v1/user',{headers:{Authorization:auth,apikey},cache:'no-store'});
 if(!userRes.ok)return json({error:'Session invalide. Reconnectez-vous.',code:'AUTH_REQUIRED'},401);
 const form=await req.formData(),file=form.get('image'),tool=String(form.get('tool')||'Amélioration Pro');
 if(!(file instanceof File))return json({error:'Image requise.'},400);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Format non supporté.'},400);
 if(file.size>5*1024*1024)return json({error:'Photo trop volumineuse après compression.'},413);
 const reserve=await fetch(sb+'/rest/v1/rpc/reserve_credit',{method:'POST',headers:{Authorization:auth,apikey,'Content-Type':'application/json'},body:JSON.stringify({p_tool:tool}),cache:'no-store'});
 const reserveText=await reserve.text();let reserveData:any;try{reserveData=reserveText?JSON.parse(reserveText):null}catch{}
 if(!reserve.ok){
   const msg=reserveData?.message||reserveData?.error||'';
   if(String(msg).includes('NO_CREDITS'))return json({error:'Vos 20 crédits gratuits sont épuisés. Un abonnement est requis pour continuer.',code:'SUBSCRIPTION_REQUIRED'},402);
   return json({error:'Impossible de vérifier vos crédits.'},500);
 }
 const row=Array.isArray(reserveData)?reserveData[0]:reserveData;
 const localJobId=row?.job_id;const remaining=row?.remaining;
 const refund=async()=>{if(!localJobId)return;await fetch(sb+'/rest/v1/rpc/refund_reserved_credit',{method:'POST',headers:{Authorization:auth,apikey,'Content-Type':'application/json'},body:JSON.stringify({p_job_id:localJobId}),cache:'no-store'}).catch(()=>{})};
 const key=process.env.OPENAI_API_KEY?.trim();if(!key){await refund();return json({error:'OpenAI non configuré.'},503);}
 const b64=Buffer.from(await file.arrayBuffer()).toString('base64');
 const payload={model:'gpt-5.5',background:true,input:[{role:'user',content:[{type:'input_text',text:instructions[tool]||instructions['Amélioration Pro']},{type:'input_image',image_url:`data:${file.type};base64,${b64}`,detail:'high'}]}],tools:[{type:'image_generation',model:'gpt-image-2.5-flare',action:'edit',size:'1024x1024',quality:'medium'}],tool_choice:{type:'image_generation'}};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
 const raw=await r.text();let d:any={};try{d=raw?JSON.parse(raw):{}}catch{}
 if(!r.ok){await refund();return json({error:d?.error?.message||`OpenAI HTTP ${r.status}`},r.status);}
 if(localJobId)await fetch(sb+'/rest/v1/rpc/mark_job_processing',{method:'POST',headers:{Authorization:auth,apikey,'Content-Type':'application/json'},body:JSON.stringify({p_job_id:localJobId,p_external_job_id:d.id}),cache:'no-store'}).catch(()=>{});
 return json({jobId:d.id,status:d.status||'queued',credits:remaining});
}catch(e:any){return json({error:'Impossible de démarrer le traitement: '+(e?.message||'erreur inconnue')},500)}}