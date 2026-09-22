import test from 'node:test';
import assert from 'node:assert/strict';
import { splitWebHelpHighlightSegments } from './highlight';

test('splitWebHelpHighlightSegments returns plain text when query empty', () => {
  assert.deepEqual(splitWebHelpHighlightSegments('Paiement carte', ''), [
    { text: 'Paiement carte', match: false },
  ]);
});

test('splitWebHelpHighlightSegments marks ascii matches', () => {
  const segments = splitWebHelpHighlightSegments(
    'Panier et parcours de paiement',
    'panier',
  );
  assert.ok(segments.some((s) => s.match && s.text.toLowerCase() === 'panier'));
  assert.ok(segments.some((s) => !s.match));
});

test('splitWebHelpHighlightSegments ignores accents when matching', () => {
  const segments = splitWebHelpHighlightSegments(
    'Récapitulatif de paiement',
    'recapitulatif',
  );
  const matched = segments.filter((s) => s.match).map((s) => s.text).join('');
  assert.equal(matched, 'Récapitulatif');
});

test('splitWebHelpHighlightSegments finds multiple matches', () => {
  const segments = splitWebHelpHighlightSegments('cart then cart again', 'cart');
  assert.equal(segments.filter((s) => s.match).length, 2);
});
