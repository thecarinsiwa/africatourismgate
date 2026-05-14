/**
 * Local scratch: print role names from env or placeholder.
 * Run: pnpm exec tsx scratch/debug-roles.ts
 */
const roles = (process.env.DEBUG_ROLES ?? "admin,support,customer").split(",");
console.log("Roles:", roles);
