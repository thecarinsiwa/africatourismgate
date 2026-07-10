export function isGmailAddress(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at === -1) {
    return false;
  }
  return normalized.slice(at + 1) === 'gmail.com';
}
