import {supabase} from './supabase';

export type PrivatePhoto={id:string;tool:string;original_name:string;storage_path:string;created_at:string;expires_at:string;signed_url?:string};

export async function savePrivatePhoto(dataUrl:string,originalName:string,tool:string){
 if(!supabase)return null;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
 const res=await fetch(dataUrl); const blob=await res.blob();
 const ext=blob.type.includes('jpeg')?'jpg':'png'; const id=crypto.randomUUID();
 const path=`${user.id}/${id}.${ext}`;
 const up=await supabase.storage.from('private-photos').upload(path,blob,{contentType:blob.type||'image/png',upsert:false});
 if(up.error)throw up.error;
 const expires=new Date(Date.now()+24*60*60*1000).toISOString();
 const ins=await supabase.from('photo_assets').insert({id,user_id:user.id,tool,original_name:originalName,storage_path:path,expires_at:expires}).select().single();
 if(ins.error){await supabase.storage.from('private-photos').remove([path]);throw ins.error}
 return ins.data;
}

export async function cleanupMyExpiredPhotos(){
 if(!supabase)return;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
 const now=new Date().toISOString();
 const {data}=await supabase.from('photo_assets').select('id,storage_path').eq('user_id',user.id).lte('expires_at',now);
 if(!data?.length)return;
 await supabase.storage.from('private-photos').remove(data.map((x:any)=>x.storage_path));
 await supabase.from('photo_assets').delete().in('id',data.map((x:any)=>x.id));
}

export async function listMyPrivatePhotos():Promise<PrivatePhoto[]>{
 if(!supabase)return[];
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return[];
 await cleanupMyExpiredPhotos();
 const {data,error}=await supabase.from('photo_assets').select('id,tool,original_name,storage_path,created_at,expires_at').eq('user_id',user.id).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false});
 if(error)throw error;
 return await Promise.all((data||[]).map(async(p:any)=>{const {data:s}=await supabase!.storage.from('private-photos').createSignedUrl(p.storage_path,300);return {...p,signed_url:s?.signedUrl}}));
}


export async function deleteMyPrivatePhoto(photo:{id:string;storage_path:string}){
 if(!supabase)throw new Error('Supabase indisponible');
 const {data:{user}}=await supabase.auth.getUser(); if(!user)throw new Error('Connexion requise');
 if(!photo?.id||!photo?.storage_path)throw new Error('Photo invalide');
 if(!photo.storage_path.startsWith(user.id+'/'))throw new Error('Accès refusé');
 const {error:storageError}=await supabase.storage.from('private-photos').remove([photo.storage_path]);
 if(storageError)throw storageError;
 const {error:dbError}=await supabase.from('photo_assets').delete().eq('id',photo.id).eq('user_id',user.id);
 if(dbError)throw dbError;
 return true;
}
