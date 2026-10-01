'use client';
import Link from 'next/link';import {useEffect,useMemo,useState} from 'react';import {supabase} from '../../lib/supabase';

export default function Credits(){
 const [qty,setQty]=useState(100),[amount,setAmount]=useState<number|null>(null),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false),[plan,setPlan]=useState('free');
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){location.href='/login';return}const {data:p}=await supabase.from('profiles').select('plan,subscription_status').eq('id',user.id).maybeSingle();setPlan(p?.plan||'free')})()},[]);
 const display=useMemo(()=>amount===null?'—':amount.toLocaleString('fr-FR',{style:'currency',currency:'EUR'}),[amount]);
 async function calc(v:number){const safe=Math.max(100,Math.floor(v/100)*100);setQty(safe);const {data,error}=await supabase.rpc('custom_credit_price',{p_credits:safe});if(!error)setAmount(Number(data))}
 async function createOrder(){setLoading(true);setMsg('');const {data:{user}}=await supabase.auth.getUser();if(!user){location.href='/login';return}
 if(plan==='free'){setMsg('Un abonnement actif est requis avant d’acheter des crédits supplémentaires.');setLoading(false);return}
 const {data,error}=await supabase.rpc('create_credit_order',{p_credits:qty});setLoading(false);if(error)return setMsg(error.message);const row=Array.isArray(data)?data[0]:data;setAmount(Number(row?.amount_eur||0));setMsg('Commande préparée. Paiement PayPal sécurisé à connecter à cette commande.')}
 useEffect(()=>{calc(100)},[]);
 return <main className="page-shell"><Link href="/dashboard">← Retour au dashboard</Link><div className="eyebrow" style={{marginTop:24}}>RECHARGE PERSONNALISÉE</div><h1 style={{fontSize:48}}>Acheter des crédits supplémentaires</h1><p style={{color:'#9299ad',maxWidth:680}}>Après votre abonnement, choisissez librement la quantité de crédits à ajouter à votre compte, par tranches de 100 crédits.</p><div className="pricing-grid" style={{gridTemplateColumns:'1.1fr .9fr'}}>
 <article className="price-card featured"><span className="plan-badge">PERSONNALISÉ</span><h2>Quantité de crédits</h2><div className="price">{qty} crédits</div><input type="range" min="100" max="10000" step="100" value={qty} onChange={e=>calc(Number(e.target.value))}/><input style={{marginTop:14}} type="number" min="100" step="100" value={qty} onChange={e=>calc(Number(e.target.value)||100)}/><p>Minimum 100 crédits. Vous pouvez choisir 200, 300, 500, 1000, 2500, etc.</p></article>
 <article className="price-card"><h2>Résumé</h2><div className="price">{display}</div><p>{qty} crédits seront ajoutés à votre solde après confirmation du paiement.</p><button className="primary" style={{width:'100%',justifyContent:'center'}} onClick={createOrder} disabled={loading}>{loading?'Préparation…':'Continuer vers PayPal'}</button>{msg&&<div className="auth-msg">{msg}</div>}<p style={{fontSize:12}}>Cette recharge est réservée aux comptes abonnés.</p></article>
 </div></main>
}