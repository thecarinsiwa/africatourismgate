import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isSafeHttpUrl, safeCssUrl, safeHref } from './urls';

describe('isSafeHttpUrl / safeHref', () => {
  test('accepts relative paths and http(s) URLs', () => {
    assert.equal(safeHref('/hotels'), '/hotels');
    assert.equal(safeHref('/api/uploads/a.jpg'), '/api/uploads/a.jpg');
    assert.equal(safeHref('/cars?from=Goma'), '/cars?from=Goma');
    assert.equal(
      safeHref('https://cdn.example.com/img.jpg'),
      'https://cdn.example.com/img.jpg',
    );
    assert.equal(
      safeHref('http://localhost:3000/api/uploads/x.png'),
      'http://localhost:3000/api/uploads/x.png',
    );
    assert.equal(isSafeHttpUrl('https://africatourismgate.org/'), true);
  });

  test('rejects empty and non-strings', () => {
    assert.equal(safeHref(null), null);
    assert.equal(safeHref(undefined), null);
    assert.equal(safeHref(''), null);
    assert.equal(safeHref('   '), null);
    assert.equal(isSafeHttpUrl(''), false);
  });

  test('rejects javascript / data / other schemes', () => {
    assert.equal(safeHref('javascript:alert(1)'), null);
    assert.equal(safeHref('JAVASCRIPT:alert(1)'), null);
    assert.equal(safeHref('data:text/html,<script>'), null);
    assert.equal(safeHref('vbscript:msgbox(1)'), null);
    assert.equal(safeHref('blob:https://example.com/uuid'), null);
    assert.equal(safeHref('file:///etc/passwd'), null);
  });

  test('rejects protocol-relative and backslash tricks', () => {
    assert.equal(safeHref('//evil.com'), null);
    assert.equal(safeHref('/\\evil.com'), null);
    assert.equal(safeHref('https://example.com/\\x'), null);
  });

  test('rejects userinfo phishing URLs', () => {
    assert.equal(safeHref('https://evil@africatourismgate.org/'), null);
    assert.equal(safeHref('https://user:pass@cdn.example.com/a.jpg'), null);
  });

  test('rejects control characters', () => {
    assert.equal(safeHref('/path\nhttps://evil.com'), null);
    assert.equal(safeHref('https://example.com/\u0000'), null);
  });
});

describe('safeCssUrl', () => {
  test('accepts plain http(s) and relative image URLs', () => {
    assert.equal(safeCssUrl('/uploads/hero.jpg'), '/uploads/hero.jpg');
    assert.equal(
      safeCssUrl('https://cdn.example.com/photo.webp'),
      'https://cdn.example.com/photo.webp',
    );
  });

  test('rejects CSS url() breakout characters', () => {
    assert.equal(safeCssUrl('https://evil.com/x")'), null);
    assert.equal(safeCssUrl("https://evil.com/x')"), null);
    assert.equal(safeCssUrl('https://evil.com/x)'), null);
    assert.equal(safeCssUrl('https://evil.com/x(y)'), null);
  });

  test('rejects unsafe schemes like safeHref', () => {
    assert.equal(safeCssUrl('javascript:alert(1)'), null);
    assert.equal(safeCssUrl('//evil.com/a.jpg'), null);
  });
});
