import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/contenu/support?tab=tickets');
}
