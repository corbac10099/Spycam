'use client';

import { useState, useEffect, useMemo } from 'react';
import parse, { Element, HTMLReactParserOptions, domToReact, DOMNode } from 'html-react-parser';
import { tr, useLanguage } from '@/lib/i18n';
import VideoPlayer from './VideoPlayer';

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


export function toReactStyleKey(prop: string): string {
  if (prop.startsWith('--')) {
    return prop; // Keep CSS custom properties (--variable) intact for React
  }
  if (prop.startsWith('-ms-')) {
    return prop.slice(1).replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());
  }
  if (prop.startsWith('-webkit-') || prop.startsWith('-moz-') || prop.startsWith('-o-')) {
    const cleaned = prop.slice(1);
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());
  }
  return prop.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());
}

export function parseInlineStyle(styleStr?: string, isLightMode = false): React.CSSProperties {
  if (!styleStr || typeof styleStr !== 'string') return {};
  const inlineStyle: React.CSSProperties = {};
  styleStr.split(';').forEach(rule => {
    const colonIdx = rule.indexOf(':');
    if (colonIdx === -1) return;
    const rawProp = rule.substring(0, colonIdx).trim();
    const val = rule.substring(colonIdx + 1).trim();
    if (rawProp && val) {
      const key = toReactStyleKey(rawProp);
      let finalVal = val;
      if (isLightMode && (key === 'color' || key === 'backgroundColor')) {
        finalVal = adaptColorForLightMode(val);
      }
      (inlineStyle as any)[key] = finalVal;
    }
  });
  return inlineStyle;
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
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function FileDownloadButton({ url, label }: { url: string; label: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const filename = url.split('/').pop() || 'download';

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`val-file-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
        downloading 
          ? 'opacity-50 cursor-not-allowed bg-gray-600 text-white' 
          : 'bg-[var(--color-val-red)] hover:bg-[var(--color-val-red)]/80 text-white shadow-[0_0_15px_rgba(255,70,85,0.4)] cursor-pointer'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={downloading ? 'animate-bounce' : ''}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}

// Fallback legacy parser for tokens and widgets
function preprocessLegacyHTML(html: string): string {
  if (!html) return '';
  let processed = html;
  // Custom pseudo-tags
  processed = processed.replace(/\[timer:([^\]]+)\]/g, '<span class="val-timer" data-date="$1"></span>');
  processed = processed.replace(/\[chrono:([^\]]+)\]/g, '<span class="val-chrono" data-date="$1"></span>');
  processed = processed.replace(/\[date:([^\]]+)\]/g, '<span class="val-date" data-date="$1"></span>');
  processed = processed.replace(/\[link:([^|\]]+)\|([^\]]+)\]/g, '<a class="val-link-btn" href="$1" data-label="$2"></a>');
  processed = processed.replace(/\[file:([^|\]]+)\|([^\]]+)\]/g, '<a class="val-file-btn" href="$1" data-label="$2"></a>');
  processed = processed.replace(/\[video:([^\]]+)\]/g, '<div class="val-video" data-url="$1"></div>');
  // Convert <accent> tags to spans, preserving any inline style
  processed = processed.replace(/<accent([^>]*)>([\s\S]*?)<\/accent>/gi, (match, attrs, content) => {
    return `<span class="val-accent"${attrs}>${content}</span>`;
  });

  return processed;
}

function decodeHtmlEntities(value: string): string {
  if (typeof document === 'undefined') {
    return value
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeRichHtml(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<span\b[^>]*class=["'][^"']*\bval-accent\b[^"']*["'][^>]*>/gi, '<accent>')
    .replace(/<span\b[^>]*class=["'][^"']*\bval-link-text\b[^"']*["'][^>]*>/gi, '')
    .replace(/<span\b[^>]*class=["'][^"']*\bval-file-text\b[^"']*["'][^>]*>/gi, '')
    .replace(/<\/span>/gi, (match, offset, source) => {
      const before = source.slice(0, offset);
      const openAccentCount = (before.match(/<accent>/g) || []).length;
      const closeAccentCount = (before.match(/<\/accent>/g) || []).length;
      return openAccentCount > closeAccentCount ? '</accent>' : '';
    })
    .replace(/<accent\b[^>]*>/gi, '<accent>')
    .replace(/<\/accent>/gi, '</accent>')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote|td|th)>/gi, ' ')
    .replace(/<(?!\/?accent\b)[^>]+>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripRichTags(value: string): string {
  return normalizeRichHtml(value).replace(/<\/?accent>/gi, '').replace(/\s+/g, ' ').trim();
}

function sanitizeTranslatedRichHtml(value: string): string {
  const escaped = escapeHtmlText(decodeHtmlEntities(value));
  return escaped
    .replace(/&lt;accent&gt;/gi, '<accent>')
    .replace(/&lt;\/accent&gt;/gi, '</accent>')
    .replace(/\n/g, '<br />');
}

function translateRichContent(value: string): string {
  const richKey = normalizeRichHtml(value);
  if (!richKey) return value;

  const richTranslation = tr(richKey);
  if (richTranslation !== richKey) {
    return sanitizeTranslatedRichHtml(richTranslation);
  }

  const plainText = stripRichTags(value);
  const translated = tr(plainText);
  if (translated === plainText) return value;

  return sanitizeTranslatedRichHtml(translated);
}

export default function RichTextRenderer({ content }: { content: string }) {
  const { lang } = useLanguage();
  const [isLightMode, setIsLightMode] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [isFolded, setIsFolded] = useState(true);

  useEffect(() => {
    const isLight = document.body.classList.contains('theme-light') || 
                    document.body.classList.contains('theme-cream') || 
                    document.body.classList.contains('theme-nordic');
    setIsLightMode(isLight);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isL = document.body.classList.contains('theme-light') || 
                      document.body.classList.contains('theme-cream') || 
                      document.body.classList.contains('theme-nordic');
          setIsLightMode(isL);
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
    } catch {}
  }

  // Handle Fold separation: [fold], <!--fold-->, or <div class="val-fold">
  const foldParts = useMemo(() => {
    if (blocks || !content || typeof content !== 'string') return null;
    const foldRegex = /\[fold\]|<!--\s*fold\s*-->|<div\s+class=["'][^"']*val-fold[^"']*["'][^>]*>[\s\S]*?<\/div>|<hr\s+class=["'][^"']*val-fold[^"']*["']\s*\/?>/i;
    if (foldRegex.test(content)) {
      const parts = content.split(foldRegex);
      if (parts.length >= 2) {
        return { top: parts[0], bottom: parts.slice(1).join('') };
      }
    }
    return null;
  }, [content, blocks]);

  const processedHtml = useMemo(() => {
    if (blocks) return '';
    const raw = foldParts ? (isFolded ? foldParts.top : `${foldParts.top} <div class="val-fold-divider"></div> ${foldParts.bottom}`) : content;
    return preprocessLegacyHTML(translateRichContent(raw || ''));
  }, [content, blocks, lang, foldParts, isFolded]);

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
          } else if (block.type === 'video') {
            return (
              <div key={idx} style={{ position: 'absolute', left, top, width, height, overflow: 'hidden' }}>
                <VideoPlayer src={block.url} poster={block.poster} autoPlay={block.autoPlay} className="w-full h-full" />
              </div>
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

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        const className = domNode.attribs.class || '';
        const tagName = domNode.name?.toLowerCase();
        const userStyle = parseInlineStyle(domNode.attribs.style, isLightMode);

        // Handle Video player token / video tag
        if (className.includes('val-video') || tagName === 'video') {
          const videoUrl = domNode.attribs['data-url'] || domNode.attribs.src || ((domNode.children as any[])?.find((c: any) => c.name === 'video')?.attribs?.src);
          return (
            <div className="my-6 w-full overflow-hidden" style={userStyle}>
              <VideoPlayer src={videoUrl} className="w-full h-full rounded-xl" />
            </div>
          );
        }

        // Handle legacy <font size="X"> tags generated by execCommand('fontSize')
        if (tagName === 'font') {
          const sizeAttr = domNode.attribs.size;
          const colorAttr = domNode.attribs.color;
          const faceAttr = domNode.attribs.face;
          const inlineStyle: React.CSSProperties = { ...userStyle };

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
          if (faceAttr) {
            inlineStyle.fontFamily = faceAttr;
          }

          return (
            <span style={inlineStyle}>
              {domToReact(domNode.children as DOMNode[], options)}
            </span>
          );
        }

        // Custom countdown timer widget
        if (className.includes('val-timer')) {
          const isoDate = domNode.attribs['data-date'];
          const target = new Date(isoDate).getTime();
          if (isNaN(target)) return <span style={userStyle} className="text-red-400 font-bold">[Date invalide]</span>;
          const diff = target - now;
          if (diff <= 0) return <span style={userStyle} className="val-timer-finished font-bold text-emerald-400">Terminé</span>;
          return <span style={userStyle} className="val-timer-active font-mono font-bold text-[var(--color-val-red)]">{formatDuration(diff)}</span>;
        }

        // Custom elapsed timer (chronometer) widget
        if (className.includes('val-chrono')) {
          const isoDate = domNode.attribs['data-date'];
          const start = new Date(isoDate).getTime();
          if (isNaN(start)) return <span style={userStyle} className="text-red-400 font-bold">[Date invalide]</span>;
          const diff = now - start;
          if (diff < 0) return <span style={userStyle} className="val-chrono-pending font-bold text-[var(--color-text-secondary)]">Pas encore commencé</span>;
          return <span style={userStyle} className="val-chrono-active font-mono font-bold text-amber-400">{formatDuration(diff)}</span>;
        }

        // Custom formatted date display
        if (className.includes('val-date')) {
          const isoDate = domNode.attribs['data-date'];
          return <span style={userStyle} className="val-date-display font-bold text-[var(--color-text-primary)]">{formatFrenchDate(isoDate)}</span>;
        }

        // External Link Button Widget with full CSS injection support
        if (className.includes('val-link-btn')) {
          const url = domNode.attribs.href || '#';
          const label = domNode.attribs['data-label'];
          
          return (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={userStyle}
              className={`val-link-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md group cursor-pointer ${
                !domNode.attribs.style?.includes('background') && !domNode.attribs.style?.includes('bg')
                  ? 'bg-[#1a1f2e] hover:bg-[var(--color-val-red)] text-[var(--color-text-primary)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-val-red)]'
                  : ''
              } ${className}`.trim()}
            >
              {domNode.children && domNode.children.length > 0 ? (
                domToReact(domNode.children as DOMNode[], options)
              ) : (
                <span>{label || 'Ouvrir le lien'}</span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          );
        }

        // Download File Button Widget with CSS injection support
        if (className.includes('val-file-btn')) {
          const url = domNode.attribs.href || '#';
          const label = domNode.attribs['data-label'] || 'Télécharger';
          let actualLabel = label;
          const childrenAny = domNode.children as any[];
          const fileTextNode = childrenAny.find((c: any) => c.type === 'tag' && c.attribs?.class?.includes('val-file-text'));
          if (fileTextNode && fileTextNode.children?.[0]?.data) {
             actualLabel = fileTextNode.children[0].data;
          } else if (childrenAny?.[0]?.data && !className.includes('val-link-btn')) {
             actualLabel = childrenAny[0].data;
          }
          return <div style={userStyle} className="inline-block"><FileDownloadButton url={url} label={actualLabel} /></div>;
        }

        // Accent tag / val-accent highlight with CSS injection support
        if (tagName === 'accent' || className.includes('val-accent')) {
          return (
            <span style={userStyle} className="val-accent text-[var(--color-val-red)] font-bold">
              {domToReact(domNode.children as DOMNode[], options)}
            </span>
          );
        }

        // Void tags that cannot have children in React
        if (tagName === 'img') {
          return (
            <img
              src={domNode.attribs.src}
              alt={domNode.attribs.alt || ''}
              style={userStyle}
              className={className || undefined}
              loading="lazy"
            />
          );
        }

        if (['hr', 'br', 'input', 'wbr', 'area', 'col'].includes(tagName)) {
          const VoidTag = tagName as any;
          return <VoidTag style={userStyle} className={className || undefined} />;
        }

        // Preserve inline styles on container and text elements
        if (domNode.attribs.style) {
          const Tag = tagName as any;
          return (
            <Tag style={userStyle} className={className || undefined}>
              {domToReact(domNode.children as DOMNode[], options)}
            </Tag>
          );
        }
      }
    }
  };

  const wrapperClass = `rich-text-renderer notranslate prose max-w-none leading-relaxed
    prose-h1:font-black prose-h1:uppercase prose-h1:tracking-widest prose-h1:mt-6 prose-h1:mb-4
    prose-h2:font-extrabold prose-h2:uppercase prose-h2:border-b-2 prose-h2:border-[var(--color-val-red)] prose-h2:pb-1 prose-h2:mt-5 prose-h2:mb-3
    prose-h3:text-[var(--color-val-red)] prose-h3:mt-4 prose-h3:mb-2
    ${isLightMode 
      ? 'prose-headings:text-black text-gray-800 prose-a:text-blue-600' 
      : 'prose-invert prose-headings:text-white text-gray-300 prose-a:text-blue-400'
    }`;

  // If fold is present
  if (foldParts) {
    return (
      <div className={wrapperClass}>
        {/* Top Part */}
        {parse(preprocessLegacyHTML(translateRichContent(foldParts.top || '')), options)}

        {/* Fold Button */}
        {isFolded ? (
          <div className="flex justify-center my-8 not-prose">
            <button
              onClick={() => setIsFolded(false)}
              className="px-6 py-3 rounded-full bg-[var(--color-val-red)]/10 hover:bg-[var(--color-val-red)] border border-[var(--color-val-red)]/30 hover:border-[var(--color-val-red)] text-[var(--color-val-red)] hover:text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,70,85,0.4)] cursor-pointer"
            >
              <span>{tr("Afficher toutes les informations")}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Bottom Part */}
            {parse(preprocessLegacyHTML(translateRichContent(foldParts.bottom || '')), options)}

            {/* Collapse Button at the bottom */}
            <div className="flex justify-center mt-8 mb-4 not-prose">
              <button
                onClick={() => setIsFolded(true)}
                className="px-6 py-3 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-val-red)] border border-[var(--color-border)] hover:border-[var(--color-val-red)] text-[var(--color-text-secondary)] hover:text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all duration-300 cursor-pointer"
              >
                <span>{tr("Afficher moins")}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {parse(processedHtml, options)}
    </div>
  );
}
