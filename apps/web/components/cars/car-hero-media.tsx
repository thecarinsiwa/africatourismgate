'use client';

import Image from 'next/image';

type CarHeroMediaProps = {
  imageUrl?: string | null;
  categoryName: string;
  title: string;
  agencyName?: string;
  placeholderAria: string;
};

export function CarHeroMedia({
  imageUrl,
  categoryName,
  title,
  agencyName,
  placeholderAria,
}: CarHeroMediaProps) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-atg-surface">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {categoryName}
          </p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">{title}</p>
          {agencyName ? (
            <p className="mt-1 text-sm text-white/80">{agencyName}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1b2f] to-primary/80"
      role="img"
      aria-label={placeholderAria}
    >
      <svg
        className="absolute right-6 top-1/2 h-24 w-24 -translate-y-1/2 text-white/10 sm:h-32 sm:w-32"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {categoryName}
        </p>
        <p className="mt-1 text-xl font-bold sm:text-2xl">{title}</p>
        {agencyName ? (
          <p className="mt-1 text-sm text-white/80">{agencyName}</p>
        ) : null}
      </div>
    </div>
  );
}
