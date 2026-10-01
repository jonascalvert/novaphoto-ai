import { createClient } from '@supabase/supabase-js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcbqmdfjbsymlnesroxe.supabase.co';
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5AWge0dzpaF_fVNNpkfugg_BQaAAmD5';

export const supabase=createClient(url,key,{
  auth:{
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true
  }
});