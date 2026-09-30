import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async()=>{
 const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const supabase=createClient(url,key,{auth:{persistSession:false}});
 const now=new Date().toISOString();
 const {data:rows,error}=await supabase.from('photo_assets').select('id,storage_path').lte('expires_at',now).limit(500);
 if(error)return new Response(JSON.stringify({error:error.message}),{status:500,headers:{'content-type':'application/json'}});
 if(!rows?.length)return new Response(JSON.stringify({deleted:0}),{headers:{'content-type':'application/json'}});
 const paths=rows.map((r:any)=>r.storage_path);
 const rm=await supabase.storage.from('private-photos').remove(paths);
 if(rm.error)return new Response(JSON.stringify({error:rm.error.message}),{status:500,headers:{'content-type':'application/json'}});
 const del=await supabase.from('photo_assets').delete().in('id',rows.map((r:any)=>r.id));
 if(del.error)return new Response(JSON.stringify({error:del.error.message}),{status:500,headers:{'content-type':'application/json'}});
 return new Response(JSON.stringify({deleted:rows.length}),{headers:{'content-type':'application/json'}});
});