import { blogLocaleOrder, groupBlogPostsByTranslationKey, pickBlogPostForLocale } from './blog-locale.util';
import type { BlogPosts } from '../../../entities/blog-post.entity';

describe('blog-locale.util', () => {
  const sibling = (locale: string, slug: string): BlogPosts =>
    ({
      id: `${locale}-${slug}`,
      locale,
      slug,
      translationKey: 'kenya',
      publishedAt: new Date('2026-05-15T10:00:00.000Z'),
    }) as BlogPosts;

  it('orders locale with requested locale first', () => {
    expect(blogLocaleOrder('es')).toEqual(['es', 'fr', 'en']);
  });

  it('groups siblings and picks locale', () => {
    const posts = [sibling('fr', 'kenya-fr'), sibling('en', 'kenya-en')];
    const groups = groupBlogPostsByTranslationKey(posts);
    expect(groups.size).toBe(1);
    expect(pickBlogPostForLocale([...groups.values()][0]!, 'en')?.slug).toBe('kenya-en');
  });
});
