export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isStripeConfigured(): boolean {
  return getStripePublishableKey() !== null;
}
