import type {Metadata,Viewport} from 'next';
import Link from 'next/link';
import './globals.css';
import {SiteHeader} from '@/components/site-header';
import {PwaRegister} from '@/components/pwa-register';
export const metadata:Metadata={title:{default:'DRFC | Druk Raven Football Club',template:'%s | DRFC'},description:'The home of Druk Raven Football Club. First team, club films and match-day moments.',applicationName:'DRFC'};
export const viewport:Viewport={themeColor:'#0c0c0c'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-devil focus:p-4">Skip to content</a><SiteHeader/><main id="main">{children}</main><footer className="mt-20 border-t border-white/15 bg-panel py-12"><div className="shell flex flex-wrap items-center justify-between gap-8"><div><p className="text-3xl font-black">DRFC<span className="text-devil">.</span></p><p className="kicker mt-2 text-neutral-400">Druk Raven Football Club</p></div><nav aria-label="Footer" className="flex gap-6 text-xs font-bold uppercase"><Link href="/club">Club</Link><Link href="/squad">Squad</Link><Link href="/tv">DRFC TV</Link><Link href="/admin">Admin</Link></nav><p className="text-xs text-neutral-500">One club. One community.</p></div></footer><PwaRegister/></body></html>}
