import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
const instructions:Record<string,string>={
'Amélioration Pro':'Enhance this exact photo professionally: natural exposure, white balance, contrast, color, clarity and sharpness. Preserve composition and every person identity, facial geometry, skin tone, age and expression. Do not add or remove people or objects.',
'Préserver le visage':'Conservatively enhance this exact photo. Preserve every face and identity, facial geometry, skin tone, age, expression, hair and distinguishing features. Only improve lighting, color, noise and clarity. Do not beautify or redesign faces.',
'Upscale 4K':'Enhance this exact image for high resolution with natural detail and clean edges. Preserve composition, text, people and facial identity. Do not invent details that change identity.',
'Arrière-plan':'Keep the main subject exactly as photographed and isolate it from the background with clean natural edges. Preserve face, identity, hair and clothing.',
'T-shirt Ready':'Clean and enhance this exact image for professional T-shirt printing. Improve edge clarity and contrast while preserving the original design, text, people and identity.'
};
export async function POST(req:NextRequest){
 try{
  const form=await req.formData();const file=form.get('image');const tool=String(form.get('tool')||'Amélioration Pro');
  if(!(file instanceof File))return NextResponse.json({error:'Image requise'},{status:400});
  if(file.size>20*1024*1024)return NextResponse.json({error:'Image trop volumineuse (20 Mo max)'},{status:400});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:'OPENAI_API_KEY n’est pas configurée sur le serveur.'},{status:503});
  const body=new FormData();body.append('model','gpt-image-1');body.append('image',file,file.name||'photo.png');body.append('prompt',instructions[tool]||instructions['Amélioration Pro']);body.append('size','auto');
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+key},body});
  const data:any=await response.json();
  if(!response.ok)return NextResponse.json({error:data?.error?.message||'Le traitement OpenAI a échoué.'},{status:response.status});
  const item=data?.data?.[0];if(!item)return NextResponse.json({error:'Aucune image retournée par OpenAI.'},{status:502});
  return NextResponse.json({image:item.b64_json?'data:image/png;base64,'+item.b64_json:item.url,tool});
 }catch(e:any){return NextResponse.json({error:e?.message||'Erreur serveur'},{status:500})}
}