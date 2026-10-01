import './globals.css';
export const metadata={
 title:'NovaPhoto AI',
 description:'Améliorez vos photos avec l’intelligence artificielle',
 icons:{icon:'/icon.svg',shortcut:'/icon.svg',apple:'/icon.svg'},
 openGraph:{title:'NovaPhoto AI',description:'Retouche photo professionnelle avec IA',type:'website'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}