export const CRUISE_PORT_OPTIONS = [
  { code: 'CDKIN', name: 'Kinshasa Port' },
  { code: 'CDBNW', name: 'Banana Port' },
] as const;

export function formatCruisePortLabel(code: string, name?: string): string {
  if (name) return `${code} — ${name}`;
  const match = CRUISE_PORT_OPTIONS.find((port) => port.code === code);
  return match ? `${match.code} — ${match.name}` : code;
}
