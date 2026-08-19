'use client';

import type { BookingManifestSex, CreateBookingManifestEntryRequest } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type ManifestEntryDraft = {
  fullName: string;
  age: string;
  sex: '' | BookingManifestSex;
  nationality: string;
  idNumber: string;
  conditions: string;
  file?: File;
};

export function emptyManifestEntryDraft(): ManifestEntryDraft {
  return { fullName: '', age: '', sex: '', nationality: '', idNumber: '', conditions: '', file: undefined };
}

export function manifestDraftToPayload(
  entry: ManifestEntryDraft,
  sortOrder: number,
): CreateBookingManifestEntryRequest {
  const age = Number.parseInt(entry.age, 10);
  return {
    fullName: entry.fullName.trim(),
    age: !Number.isNaN(age) && age >= 0 ? age : undefined,
    sex: entry.sex || undefined,
    nationality: entry.nationality.trim() || undefined,
    idNumber: entry.idNumber.trim() || undefined,
    conditions: entry.conditions.trim() || undefined,
    sortOrder,
  };
}

// ---------------------------------------------------------------------------
// CameraCapture sub-component
// ---------------------------------------------------------------------------

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  onClose: () => void;
  labels: { capture: string; retake: string; confirm: string; cancel: string; cameraError: string };
};

function CameraCapture({ onCapture, onClose, labels }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError(labels.cameraError);
    }
  }, [labels.cameraError]);

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  function takeSnapshot() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setSnapshot(canvas.toDataURL('image/jpeg', 0.92));
  }

  function retake() {
    setSnapshot(null);
  }

  function confirm() {
    if (!snapshot || !canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      'image/jpeg',
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" role="dialog" aria-modal="true">
      <div className="relative flex-1 overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${snapshot ? 'hidden' : ''}`}
        />
        {snapshot ? (
          <img src={snapshot} alt="" className="h-full w-full object-cover" />
        ) : null}
        {error ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-center text-sm text-red-400">{error}</p>
          </div>
        ) : null}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center justify-around gap-4 bg-black/90 px-6 py-5">
        <button
          type="button"
          onClick={() => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            onClose();
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label={labels.cancel}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {!snapshot ? (
          <button
            type="button"
            onClick={takeSnapshot}
            disabled={Boolean(error)}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform active:scale-95 disabled:opacity-40"
            aria-label={labels.capture}
          >
            <span className="h-10 w-10 rounded-full bg-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={confirm}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"
            aria-label={labels.confirm}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {snapshot ? (
          <button
            type="button"
            onClick={retake}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label={labels.retake}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <div className="h-12 w-12" />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Labels = {
  title: string;
  subtitle: string;
  travelerN: string;
  fullName: string;
  age: string;
  sex: string;
  sexUnspecified: string;
  sexM: string;
  sexF: string;
  sexOther: string;
  nationality: string;
  idNumber: string;
  conditions: string;
  conditionsPlaceholder: string;
  idDocument: string;
  idDocumentHint: string;
  idDocumentSelected: string;
  idDocumentRemove: string;
  takePhoto: string;
  cameraCapture: string;
  cameraRetake: string;
  cameraConfirm: string;
  cameraCancel: string;
  cameraError: string;
};

type Props = {
  count: number;
  entries: ManifestEntryDraft[];
  onChange: (entries: ManifestEntryDraft[]) => void;
  labels: Labels;
  validationErrors: Record<number, string>;
};

export function CheckoutManifestForm({ count, entries, onChange, labels, validationErrors }: Props) {
  const baseId = useId();
  const [cameraIndex, setCameraIndex] = useState<number | null>(null);

  useEffect(() => {
    if (entries.length === count) return;
    if (count < 1) return;
    const next = Array.from({ length: count }, (_, i) => entries[i] ?? emptyManifestEntryDraft());
    onChange(next);
  }, [count, entries, onChange]);

  function update(index: number, patch: Partial<ManifestEntryDraft>) {
    const next = entries.map((e, i) => (i === index ? { ...e, ...patch } : e));
    onChange(next);
  }

  if (entries.length === 0) return null;

  const cameraLabels = {
    capture: labels.cameraCapture,
    retake: labels.cameraRetake,
    confirm: labels.cameraConfirm,
    cancel: labels.cameraCancel,
    cameraError: labels.cameraError,
  };

  return (
    <>
      {cameraIndex !== null ? (
        <CameraCapture
          labels={cameraLabels}
          onCapture={(file) => {
            update(cameraIndex, { file });
            setCameraIndex(null);
          }}
          onClose={() => setCameraIndex(null)}
        />
      ) : null}

      <div className="space-y-4 rounded-xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
        <div>
          <h3 className="text-base font-semibold text-atg-fg">{labels.title}</h3>
          <p className="mt-1 text-sm text-atg-muted">{labels.subtitle}</p>
        </div>

        {entries.map((entry, index) => {
          const idPrefix = `${baseId}-t${index}`;
          const travellerLabel = labels.travelerN.replace('{n}', String(index + 1));
          const error = validationErrors[index];
          return (
            <fieldset
              key={index}
              className="space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border"
            >
              <legend className="px-1 text-sm font-semibold text-atg-fg">{travellerLabel}</legend>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`${idPrefix}-name`} className="block text-sm font-medium text-atg-fg">
                    {labels.fullName}
                    <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${idPrefix}-name`}
                    type="text"
                    value={entry.fullName}
                    onChange={(e) => update(index, { fullName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                    autoComplete="name"
                  />
                  {error ? (
                    <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-age`} className="block text-sm font-medium text-atg-fg">
                    {labels.age}
                  </label>
                  <input
                    id={`${idPrefix}-age`}
                    type="number"
                    min={0}
                    max={150}
                    value={entry.age}
                    onChange={(e) => update(index, { age: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  />
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-sex`} className="block text-sm font-medium text-atg-fg">
                    {labels.sex}
                  </label>
                  <select
                    id={`${idPrefix}-sex`}
                    value={entry.sex}
                    onChange={(e) => update(index, { sex: e.target.value as ManifestEntryDraft['sex'] })}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  >
                    <option value="">{labels.sexUnspecified}</option>
                    <option value="M">{labels.sexM}</option>
                    <option value="F">{labels.sexF}</option>
                    <option value="other">{labels.sexOther}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-nat`} className="block text-sm font-medium text-atg-fg">
                    {labels.nationality}
                  </label>
                  <input
                    id={`${idPrefix}-nat`}
                    type="text"
                    value={entry.nationality}
                    onChange={(e) => update(index, { nationality: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  />
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-id`} className="block text-sm font-medium text-atg-fg">
                    {labels.idNumber}
                  </label>
                  <input
                    id={`${idPrefix}-id`}
                    type="text"
                    value={entry.idNumber}
                    onChange={(e) => update(index, { idNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 font-mono text-sm text-atg-fg dark:border-atg-border"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor={`${idPrefix}-cond`} className="block text-sm font-medium text-atg-fg">
                    {labels.conditions}
                  </label>
                  <textarea
                    id={`${idPrefix}-cond`}
                    rows={2}
                    value={entry.conditions}
                    onChange={(e) => update(index, { conditions: e.target.value })}
                    placeholder={labels.conditionsPlaceholder}
                    className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  />
                </div>

                {/* Document upload / camera */}
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-atg-fg">{labels.idDocument}</p>
                  <p className="mt-0.5 text-xs text-atg-muted">{labels.idDocumentHint}</p>

                  {entry.file ? (
                    /* File preview */
                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-atg-border bg-atg-surface px-3 py-2 dark:border-atg-border dark:bg-white/5">
                      {entry.file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(entry.file)}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <svg className="h-8 w-8 shrink-0 text-atg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      )}
                      <span className="flex-1 truncate text-sm text-atg-fg">{entry.file.name}</span>
                      <button
                        type="button"
                        onClick={() => update(index, { file: undefined })}
                        className="shrink-0 text-xs text-atg-muted hover:text-red-600 dark:hover:text-red-400"
                      >
                        {labels.idDocumentRemove}
                      </button>
                    </div>
                  ) : (
                    /* Upload + Camera buttons */
                    <div className="mt-2 flex flex-wrap gap-2">
                      <label
                        htmlFor={`${idPrefix}-file`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-atg-border px-4 py-2.5 text-sm text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        {labels.idDocumentSelected}
                        <input
                          id={`${idPrefix}-file`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) update(index, { file: f });
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setCameraIndex(index)}
                        className="flex items-center gap-2 rounded-lg border border-dashed border-atg-border px-4 py-2.5 text-sm text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                        </svg>
                        {labels.takePhoto}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </fieldset>
          );
        })}
      </div>
    </>
  );
}
