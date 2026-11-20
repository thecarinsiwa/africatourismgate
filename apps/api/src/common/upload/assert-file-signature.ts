import { closeSync, existsSync, openSync, readSync, unlinkSync } from 'node:fs';
import { extname } from 'node:path';
import { BadRequestException } from '@nestjs/common';

export type DetectedUploadKind = 'jpeg' | 'png' | 'webp' | 'pdf';

const KIND_TO_MIME: Record<DetectedUploadKind, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

const KIND_TO_EXTS: Record<DetectedUploadKind, ReadonlySet<string>> = {
  jpeg: new Set(['.jpg', '.jpeg']),
  png: new Set(['.png']),
  webp: new Set(['.webp']),
  pdf: new Set(['.pdf']),
};

const REJECT_MESSAGE =
  'Format non accepté. Utilisez JPEG, PNG, WebP ou PDF (max 10 Mo).';

/** Detect JPEG / PNG / WebP / PDF from magic bytes. */
export function detectUploadKind(buffer: Buffer): DetectedUploadKind | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpeg';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }

  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
    return 'pdf';
  }

  return null;
}

export function readFileSignatureHead(
  file: Express.Multer.File,
  maxBytes = 16,
): Buffer {
  if (file.buffer && file.buffer.length > 0) {
    return file.buffer.subarray(0, Math.min(maxBytes, file.buffer.length));
  }

  if (file.path && existsSync(file.path)) {
    const fd = openSync(file.path, 'r');
    try {
      const buf = Buffer.alloc(maxBytes);
      const bytesRead = readSync(fd, buf, 0, maxBytes, 0);
      return buf.subarray(0, bytesRead);
    } finally {
      closeSync(fd);
    }
  }

  return Buffer.alloc(0);
}

export function removeUploadedFile(file: Express.Multer.File): void {
  if (!file.path || !existsSync(file.path)) return;
  try {
    unlinkSync(file.path);
  } catch {
    // Best-effort cleanup after rejected upload.
  }
}

/**
 * Ensures on-disk / in-memory content matches the declared extension + MIME
 * (JPEG / PNG / WebP / PDF). Deletes the temp file on failure when present.
 */
export function assertUploadContentMatchesDeclaration(
  file: Express.Multer.File,
): void {
  const extension = extname(file.originalname || '').toLowerCase();
  const head = readFileSignatureHead(file);
  const kind = detectUploadKind(head);

  if (!kind || !KIND_TO_EXTS[kind].has(extension)) {
    removeUploadedFile(file);
    throw new BadRequestException(REJECT_MESSAGE);
  }

  if (file.mimetype && file.mimetype !== KIND_TO_MIME[kind]) {
    removeUploadedFile(file);
    throw new BadRequestException(REJECT_MESSAGE);
  }
}
