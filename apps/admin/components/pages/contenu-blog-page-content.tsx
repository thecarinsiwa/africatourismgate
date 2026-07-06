'use client';

import { BlogPostsList } from '../blog-posts/blog-posts-list';
import { BlogStatCards } from '../blog-posts/blog-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuBlogPageContent() {
  return (
    <AdminIntroPage routePath="contenu/blog">
      <BlogStatCards className="mb-6" />
      <BlogPostsList />
    </AdminIntroPage>
  );
}
