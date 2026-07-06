import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildAboutPageMetadata } from '../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/qui-nous-sommes', 'whoWeAre');
}

export default function AProposIndexPage() {
  redirect('/a-propos/qui-nous-sommes');
}
