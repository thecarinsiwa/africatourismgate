import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AboutTeamMemberProfileContent } from '../../../../components/about/about-team-member-profile-content';
import { stripHtml } from '../../../../components/shared/rich-text';
import { teamMemberPath } from '../../../../lib/about/routes';
import { getTeamMemberBySlug } from '../../../../lib/api/public';

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('about');
  const canonical = teamMemberPath(params.slug);
  const teamLabel = t('nav.team');

  try {
    const member = await getTeamMemberBySlug(params.slug, await getLocale());
    const title = `${member.name} — ${member.role} | ${teamLabel}`;
    const description = stripHtml(member.bio).slice(0, 160) || member.role;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'profile',
        ...(member.photoUrl ? { images: [{ url: member.photoUrl, alt: member.name }] } : {}),
      },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return {
      title: `${params.slug.replace(/-/g, ' ')} | ${teamLabel}`,
      alternates: { canonical },
    };
  }
}

export default function TeamMemberProfilePage({ params }: PageProps) {
  return <AboutTeamMemberProfileContent slug={params.slug} />;
}
