import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWebHelpLinkPathPrefixes,
  isAllowedWebHelpHref,
  linkifyWebHelpPlainPaths,
  normalizeWebHelpLinkHref,
  parseWebHelpRichText,
  stripWebHelpMarkdownLinks,
} from './web-path-links';

test('normalizeWebHelpLinkHref accepts clean relative paths', () => {
  assert.equal(normalizeWebHelpLinkHref('/booking/cart'), '/booking/cart');
  assert.equal(normalizeWebHelpLinkHref('/account/'), '/account');
  assert.equal(normalizeWebHelpLinkHref('  /support/booking  '), '/support/booking');
});

test('normalizeWebHelpLinkHref rejects unsafe hrefs', () => {
  assert.equal(normalizeWebHelpLinkHref('https://evil.example/x'), null);
  assert.equal(normalizeWebHelpLinkHref('//cdn.example/x'), null);
  assert.equal(normalizeWebHelpLinkHref('/booking/cart?x=1'), null);
  assert.equal(normalizeWebHelpLinkHref('/booking/cart#top'), null);
  assert.equal(normalizeWebHelpLinkHref('/foo/../bar'), null);
  assert.equal(normalizeWebHelpLinkHref('booking/cart'), null);
});

test('isAllowedWebHelpHref respects allowlist prefixes', () => {
  assert.equal(isAllowedWebHelpHref('/booking/cart'), true);
  assert.equal(isAllowedWebHelpHref('/account/reservations'), true);
  assert.equal(isAllowedWebHelpHref('/support'), true);
  assert.equal(isAllowedWebHelpHref('/hotels'), true);
  assert.equal(isAllowedWebHelpHref('/admin'), false);
  assert.equal(isAllowedWebHelpHref('/api/users'), false);
});

test('getWebHelpLinkPathPrefixes is longest-first and unique', () => {
  const prefixes = getWebHelpLinkPathPrefixes();
  assert.ok(prefixes.includes('/support'));
  assert.ok(prefixes.includes('/booking'));
  for (let i = 1; i < prefixes.length; i += 1) {
    assert.ok(prefixes[i - 1]!.length >= prefixes[i]!.length);
  }
});

test('stripWebHelpMarkdownLinks keeps label and path searchable', () => {
  assert.equal(
    stripWebHelpMarkdownLinks('Voir [le panier](/booking/cart) puis payer.'),
    'Voir le panier /booking/cart puis payer.',
  );
  assert.equal(stripWebHelpMarkdownLinks(''), '');
  assert.equal(
    stripWebHelpMarkdownLinks('[x](https://evil.example)'),
    'x https://evil.example',
  );
});

test('linkifyWebHelpPlainPaths auto-links allowlisted bare paths', () => {
  const segments = linkifyWebHelpPlainPaths(
    'Ouvrez /booking/cart (ou /account) ensuite.',
  );
  const links = segments.filter((s) => s.type === 'link');
  assert.equal(links.length, 2);
  assert.deepEqual(links[0], {
    type: 'link',
    text: '/booking/cart',
    href: '/booking/cart',
  });
  assert.deepEqual(links[1], {
    type: 'link',
    text: '/account',
    href: '/account',
  });
});

test('parseWebHelpRichText parses markdown and bare paths', () => {
  const segments = parseWebHelpRichText(
    'Allez au [panier](/booking/cart) ou /support.',
  );
  assert.ok(segments.some((s) => s.type === 'link' && s.href === '/booking/cart'));
  assert.ok(segments.some((s) => s.type === 'link' && s.href === '/support'));
  const cart = segments.find(
    (s) => s.type === 'link' && s.href === '/booking/cart',
  );
  assert.equal(cart?.type === 'link' ? cart.text : null, 'panier');
});

test('parseWebHelpRichText keeps unsafe markdown as readable text', () => {
  const segments = parseWebHelpRichText('Voir [docs](https://evil.example).');
  assert.ok(segments.every((s) => s.type === 'text'));
  assert.ok(
    segments.some((s) => s.type === 'text' && s.text.includes('docs')),
  );
});
