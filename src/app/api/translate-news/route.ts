import { tr } from '@/lib/i18n';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { texts, targetLang } = await req.json(); // texts: string[]
    if (!texts || !Array.isArray(texts) || !targetLang || targetLang === 'french') {
      return NextResponse.json({ translated: texts });
    }

    let config = { provider: 'libretranslate', apiUrl: 'https://libretranslate.com/translate', excludeWords: [] as string[] };
    try {
      const configPath = path.join(process.cwd(), 'public', 'locales', 'translate_config.json');
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (e) {}

    const { provider, apiUrl, excludeWords } = config;

    let textsToTranslate = texts.map(text => {
      let t = text;
      if (excludeWords && excludeWords.length > 0) {
        excludeWords.forEach((word: string) => {
          if (word.trim()) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            t = t.replace(regex, `<span translate="no">{tr("$&")}</span>`);
          }
        });
      }
      return t;
    });

    let translated = texts;

    if (provider === 'libretranslate') {
      const res = await fetch(apiUrl || 'https://libretranslate.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: textsToTranslate,
          source: 'fr',
          target: targetLang.substring(0, 2),
          format: 'html'
        })
      });
      if (res.ok) {
        const data = await res.json();
        translated = data.translatedText; // returns array if q was array
      } else {
        return NextResponse.json({ error: 'Translation API error' }, { status: 500 });
      }
    }

    return NextResponse.json({ translated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
