/**
 * Logique pure de progression « Mise en route ».
 * Entrée : catalogue + snapshot readiness (totaux / flags, null = erreur).
 */

import {
  SETUP_MODULES,
  type SetupModule,
  type SetupModuleId,
  type SetupStep,
  type SetupStepCheck,
} from './setup-catalog';
import type { SetupReadinessSnapshot } from './setup-readiness';

/** Statut d’une étape catalogue. */
export type SetupStepStatus = 'empty' | 'ready' | 'unknown';

/** État d’un module pour la nav / verrous. */
export type SetupModuleLockState = 'locked' | 'unlocked' | 'complete';

export type SetupStepProgress = {
  step: SetupStep;
  status: SetupStepStatus;
  /** Compteur listTotal si connu ; null si settingsFlag ou erreur. */
  total: number | null;
  min: number | null;
};

export type SetupModuleProgress = {
  module: SetupModule;
  steps: readonly SetupStepProgress[];
  /** Toutes les étapes du module sont `ready`. */
  isReady: boolean;
  /** Au moins une étape `unknown` (et aucune empty bloquante pour isReady). */
  hasUnknown: boolean;
  lockState: SetupModuleLockState;
  /** Étapes ready / total dans le module. */
  readyCount: number;
  stepCount: number;
};

export type SetupGuideProgress = {
  modules: readonly SetupModuleProgress[];
  /** Étapes ready / toutes les étapes du catalogue. */
  readyStepCount: number;
  totalStepCount: number;
  /** Pourcentage 0–100 (floor). */
  percentComplete: number;
};

function evaluateListTotal(
  check: Extract<SetupStepCheck, { kind: 'listTotal' }>,
  snapshot: SetupReadinessSnapshot,
): { status: SetupStepStatus; total: number | null } {
  const total = snapshot.totals[check.resource];
  if (total == null) {
    return { status: 'unknown', total: null };
  }
  return {
    status: total >= check.min ? 'ready' : 'empty',
    total,
  };
}

function evaluateSettingsFlag(
  check: Extract<SetupStepCheck, { kind: 'settingsFlag' }>,
  snapshot: SetupReadinessSnapshot,
): { status: SetupStepStatus; total: number | null } {
  const enabled = snapshot.settings[check.path];
  if (enabled == null) {
    return { status: 'unknown', total: null };
  }
  return {
    status: enabled ? 'ready' : 'empty',
    total: null,
  };
}

/** Statut d’une étape à partir du snapshot (sans notion de verrou). */
export function evaluateSetupStepStatus(
  check: SetupStepCheck,
  snapshot: SetupReadinessSnapshot,
): { status: SetupStepStatus; total: number | null; min: number | null } {
  if (check.kind === 'listTotal') {
    const result = evaluateListTotal(check, snapshot);
    return { ...result, min: check.min };
  }
  const result = evaluateSettingsFlag(check, snapshot);
  return { ...result, min: null };
}

export function buildSetupStepProgress(
  step: SetupStep,
  snapshot: SetupReadinessSnapshot,
): SetupStepProgress {
  const { status, total, min } = evaluateSetupStepStatus(step.check, snapshot);
  return { step, status, total, min };
}

/**
 * Un module est « prêt » (prérequis satisfait) si toutes ses étapes sont `ready`.
 * Une étape `unknown` empêche le prêt (verrouille les dépendants).
 */
export function isSetupModuleReady(
  steps: readonly SetupStepProgress[],
): boolean {
  if (steps.length === 0) {
    return true;
  }
  return steps.every((item) => item.status === 'ready');
}

/**
 * Module verrouillé si un parent direct n’est pas prêt.
 * Les parents sont évalués dans l’ordre du catalogue (DAG acyclique).
 */
export function isSetupModuleLocked(
  module: SetupModule,
  readyByModuleId: ReadonlyMap<SetupModuleId, boolean>,
): boolean {
  for (const parentId of module.dependsOnModuleIds) {
    if (!readyByModuleId.get(parentId)) {
      return true;
    }
  }
  return false;
}

export function resolveSetupModuleLockState(args: {
  locked: boolean;
  isReady: boolean;
}): SetupModuleLockState {
  if (args.locked) {
    return 'locked';
  }
  if (args.isReady) {
    return 'complete';
  }
  return 'unlocked';
}

/**
 * Construit la progression complète (modules + verrous + %).
 * Ordre des modules = `SETUP_MODULES` (ordre figé).
 */
export function buildSetupGuideProgress(
  snapshot: SetupReadinessSnapshot,
  modules: readonly SetupModule[] = SETUP_MODULES,
): SetupGuideProgress {
  const readyByModuleId = new Map<SetupModuleId, boolean>();
  const moduleProgressList: SetupModuleProgress[] = [];

  let readyStepCount = 0;
  let totalStepCount = 0;

  for (const module of modules) {
    const steps = module.steps.map((step) =>
      buildSetupStepProgress(step, snapshot),
    );
    const readyCount = steps.filter((s) => s.status === 'ready').length;
    const stepCount = steps.length;
    const isReady = isSetupModuleReady(steps);
    const hasUnknown = steps.some((s) => s.status === 'unknown');
    const locked = isSetupModuleLocked(module, readyByModuleId);
    const lockState = resolveSetupModuleLockState({ locked, isReady });

    readyByModuleId.set(module.id, isReady);

    readyStepCount += readyCount;
    totalStepCount += stepCount;

    moduleProgressList.push({
      module,
      steps,
      isReady,
      hasUnknown,
      lockState,
      readyCount,
      stepCount,
    });
  }

  const percentComplete =
    totalStepCount === 0
      ? 0
      : Math.floor((readyStepCount / totalStepCount) * 100);

  return {
    modules: moduleProgressList,
    readyStepCount,
    totalStepCount,
    percentComplete,
  };
}

export function getSetupModuleProgressById(
  progress: SetupGuideProgress,
  moduleId: string,
): SetupModuleProgress | undefined {
  return progress.modules.find((item) => item.module.id === moduleId);
}
