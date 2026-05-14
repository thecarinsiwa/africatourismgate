/**
 * Local scratch: decode JWT payload (no verification) for debugging.
 * Run: pnpm exec tsx scratch/check-tokens.ts
 */
const sample = process.argv[2];
if (!sample) {
  console.error("Usage: pnpm exec tsx scratch/check-tokens.ts <jwt>");
  process.exit(1);
}
const [, payload] = sample.split(".");
if (!payload) {
  console.error("Invalid JWT format");
  process.exit(1);
}
const json = Buffer.from(payload, "base64url").toString("utf8");
console.log(JSON.stringify(JSON.parse(json), null, 2));
