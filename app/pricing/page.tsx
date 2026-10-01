'use client';
import Link from 'next/link';import Script from 'next/script';import {useEffect,useState} from 'react';import {supabase} from '../../lib/supabase';
declare global{interface Window{paypal:any}}
const PRO_PLAN_ID='P-63334247292105943NK7HFEA';
const BUSINESS_PLAN_ID='P-4L2953720M985443GNK7HHXY';
const STRIPE_PRO='https://buy.stripe.com/9B6bJ04ev6CCezzdR9awo00';
const STRIPE_BUSINESS='https://buy.stripe.com/6oUdR8eT90eegHH5kDawo01';

export default function Pricing(){
 const [ready,setReady]=useState(false),[msg,setMsg]=useState('');
 async function goStripe(base:string){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){location.href='/login?next=/pricing';return}
  const u=new URL(base);
  u.searchParams.set('client_reference_id',user.id);
  if(user.email)u.searchParams.set('prefilled_email',user.email);
  location.href=u.toString();
 }
 useEffect(()=>{if(!ready||!window.paypal)return;
 const renderPlan=(containerId:string,planId:string,planKey:string,color:string,quantity?:number)=>{
  const el=document.getElementById(containerId);if(!el||el.dataset.rendered)return;el.dataset.rendered='1';
  window.paypal.Buttons({
   style:{shape:'rect',color,layout:'vertical',label:'subscribe'},
   createSubscription:function(_data:any,actions:any){return actions.subscription.create(quantity?{plan_id:planId,quantity}:{plan_id:planId})},
   onApprove:async function(data:any){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setMsg('Abonnement créé. Connectez-vous pour l’associer à votre compte NovaPhoto AI.');return}
    const {error}=await supabase.from('subscriptions').insert({user_id:user.id,plan_key:planKey,provider_plan_id:planId,provider_subscription_id:data.subscriptionID,status:'pending_verification'});
    if(error){setMsg('Abonnement PayPal créé, mais l’association au compte doit être vérifiée.');return}
    setMsg('Abonnement PayPal créé. Vérification du paiement en cours avant activation des crédits.');
   },
   onError:function(){setMsg('Impossible de charger ou créer l’abonnement PayPal. Réessayez.')}
  }).render('#'+containerId)
 };
 renderPlan('paypal-pro-subscription',PRO_PLAN_ID,'pro','black');
 renderPlan('paypal-business-subscription',BUSINESS_PLAN_ID,'business','gold',1);
},[ready]);
 return <main className="page-shell" style={{textAlign:'center'}}>
  <Script src="https://www.paypal.com/sdk/js?client-id=AWg06xFq0dApmkQQXBM2aDw9Y-mUs84VwIIpQd9lJDQbqD-1COM5tQUmbG4VPB5VbjqxV_nEkSY_Opdu&vault=true&intent=subscription" strategy="afterInteractive" onLoad={()=>setReady(true)}/>
  <Link href="/">← NovaPhoto AI</Link>
  <div className="eyebrow" style={{marginTop:24}}>FORMULES PREMIUM</div>
  <h1 style={{fontSize:48}}>Choisissez votre formule</h1>
  <p style={{color:'#9299ad'}}>20 crédits sont offerts à la création du compte. Après épuisement, un abonnement est requis pour continuer les retouches IA.</p>
  <div className="pricing-grid">
   <article className="price-card"><h2>Gratuit</h2><div className="price">0 €</div><p>20 crédits gratuits · puis abonnement requis</p><Link href="/login"><button>Créer mon compte</button></Link></article>
   <article className="price-card featured"><span className="plan-badge">ABONNEMENT</span><h2>Pro</h2><div className="price">14,99 € / mois</div><p>500 crédits · HD/4K · sans filigrane</p><button className="primary" style={{width:'100%',justifyContent:'center',marginTop:18}} onClick={()=>goStripe(STRIPE_PRO)}>Payer avec Stripe</button><div style={{margin:'14px 0',color:'#9299ad'}}>ou</div><div id="paypal-pro-subscription" style={{minHeight:45}}><span style={{color:'#9299ad'}}>Chargement PayPal…</span></div></article>
   <article className="price-card"><h2>Business</h2><div className="price">39,99 € / mois</div><p>2000 crédits · lots · usage commercial</p><button className="primary" style={{width:'100%',justifyContent:'center',marginTop:18}} onClick={()=>goStripe(STRIPE_BUSINESS)}>Payer avec Stripe</button><div style={{margin:'14px 0',color:'#9299ad'}}>ou</div><div id="paypal-business-subscription" style={{minHeight:45}}><span style={{color:'#9299ad'}}>Chargement PayPal…</span></div></article>
   <article className="price-card"><h2>Crédits supplémentaires</h2><div className="price">À partir de 100</div><p>Ajoutez la quantité de crédits souhaitée après votre abonnement.</p><Link href="/credits"><button className="primary">Choisir une quantité</button></Link></article>
  </div>
  {msg&&<div className="auth-msg" style={{maxWidth:700,margin:'24px auto 0'}}>{msg}</div>}
 </main>
}