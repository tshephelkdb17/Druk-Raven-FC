"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ChevronDown,Menu,X} from 'lucide-react';
const items=[
  {label:'Club',href:'/club',links:[['Our Story','/club']]},
  {label:'News',href:'/news',links:[['Latest news','/news']]},
  {label:'DRFC TV',href:'/tv',links:[['All videos','/tv'],['Highlights','/tv?category=HIGHLIGHTS'],['Training','/tv?category=TRAINING']]},
  {label:'Matches',href:'/matches',links:[['Fixtures','/matches?view=fixtures'],['Match Results','/matches?view=results']]},
  {label:'Squad',href:'/squad',links:[['First team','/squad#first-team'],['Staff & management','/squad#staff']]},
  {label:'Shop',href:'/shop',links:[['Club shop','/shop']]},
];
export function SiteHeader(){
 const [open,setOpen]=useState<string|null>(null),[mobile,setMobile]=useState(false);
 const path=usePathname(), root=useRef<HTMLElement>(null);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(null);setMobile(false)}};
 const click=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)){setOpen(null);setMobile(false)}};
 document.addEventListener('keydown',close);document.addEventListener('pointerdown',click);
 return()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',click)}},[]);
 const close=()=>{setOpen(null);setMobile(false)};
 return <header ref={root} className="sticky top-0 z-40 border-t-4 border-devil bg-ink">
  <div className="border-b border-white/10"><div className="shell flex h-8 items-center justify-between text-[9px] font-bold tracking-[.18em] text-neutral-400"><span>ONE CLUB. ONE COMMUNITY.</span><Link href="/admin" onClick={close} className="hover:text-white">CLUB ADMIN ↗</Link></div></div>
  <div className="shell flex h-20 items-center justify-between gap-6">
   <Link href="/" onClick={close} aria-label="DRFC home" className="flex shrink-0 items-center gap-3"><img src="/images/drfc_logo.jpeg" alt="" width="46" height="52" className="h-12 w-11 object-contain"/><span className="text-xl font-black tracking-tight">DRFC<span className="block text-[8px] tracking-[.18em] text-neutral-400">DRUK RAVEN FC</span></span></Link>
   <nav aria-label="Main navigation" className="hidden items-center gap-3 lg:flex">{items.map(item=><div key={item.label} className="flex items-center"><Link onClick={close} href={item.href} aria-current={path.startsWith(item.href)?'page':undefined} className={`px-2 py-7 text-xs font-bold uppercase tracking-wide hover:text-red-400 ${path.startsWith(item.href)?'text-red-400':''}`}>{item.label}</Link><button onClick={()=>setOpen(open===item.label?null:item.label)} aria-expanded={open===item.label} aria-controls="mega-menu" aria-label={`Open ${item.label} menu`} className="p-2"><ChevronDown size={12}/></button></div>)}</nav>
   <div className="hidden xl:block"><Link href="/tv" className="button">Watch DRFC TV <ArrowUpRight size={16}/></Link></div>
   <button className="p-3 lg:hidden" onClick={()=>setMobile(!mobile)} aria-label={mobile?'Close navigation':'Open navigation'} aria-expanded={mobile} aria-controls="mobile-menu">{mobile?<X/>:<Menu/>}</button>
  </div>
  {open&&<div id="mega-menu" className="absolute left-0 right-0 hidden border-y border-white/10 bg-panel shadow-2xl lg:block"><div className="shell grid grid-cols-[1fr_2fr] gap-16 py-9"><div><p className="kicker text-red-400">Explore DRFC</p><p className="title mt-3 text-5xl">{open}</p></div><div className="grid grid-cols-2 gap-4">{items.find(i=>i.label===open)?.links.map(([label,href])=><Link key={label} href={href} onClick={close} className="flex items-center justify-between border-b border-white/15 py-4 font-bold hover:text-red-400">{label}<ArrowUpRight size={18}/></Link>)}</div></div></div>}
  {mobile&&<nav id="mobile-menu" aria-label="Mobile navigation" className="absolute left-0 right-0 max-h-[75vh] overflow-auto border-t border-white/10 bg-panel p-6 lg:hidden">{items.map(item=><details key={item.label} className="border-b border-white/15"><summary className="cursor-pointer py-4 font-bold uppercase">{item.label}</summary><Link href={item.href} onClick={close} className="block py-3 text-red-400">Explore {item.label} →</Link>{item.links.map(([label,href])=><Link key={label} href={href} onClick={close} className="block py-3 text-sm text-neutral-300">{label}</Link>)}</details>)}</nav>}
 </header>
}
