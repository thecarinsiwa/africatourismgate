import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';

export const metadata: Metadata = {
  title: 'Comment nous travaillons',
  description: 'Notre approche qualité, transparence et partenariat local.',
  alternates: { canonical: '/a-propos/comment-nous-travaillons' },
};

export default function Page() {
  return <AboutTextPageContent sectionKey="how-we-work" />;
}
