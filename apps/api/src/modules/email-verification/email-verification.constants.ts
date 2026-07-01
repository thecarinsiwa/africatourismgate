export const OPERATION_CODE_TTL_SECONDS = Number(
  process.env.EMAIL_OPERATION_CODE_TTL ?? 900,
);

export const OPERATION_CODE_LENGTH = 6;

export const ABANDONMENT_REMINDER_DELAY_MINUTES = Number(
  process.env.EMAIL_ABANDONMENT_REMINDER_MINUTES ?? 30,
);

export const INVALID_VERIFICATION_CODE_MESSAGE =
  'Code de vérification invalide ou expiré.';
