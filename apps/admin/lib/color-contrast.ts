export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const trimmed = hex.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (!match) return null;
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG 2.1 contrast ratio between two sRGB hex colors (1:1 to 21:1). */
export function getContrastRatio(foregroundHex: string, backgroundHex: string): number | null {
  const foreground = parseHex(foregroundHex);
  const background = parseHex(backgroundHex);
  if (!foreground || !background) return null;

  const foregroundLuminance = relativeLuminance(foreground.r, foreground.g, foreground.b);
  const backgroundLuminance = relativeLuminance(background.r, background.g, background.b);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrastRatio(
  ratio: number,
  minimum: number = WCAG_AA_NORMAL_TEXT_RATIO,
): boolean {
  return ratio >= minimum;
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}
