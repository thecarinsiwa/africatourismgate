'use client';

import { BlogPostsList } from '../blog-posts/blog-posts-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuBlogPageContent() {
  return (
    <AdminIntroPage routePath="contenu/blog">
      <BlogPostsList />
    </AdminIntroPage>
  );
}
