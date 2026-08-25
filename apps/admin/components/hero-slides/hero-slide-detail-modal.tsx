'use client';

import { Button, DataTableBadge, Modal } from '@africatourismgate/ui';
import type { HeroSlide } from '@africatourismgate/types';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type HeroSlideDetailModalProps = {
  open: boolean;
  slide: HeroSlide | null;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-atg-fg">{children}</dd>
    </div>
  );
}

export function HeroSlideDetailModal({
  open,
  slide,
  onOpenChange,
  canWrite = false,
}: HeroSlideDetailModalProps) {
  const t = useTranslations('modules.heroSlides.detail');
  const tForm = useTranslations('modules.heroSlides.form.fields');
  const tList = useTranslations('modules.heroSlides.list');
  const tStatus = useTranslations('modules.heroSlides.status');
  const tLocale = useTranslations('modules.heroSlides.locale');
  const tCommon = useTranslations('modules.common');
  const emptyDash = tCommon('empty.dash');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={slide?.title ?? t('title')}
      showClose
      closeAriaLabel={t('close')}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {!slide ? null : (
        <div className="space-y-6">
          {slide.imageUrl.trim() ? (
            <div className="overflow-hidden rounded-lg border border-atg-border">
              <Image
                src={resolveMediaUrl(slide.imageUrl.trim())}
                alt={slide.imageAlt.trim() || slide.title}
                width={960}
                height={400}
                unoptimized
                className="aspect-[21/9] h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={tForm('subtitle')}>{slide.subtitle}</DetailField>
            <DetailField label={tForm('title')}>{slide.title}</DetailField>
            <DetailField label={tCommon('columns.status')}>
              <DataTableBadge variant={slide.status === 'published' ? 'success' : 'muted'}>
                {slide.status === 'published' ? tStatus('published') : tStatus('draft')}
              </DataTableBadge>
            </DetailField>
            <DetailField label={tForm('locale')}>
              {tLocale(slide.locale as 'fr' | 'en' | 'es')}
            </DetailField>
            <DetailField label={tList('columns.sortOrder')}>
              <span className="tabular-nums">{slide.sortOrder}</span>
            </DetailField>
            <DetailField label={tForm('imageAlt')}>{slide.imageAlt}</DetailField>
            <div className="sm:col-span-2">
              <DetailField label={tForm('description')}>{slide.description}</DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label={tForm('href')}>
                {slide.href?.trim() ? (
                  <Link
                    href={slide.href}
                    className="font-medium text-primary hover:text-primary-hover"
                    target={slide.href.startsWith('http') ? '_blank' : undefined}
                    rel={slide.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {slide.href}
                  </Link>
                ) : (
                  <span className="text-atg-muted">{emptyDash}</span>
                )}
              </DetailField>
            </div>
          </dl>

          <div className="flex flex-wrap justify-end gap-3 border-t border-atg-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('close')}
            </Button>
            {canWrite ? (
              <Button type="button" href={`/contenu/hero/${slide.id}`}>
                {t('edit')}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
