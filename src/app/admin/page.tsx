import {AdminVideoStudio} from '@/components/admin-video-studio';
import {PageHeading} from '@/components/page-heading';
import {isDemo} from '@/lib/db';
export const dynamic='force-dynamic';
export const metadata={title:'Content studio',robots:{index:false,follow:false}};
export default function Admin(){return <div className="shell"><PageHeading eyebrow="Club administration" title="Club admin" description="Manage match details, player statistics and DRFC TV."/><AdminVideoStudio demo={isDemo()}/></div>}
