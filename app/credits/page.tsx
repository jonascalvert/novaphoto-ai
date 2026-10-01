'use client';
import Link from 'next/link';import {useEffect,useMemo,useState} from 'react';import {supabase} from '../../lib/supabase';

const packs=[
 {credits:100,price:4.99,label:'Recharge rapide',url:'https://buy.stripe.com/00w5kCaCTgdc6339ATawo03'},
 {credits:500,price:24.95,label:'Pack 500 crédits',url:'https://buy.stripe.com/6oUcN412jd10777fZhawo04'},
 {credits:1500,price:74.85,label:'Pack 1500 crédits',url:'https://buy.stripe.com/00w7sK26nbWW4YZcN5awo05'}
];
const CUSTOM='https://buy.stripe.com/6oU14maCT3qqezz28rawo02';

export default function Credits(){
 const [qty,setQty]=useState(100),[user,setUser]=useState<any>(null),[msg,setMsg]=useState('');
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user){location.href='/login?next=/credits';return}setUser(data.user)})},[]);
 const normalized=Math.max(100,Math.floor(qty/100)*100);
 const customPrice=useMemo(()=>normalized/100*4.99,[normalized]);

 function withUser(base:string){
  if(!user){location.href='/login?next=/credits';return}
  const u=new URL(base);u.searchParams.set('client_reference_id',user.id);if(user.email)u.searchParams.set('prefilled_email',user.email);location.href=u.toString();
 }
 function buyPack(p:any){withUser(p.url)}
 function customCheckout(){
  if(normalized===100){withUser(packs[0].url);return}
  setMsg('Sur la page Stripe, choisissez la quantité correspondant à votre nombre de tranches de 100 crédits.');
  withUser(CUSTOM);
 }
 return <main className="page-shell">
  <div className="page-head"><div><Link href="/dashboard">← Dashboard</Link><div className="eyebrow" style={{marginTop:18}}>CRÉDITS SUPPLÉMENTAIRES</div><h1>Acheter des crédits</h1><p style={{color:'#9299ad'}}>Recharge Stripe sécurisée. Tarif : 4,99 € par tranche de 100 crédits.</p></div></div>
  <div className="pricing-grid">
   {packs.map(p=><article className={'price-card '+(p.credits===500?'featured':'')} key={p.credits}>{p.credits===500&&<span className="plan-badge">POPULAIRE</span>}<h2>{p.credits} crédits</h2><div className="price">{p.price.toFixed(2).replace('.',',')} €</div><p>{p.label}</p><button className="primary" onClick={()=>buyPack(p)}>Payer avec Stripe</button></article>)}
  </div>
  <article className="price-card" style={{marginTop:28,maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
   <div className="eyebrow">QUANTITÉ PERSONNALISÉE</div><h2>Choisissez votre quantité</h2><p>Minimum 100 crédits, par tranches de 100.</p>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'end'}}>
    <label style={{textAlign:'left'}}><small style={{display:'block',marginBottom:7,color:'#9299ad'}}>Nombre de crédits</small><input type="number" min="100" step="100" value={qty} onChange={e=>setQty(Math.max(100,Number(e.target.value)||100))}/></label>
    <div style={{minWidth:150,textAlign:'right'}}><small style={{color:'#9299ad'}}>Total estimé</small><div style={{fontSize:28,fontWeight:800}}>{customPrice.toFixed(2).replace('.',',')} €</div></div>
   </div>
   <button className="primary" style={{marginTop:18,width:'100%',justifyContent:'center'}} onClick={customCheckout}>Continuer avec Stripe</button>
   {msg&&<div className="auth-msg">{msg}</div>}
  </article>
 </main>
}