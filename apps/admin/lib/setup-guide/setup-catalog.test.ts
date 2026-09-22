import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SETUP_MODULE_IDS,
  SETUP_MODULES,
  getAllSetupSteps,
  getSetupListResourcesUsed,
  getSetupModuleById,
  getSetupModulesInOrder,
} from './setup-catalog';
import {
  createEmptySetupReadinessSnapshot,
  parsePaginatedTotal,
} from './setup-readiness';
import {
  buildSetupGuideProgress,
  evaluateSetupStepStatus,
  isSetupModuleLocked,
  isSetupModuleReady,
} from './setup-progress';
import type { SetupReadinessSnapshot } from './setup-readiness';
import type { SetupListResource } from './setup-catalog';

test('catalogue: 11 modules ordered 0–10 with stable ids', () => {
  const modules = getSetupModulesInOrder();
  assert.equal(modules.length, 11);
  assert.deepEqual(
    modules.map((m) => m.id),
    [...SETUP_MODULE_IDS],
  );
  modules.forEach((setupModule, index) => {
    assert.equal(setupModule.order, index);
  });
});

test('catalogue: dependsOnModuleIds reference earlier modules only', () => {
  const indexById = new Map(
    SETUP_MODULES.map((setupModule, index) => [setupModule.id, index]),
  );

  for (const setupModule of SETUP_MODULES) {
    for (const parentId of setupModule.dependsOnModuleIds) {
      assert.ok(
        indexById.has(parentId),
        `${setupModule.id} depends on unknown ${parentId}`,
      );
      assert.ok(
        (indexById.get(parentId) ?? -1) <
          (indexById.get(setupModule.id) ?? -1),
        `${setupModule.id} must depend on an earlier module than itself`,
      );
    }
  }

  assert.deepEqual(getSetupModuleById('platform')?.dependsOnModuleIds, []);
  assert.deepEqual(getSetupModuleById('destinations')?.dependsOnModuleIds, [
    'platform',
  ]);
  assert.deepEqual(getSetupModuleById('accommodations')?.dependsOnModuleIds, [
    'destinations',
  ]);
  assert.deepEqual(getSetupModuleById('packages')?.dependsOnModuleIds, [
    'accommodations',
    'flights',
    'vehicles',
    'cruises',
    'activities',
  ]);
});

test('catalogue: step ids unique; listHref present; list resources covered', () => {
  const steps = getAllSetupSteps();
  const ids = steps.map((step) => step.id);
  assert.equal(new Set(ids).size, ids.length);

  for (const step of steps) {
    assert.ok(step.listHref.startsWith('/'), step.id);
    assert.ok(step.titleKey.startsWith('steps.'), step.id);
    assert.ok(step.helpKey.startsWith('steps.'), step.id);
  }

  const resources = getSetupListResourcesUsed();
  assert.ok(resources.includes('destinations'));
  assert.ok(resources.includes('properties'));
  assert.ok(resources.length >= 20);
});

test('parsePaginatedTotal: accepts finite non-negative totals', () => {
  assert.equal(parsePaginatedTotal({ meta: { total: 0 } }), 0);
  assert.equal(parsePaginatedTotal({ meta: { total: 12 } }), 12);
  assert.equal(parsePaginatedTotal({ meta: { total: 3.9 } }), 3);
});

test('parsePaginatedTotal: rejects invalid meta.total', () => {
  assert.throws(() => parsePaginatedTotal({ meta: { total: -1 } }));
  assert.throws(() => parsePaginatedTotal({ meta: { total: Number.NaN } }));
  assert.throws(() =>
    parsePaginatedTotal({ meta: { total: Number.POSITIVE_INFINITY } }),
  );
  assert.throws(() =>
    parsePaginatedTotal({ meta: { total: '1' as unknown as number } }),
  );
});

function fillSnapshot(overrides: {
  totals?: Partial<Record<SetupListResource, number | null>>;
  settings?: Partial<SetupReadinessSnapshot['settings']>;
}): SetupReadinessSnapshot {
  const snapshot = createEmptySetupReadinessSnapshot();
  if (overrides.totals) {
    for (const [key, value] of Object.entries(overrides.totals)) {
      snapshot.totals[key as SetupListResource] = value;
    }
  }
  if (overrides.settings) {
    for (const [key, value] of Object.entries(overrides.settings)) {
      snapshot.settings[key as keyof SetupReadinessSnapshot['settings']] =
        value;
    }
  }
  return snapshot;
}

test('evaluateSetupStepStatus: empty / ready / unknown for listTotal', () => {
  const check = {
    kind: 'listTotal' as const,
    resource: 'destinations' as const,
    min: 1,
  };

  assert.equal(
    evaluateSetupStepStatus(check, fillSnapshot({ totals: { destinations: null } }))
      .status,
    'unknown',
  );
  assert.equal(
    evaluateSetupStepStatus(check, fillSnapshot({ totals: { destinations: 0 } }))
      .status,
    'empty',
  );
  assert.equal(
    evaluateSetupStepStatus(check, fillSnapshot({ totals: { destinations: 1 } }))
      .status,
    'ready',
  );
});

test('evaluateSetupStepStatus: settingsFlag payment methods', () => {
  const check = {
    kind: 'settingsFlag' as const,
    path: 'booking.payment_methods' as const,
  };

  assert.equal(
    evaluateSetupStepStatus(
      check,
      fillSnapshot({ settings: { 'booking.payment_methods': null } }),
    ).status,
    'unknown',
  );
  assert.equal(
    evaluateSetupStepStatus(
      check,
      fillSnapshot({ settings: { 'booking.payment_methods': false } }),
    ).status,
    'empty',
  );
  assert.equal(
    evaluateSetupStepStatus(
      check,
      fillSnapshot({ settings: { 'booking.payment_methods': true } }),
    ).status,
    'ready',
  );
});

test('dependsOn: destinations locked until platform ready', () => {
  const emptyProgress = buildSetupGuideProgress(
    fillSnapshot({
      totals: {
        organizations: 0,
        amenities: 0,
        vehicleCategories: 0,
      },
    }),
  );

  const platform = emptyProgress.modules.find((m) => m.module.id === 'platform');
  const destinations = emptyProgress.modules.find(
    (m) => m.module.id === 'destinations',
  );

  assert.ok(platform);
  assert.ok(destinations);
  assert.equal(platform.lockState, 'unlocked');
  assert.equal(platform.isReady, false);
  assert.equal(destinations.lockState, 'locked');

  const readyById = new Map(
    emptyProgress.modules.map((item) => [item.module.id, item.isReady]),
  );
  assert.equal(
    isSetupModuleLocked(destinations.module, readyById),
    true,
  );
});

test('dependsOn: destinations unlocks when platform steps are ready', () => {
  const progress = buildSetupGuideProgress(
    fillSnapshot({
      totals: {
        organizations: 1,
        amenities: 1,
        vehicleCategories: 1,
        destinations: 0,
        pointsOfInterest: 0,
      },
    }),
  );

  const platform = progress.modules.find((m) => m.module.id === 'platform');
  const destinations = progress.modules.find(
    (m) => m.module.id === 'destinations',
  );

  assert.ok(platform);
  assert.ok(destinations);
  assert.equal(platform.lockState, 'complete');
  assert.equal(platform.isReady, true);
  assert.equal(destinations.lockState, 'unlocked');
  assert.equal(destinations.isReady, false);
});

test('isSetupModuleReady: unknown blocks readiness', () => {
  assert.equal(
    isSetupModuleReady([
      {
        step: getAllSetupSteps()[0]!,
        status: 'ready',
        total: 1,
        min: 1,
      },
      {
        step: getAllSetupSteps()[1]!,
        status: 'unknown',
        total: null,
        min: 1,
      },
    ]),
    false,
  );
});

test('buildSetupGuideProgress: percentComplete floors ready ratio', () => {
  const progress = buildSetupGuideProgress(
    fillSnapshot({
      totals: {
        organizations: 1,
        amenities: 1,
        vehicleCategories: 1,
      },
      settings: { 'booking.payment_methods': false },
    }),
  );

  assert.equal(progress.readyStepCount, 3);
  assert.ok(progress.totalStepCount > 3);
  assert.equal(
    progress.percentComplete,
    Math.floor((3 / progress.totalStepCount) * 100),
  );
});
