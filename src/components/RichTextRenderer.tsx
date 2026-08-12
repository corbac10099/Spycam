'use client';

import { useState, useEffect, useMemo } from 'react';
import parse, { Element, HTMLReactParserOptions, domToReact, DOMNode } from 'html-react-parser';

export function parseColor(color: string): {r: number, g: number, b: number} | null {
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    return {
      r: parseInt(hex.substring(0,2), 16),
      g: parseInt(hex.substring(2,4), 16),
      b: parseInt(hex.substring(4,6), 16)
    };
  }
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  if (color.trim().toLowerCase() === 'white') return {r:255,g:255,b:255};
  if (color.trim().toLowerCase() === 'black') return {r:0,g:0,b:0};
  return null;
}

function adaptColorForLightMode(color: string): string {
  const parsed = parseColor(color);
  if (!parsed) return color;
  const {r, g, b} = parsed;
  let rP = r / 255;
  let gP = g / 255;
  let bP = b / 255;
  let max = Math.max(rP, gP, bP), min = Math.min(rP, gP, bP);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rP: h = (gP - bP) / d + (gP < bP ? 6 : 0); break;
      case gP: h = (bP - rP) / d + 2; break;
      case bP: h = (rP - gP) / d + 4; break;
    }
    h /= 6;
  }

  if (l > 0.7) {
    l = Math.max(0.1, 1 - l); 
  } else if (l < 0.3) {
    l = Math.min(0.9, 1 - l); 
  } else {
    l = Math.max(0.2, l - 0.3); 
  }

  let r2, g2, b2;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1/3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1/3);
  }

  return `rgb(${Math.round(r2*255)}, ${Math.round(g2*255)}, ${Math.round(b2*255)})`;
}

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
  processed = processed.replace(/\[timer:([^\]]+)\]/g, '<span class="val-timer" data-date="$1"></span>');
  processed = processed.replace(/\[chrono:([^\]]+)\]/g, '<span class="val-chrono" data-date="$1"></span>');
  processed = processed.replace(/\[date:([^\]]+)\]/g, '<span class="val-date" data-date="$1"></span>');
  processed = processed.replace(/\[link:([^|\]]+)\|([^\]]+)\]/g, '<a class="val-link-btn" href="$1" data-label="$2"></a>');
  processed = processed.replace(/\[file:([^|\]]+)\|([^\]]+)\]/g, '<a class="val-file-btn" href="$1" data-label="$2"></a>');
  // Convert <accent> tags to spans, preserving any inline style
  processed = processed.replace(/<accent([^>]*)>(.*?)<\/accent>/gi, (match, attrs, content) => {
    return `<span class="val-accent"${attrs}>${content}</span>`;
  });

  return processed;
}

export default function RichTextRenderer({ content }: { content: string }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setIsLightMode(document.body.classList.contains('theme-light'));
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          setIsLightMode(document.body.classList.contains('theme-light'));
        }
      });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Check if content is a JSON slide array
  let blocks: any[] | null = null;
  if (typeof content === 'string' && (content.startsWith('[{"') || content.startsWith('[]'))) {
    try {
      blocks = JSON.parse(content);
    } catch (e) {}
  }

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
        const tagName = domNode.name?.toLowerCase();

        // Handle legacy <font size="X"> tags generated by execCommand('fontSize')
        if (tagName === 'font') {
          const sizeAttr = domNode.attribs.size;
          const colorAttr = domNode.attribs.color;
          const faceAttr = domNode.attribs.face;
          const inlineStyle: React.CSSProperties = {};

          if (sizeAttr) {
            const fontSizeMap: Record<string, string> = {
              '1': '10px', '2': '13px', '3': '16px',
              '4': '18px', '5': '24px', '6': '32px', '7': '48px',
            };
            inlineStyle.fontSize = fontSizeMap[sizeAttr] || '16px';
          }
          if (colorAttr) {
            inlineStyle.color = isLightMode ? adaptColorForLightMode(colorAttr) : colorAttr;
          }
          if (faceAttr) inlineStyle.fontFamily = faceAttr;

          // Merge any existing inline style from the tag
          const existingStyle = domNode.attribs.style;
          if (existingStyle) {
            existingStyle.split(';').forEach(rule => {
              const [prop, val] = rule.split(':').map(s => s.trim());
              if (prop && val) {
                const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                let finalVal = val;
                if (isLightMode && (camelProp === 'color' || camelProp === 'backgroundColor')) {
                  finalVal = adaptColorForLightMode(val);
                }
                (inlineStyle as any)[camelProp] = finalVal;
              }
            });
          }

          return (
            <span style={inlineStyle}>
              {domToReact(domNode.children as DOMNode[], options)}
            </span>
          );
        }

        if (className.includes('val-accent')) {
          // Parse any existing inline style from the accent tag
          const existingStyle = domNode.attribs.style || '';
          const mergedStyle: React.CSSProperties = {};
          
          if (existingStyle) {
            existingStyle.split(';').forEach((rule: string) => {
              const colonIdx = rule.indexOf(':');
              if (colonIdx === -1) return;
              const prop = rule.substring(0, colonIdx).trim();
              const val = rule.substring(colonIdx + 1).trim();
              if (prop && val) {
                const camelProp = prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
                (mergedStyle as any)[camelProp] = val;
              }
            });
          }
          return (
            <span className="font-bold text-[var(--color-val-red)]" style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}>
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
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-transparent hover:bg-white/5 border border-[#fa4454]/40 rounded-full text-[14px] font-medium text-gray-200 no-underline transition-colors my-0.5 align-middle">
              {domToReact(domNode.children as DOMNode[], options)}
            </a>
          );
        }

        if (className.includes('val-file-btn')) {
          const url = domNode.attribs.href;
          const label = domNode.attribs['data-label'] || 'Télécharger';
          // If they used the new structure, the text is inside .val-file-text
          let actualLabel = label;
          const childrenAny = domNode.children as any[];
          const fileTextNode = childrenAny.find((c: any) => c.type === 'tag' && c.attribs?.class?.includes('val-file-text'));
          if (fileTextNode && fileTextNode.children?.[0]?.data) {
             actualLabel = fileTextNode.children[0].data;
          } else if (childrenAny?.[0]?.data && !className.includes('val-link-btn')) {
             actualLabel = childrenAny[0].data;
          }
          return <FileDownloadButton url={url} label={actualLabel} />;
        }

        // Preserve inline styles on all elements (h1-h6, p, div, span, etc.)
        // This ensures font-size, color, etc. set in AppControl are respected
        if (domNode.attribs.style && ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','blockquote'].includes(tagName)) {
          const inlineStyle: React.CSSProperties = {};
          domNode.attribs.style.split(';').forEach(rule => {
            const colonIdx = rule.indexOf(':');
            if (colonIdx === -1) return;
            const prop = rule.substring(0, colonIdx).trim();
            const val = rule.substring(colonIdx + 1).trim();
            if (prop && val) {
              const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              let finalVal = val;
              if (isLightMode && (camelProp === 'color' || camelProp === 'backgroundColor')) {
                finalVal = adaptColorForLightMode(val);
              }
              (inlineStyle as any)[camelProp] = finalVal;
            }
          });

          const Tag = tagName as any;
          return (
            <Tag style={inlineStyle} className={className || undefined}>
              {domToReact(domNode.children as DOMNode[], options)}
            </Tag>
          );
        }
      }
    }
  };

  const wrapperClass = `rich-text-renderer prose max-w-none leading-relaxed
    prose-h1:font-black prose-h1:uppercase prose-h1:tracking-widest prose-h1:mt-6 prose-h1:mb-4
    prose-h2:font-extrabold prose-h2:uppercase prose-h2:border-b-2 prose-h2:border-[var(--color-val-red)] prose-h2:pb-1 prose-h2:mt-5 prose-h2:mb-3
    prose-h3:text-[var(--color-val-red)] prose-h3:mt-4 prose-h3:mb-2
    ${isLightMode 
      ? 'prose-headings:text-black text-gray-800 prose-a:text-blue-600' 
      : 'prose-invert prose-headings:text-white text-gray-300 prose-a:text-blue-400'
    }`;

  return (
    <div className={wrapperClass}>
      {parse(processedHtml, options)}
    </div>
  );
}
