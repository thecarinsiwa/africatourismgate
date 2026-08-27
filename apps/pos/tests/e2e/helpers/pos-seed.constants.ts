export const SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

export const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
export const SEED_ORG_ATG_NAME = 'Africa Tourism Gate';
export const SEED_ORG_GUICHET_NAME = 'Kinshasa Guichet Est';

/** Dates stables pour dispo chambre (hors conflits seed 2026). */
export const E2E_ROOM_STAY_START = '2099-12-01';
/** Date de fin alignée sur test-pos-sale-cash.mjs (même jour). */
export const E2E_ROOM_STAY_END = E2E_ROOM_STAY_START;
