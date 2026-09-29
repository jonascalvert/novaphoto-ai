import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
export const maxDuration=300;
const instructions:Record<string,string>={
'Amélioration Pro':'Enhance this exact photo professionally with natural exposure, white balance, contrast, color, clarity and sharpness. Preserve composition and every person identity, facial geometry, skin tone, age and expression. Do not add or remove people or objects.',
'Préserver le visage':'Conservatively enhance this exact photo. Preserve every face and identity, facial geometry, skin tone, age, expression, hair and distinguishing features. Only improve lighting, color, noise and clarity. Do not beautify or redesign faces.',
'Upscale 4K':'Enhance this exact image for high resolution with natural detail and clean edges. Preserve composition, text, people and facial identity. Do not invent details that change identity.',
'Arrière-plan':'Keep the main subject exactly as photographed and isolate it from the background. Preserve face, identity, hair and clothing.',
'T-shirt Ready':'Clean and enhance this exact image for professional T-shirt printing. Improve edge clarity and contrast while preserving the original design, text, people and identity.'
};
function json(data:any,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function POST(req:NextRequest){
 try{
  const form=await req.formData();const file=form.get('image');const tool=String(form.get('tool')||'Amélioration Pro');
  if(!(file instanceof File))return json({error:'Image requise.'},400);
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Format non supporté. Utilisez JPG, PNG ou WEBP.'},400);
  if(file.size>10*1024*1024)return json({error:'Photo trop volumineuse. Utilisez une image de moins de 10 Mo.'},413);
  const key=process.env.OPENAI_API_KEY?.trim();
  if(!key)return json({error:'La clé OpenAI n’est pas configurée sur le serveur.'},503);
  const body=new FormData();body.append('model','gpt-image-2');body.append('image',file,file.name||'photo.png');body.append('prompt',instructions[tool]||instructions['Amélioration Pro']);body.append('size','1024x1024');body.append('quality','medium');
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+key},body,cache:'no-store'});
  const raw=await response.text();let data:any={};try{data=raw?JSON.parse(raw):{}}catch{}
  if(!response.ok){
   const msg=data?.error?.message||('OpenAI a retourné une erreur HTTP '+response.status+'.');
   if(response.status===429)return json({error:msg.includes('credits')?'Votre compte OpenAI API n’a plus de crédits. Ajoutez des crédits API puis réessayez.':msg},429);
   if(response.status===401)return json({error:'La clé OpenAI est invalide ou révoquée. Remplacez OPENAI_API_KEY.'},401);
   return json({error:msg},response.status);
  }
  const item=data?.data?.[0];const image=item?.b64_json?('data:image/png;base64,'+item.b64_json):item?.url;
  if(!image)return json({error:'OpenAI n’a retourné aucune image.'},502);
  return json({image,tool});
 }catch(e:any){console.error('NovaPhoto enhance error',e);return json({error:'Erreur du serveur photo: '+(e?.message||'inconnue')},500)}
}