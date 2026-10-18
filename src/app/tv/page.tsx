import {getVideos} from '@/lib/data';
import {VideoGrid} from '@/components/video-grid';
import {PageHeading} from '@/components/page-heading';
import {PreviewNotice} from '@/components/preview-notice';
import {categories} from '@/lib/types';
export const dynamic='force-dynamic';
export const metadata={title:'DRFC TV'};
export default async function TvPage({searchParams}:{searchParams:Promise<{category?:string}>}){const query=await searchParams;const category=categories.some(c=>c===query.category)?query.category!:'ALL';return <><PreviewNotice/><div className="shell min-h-[65vh]"><PageHeading eyebrow="Closer to the club" title="DRFC TV" description="Every angle. Every moment. Match highlights, training and stories from the Ravens."/><VideoGrid key={category} videos={await getVideos()} initialCategory={category}/></div></>}
