import type { Metadata } from 'next';
import { PosSalesHistoryContent } from '../../../components/history/pos-sales-history-content';
import { posHistoryPageConfig } from '../../../config/history';

export const metadata: Metadata = {
  title: posHistoryPageConfig.title,
  description: posHistoryPageConfig.subtitle,
};

export default function PosHistoryPage() {
  return <PosSalesHistoryContent />;
}
