import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ACTIVITIES_VIEW_MODE_STORAGE_KEY,
  DEFAULT_ACTIVITIES_VIEW_MODE,
  isActivitiesViewMode,
} from './view-mode';

test('default activities view mode is list', () => {
  assert.equal(DEFAULT_ACTIVITIES_VIEW_MODE, 'list');
});

test('storage key matches issue contract', () => {
  assert.equal(ACTIVITIES_VIEW_MODE_STORAGE_KEY, 'activities.viewMode');
});

test('isActivitiesViewMode accepts only grid/list/table', () => {
  assert.ok(isActivitiesViewMode('grid'));
  assert.ok(isActivitiesViewMode('list'));
  assert.ok(isActivitiesViewMode('table'));
  assert.ok(!isActivitiesViewMode('cards'));
  assert.ok(!isActivitiesViewMode(null));
});
