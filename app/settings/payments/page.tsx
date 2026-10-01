'use client';
import Link from 'next/link';import {FormEvent,useEffect,useState} from 'react';import {supabase} from '../../../lib/supabase';

export default function PaymentSettings(){
 const [accountId,setAccountId]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){location.href='/login';return}
 const {data}=await supabase.from('payment_settings').select('stripe_account_id').eq('user_id',user.id).maybeSingle();
 if(data?.stripe_account_id)setAccountId(data.stripe_account_id);setLoading(false)})()},[]);
 async function save(e:FormEvent){e.preventDefault();setMsg('');if(!/^acct_[A-Za-z0-9]+$/.test(accountId.trim())){setMsg('Identifiant Stripe invalide. Il doit commencer par acct_.');return}
 setSaving(true);const {data:{user}}=await supabase.auth.getUser();if(!user){location.href='/login';return}
 const {error}=await supabase.from('payment_settings').upsert({user_id:user.id,stripe_account_id:accountId.trim(),updated_at:new Date().toISOString()});
 setSaving(false);setMsg(error?'Impossible d’enregistrer cet identifiant.':'Identifiant Stripe enregistré avec succès.');}
 return <main className="page-shell"><div className="page-head"><div><Link href="/dashboard">← Dashboard</Link><div className="eyebrow" style={{marginTop:18}}>PAIEMENTS</div><h1>Configuration Stripe</h1><p style={{color:'#9299ad'}}>Ajoutez ici l’identifiant de votre compte Stripe.</p></div></div>
 <article className="auth-card" style={{margin:'0 auto',maxWidth:620}}>
  {loading?<p>Chargement…</p>:<form onSubmit={save}>
   <label><small style={{display:'block',marginBottom:8,color:'#9299ad'}}>Stripe Account ID</small>
   <input value={accountId} onChange={e=>setAccountId(e.target.value)} placeholder="acct_..." autoComplete="off"/></label>
   <p style={{color:'#9299ad',fontSize:13,lineHeight:1.5}}>Vous pouvez coller ici un identifiant comme <b>acct_…</b>. Ne mettez jamais votre clé secrète Stripe <b>sk_…</b> dans ce champ.</p>
   <button className="primary" style={{width:'100%',justifyContent:'center'}} disabled={saving}>{saving?'Enregistrement…':'Enregistrer'}</button>
   {msg&&<div className="auth-msg">{msg}</div>}
  </form>}
 </article></main>
}