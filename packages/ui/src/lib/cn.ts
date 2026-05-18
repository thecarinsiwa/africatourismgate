/** Fusionne des classes Tailwind (ignore les valeurs falsy). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
