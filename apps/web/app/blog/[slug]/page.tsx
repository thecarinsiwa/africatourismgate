import type { Metadata } from 'next';
import { BlogDetailPageContent } from '../../../components/blog/blog-detail-page-content';

type PageProps = {
  params: { slug: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `${params.slug.replace(/-/g, ' ')} | Blog`,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  return <BlogDetailPageContent slug={params.slug} />;
}
