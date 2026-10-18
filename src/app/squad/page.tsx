import {getPlayers,getStaff} from '@/lib/data';
import {SquadDirectory} from '@/components/squad-directory';
import {PageHeading} from '@/components/page-heading';
import {PreviewNotice} from '@/components/preview-notice';
export const dynamic='force-dynamic';
export const metadata={title:'Squad & staff'};
export default async function SquadPage(){const [players,staff]=await Promise.all([getPlayers(),getStaff()]);return <><PreviewNotice/><div className="shell"><PageHeading eyebrow="The first team" title="Behind the badge." description="The players on the pitch. The people who make it possible."/><SquadDirectory players={players} staff={staff}/></div></>}
