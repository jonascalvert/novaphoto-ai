import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
const json=(d:any,s=200)=>NextResponse.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function GET(req:NextRequest){try{
 const id=new URL(req.url).searchParams.get('id');if(!id)return json({error:'Job manquant.'},400);
 const key=process.env.OPENAI_API_KEY?.trim();if(!key)return json({error:'OpenAI non configuré.'},503);
 const r=await fetch('https://api.openai.com/v1/responses/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+key},cache:'no-store'});
 const raw=await r.text();let d:any={};try{d=raw?JSON.parse(raw):{}}catch{}
 if(!r.ok)return json({error:d?.error?.message||`OpenAI HTTP ${r.status}`},r.status);
 if(d.status==='failed'||d.status==='cancelled'||d.status==='incomplete')return json({status:d.status,error:d?.error?.message||d?.incomplete_details?.reason||'Le traitement a échoué.'});
 if(d.status!=='completed')return json({status:d.status||'in_progress'});
 const call=(d.output||[]).find((x:any)=>x.type==='image_generation_call');
 if(!call?.result)return json({status:'failed',error:'Aucune image générée.'},502);
 return json({status:'completed',image:'data:image/png;base64,'+call.result});
}catch(e:any){return json({error:'Erreur de suivi: '+(e?.message||'inconnue')},500)}}