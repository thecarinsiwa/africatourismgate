import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildAboutPageMetadata } from '../../lib/about/metadata';
import { ABOUT_PATHS } from '../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.whoWeAre, 'whoWeAre');
}

export default function AboutIndexPage() {
  redirect(ABOUT_PATHS.whoWeAre);
}
