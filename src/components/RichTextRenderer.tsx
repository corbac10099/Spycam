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
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:opacity-80 transition-opacity text-[var(--color-text-primary)] cursor-pointer disabled:opacity-50 my-0.5 align-middle"
      style={{ backgroundColor: 'var(--color-surface-hover)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
    >
      <svg className={`w-3.5 h-3.5 shrink-0 opacity-70 ${isDownloading ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

function preprocessHTML(html: string): string {
  let processed = html;
  
  // Convert custom shorthand typed by user in WYSIWYG editor into data-widget elements
  processed = processed.replace(/\[timer:([^\]]+)\]/g, '<span data-widget="timer" data-value="$1"></span>');
  processed = processed.replace(/\[chrono:([^\]]+)\]/g, '<span data-widget="chrono" data-value="$1"></span>');
  processed = processed.replace(/\[date:([^\]]+)\]/g, '<span data-widget="date" data-value="$1"></span>');
  processed = processed.replace(/\[link:([^|\]]+)\|([^\]]+)\]/g, '<span data-widget="link" data-value="$1" data-label="$2"></span>');
  processed = processed.replace(/\[file:([^|\]]+)\|([^\]]+)\]/g, '<span data-widget="file" data-value="$1" data-label="$2"></span>');

  // Legacy BBCode for backward compatibility
  processed = processed.replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>');
  processed = processed.replace(/\[i\]/g, '<em>').replace(/\[\/i\]/g, '</em>');
  processed = processed.replace(/\[u\]/g, '<u>').replace(/\[\/u\]/g, '</u>');
  processed = processed.replace(/\[color=([^\]]+)\]/g, '<span style="color: $1;">').replace(/\[\/color\]/g, '</span>');
  processed = processed.replace(/\[size=([^\]]+)\]/g, '<span style="font-size: $1px;">').replace(/\[\/size\]/g, '</span>');
  processed = processed.replace(/\[h1\]/g, '<h1>').replace(/\[\/h1\]/g, '</h1>');
  processed = processed.replace(/\[h2\]/g, '<h2>').replace(/\[\/h2\]/g, '</h2>');
  processed = processed.replace(/\[h3\]/g, '<h3>').replace(/\[\/h3\]/g, '</h3>');

  // Auto-breaklines for plain text inputs (if not already HTML generated by Quill)
  if (!html.includes('<p>') && !html.includes('<br>')) {
     processed = processed.replace(/\n/g, '<br/>');
  }

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
    return preprocessHTML(content || '');
  }, [content, blocks]);

  const hasTimeDependentToken = useMemo(() => {
    return processedHtml.includes('data-widget="timer"') || processedHtml.includes('data-widget="chrono"');
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
      if (domNode instanceof Element) {
        // Handle `<accent>` tags specifically
        if (domNode.name === 'accent') {
          return (
            <span className="font-bold text-[var(--color-val-red)]" style={{ color: 'var(--color-val-red)', fontWeight: 700 }}>
              {domToReact(domNode.children as DOMNode[], options)}
            </span>
          );
        }

        // Apply automatic margins to headers if not handled by standard CSS
        if (domNode.name === 'h1') {
          return <h1 className="text-2xl font-bold text-white mt-6 mb-4 block" style={{ fontSize: '24px', marginTop: '24px', marginBottom: '16px' }}>{domToReact(domNode.children as DOMNode[], options)}</h1>;
        }
        if (domNode.name === 'h2') {
          return <h2 className="text-xl font-bold text-gray-200 mt-5 mb-3 block" style={{ fontSize: '20px', marginTop: '20px', marginBottom: '12px' }}>{domToReact(domNode.children as DOMNode[], options)}</h2>;
        }
        if (domNode.name === 'h3') {
          return <h3 className="text-lg font-semibold text-gray-300 mt-4 mb-2 block" style={{ fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>{domToReact(domNode.children as DOMNode[], options)}</h3>;
        }

        // Handle dynamic widgets
        if (domNode.attribs && domNode.attribs['data-widget']) {
          const widget = domNode.attribs['data-widget'];
          const value = domNode.attribs['data-value'] || '';
          const label = domNode.attribs['data-label'] || '';

          if (widget === 'timer') {
            const targetTime = new Date(value).getTime();
            if (isNaN(targetTime)) return <span>[timer:{value}]</span>;
            const remaining = targetTime - now;
            if (remaining <= 0) {
              return <span className="font-semibold text-green-500" style={{ color: '#22c55e' }}>Terminé</span>;
            }
            return <span className="font-mono font-medium">{formatDuration(remaining)}</span>;
          }

          if (widget === 'chrono') {
            const startTime = new Date(value).getTime();
            if (isNaN(startTime)) return <span>[chrono:{value}]</span>;
            const elapsed = Math.max(0, now - startTime);
            return <span className="font-mono font-medium">{formatDuration(elapsed)}</span>;
          }

          if (widget === 'date') {
            return <span className="font-medium">{formatFrenchDate(value)}</span>;
          }

          if (widget === 'link') {
            return (
              <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:opacity-80 transition-opacity text-[var(--color-text-primary)] no-underline my-0.5 align-middle" style={{ backgroundColor: 'var(--color-surface-hover)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <span>{label}</span>
                <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            );
          }

          if (widget === 'file') {
            return <FileDownloadButton url={value} label={label} />;
          }
        }
      }
    }
  };

  return (
    <div className="rich-text-renderer html-content text-base leading-relaxed text-gray-300">
      {parse(processedHtml, options)}
    </div>
  );
}
