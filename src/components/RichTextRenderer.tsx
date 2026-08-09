'use client';

import { useState, useEffect, useMemo } from 'react';

type ParsedToken =
  | { type: 'text'; content: string }
  | { type: 'accent'; content: string }
  | { type: 'timer'; isoDate: string }
  | { type: 'chrono'; isoDate: string }
  | { type: 'date'; isoDate: string }
  | { type: 'link'; url: string; label: string }
  | { type: 'file'; url: string; label: string };

/**
 * Formats a duration in milliseconds into a string of format "Xj Xh Xm Xs".
 * Omits leading zero units (e.g., "45s", "2m 5s", "1j 2h 0m 0s").
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Formats an ISO date string into a French localized date string.
 * Example: "2026-08-08T14:30:00Z" -> "8 août 2026 à 14h30"
 *
 * @param isoDate - The ISO date string to format
 * @returns Formatted date string in French locale
 */
function formatFrenchDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const day = date.getDate();
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isoDate.includes('T') || isoDate.includes(':')) {
    return `${day} ${month} ${year} à ${hours}h${minutes}`;
  }
  return `${day} ${month} ${year}`;
}

// Regex to capture supported markup tags in the content string
const TAG_REGEX = /(<accent>[\s\S]*?<\/accent>|\[timer:[^\]]+\]|\[chrono:[^\]]+\]|\[date:[^\]]+\]|\[link:[^|\]]+\|[^\]]+\]|\[file:[^|\]]+\|[^\]]+\])/g;

/**
 * Parses a content string containing custom tags into an array of typed tokens.
 *
 * @param content - Raw text input with optional markup tags
 * @returns Array of ParsedToken objects for rendering
 */
function parseContent(content: string): ParsedToken[] {
  if (!content) return [];
  const rawSegments = content.split(TAG_REGEX);
  const tokens: ParsedToken[] = [];

  for (const segment of rawSegments) {
    if (!segment) continue;

    const accentMatch = segment.match(/^<accent>([\s\S]*?)<\/accent>$/);
    if (accentMatch) {
      tokens.push({ type: 'accent', content: accentMatch[1] });
      continue;
    }

    const timerMatch = segment.match(/^\[timer:([^\]]+)\]$/);
    if (timerMatch) {
      tokens.push({ type: 'timer', isoDate: timerMatch[1].trim() });
      continue;
    }

    const chronoMatch = segment.match(/^\[chrono:([^\]]+)\]$/);
    if (chronoMatch) {
      tokens.push({ type: 'chrono', isoDate: chronoMatch[1].trim() });
      continue;
    }

    const dateMatch = segment.match(/^\[date:([^\]]+)\]$/);
    if (dateMatch) {
      tokens.push({ type: 'date', isoDate: dateMatch[1].trim() });
      continue;
    }

    const linkMatch = segment.match(/^\[link:([^|\]]+)\|([^\]]+)\]$/);
    if (linkMatch) {
      tokens.push({ type: 'link', url: linkMatch[1].trim(), label: linkMatch[2].trim() });
      continue;
    }

    const fileMatch = segment.match(/^\[file:([^|\]]+)\|([^\]]+)\]$/);
    if (fileMatch) {
      tokens.push({ type: 'file', url: fileMatch[1].trim(), label: fileMatch[2].trim() });
      continue;
    }

    tokens.push({ type: 'text', content: segment });
  }

  return tokens;
}

function renderTextWithNewlines(text: string) {
  const lines = text.split('\n');
  return lines.flatMap((line, index) => (
    index > 0 ? [<br key={`br-${index}`} />, line] : [line]
  ));
}

function FileDownloadButton({ url, label }: { url: string; label: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      const urlFileName = url.split('/').pop()?.split('?')[0];
      link.download = urlFileName || label || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('File download fetch failed, falling back to direct link download:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = label || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:opacity-80 transition-opacity text-[var(--color-text-primary)] cursor-pointer disabled:opacity-50 my-0.5 align-middle"
      style={{
        backgroundColor: 'var(--color-surface-hover)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)'
      }}
    >
      <svg
        className={`w-3.5 h-3.5 shrink-0 opacity-70 ${isDownloading ? 'animate-bounce' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}

function escapeHtmlText(unsafe: string) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function renderBBCodeAndNewlines(text: string) {
  let html = escapeHtmlText(text);
  
  html = html.replace(/\[h1\]/g, '<h1 class="text-2xl font-bold text-white mt-6 mb-4 block" style="font-size: 24px; margin-top: 24px; margin-bottom: 16px;">').replace(/\[\/h1\]/g, '</h1>');
  html = html.replace(/\[h2\]/g, '<h2 class="text-xl font-bold text-gray-200 mt-5 mb-3 block" style="font-size: 20px; margin-top: 20px; margin-bottom: 12px;">').replace(/\[\/h2\]/g, '</h2>');
  html = html.replace(/\[h3\]/g, '<h3 class="text-lg font-semibold text-gray-300 mt-4 mb-2 block" style="font-size: 18px; margin-top: 16px; margin-bottom: 8px;">').replace(/\[\/h3\]/g, '</h3>');
  
  html = html.replace(/\n/g, '<br />');
  // Nettoyer les sauts de ligne directement après ou avant les titres pour éviter de trop grands espaces
  html = html.replace(/<\/h1><br \/>/g, '</h1>');
  html = html.replace(/<\/h2><br \/>/g, '</h2>');
  html = html.replace(/<\/h3><br \/>/g, '</h3>');
  
  html = html.replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>');
  html = html.replace(/\[i\]/g, '<em>').replace(/\[\/i\]/g, '</em>');
  html = html.replace(/\[u\]/g, '<u>').replace(/\[\/u\]/g, '</u>');
  html = html.replace(/\[color=([^\]]+)\]/g, '<span style="color: $1;">').replace(/\[\/color\]/g, '</span>');
  html = html.replace(/\[size=([^\]]+)\]/g, '<span style="font-size: $1px;">').replace(/\[\/size\]/g, '</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * RichTextRenderer component parses custom markup tags inside a content string
 * and renders them as rich interactive React elements.
 *
 * Supported Tags:
 * 1. `<accent>text</accent>` - Highlighted red accent text
 * 2. `[timer:ISO_DATE]` - Live ticking countdown timer until target date
 * 3. `[chrono:ISO_DATE]` - Live ticking elapsed duration since start date
 * 4. `[date:ISO_DATE]` - French formatted date string
 * 5. `[link:URL|Label]` - External web link button opening in a new tab
 * 6. `[file:URL|Label]` - File download button with fetch/blob download trigger
 * 
 * Also supports Slide Mode (JSON array of blocks) and BBCode [b], [i], [u], [color], [size].
 */
export default function RichTextRenderer({ content }: { content: string }) {
  // Check if content is a JSON slide array
  let blocks: any[] | null = null;
  if (typeof content === 'string' && (content.startsWith('[{"') || content.startsWith('[]'))) {
    try {
      blocks = JSON.parse(content);
    } catch (e) {}
  }

  const [now, setNow] = useState(() => Date.now());

  const tokens = useMemo(() => {
    if (blocks) return []; // skip parsing if slide mode
    return parseContent(content);
  }, [content, blocks]);

  const hasTimeDependentToken = useMemo(() => {
    return tokens.some(t => t.type === 'timer' || t.type === 'chrono');
  }, [tokens]);

  useEffect(() => {
    if (!hasTimeDependentToken) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasTimeDependentToken]);

  if (blocks && Array.isArray(blocks)) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: 'transparent', overflow: 'hidden' }}>
        {blocks.map((block, idx) => {
          const left = (block.x / 800) * 100 + '%';
          const top = (block.y / 450) * 100 + '%';
          const width = (block.w / 800) * 100 + '%';
          const height = (block.h / 450) * 100 + '%';
          
          if (block.type === 'image') {
            return (
              <img key={idx} src={block.url} style={{ position: 'absolute', left, top, width, height, objectFit: 'contain' }} alt="" />
            );
          } else if (block.type === 'text') {
            return (
              <div key={idx} style={{ position: 'absolute', left, top, width, height, color: block.color || '#fff', fontSize: block.fontSize || 16, overflow: 'hidden' }}>
                 <RichTextRenderer content={block.content || ''} />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <span className="rich-text-renderer">
      {tokens.map((token, index) => {
        switch (token.type) {
          case 'text':
            return <span key={index}>{renderBBCodeAndNewlines(token.content)}</span>;

          case 'accent':
            return (
              <span
                key={index}
                className="font-bold text-[var(--color-val-red)]"
                style={{ color: 'var(--color-val-red)', fontWeight: 700 }}
              >
                {renderTextWithNewlines(token.content)}
              </span>
            );

          case 'timer': {
            const targetTime = new Date(token.isoDate).getTime();
            if (isNaN(targetTime)) {
              return <span key={index}>[timer:{token.isoDate}]</span>;
            }
            const remaining = targetTime - now;
            if (remaining <= 0) {
              return (
                <span
                  key={index}
                  className="font-semibold text-green-500"
                  style={{ color: '#22c55e' }}
                >
                  Terminé
                </span>
              );
            }
            return (
              <span key={index} className="font-mono font-medium">
                {formatDuration(remaining)}
              </span>
            );
          }

          case 'chrono': {
            const startTime = new Date(token.isoDate).getTime();
            if (isNaN(startTime)) {
              return <span key={index}>[chrono:{token.isoDate}]</span>;
            }
            const elapsed = Math.max(0, now - startTime);
            return (
              <span key={index} className="font-mono font-medium">
                {formatDuration(elapsed)}
              </span>
            );
          }

          case 'date':
            return (
              <span key={index} className="font-medium">
                {formatFrenchDate(token.isoDate)}
              </span>
            );

          case 'link':
            return (
              <a
                key={index}
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:opacity-80 transition-opacity text-[var(--color-text-primary)] no-underline my-0.5 align-middle"
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span>{token.label}</span>
                <svg
                  className="w-3.5 h-3.5 shrink-0 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            );

          case 'file':
            return <FileDownloadButton key={index} url={token.url} label={token.label} />;

          default:
            return null;
        }
      })}
    </span>
  );
}
