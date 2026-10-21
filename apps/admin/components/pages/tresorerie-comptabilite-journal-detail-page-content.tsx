'use client';

import { JournalEntryDetail } from '../treasury/journal-entry-detail';

type Props = {
  entryId: string;
};

export function TresorerieComptabiliteJournalDetailPageContent({
  entryId,
}: Props) {
  return <JournalEntryDetail entryId={entryId} />;
}
