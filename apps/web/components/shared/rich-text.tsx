import type { HTMLAttributes } from 'react';
import { cn } from '@africatourismgate/ui';

export function hasHtmlMarkup(value: string | null | undefined): boolean {
  if (!value) return false;
  return /<[^>]+>/.test(value);
}

export function stripHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export type RichTextProps = HTMLAttributes<HTMLDivElement> & {
  content?: string | null;
  fallbackClassName?: string;
};

export function RichText({
  content,
  className,
  fallbackClassName,
  ...props
}: RichTextProps) {
  if (!content) return null;

  if (hasHtmlMarkup(content)) {
    return (
      <div
        className={cn(
          'max-w-none break-words text-sm leading-relaxed text-atg-muted [overflow-wrap:anywhere] [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-2 [&_strong]:font-semibold',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
        {...props}
      />
    );
  }

  return (
    <p
      className={cn('whitespace-pre-line text-sm leading-relaxed text-atg-muted', fallbackClassName ?? className)}
      {...props}
    >
      {content}
    </p>
  );
}
