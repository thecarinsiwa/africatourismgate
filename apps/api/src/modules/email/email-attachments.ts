import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import {
  brandingUploadUrl,
  getApiBaseUrl,
  normalizeBrandingAssetUrl,
} from '../../common/utils/public-asset-url';

const logger = new Logger('EmailAttachments');

const LOGO_FILENAMES = ['atg-logo.png', 'atg-email-logo.png'];
const LOGO_FETCH_TIMEOUT_MS = 5_000;
const PRODUCTION_LOGO_FALLBACK =
  'https://app-africatourismgate.org/api/uploads/branding/1779898371337-64a7d630-0e1c-4e0e-8813-baa68e6dd1ba.png';

function brandingUploadsDirs(): string[] {
  return [
    join(process.cwd(), 'uploads', 'branding'),
    join(process.cwd(), 'apps', 'api', 'uploads', 'branding'),
  ];
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
  if (!filename) {
    return null;
  }

  for (const dir of brandingUploadsDirs()) {
    const path = join(dir, filename);
    if (existsSync(path)) return path;
  }

  return null;
}

async function fetchLogoBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(LOGO_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      logger.warn(`Logo PDF: fetch HTTP ${response.status} pour ${url}`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      logger.warn(`Logo PDF: buffer vide pour ${url}`);
      return null;
    }
    return buffer;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Logo PDF: fetch échoué pour ${url} — ${message}`);
    return null;
  }
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
    const remote = await fetchLogoBuffer(remoteUrl);
    if (remote) return remote;
    logger.warn(
      `Logo PDF: fichier local introuvable pour branding URL « ${logoUrl.trim()} »`,
    );
  }

  const envLogoUrl = normalizeBrandingAssetUrl(process.env.EMAIL_LOGO_URL);
  if (envLogoUrl && !isLocalhostUrl(envLogoUrl)) {
    const envRemote = await fetchLogoBuffer(envLogoUrl);
    if (envRemote) return envRemote;
  }

  const fallback = resolveLogoFilePath();
  if (!fallback) {
    logger.warn(
      'Logo PDF: aucun logo résolu (local, remote, EMAIL_LOGO_URL, assets) — PDF sans logo',
    );
  }
  return fallback;
}

function latestBrandingPngFilename(): string | null {
  const candidates: Array<{ name: string; path: string; mtimeMs: number }> = [];

  for (const dir of brandingUploadsDirs()) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.toLowerCase().endsWith('.png')) continue;
      const path = join(dir, name);
      if (!existsSync(path)) continue;
      candidates.push({ name, path, mtimeMs: statSync(path).mtimeMs });
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.name ?? null;
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

/** Chemins candidats pour les assets logo email (cwd monorepo, apps/api, dist). */
function logoAssetRoots(): string[] {
  return [
    join(process.cwd(), 'src', 'modules', 'email', 'assets'),
    join(process.cwd(), 'dist', 'modules', 'email', 'assets'),
    join(process.cwd(), 'apps', 'api', 'src', 'modules', 'email', 'assets'),
    join(process.cwd(), 'apps', 'api', 'dist', 'modules', 'email', 'assets'),
    join(__dirname, 'assets'),
    join(__dirname, '..', 'assets'),
  ];
}

/** Chemin local du fichier logo (copie vers uploads / assets statiques API). */
export function resolveLogoFilePath(): string | null {
  const envPath = process.env.EMAIL_LOGO_PATH?.trim();
  if (envPath && existsSync(envPath)) return envPath;

  const uploaded = latestBrandingPngFilename();
  if (uploaded) {
    for (const dir of brandingUploadsDirs()) {
      const path = join(dir, uploaded);
      if (existsSync(path)) return path;
    }
  }

  for (const root of logoAssetRoots()) {
    for (const name of LOGO_FILENAMES) {
      const path = join(root, name);
      if (existsSync(path)) return path;
    }
  }

  return null;
}

export function getEmailAssetsDir(): string | null {
  for (const root of logoAssetRoots()) {
    if (existsSync(root)) return root;
  }
  return null;
}
