import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertUploadContentMatchesDeclaration,
  detectUploadKind,
} from './assert-file-signature';

function multerFile(partial: {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: partial.originalname,
    encoding: '7bit',
    mimetype: partial.mimetype,
    size: partial.buffer.length,
    buffer: partial.buffer,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as unknown as Express.Multer.File['stream'],
  };
}

describe('detectUploadKind', () => {
  it('detects JPEG / PNG / WebP / PDF', () => {
    assert.equal(detectUploadKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpeg');
    assert.equal(
      detectUploadKind(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
      'png',
    );
    const webp = Buffer.alloc(12);
    webp.write('RIFF', 0, 'ascii');
    webp.writeUInt32LE(4, 4);
    webp.write('WEBP', 8, 'ascii');
    assert.equal(detectUploadKind(webp), 'webp');
    assert.equal(detectUploadKind(Buffer.from('%PDF-1.4')), 'pdf');
  });

  it('returns null for text disguised as image', () => {
    assert.equal(detectUploadKind(Buffer.from('not an image')), null);
    assert.equal(detectUploadKind(Buffer.from('')), null);
  });
});

describe('assertUploadContentMatchesDeclaration', () => {
  it('accepts matching PDF content', () => {
    assert.doesNotThrow(() =>
      assertUploadContentMatchesDeclaration(
        multerFile({
          originalname: 'proof.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('%PDF-1.7\n%âãÏÓ\n'),
        }),
      ),
    );
  });

  it('rejects text file renamed as .pdf', () => {
    assert.throws(
      () =>
        assertUploadContentMatchesDeclaration(
          multerFile({
            originalname: 'fake.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('hello world'),
          }),
        ),
      (err: unknown) =>
        err instanceof Error && /Format non accepté/.test(err.message),
    );
  });

  it('rejects JPEG bytes with .png extension', () => {
    assert.throws(
      () =>
        assertUploadContentMatchesDeclaration(
          multerFile({
            originalname: 'photo.png',
            mimetype: 'image/png',
            buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
          }),
        ),
      (err: unknown) =>
        err instanceof Error && /Format non accepté/.test(err.message),
    );
  });
});
