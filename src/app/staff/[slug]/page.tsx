import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getStaff} from '@/lib/data';
import {PageHeading} from '@/components/page-heading';
export const dynamic='force-dynamic';
export default async function StaffPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,s=(await getStaff()).find(s=>s.slug===slug);if(!s)notFound();return <div className="shell min-h-[60vh]"><PageHeading eyebrow={s.role} title={s.name} description={s.biography}/>{s.portrait&&<img src={s.portrait} alt={s.name} className="max-h-96 object-contain"/>}<Link href="/squad#staff" className="button">← Staff & management</Link></div>}
