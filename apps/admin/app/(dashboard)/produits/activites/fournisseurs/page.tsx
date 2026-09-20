import { redirect } from 'next/navigation';

/** Legacy URL — Prefer `/produits/activites/partenaires` (PR-09). */
export default function LegacyFournisseursRedirectPage() {
  redirect('/produits/activites/partenaires');
}
