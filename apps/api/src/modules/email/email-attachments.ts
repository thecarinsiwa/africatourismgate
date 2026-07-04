import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  brandingUploadUrl,
  getApiBaseUrl,
  normalizeBrandingAssetUrl,
} from '../../common/utils/public-asset-url';

const LOGO_FILENAMES = ['atg-logo.png', 'atg-email-logo.png'];
/** URL HTTPS publique du logo (inline dans le HTML, jamais en pièce jointe). */
const PRODUCTION_LOGO_URL =
  'https://app-africatourismgate.org/api/email-assets/atg-logo.png';
const PRODUCTION_LOGO_FALLBACK =
  'https://app-africatourismgate.org/api/uploads/branding/1779898371337-64a7d630-0e1c-4e0e-8813-baa68e6dd1ba.png';

function brandingUploadsDir(): string {
  return join(process.cwd(), 'uploads', 'branding');
}

/** Extrait le nom de fichier depuis une URL ou un chemin de logo branding. */
export function extractBrandingUploadFilename(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /\/uploads\/branding\/([^/?#]+)$/i,
    /\/api\/uploads\/branding\/([^/?#]+)$/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(trimmed);
    if (match?.[1]) return match[1];
  }

  try {
    const parsed = new URL(trimmed);
    for (const pattern of patterns) {
      const match = pattern.exec(parsed.pathname);
      if (match?.[1]) return match[1];
    }
  } catch {
    // not a full URL
  }

  return null;
}

/** Chemin local d'un logo branding à partir de son URL publique. */
export function resolveLogoFilePathFromUrl(logoUrl?: string | null): string | null {
  if (!logoUrl?.trim()) {
    return null;
  }

  const filename = extractBrandingUploadFilename(logoUrl);
  if (filename) {
    const path = join(brandingUploadsDir(), filename);
    if (existsSync(path)) return path;
  }

  return null;
}

/**
 * Résout le logo pour inclusion dans un PDF (fichier local, fetch distant, ou fallback).
 */
export async function resolveLogoForPdf(
  logoUrl?: string | null,
): Promise<string | Buffer | null> {
  const local = resolveLogoFilePathFromUrl(logoUrl);
  if (local) return local;

  if (logoUrl?.trim()) {
    const remoteUrl = normalizeBrandingAssetUrl(logoUrl) ?? logoUrl.trim();
    try {
      const response = await fetch(remoteUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 0) return buffer;
      }
    } catch {
      // optional remote logo
    }
  }

  return resolveLogoFilePath();
}

function latestBrandingPngFilename(): string | null {
  const dir = brandingUploadsDir();
  if (!existsSync(dir)) return null;

  const pngs = readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .map((name) => ({ name, path: join(dir, name) }))
    .filter(({ path }) => existsSync(path))
    .sort((a, b) => statSync(b.path).mtimeMs - statSync(a.path).mtimeMs);

  return pngs[0]?.name ?? null;
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * URL publique du logo (pas de pièce jointe CID — affichage inline dans le HTML).
 * Gmail et autres clients doivent pouvoir charger l'image via HTTPS.
 */
export function resolveEmailLogoUrl(): string {
  const explicit = normalizeBrandingAssetUrl(process.env.EMAIL_LOGO_URL);
  if (explicit && !isLocalhostUrl(explicit)) return explicit;

  const apiBase = getApiBaseUrl();
  if (!isLocalhostUrl(apiBase)) {
    const uploaded = latestBrandingPngFilename();
    if (uploaded) return brandingUploadUrl(uploaded);
    return `${apiBase}/email-assets/atg-logo.png`;
  }

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim()?.replace(/\/$/, '');
  if (webUrl && !isLocalhostUrl(webUrl)) {
    return `${webUrl}/branding/atg-logo.png`;
  }

  // Envoi depuis localhost vers de vraies boîtes : image sur le serveur de prod
  return PRODUCTION_LOGO_FALLBACK;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Logo compact pour l'en-tête e-mail (cercle, ~44px), chargé via URL publique. */
export function emailLogoImgHtml(
  alt = 'Africa Tourism Gate',
  size = 44,
  logoUrl?: string,
): string {
  const src = escapeHtmlAttr(logoUrl ?? resolveEmailLogoUrl());
  const safeAlt = escapeHtmlAttr(alt);
  return `<img src="${src}" alt="${safeAlt}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;max-width:${size}px;border-radius:50%;object-fit:cover;border:0;outline:none;text-decoration:none;" />`;
}

/** Chemin local du fichier logo (copie vers uploads / assets statiques API). */
export function resolveLogoFilePath(): string | null {
  const envPath = process.env.EMAIL_LOGO_PATH?.trim();
  if (envPath && existsSync(envPath)) return envPath;

  const uploaded = latestBrandingPngFilename();
  if (uploaded) return join(brandingUploadsDir(), uploaded);

  const roots = [
    join(process.cwd(), 'src', 'modules', 'email', 'assets'),
    join(process.cwd(), 'apps', 'api', 'src', 'modules', 'email', 'assets'),
    join(__dirname, 'assets'),
  ];

  for (const root of roots) {
    for (const name of LOGO_FILENAMES) {
      const path = join(root, name);
      if (existsSync(path)) return path;
    }
  }

  return null;
}

export function getEmailAssetsDir(): string | null {
  const roots = [
    join(process.cwd(), 'dist', 'modules', 'email', 'assets'),
    join(process.cwd(), 'src', 'modules', 'email', 'assets'),
    join(process.cwd(), 'apps', 'api', 'dist', 'modules', 'email', 'assets'),
    join(process.cwd(), 'apps', 'api', 'src', 'modules', 'email', 'assets'),
  ];
  for (const root of roots) {
    if (existsSync(root)) return root;
  }
  return null;
}
