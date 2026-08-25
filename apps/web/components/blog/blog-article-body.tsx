import { cn } from '@africatourismgate/ui';

type BlogArticleBodyProps = {
  html: string;
  className?: string;
};

/** Corps d'article — typographie éditoriale (Medium / magazine voyage). */
export function BlogArticleBody({ html, className }: BlogArticleBodyProps) {
  return (
    <div
      className={cn(
        'blog-prose',
        'text-[1.0625rem] leading-[1.8] text-atg-fg',
        '[&_p]:mb-6 [&_p]:text-atg-muted',
        '[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-atg-fg',
        '[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-atg-fg',
        '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80',
        '[&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-atg-muted',
        '[&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-atg-muted',
        '[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-atg-fg',
        '[&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl',
        '[&_strong]:font-semibold [&_strong]:text-atg-fg',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
