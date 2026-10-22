import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import {
  DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER,
  type PublicAnnouncementBanner,
} from '@africatourismgate/types/organization-settings';
import { AnnouncementBanner, SiteAnnouncementBanner } from './announcement-banner';
import { AnnouncementBannerProvider } from './announcement-banner-provider';
import { parsePublicAnnouncementBanner } from '../lib/site/announcement-banner';

const messages = {
  announcement: {
    regionLabel: 'Announcement',
    dismiss: 'Dismiss announcement',
    opensInNewTab: 'opens in a new tab',
  },
};

const activeBanner: PublicAnnouncementBanner = {
  enabled: true,
  text: 'Holiday sale: 20% off safaris',
  color: 'red',
  intensity: 'high',
  ctaLabel: 'Learn more',
  ctaUrl: '/packages',
  ctaNewTab: false,
  version: 'v1',
};

function renderSiteBanner(banner: PublicAnnouncementBanner) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AnnouncementBannerProvider banner={banner}>
        <SiteAnnouncementBanner />
      </AnnouncementBannerProvider>
    </NextIntlClientProvider>,
  );
}

describe('AnnouncementBanner', () => {
  const baseProps = {
    text: 'Maintenance tonight',
    isVisible: true,
    regionLabel: 'Announcement',
  } as const;

  it('renders nothing when hidden or text is blank', () => {
    const { container, rerender } = render(
      <AnnouncementBanner {...baseProps} isVisible={false} themeColor="blue" intensity="low" />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<AnnouncementBanner {...baseProps} text="   " themeColor="blue" intensity="low" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['red', 'high', 'bg-red-600', 'text-white'],
    ['red', 'low', 'bg-red-100', 'text-red-900'],
    ['yellow', 'high', 'bg-yellow-400', 'text-yellow-950'],
    ['blue', 'low', 'bg-blue-100', 'text-blue-900'],
    ['green', 'high', 'bg-green-700', 'text-white'],
    ['gray', 'low', 'bg-gray-100', 'text-gray-900'],
  ] as const)('maps %s / %s to readable classes', (color, intensity, bg, fg) => {
    render(<AnnouncementBanner {...baseProps} themeColor={color} intensity={intensity} />);
    const region = screen.getByRole('region', { name: 'Announcement' });
    expect(region).toHaveClass(`banner--${color}-${intensity}`, bg, fg);
    expect(region).toHaveAttribute('data-color', color);
    expect(region).toHaveAttribute('data-intensity', intensity);
    expect(screen.getByText('Maintenance tonight')).toBeInTheDocument();
  });

  it('renders an internal CTA in the same tab', () => {
    render(
      <AnnouncementBanner
        {...baseProps}
        themeColor="green"
        intensity="low"
        ctaLabel="Learn more"
        ctaUrl="/blog"
      />,
    );
    const link = screen.getByRole('link', { name: 'Learn more' });
    expect(link).toHaveAttribute('href', '/blog');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens an external CTA in a new tab safely', () => {
    render(
      <AnnouncementBanner
        {...baseProps}
        themeColor="blue"
        intensity="high"
        ctaLabel="Details"
        ctaUrl="https://example.org/promo"
        ctaNewTab
        newTabHint="opens in a new tab"
      />,
    );
    const link = screen.getByRole('link', { name: /Details/ });
    expect(link).toHaveAttribute('href', 'https://example.org/promo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('opens in a new tab');
  });

  it('omits the CTA when label or URL is missing', () => {
    render(
      <AnnouncementBanner {...baseProps} themeColor="blue" intensity="low" ctaLabel="Learn more" />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('SiteAnnouncementBanner', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when the banner is disabled', () => {
    renderSiteBanner({ ...DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER });
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('shows the configured banner with its CTA', () => {
    renderSiteBanner(activeBanner);
    expect(screen.getByRole('region', { name: 'Announcement' })).toHaveClass('bg-red-600');
    expect(screen.getByText(activeBanner.text)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', '/packages');
  });

  it('hides on dismiss and remembers the dismissed version', () => {
    renderSiteBanner(activeBanner);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss announcement' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem('atg-banner-dismissed')).toBe('v1');
  });

  it('stays hidden for the same version and reappears when content changes', () => {
    window.sessionStorage.setItem('atg-banner-dismissed', 'v1');
    const { unmount } = renderSiteBanner(activeBanner);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    unmount();

    renderSiteBanner({ ...activeBanner, text: 'New announcement', version: 'v2' });
    expect(screen.getByText('New announcement')).toBeInTheDocument();
  });
});

describe('parsePublicAnnouncementBanner', () => {
  it('falls back to a disabled banner for invalid payloads', () => {
    expect(parsePublicAnnouncementBanner(null).enabled).toBe(false);
    expect(parsePublicAnnouncementBanner({ enabled: true, text: '  ' }).enabled).toBe(false);
  });

  it('sanitizes unknown theme values and drops a CTA without label', () => {
    const parsed = parsePublicAnnouncementBanner({
      enabled: true,
      text: 'Hello',
      color: 'purple',
      intensity: 'extreme',
      ctaUrl: '/blog',
      ctaLabel: null,
      ctaNewTab: true,
      version: 'abc',
    });
    expect(parsed).toMatchObject({
      enabled: true,
      color: 'blue',
      intensity: 'low',
      ctaUrl: null,
      ctaLabel: null,
      ctaNewTab: false,
      version: 'abc',
    });
  });
});
