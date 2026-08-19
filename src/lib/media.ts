/**
 * Media URL resolver.
 * Converts private Cloudflare R2 keys (e.g. r2://exclusive/trailer.mp4 or private://...)
 * into secure, authenticated streaming endpoints (/api/media/stream?key=...).
 */
export function resolveMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();

  if (trimmed.startsWith('r2://') || trimmed.startsWith('private://') || trimmed.startsWith('r2:')) {
    const cleanKey = trimmed.replace(/^(r2:\/\/|private:\/\/|r2:)/i, '');
    return `/api/media/stream?key=${encodeURIComponent(cleanKey)}`;
  }

  return trimmed;
}
