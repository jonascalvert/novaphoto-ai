import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://gcbqmdfjbsymlnesroxe.supabase.co';
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'sb_publishable_5AWge0dzpaF_fVNNpkfugg_BQaAAmD5';

export async function GET(req:NextRequest){
 try{
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return NextResponse.json({error:'Connexion requise'},{status:401});
  const token=auth.slice(7);
  const sb=createClient(url,anon,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false}});
  const {data:{user},error:userError}=await sb.auth.getUser(token);
  if(userError||!user)return NextResponse.json({error:'Session invalide'},{status:401});
  const id=req.nextUrl.searchParams.get('id');
  if(!id)return NextResponse.json({error:'Photo manquante'},{status:400});
  const [{data:profile},{data:photo,error:photoError}]=await Promise.all([
   sb.from('profiles').select('credits,subscription_status').eq('id',user.id).maybeSingle(),
   sb.from('photo_assets').select('id,original_name,storage_path,expires_at').eq('id',id).eq('user_id',user.id).maybeSingle()
  ]);
  if(photoError||!photo)return NextResponse.json({error:'Photo introuvable'},{status:404});
  if(new Date(photo.expires_at).getTime()<=Date.now())return NextResponse.json({error:'Photo expirée'},{status:410});
  const allowed=profile?.subscription_status==='active'||Number(profile?.credits||0)>0;
  if(!allowed)return NextResponse.json({error:'Abonnement ou crédits requis',code:'DOWNLOAD_LOCKED'},{status:402});
  const {data:signed,error:signedError}=await sb.storage.from('private-photos').createSignedUrl(photo.storage_path,45);
  if(signedError||!signed?.signedUrl)return NextResponse.json({error:'Téléchargement indisponible'},{status:500});
  const file=await fetch(signed.signedUrl,{cache:'no-store'});
  if(!file.ok)return NextResponse.json({error:'Fichier indisponible'},{status:502});
  const headers=new Headers();
  headers.set('Content-Type',file.headers.get('content-type')||'application/octet-stream');
  headers.set('Content-Disposition',`attachment; filename="${encodeURIComponent(photo.original_name||'novaphoto.jpg')}"`);
  headers.set('Cache-Control','private, no-store, max-age=0');
  return new NextResponse(file.body,{status:200,headers});
 }catch{return NextResponse.json({error:'Erreur de téléchargement'},{status:500})}
}