import { redirect } from 'next/navigation';

type PageProps = {
  params: { id: string };
};

/** @deprecated Use `/reservations/[id]` — kept for backward-compatible links. */
export default function LegacyBookingDetailPage({ params }: PageProps) {
  redirect(`/reservations/${params.id}`);
}
