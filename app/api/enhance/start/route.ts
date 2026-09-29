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
 const form=await req.formData(),file=form.get('image'),tool=String(form.get('tool')||'Amélioration Pro');
 if(!(file instanceof File))return json({error:'Image requise.'},400);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Format non supporté.'},400);
 if(file.size>5*1024*1024)return json({error:'Photo trop volumineuse après compression.'},413);
 const key=process.env.OPENAI_API_KEY?.trim();if(!key)return json({error:'OpenAI non configuré.'},503);
 const b64=Buffer.from(await file.arrayBuffer()).toString('base64');
 const payload={model:'gpt-5.5',background:true,input:[{role:'user',content:[{type:'input_text',text:instructions[tool]||instructions['Amélioration Pro']},{type:'input_image',image_url:`data:${file.type};base64,${b64}`,detail:'high'}]}],tools:[{type:'image_generation',model:'gpt-image-2.5-flare',action:'edit',size:'1024x1024',quality:'medium'}],tool_choice:{type:'image_generation'}};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
 const raw=await r.text();let d:any={};try{d=raw?JSON.parse(raw):{}}catch{}
 if(!r.ok)return json({error:d?.error?.message||`OpenAI HTTP ${r.status}`},r.status);
 return json({jobId:d.id,status:d.status||'queued'});
}catch(e:any){return json({error:'Impossible de démarrer le traitement: '+(e?.message||'erreur inconnue')},500)}}