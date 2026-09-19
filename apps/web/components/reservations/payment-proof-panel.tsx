'use client';

import { Button } from '@africatourismgate/ui';
import type {
  BookingPaymentProof,
  BookingPaymentProofMethod,
  BookingStatus,
} from '@africatourismgate/types';
import { useMemo, useRef, useState } from 'react';
import { CameraCapture } from '../camera-capture';
import {
  fetchBookingPaymentProofBlob,
  uploadBookingPaymentProof,
} from '../../lib/api/booking-payment-proofs';

const ALLOWED_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

export type PaymentProofPanelLabels = {
  title: string;
  subtitle: string;
  empty: string;
  upload: string;
  uploading: string;
  takePhoto: string;
  fileHint: string;
  uploadError: string;
  fileTooLarge: string;
  view: string;
  viewing: string;
  viewError: string;
  statusLabel: string;
  methods: {
    bank_transfer: string;
    mobile_money: string;
  };
  statuses: {
    pending_review: string;
    approved: string;
    resubmit_requested: string;
    rejected: string;
  };
  camera: {
    capture: string;
    retake: string;
    confirm: string;
    cancel: string;
    cameraError: string;
  };
};

function latestProof(
  proofs: BookingPaymentProof[],
  method: BookingPaymentProofMethod,
): BookingPaymentProof | null {
  const matching = proofs.filter((p) => p.paymentMethod === method);
  if (matching.length === 0) return null;
  return matching.reduce((best, cur) =>
    cur.version > best.version ? cur : best,
  );
}

function canUploadNewVersion(proof: BookingPaymentProof | null): boolean {
  if (!proof) return true;
  if (proof.status === 'pending_review') return false;
  return proof.status === 'resubmit_requested' || proof.status === 'rejected';
}

type Props = {
  bookingId: string;
  bookingStatus: BookingStatus;
  paymentMethod?: BookingPaymentProofMethod;
  proofs: BookingPaymentProof[];
  labels: PaymentProofPanelLabels;
  onUpdated: () => Promise<void>;
};

export function PaymentProofPanel({
  bookingId,
  bookingStatus,
  paymentMethod = 'bank_transfer',
  proofs,
  labels,
  onUpdated,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const latest = useMemo(
    () => latestProof(proofs, paymentMethod),
    [proofs, paymentMethod],
  );

  const showUpload =
    bookingStatus === 'pending_payment' && canUploadNewVersion(latest);

  async function handleUpload(file: File) {
    if (file.size > MAX_BYTES) {
      setError(labels.fileTooLarge);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadBookingPaymentProof(bookingId, file, paymentMethod);
      await onUpdated();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : labels.uploadError);
    } finally {
      setUploading(false);
      setCameraOpen(false);
    }
  }

  async function handleView(proof: BookingPaymentProof) {
    setViewingId(proof.id);
    try {
      const blob = await fetchBookingPaymentProofBlob(bookingId, proof.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError(labels.viewError);
    } finally {
      setViewingId(null);
    }
  }

  if (!showUpload && !latest) {
    return null;
  }

  return (
    <section className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <h3 className="text-sm font-semibold text-atg-fg">{labels.title}</h3>
      <p className="mt-1 text-xs text-atg-muted">{labels.subtitle}</p>

      {latest ? (
        <div className="mt-3 rounded-lg border border-atg-border/80 bg-white/50 p-3 dark:bg-black/10">
          <p className="text-sm font-medium text-atg-fg">
            {labels.methods[latest.paymentMethod]} · v{latest.version}
          </p>
          <p className="truncate text-xs text-atg-muted">{latest.originalFilename}</p>
          <p className="mt-1 text-sm">
            <span className="font-medium">{labels.statusLabel} : </span>
            {labels.statuses[latest.status]}
          </p>
          {latest.staffNote ? (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {latest.staffNote}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={viewingId === latest.id}
            onClick={() => void handleView(latest)}
          >
            {viewingId === latest.id ? labels.viewing : labels.view}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-atg-muted">{labels.empty}</p>
      )}

      {showUpload ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-atg-muted">{labels.fileHint}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            capture="environment"
            className="block w-full text-sm text-atg-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => setCameraOpen(true)}
            >
              {labels.takePhoto}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? labels.uploading : labels.upload}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {cameraOpen ? (
        <CameraCapture
          labels={labels.camera}
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            void handleUpload(file);
          }}
        />
      ) : null}
    </section>
  );
}
