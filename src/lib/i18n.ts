// ==================== Système de Traduction i18n (Dynamique via DOM) ====================
// Fichier centralisé gérant les traductions de l'interface utilisateur automatiquement via MutationObserver.

import { useState, useEffect } from 'react';

export type LanguageInfo = {
  id: string;
  label: string;
  flag: string;
  code?: string;
};

export type Locale = string;
export const LOCALES: LanguageInfo[] = [];

let currentLanguage: string = 'french';
let languagesList: LanguageInfo[] = [];
let translations: Record<string, string> = {};
let isInitialized: boolean = false;
let translationRegex: RegExp | null = null;

const listeners = new Set<() => void>();
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'alt', 'aria-label'];
const OBSERVED_ATTRIBUTES = [
  ...TRANSLATABLE_ATTRIBUTES,
  ...TRANSLATABLE_ATTRIBUTES.map(attr => `data-original-${attr}`),
];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function tr(frenchString: string): string {
  if (currentLanguage === 'french') return frenchString;
  return translations[frenchString] ?? frenchString;
}

export function t(frenchString: string, _locale?: string): string {
  return tr(frenchString);
}

export function trFormat(frenchString: string, values: Record<string, string | number>): string {
  return tr(frenchString).replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export function getCurrentLanguage(): string { return currentLanguage; }
export function getLanguagesList(): LanguageInfo[] { return languagesList; }

export async function loadLanguagesList(): Promise<LanguageInfo[]> {
  try {
    const res = await fetch('/locales/languages.json');
    if (!res.ok) throw new Error('Failed to load languages.json');
    
    const data = await res.json();
    languagesList = data.languages;
    
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('app_language') : null;
    const defaultLang = data.default || 'french';
    
    if (!isInitialized) {
      isInitialized = true;
      await setLanguage(savedLang || defaultLang);
    }
    
    return languagesList;
  } catch (error) {
    console.error('Error loading languages list:', error);
    return [];
  }
}

export async function setLanguage(langId: string): Promise<void> {
  currentLanguage = langId;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', langId);
  }

  if (langId === 'french') {
    translations = {};
    notifyListeners();
    translateDOM(); // Revert back to original texts (stored in attributes)
    return;
  }

  try {
    const res = await fetch(`/locales/${langId}.json`);
    if (!res.ok) throw new Error(`Failed to load ${langId}.json`);
    
    const data = await res.json();
    translations = data.translations || {};
  } catch (error) {
    console.error(`Error loading translations for ${langId}:`, error);
    translations = {};
  }

  // Build regex for partial translation matches
  const keys = Object.keys(translations)
    .filter(k => k.length > 3)
    .sort((a, b) => b.length - a.length);

  if (keys.length > 0) {
    const escapedKeys = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    translationRegex = new RegExp(`(${escapedKeys.join('|')})`, 'g');
  } else {
    translationRegex = null;
  }
  
  notifyListeners();
  translateDOM();
}

// ==================== DOM TRANSLATOR ====================

function translateDOM() {
  if (typeof window === 'undefined') return;
  
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    translateNode(node as Text);
  }

  document.body.querySelectorAll<HTMLElement>('*').forEach(translateElementAttributes);
}

function translateElementAttributes(element: HTMLElement) {
  if (
    element.tagName === 'SCRIPT' ||
    element.tagName === 'STYLE' ||
    element.closest('[translate="no"]') ||
    element.closest('.notranslate')
  ) {
    return;
  }

  TRANSLATABLE_ATTRIBUTES.forEach(attr => {
    const rawValue = element.getAttribute(attr);
    if (!rawValue || !rawValue.trim()) return;

    const originalAttr = `data-original-${attr}`;
    if (!element.hasAttribute(originalAttr)) {
      element.setAttribute(originalAttr, rawValue);
    }

    const original = element.getAttribute(originalAttr) || rawValue;
    const stripped = original.trim();
    const translated = currentLanguage === 'french' ? original : original.replace(stripped, translations[stripped] || stripped);

    if (element.getAttribute(attr) !== translated) {
      element.setAttribute(attr, translated);
    }
  });
}

function translateNode(node: Text) {
  // Ignore scripts, styles, and elements specifically marked as notranslate
  if (node.parentElement && (
      node.parentElement.tagName === 'SCRIPT' || 
      node.parentElement.tagName === 'STYLE' ||
      node.parentElement.closest('[translate="no"]') ||
      node.parentElement.closest('.notranslate')
  )) {
    return;
  }

  // We store the original text in a custom property on the DOM node object to avoid mutating React's visible state in a breaking way
  // Since we mutate `nodeValue`, React won't crash.
  
  // Clean whitespace for matching
  const rawText = node.nodeValue || '';
  if (!rawText.trim()) return;

  // Initialize original text if not present
  if (!(node as any)._originalText) {
    (node as any)._originalText = rawText;
  }
  
  const original = (node as any)._originalText;
  const stripped = original.trim();
  
  if (currentLanguage === 'french') {
    if (node.nodeValue !== original) {
      node.nodeValue = original;
    }
    return;
  }
  
  let translatedStr = original;

  // Partial match via Regex for mixed text nodes
  if (translationRegex) {
    translatedStr = translatedStr.replace(translationRegex, (match: string) => {
      return translations[match] || match;
    });
  }

  // Exact match fallback (for short strings < 4 chars)
  if (translatedStr === original && translations[stripped]) {
    translatedStr = original.replace(stripped, translations[stripped]);
  }

  if (node.nodeValue !== translatedStr) {
    node.nodeValue = translatedStr;
  }
}

export function useLanguage() {
  const [lang, setLang] = useState<string>(currentLanguage);

  useEffect(() => {
    if (languagesList.length === 0 && !isInitialized) {
      loadLanguagesList();
    }

    const listener = () => setLang(currentLanguage);
    listeners.add(listener);
    
    // Set up DOM MutationObserver
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              translateNode(node as Text);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              translateElementAttributes(el);
              el.querySelectorAll('*').forEach(child => translateElementAttributes(child as HTMLElement));
              
              const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
              let child;
              while ((child = walker.nextNode())) {
                translateNode(child as Text);
              }
            }
          });
        } else if (mutation.type === 'attributes') {
          translateElementAttributes(mutation.target as HTMLElement);
        } else if (mutation.type === 'characterData') {
          // If React overrides a text node, characterData triggers.
          // However, if we modified it, characterData might trigger. We check if it changed to something other than our translation
          const node = mutation.target as Text;
          if (node.nodeValue && node.parentElement && !node.parentElement.closest('.notranslate')) {
             // Reset original text if React explicitly wrote something new (that is not our translation)
             const currentStripped = node.nodeValue.trim();
             const originalStripped = (node as any)._originalText?.trim();
             const translatedStripped = translations[originalStripped];
             
             if (currentStripped !== translatedStripped && currentStripped !== originalStripped) {
               (node as any)._originalText = node.nodeValue;
               translateNode(node);
             }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES
    });
    
    // Initial pass
    translateDOM();

    return () => {
      listeners.delete(listener);
      observer.disconnect();
    };
  }, []);

  return {
    lang,
    tr,
    trFormat,
    setLanguage,
    languagesList,
    currentLanguage
  };
}

export default {
  tr,
  trFormat,
  useLanguage,
  loadLanguagesList,
  setLanguage,
  getCurrentLanguage,
  getLanguagesList
};
