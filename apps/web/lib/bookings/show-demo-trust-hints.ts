/**
 * Demo-catalogue trust hint is for local/preview only.
 * Enable explicitly on staging via NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS=true.
 */
export function shouldShowDemoTrustHints(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.NODE_ENV === 'development') return true;
  return env.NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS === 'true';
}
