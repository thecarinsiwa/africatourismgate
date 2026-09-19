'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@africatourismgate/ui';

export type CameraCaptureLabels = {
  capture: string;
  retake: string;
  confirm: string;
  cancel: string;
  cameraError: string;
};

type Props = {
  onCapture: (file: File) => void;
  onClose: () => void;
  labels: CameraCaptureLabels;
};

export function CameraCapture({ onCapture, onClose, labels }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
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
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
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
          <p className="absolute inset-x-0 top-4 px-4 text-center text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex flex-wrap justify-center gap-3 bg-black/80 p-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {labels.cancel}
        </Button>
        {snapshot ? (
          <>
            <Button type="button" variant="outline" onClick={retake}>
              {labels.retake}
            </Button>
            <Button type="button" onClick={confirm}>
              {labels.confirm}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={takeSnapshot} disabled={Boolean(error)}>
            {labels.capture}
          </Button>
        )}
      </div>
    </div>
  );
}
