import type { Metadata } from 'next';
import { AboutTeamPageContent } from '../../../components/about/about-team-page-content';

export const metadata: Metadata = {
  title: 'Notre équipe',
  description: 'Rencontrez l’équipe Africa Tourism Gate.',
  alternates: { canonical: '/a-propos/equipe' },
};

export default function Page() {
  return <AboutTeamPageContent />;
}
