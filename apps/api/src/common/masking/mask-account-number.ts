/** Mask account number, keeping last 4 alphanumeric characters (e.g. ****7890). */
export function maskAccountNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '****';
  const alnum = trimmed.replace(/\s/g, '');
  if (alnum.length <= 4) {
    return '*'.repeat(Math.max(0, alnum.length - 1)) + alnum.slice(-1);
  }
  return `****${alnum.slice(-4)}`;
}

export function containsMaskChars(value: string): boolean {
  return value.includes('*');
}
