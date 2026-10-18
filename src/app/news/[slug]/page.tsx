import Link from 'next/link';
import {notFound} from 'next/navigation';
import {PageHeading} from '@/components/page-heading';
import {publishedContent} from '@/lib/club-content';

export const dynamic = 'force-dynamic';

export default async function NewsArticle({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;

  if (!/^[a-z0-9-]{1,100}$/.test(slug)) {
    notFound();
  }

  const [article] = await publishedContent('NEWS', slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="shell pb-20">
      <Link
        href="/news"
        className="mt-8 inline-block text-sm text-neutral-400"
      >
        ← Latest news
      </Link>

      <PageHeading
        eyebrow="Club news"
        title={article.title}
        description={article.summary}
      />

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="mx-auto mb-10 h-auto max-h-[80vh] w-full object-contain"
        />
      )}

      <p className="mb-6 text-xs text-neutral-400">
        {article.createdAt.toLocaleDateString('en-AU', {
          timeZone: 'Australia/Brisbane',
        })}
      </p>

      <div className="max-w-3xl whitespace-pre-wrap break-words text-base leading-8 text-neutral-200">
        {article.body}
      </div>
    </article>
  );
}
