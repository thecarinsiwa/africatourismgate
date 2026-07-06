import type { Metadata } from 'next';
import { AboutContactPageContent } from '../../../components/about/about-contact-page-content';

export const metadata: Metadata = {
  title: 'Nous contacter',
  description: 'Contactez l’équipe Africa Tourism Gate — téléphone, e-mail et formulaire de support.',
  alternates: { canonical: '/a-propos/contact' },
};

export default function Page() {
  return <AboutContactPageContent />;
}
