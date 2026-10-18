import {isDemo} from '@/lib/db';
export function PreviewNotice(){return isDemo()?<div className="border-b border-white/10 bg-white/5 px-4 py-2 text-center text-[10px] tracking-wide text-neutral-400">DESIGN PREVIEW · Sample roster and staff roles. One supplied club film.</div>:null}
