'use client';
import Link from 'next/link';import Script from 'next/script';import {useEffect,useState} from 'react';import {supabase} from '../../lib/supabase';
declare global{interface Window{paypal:any}}
const PRO_PLAN_ID='P-63334247292105943NK7HFEA';
export default function Pricing(){
 const [ready,setReady]=useState(false),[msg,setMsg]=useState('');
 useEffect(()=>{if(!ready||!window.paypal)return;const el=document.getElementById('paypal-pro-subscription');if(!el||el.dataset.rendered)return;el.dataset.rendered='1';window.paypal.Buttons({
  style:{shape:'rect',color:'black',layout:'vertical',label:'subscribe'},
  createSubscription:function(_data:any,actions:any){return actions.subscription.create({plan_id:PRO_PLAN_ID})},
  onApprove:async function(data:any){
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){setMsg('Abonnement créé. Connectez-vous pour l’associer à votre compte NovaPhoto AI.');return}
   const {error}=await supabase.from('subscriptions').insert({user_id:user.id,plan_key:'pro',provider_plan_id:PRO_PLAN_ID,provider_subscription_id:data.subscriptionID,status:'pending_verification'});
   if(error){setMsg('Abonnement PayPal créé, mais l’association au compte doit être vérifiée.');return}
   setMsg('Abonnement PayPal créé. Vérification du paiement en cours avant activation des crédits.');
  },
  onError:function(){setMsg('Impossible de charger ou créer l’abonnement PayPal. Réessayez.')}
 }).render('#paypal-pro-subscription')},[ready]);
 return <main className="page-shell" style={{textAlign:'center'}}>
  <Script src="https://www.paypal.com/sdk/js?client-id=AWg06xFq0dApmkQQXBM2aDw9Y-mUs84VwIIpQd9lJDQbqD-1COM5tQUmbG4VPB5VbjqxV_nEkSY_Opdu&vault=true&intent=subscription" strategy="afterInteractive" onLoad={()=>setReady(true)}/>
  <Link href="/">← NovaPhoto AI</Link>
  <div className="eyebrow" style={{marginTop:24}}>FORMULES PREMIUM</div>
  <h1 style={{fontSize:48}}>Choisissez votre formule</h1>
  <p style={{color:'#9299ad'}}>20 crédits sont offerts à la création du compte. Après épuisement, un abonnement est requis pour continuer les retouches IA.</p>
  <div className="pricing-grid">
   <article className="price-card"><h2>Gratuit</h2><div className="price">0 €</div><p>20 crédits gratuits · puis abonnement requis</p><Link href="/login"><button>Créer mon compte</button></Link></article>
   <article className="price-card featured"><span className="plan-badge">ABONNEMENT</span><h2>Pro</h2><div className="price">14,99 € / mois</div><p>500 crédits · HD/4K · sans filigrane</p><div id="paypal-pro-subscription" style={{minHeight:45,marginTop:18}}><span style={{color:'#9299ad'}}>Chargement PayPal…</span></div></article>
   <article className="price-card"><h2>Crédits supplémentaires</h2><div className="price">À partir de 100</div><p>Ajoutez la quantité de crédits souhaitée après votre abonnement.</p><Link href="/credits"><button className="primary">Choisir une quantité</button></Link></article>
  </div>
  {msg&&<div className="auth-msg" style={{maxWidth:700,margin:'24px auto 0'}}>{msg}</div>}
  <p style={{marginTop:28,color:'#9299ad',fontSize:13}}>L’activation définitive des crédits d’abonnement doit être confirmée côté serveur après validation PayPal.</p>
 </main>
}