import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAdminLockSessionShortcut,
  isAdminSearchToggleShortcut,
  shouldHandleAdminSearchShortcut,
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

test('isAdminSearchToggleShortcut accepts Ctrl/Meta F and K', () => {
  assert.equal(
    isAdminSearchToggleShortcut(asKeyboardEvent({ key: 'f', ctrlKey: true })),
    true,
  );
  assert.equal(
    isAdminSearchToggleShortcut(asKeyboardEvent({ key: 'K', metaKey: true })),
    true,
  );
  assert.equal(
    isAdminSearchToggleShortcut(asKeyboardEvent({ key: 'f' })),
    false,
  );
  assert.equal(
    isAdminSearchToggleShortcut(
      asKeyboardEvent({ key: 'f', ctrlKey: true, shiftKey: true }),
    ),
    false,
  );
  assert.equal(
    isAdminSearchToggleShortcut(
      asKeyboardEvent({ key: 'f', ctrlKey: true, defaultPrevented: true }),
    ),
    false,
  );
});

test('isAdminLockSessionShortcut accepts Ctrl/Meta L only', () => {
  assert.equal(
    isAdminLockSessionShortcut(asKeyboardEvent({ key: 'l', ctrlKey: true })),
    true,
  );
  assert.equal(
    isAdminLockSessionShortcut(asKeyboardEvent({ key: 'L', metaKey: true })),
    true,
  );
  assert.equal(
    isAdminLockSessionShortcut(asKeyboardEvent({ key: 'l' })),
    false,
  );
  assert.equal(
    isAdminLockSessionShortcut(
      asKeyboardEvent({ key: 'l', ctrlKey: true, shiftKey: true }),
    ),
    false,
  );
  assert.equal(
    isAdminLockSessionShortcut(
      asKeyboardEvent({ key: 'f', ctrlKey: true }),
    ),
    false,
  );
});

test('shouldHandleAdminSearchShortcut opens when closed and not in a field', () => {
  assert.equal(
    shouldHandleAdminSearchShortcut(
      asKeyboardEvent({ key: 'f', ctrlKey: true }),
      { searchOpen: false },
    ),
    true,
  );
  assert.equal(
    shouldHandleAdminSearchShortcut(
      asKeyboardEvent({ key: 'k', metaKey: true }),
      { searchOpen: false },
    ),
    true,
  );
});

test('shouldHandleAdminSearchShortcut always handles when search is open', () => {
  assert.equal(
    shouldHandleAdminSearchShortcut(
      asKeyboardEvent({ key: 'f', ctrlKey: true }),
      { searchOpen: true },
    ),
    true,
  );
});
