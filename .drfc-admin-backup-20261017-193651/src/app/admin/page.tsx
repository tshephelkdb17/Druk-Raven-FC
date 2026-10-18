import {AdminVideoStudio} from '@/components/admin-video-studio';
import {PageHeading} from '@/components/page-heading';
import {isDemo} from '@/lib/db';
export const dynamic='force-dynamic';
export const metadata={title:'Content studio',robots:{index:false,follow:false}};
export default function Admin(){return <div className="shell"><PageHeading eyebrow="Club administration" title="DRFC TV studio" description="Create, organise and publish your club films."/><AdminVideoStudio demo={isDemo()}/></div>}
