import { ValidationError } from 'class-validator';

export function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const [key, message] of Object.entries(error.constraints)) {
        if (key === 'whitelistValidation') {
          messages.push(`La propriété « ${error.property} » n'est pas autorisée.`);
          continue;
        }
        messages.push(message);
      }
    }

    if (error.children?.length) {
      messages.push(...formatValidationErrors(error.children));
    }
  }

  return messages;
}
