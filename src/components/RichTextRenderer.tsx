'use client';

import { useState, useEffect, useMemo } from 'react';
import parse, { Element, HTMLReactParserOptions, domToReact, DOMNode } from 'html-react-parser';

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

function formatFrenchDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const day = date.getDate();
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isoDate.includes('T') || isoDate.includes(':')) {
    return `${day} ${month} ${year} à ${hours}h${minutes}`;
  }
  return `${day} ${month} ${year}`;
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
      className="inline-flex items-center gap-1.5 px-3.5 py-1 text-sm font-medium rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-gray-200 cursor-pointer disabled:opacity-50 my-0.5 align-middle"
    >
      <svg className={`w-3.5 h-3.5 shrink-0 opacity-70 ${isDownloading ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

// Fallback legacy parser for very old entries not yet migrated by AppControl
function preprocessLegacyHTML(html: string): string {
  if (!html) return '';
  let processed = html;
  
  // Custom pseudo-tags
  processed = processed.replace(/\\[timer:([^\]]+)\\]/g, '<span class="val-timer" data-date="$1"></span>');
  processed = processed.replace(/\\[chrono:([^\]]+)\\]/g, '<span class="val-chrono" data-date="$1"></span>');
  processed = processed.replace(/\\[date:([^\]]+)\\]/g, '<span class="val-date" data-date="$1"></span>');
  processed = processed.replace(/\\[link:([^|\]]+)\\|([^\]]+)\\]/g, '<a class="val-link-btn" href="$1" data-label="$2"></a>');
  processed = processed.replace(/\\[file:([^|\]]+)\\|([^\]]+)\\]/g, '<a class="val-file-btn" href="$1" data-label="$2"></a>');
  processed = processed.replace(/<accent>(.*?)<\\/accent>/gi, '<span class="val-accent">$1</span>');

  return processed;
}

export default function RichTextRenderer({ content }: { content: string }) {
  // Check if content is a JSON slide array
  let blocks: any[] | null = null;
  if (typeof content === 'string' && (content.startsWith('[{"') || content.startsWith('[]'))) {
    try {
      blocks = JSON.parse(content);
    } catch (e) {}
  }

  const [now, setNow] = useState(() => Date.now());

  const processedHtml = useMemo(() => {
    if (blocks) return ''; // Skip parsing for slide layout
    return preprocessLegacyHTML(content || '');
  }, [content, blocks]);

  const hasTimeDependentToken = useMemo(() => {
    return processedHtml.includes('val-timer') || processedHtml.includes('val-chrono');
  }, [processedHtml]);

  useEffect(() => {
    if (!hasTimeDependentToken) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
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
            return <img key={idx} src={block.url} style={{ position: 'absolute', left, top, width, height, objectFit: 'contain' }} alt="" />;
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

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        const className = domNode.attribs.class || '';

        if (className.includes('val-accent')) {
          return (
            <span className="font-bold text-[var(--color-val-red)]">
              {domToReact(domNode.children as DOMNode[], options)}
            </span>
          );
        }

        if (className.includes('val-timer')) {
          const date = domNode.attribs['data-date'];
          const targetTime = new Date(date).getTime();
          if (isNaN(targetTime)) return <span>{domToReact(domNode.children as DOMNode[], options)}</span>;
          
          const remaining = targetTime - now;
          if (remaining <= 0) {
            return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 rounded-lg font-mono text-sm text-green-400 my-0.5 align-middle">Terminé</span>;
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/30 rounded-lg font-mono text-sm text-[var(--color-val-red)] my-0.5 align-middle">
              ⏱️ {formatDuration(remaining)}
            </span>
          );
        }

        if (className.includes('val-chrono')) {
          const date = domNode.attribs['data-date'];
          const startTime = new Date(date).getTime();
          if (isNaN(startTime)) return <span>{domToReact(domNode.children as DOMNode[], options)}</span>;
          
          const elapsed = Math.max(0, now - startTime);
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded-lg font-mono text-sm text-blue-400 my-0.5 align-middle">
              ⏳ {formatDuration(elapsed)}
            </span>
          );
        }

        if (className.includes('val-date')) {
          const dateStr = domNode.attribs['data-date'];
          return <span className="font-semibold text-yellow-400 align-middle">📅 {formatFrenchDate(dateStr)}</span>;
        }

        if (className.includes('val-link-btn')) {
          const url = domNode.attribs.href;
          const label = domNode.attribs['data-label'] || domToReact(domNode.children as DOMNode[], options);
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/5 hover:bg-white/10 border border-white/15 rounded-full text-[13px] font-medium text-gray-200 no-underline transition-colors my-0.5 align-middle">
              🔗 {label}
            </a>
          );
        }

        if (className.includes('val-file-btn')) {
          const url = domNode.attribs.href;
          const label = domNode.attribs['data-label'] || domToReact(domNode.children as DOMNode[], options);
          return <FileDownloadButton url={url} label={label as string} />;
        }
      }
    }
  };

  return (
    <div className="rich-text-renderer prose prose-invert max-w-none 
      prose-headings:text-white prose-h1:text-2xl prose-h1:font-black prose-h1:uppercase prose-h1:tracking-widest prose-h1:mt-6 prose-h1:mb-4
      prose-h2:text-xl prose-h2:font-extrabold prose-h2:uppercase prose-h2:border-b-2 prose-h2:border-[var(--color-val-red)] prose-h2:pb-1 prose-h2:mt-5 prose-h2:mb-3
      prose-h3:text-[var(--color-val-red)] prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
      prose-a:text-blue-400
      text-gray-300 leading-relaxed">
      {parse(processedHtml, options)}
    </div>
  );
}
