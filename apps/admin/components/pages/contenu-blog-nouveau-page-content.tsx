'use client';

import { BlogPostForm } from '../blog-posts/blog-post-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuBlogNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/blog/nouveau">
      <BlogPostForm mode="create" />
    </AdminIntroPage>
  );
}
