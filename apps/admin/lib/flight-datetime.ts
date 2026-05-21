/** ISO → value for `<input type="datetime-local" />` */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local → ISO string for API */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
