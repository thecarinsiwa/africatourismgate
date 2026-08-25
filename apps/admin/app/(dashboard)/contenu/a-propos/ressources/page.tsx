import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/contenu/site?tab=about-resources');
}
