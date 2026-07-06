import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { BlogPostEditPage } from '../../../../../components/blog-posts/blog-post-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/blog/id');
}

export default function EditBlogPostPage({ params }: PageProps) {
  return <BlogPostEditPage postId={params.id} />;
}
