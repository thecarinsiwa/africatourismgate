import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSiteSearchToggleShortcut,
  shouldHandleSiteSearchShortcut,
} from './shortcuts';

type FakeKeyEvent = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  target?: EventTarget | null;
};

function asKeyboardEvent(partial: FakeKeyEvent): KeyboardEvent {
  return {
    key: partial.key,
    ctrlKey: partial.ctrlKey ?? false,
    metaKey: partial.metaKey ?? false,
    altKey: partial.altKey ?? false,
    shiftKey: partial.shiftKey ?? false,
    defaultPrevented: partial.defaultPrevented ?? false,
    target: partial.target ?? null,
  } as KeyboardEvent;
}

test('isSiteSearchToggleShortcut accepts Ctrl/Meta+K', () => {
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: 'k', ctrlKey: true })),
    true,
  );
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: 'K', metaKey: true })),
    true,
  );
  assert.equal(
    isSiteSearchToggleShortcut(
      asKeyboardEvent({ key: 'k', ctrlKey: true, shiftKey: true }),
    ),
    false,
  );
  assert.equal(
    isSiteSearchToggleShortcut(
      asKeyboardEvent({ key: 'k', ctrlKey: true, defaultPrevented: true }),
    ),
    false,
  );
});

test('isSiteSearchToggleShortcut accepts bare slash', () => {
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: '/' })),
    true,
  );
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: '/', shiftKey: true })),
    true,
  );
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: '/', ctrlKey: true })),
    false,
  );
});

test('isSiteSearchToggleShortcut ignores missing or empty key', () => {
  assert.equal(
    isSiteSearchToggleShortcut(
      asKeyboardEvent({ key: undefined as unknown as string }),
    ),
    false,
  );
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: '' })),
    false,
  );
});

test('isSiteSearchToggleShortcut never captures Ctrl/Meta+F', () => {
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: 'f', ctrlKey: true })),
    false,
  );
  assert.equal(
    isSiteSearchToggleShortcut(asKeyboardEvent({ key: 'f', metaKey: true })),
    false,
  );
});

test('shouldHandleSiteSearchShortcut opens when closed and not in a field', () => {
  assert.equal(
    shouldHandleSiteSearchShortcut(
      asKeyboardEvent({ key: 'k', ctrlKey: true }),
      { searchOpen: false },
    ),
    true,
  );
  assert.equal(
    shouldHandleSiteSearchShortcut(asKeyboardEvent({ key: '/' }), {
      searchOpen: false,
    }),
    true,
  );
});

test('shouldHandleSiteSearchShortcut always handles when search is open', () => {
  assert.equal(
    shouldHandleSiteSearchShortcut(
      asKeyboardEvent({ key: 'k', metaKey: true }),
      { searchOpen: true },
    ),
    true,
  );
  assert.equal(
    shouldHandleSiteSearchShortcut(asKeyboardEvent({ key: '/' }), {
      searchOpen: true,
    }),
    true,
  );
});

test('shouldHandleSiteSearchShortcut ignores when focus is in an editable field', () => {
  if (typeof HTMLElement === 'undefined') {
    // Node sans DOM : isEditableKeyboardTarget est un no-op → skip.
    return;
  }

  const input = document.createElement('input');
  assert.equal(
    shouldHandleSiteSearchShortcut(
      asKeyboardEvent({ key: '/', target: input }),
      { searchOpen: false },
    ),
    false,
  );
  assert.equal(
    shouldHandleSiteSearchShortcut(
      asKeyboardEvent({ key: 'k', ctrlKey: true, target: input }),
      { searchOpen: false },
    ),
    false,
  );
});
