'use client';
import Link from 'next/link';import {useEffect,useMemo,useState} from 'react';import {supabase} from '../../lib/supabase';

const packs=[
 {credits:100,price:4.99,label:'Recharge rapide'},
 {credits:500,price:14.99,label:'Pack populaire'},
 {credits:1500,price:34.99,label:'Pack avantage'}
];

export default function Credits(){
 const [qty,setQty]=useState(100),[user,setUser]=useState<any>(null),[msg,setMsg]=useState('');
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user){location.href='/login';return}setUser(data.user)})},[]);
 const customPrice=useMemo(()=>Math.max(100,Math.floor(qty/100)*100)/100*4.99,[qty]);
 async function prepareCustom(){
  const credits=Math.max(100,Math.floor(qty/100)*100);setQty(credits);setMsg('Préparation du paiement…');
  const {data,error}=await supabase.rpc('create_credit_order',{p_credits:credits});
  if(error){setMsg(error.message);return}
  const row=Array.isArray(data)?data[0]:data;
  setMsg(`Commande préparée : ${credits} crédits · ${Number(row?.amount_eur||customPrice).toFixed(2)} €. Paiement PayPal sécurisé à connecter pour crédit automatique.`);
 }
 return <main className="page-shell">
  <div className="page-head"><div><Link href="/dashboard">← Dashboard</Link><div className="eyebrow" style={{marginTop:18}}>CRÉDITS SUPPLÉMENTAIRES</div><h1>Acheter des crédits</h1><p style={{color:'#9299ad'}}>Après vos crédits inclus dans l’abonnement, rechargez votre compte quand vous voulez.</p></div></div>
  <div className="pricing-grid">
   {packs.map(p=><article className={'price-card '+(p.credits===500?'featured':'')} key={p.credits}>{p.credits===500&&<span className="plan-badge">POPULAIRE</span>}<h2>{p.credits} crédits</h2><div className="price">{p.price.toFixed(2).replace('.',',')} €</div><p>{p.label}</p><button className="primary" onClick={()=>{setQty(p.credits);prepareCustom()}}>Choisir ce pack</button></article>)}
  </div>
  <article className="price-card" style={{marginTop:28,maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
   <div className="eyebrow">QUANTITÉ PERSONNALISÉE</div><h2>Choisissez votre quantité</h2><p>Minimum 100 crédits, par tranches de 100. Vous pouvez saisir autant de crédits que vous souhaitez.</p>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'end'}}>
    <label style={{textAlign:'left'}}><small style={{display:'block',marginBottom:7,color:'#9299ad'}}>Nombre de crédits</small><input type="number" min="100" step="100" value={qty} onChange={e=>setQty(Math.max(100,Number(e.target.value)||100))}/></label>
    <div style={{minWidth:150,textAlign:'right'}}><small style={{color:'#9299ad'}}>Total estimé</small><div style={{fontSize:28,fontWeight:800}}>{customPrice.toFixed(2).replace('.',',')} €</div></div>
   </div>
   <button className="primary" style={{marginTop:18,width:'100%',justifyContent:'center'}} onClick={prepareCustom}>Continuer avec cette quantité</button>
   {msg&&<div className="auth-msg">{msg}</div>}
  </article>
  <p style={{color:'#9299ad',marginTop:24,textAlign:'center'}}>Tarif personnalisé actuel : 4,99 € par tranche de 100 crédits. Les crédits n’expirent pas avec l’abonnement en cours.</p>
 </main>
}