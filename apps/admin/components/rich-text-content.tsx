'use client';

import { cn } from '@africatourismgate/ui';

const richTextContentClass = cn(
  'text-sm leading-relaxed text-atg-muted',
  '[&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-atg-fg [&_h2:first-child]:mt-0',
  '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_strong]:font-semibold [&_strong]:text-atg-fg',
  '[&_em]:italic',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-atg-border [&_blockquote]:pl-3',
);

type RichTextContentProps = {
  html: string;
  className?: string;
};

export function RichTextContent({ html, className }: RichTextContentProps) {
  return (
    <div
      className={cn(richTextContentClass, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
