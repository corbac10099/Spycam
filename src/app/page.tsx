"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AbilityCard from "@/components/AbilityCard";

// ==================== Tooltip ====================
function Tooltip({ message }: { message: string }) {
  return (
    <div className="group relative inline-flex ml-1.5 cursor-help">
      <div className="w-5 h-5 rounded-full bg-[var(--color-val-red)]/10 border border-[var(--color-val-red)]/40 flex items-center justify-center text-[11px] font-black text-[var(--color-val-red)]">!</div>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <div className="bg-[#1a1f2e] border border-[rgba(255,180,50,0.3)] rounded-xl px-4 py-3 text-xs text-[var(--color-text-secondary)] leading-relaxed shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1f2e] border-r border-b border-[rgba(255,180,50,0.3)] rotate-45 -mt-1"></div>
        </div>
      </div>
    </div>
  );
}

// ==================== Banner Catalog Modal ====================
function BannerCatalogModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (url: string) => void; }) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen && cards.length === 0) {
      setLoading(true);
      Promise.all([
        fetch("https://valorant-api.com/v1/playercards").then(res => res.json()),
        fetch("https://valorant-api.com/v1/maps").then(res => res.json()),
        fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true").then(res => res.json())
      ])
      .then(([cardsRes, mapsRes, agentsRes]) => {
        let allItems: any[] = [];

        // 1. Agents (HD local pour le profil, miniature -thumb.jpg basse résolution pour le catalogue)
        if (agentsRes.data) {
          const agentItems = agentsRes.data
            .filter((a: any) => a.isPlayableCharacter)
            .map((a: any) => {
              const slug = a.displayName.toLowerCase().replace(/[\/']/g, '');
              const hdUrl = `/banners/hero-${slug}.jpg`;
              const thumbUrl = `/banners/hero-${slug}-thumb.jpg`;
              return {
                id: `hero-${a.uuid}`,
                name: `Agent ${a.displayName}`,
                url: hdUrl, // Full HD 2100px local pour le profil !
                previewUrl: thumbUrl, // Version basse résolution (320px) très légère pour le catalogue !
                isHD: true
              };
            });
          allItems = [...allItems, ...agentItems];
        }

        // 2. Maps (HD Splash pour le profil, miniature listViewIcon basse résolution pour le catalogue)
        if (mapsRes.data) {
          const mapItems = mapsRes.data
            .filter((m: any) => m.splash)
            .map((m: any) => ({
              id: m.uuid,
              name: m.displayName + " (Map)",
              url: m.splash, // Full HD 1920x1080 pour le profil !
              previewUrl: m.listViewIcon || m.splash, // Miniature basse résolution (200px) pour le catalogue !
              isHD: true
            }));
          allItems = [...allItems, ...mapItems];
        }

        // 3. Player cards (Wide Art 1028x268)
        if (cardsRes.data) {
          const cardItems = cardsRes.data
            .filter((c: any) => c.wideArt)
            .map((c: any) => ({
              id: c.uuid,
              name: c.displayName,
              url: c.wideArt,
              previewUrl: c.wideArt,
              isHD: false
            }));
          allItems = [...allItems, ...cardItems];
        }
        
        setCards(allItems);
      })
      .finally(() => setLoading(false));
    }
  }, [isOpen, cards.length]);

  if (!isOpen) return null;

  const filtered = cards.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" onClick={onClose}></div>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[85vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-val-dark)] text-white">
          <h2 className="text-2xl font-black uppercase tracking-widest">Catalogue de Bannières</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="p-6 border-b border-[var(--color-border)]">
           <input type="text" placeholder="Rechercher une carte ou une map..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-3 rounded-xl outline-none focus:border-[var(--color-val-red)] transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-[var(--color-text-secondary)] font-bold uppercase tracking-widest animate-pulse">Chargement du catalogue...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(c => (
                <button key={c.id} onClick={() => { onSelect(c.url); onClose(); }}
                  className="relative group rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--color-val-red)] transition-all cursor-pointer aspect-[3.5/1] bg-[var(--color-background)]">
                  <img referrerPolicy="no-referrer" src={c.previewUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-2">
                    <span className="text-white text-xs font-bold text-center leading-tight">{c.name}</span>
                  </div>
                  {c.isHD && (
                    <div className="absolute top-2 right-2 bg-[var(--color-val-red)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-lg">HD</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== Settings View ====================
function SettingsView({ onClose, smartRating, setSmartRating, theme, setTheme, bannerUrl, setBannerUrl, bannerOffsetY, setBannerOffsetY, isPublic, setIsPublic, videoLoop, setVideoLoop, videoLoopDelay, setVideoLoopDelay, hiddenStats, setHiddenStats, enforcePublicStats, setEnforcePublicStats, p, canEditProfile, settingsTab, setSettingsTab, pushUrl, locale, setLocale }: any) {
  const statOptions = [
    { id: 'kills', label: t('stat_kills', locale) }, { id: 'deaths', label: t('stat_deaths', locale) }, { id: 'assists', label: t('stat_assists', locale) },
    { id: 'kd', label: t('stat_kd', locale) }, { id: 'adr', label: t('stat_adr', locale) }, { id: 'hs', label: t('stat_hs', locale) },
    { id: 'wr', label: t('stat_winrate', locale) }, { id: 'acs', label: t('stat_acs', locale) }, { id: 'fb', label: t('stat_fb', locale) },
    { id: 'ace', label: t('stat_ace', locale) }, { id: 'kast', label: t('stat_kast', locale) }, { id: 'dd', label: t('stat_dd', locale) },
    { id: 'wins', label: t('stat_wins', locale) }, { id: 'matches', label: t("matches_played", locale) }
  ];
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Draft State
  const [draftSmartRating, setDraftSmartRating] = useState(smartRating);
  const [draftVideoLoop, setDraftVideoLoop] = useState(videoLoop ?? true);
  const [draftVideoLoopDelay, setDraftVideoLoopDelay] = useState(videoLoopDelay ?? 500);
  const [draftHiddenStats, setDraftHiddenStats] = useState<string[]>(hiddenStats || []);
  const [draftEnforcePublicStats, setDraftEnforcePublicStats] = useState(enforcePublicStats || false);
  const [draftTheme, setDraftTheme] = useState(theme?.startsWith('custom:') ? 'custom' : theme);
  const [draftCustomBg, setDraftCustomBg] = useState(() => {
    if (theme?.startsWith('custom:')) {
      const match = theme.match(/bg=([^,]+)/);
      return match ? match[1] : '#0a0e13';
    }
    return '#0a0e13';
  });
  const [draftCustomAccent, setDraftCustomAccent] = useState(() => {
    if (theme?.startsWith('custom:')) {
      const match = theme.match(/accent=([^,]+)/);
      return match ? match[1] : '#ff4655';
    }
    return '#ff4655';
  });
  const [draftBannerUrl, setDraftBannerUrl] = useState(bannerUrl);
  const [draftBannerOffsetY, setDraftBannerOffsetY] = useState(bannerOffsetY);
  const [draftIsPublic, setDraftIsPublic] = useState(isPublic ?? true);
  const [draftLocale, setDraftLocale] = useState<Locale>(locale || 'fr');

  // Preview theme live
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-midnight', 'theme-crimson', 'theme-ocean', 'theme-custom');
    if (draftTheme !== 'dark' && draftTheme !== 'custom') document.body.classList.add(`theme-${draftTheme}`);
    if (draftTheme === 'custom') {
      document.body.classList.add('theme-custom');
      document.documentElement.style.setProperty('--custom-bg', draftCustomBg);
      document.documentElement.style.setProperty('--custom-accent', draftCustomAccent);
    }
    
    // Cleanup on unmount (restore original theme if not saved)
    return () => {
      document.body.classList.remove('theme-light', 'theme-midnight', 'theme-crimson', 'theme-ocean', 'theme-custom');
      document.documentElement.style.removeProperty('--custom-bg');
      document.documentElement.style.removeProperty('--custom-accent');
      if (theme !== 'dark' && !theme?.startsWith('custom:')) document.body.classList.add(`theme-${theme}`);
      if (theme?.startsWith('custom:')) {
        document.body.classList.add('theme-custom');
        const matchBg = theme.match(/bg=([^,]+)/);
        const matchAccent = theme.match(/accent=([^,]+)/);
        if (matchBg) document.documentElement.style.setProperty('--custom-bg', matchBg[1]);
        if (matchAccent) document.documentElement.style.setProperty('--custom-accent', matchAccent[1]);
      }
    };
  }, [draftTheme, draftCustomBg, draftCustomAccent, theme]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smartRating: draftSmartRating,
          theme: draftTheme === 'custom' ? `custom:bg=${draftCustomBg},accent=${draftCustomAccent}` : draftTheme,
          bannerUrl: draftBannerUrl,
          bannerOffsetY: draftBannerOffsetY,
          isPublic: draftIsPublic,
          videoLoop: draftVideoLoop,
          videoLoopDelay: draftVideoLoopDelay,
          hiddenStats: JSON.stringify(draftHiddenStats),
          enforcePublicStats: draftEnforcePublicStats,
          language: draftLocale
        })
      });
      if (res.ok) {
        setSmartRating(draftSmartRating);
        setTheme(draftTheme === 'custom' ? `custom:bg=${draftCustomBg},accent=${draftCustomAccent}` : draftTheme);
        setBannerUrl(draftBannerUrl);
        setBannerOffsetY(draftBannerOffsetY);
        if (setIsPublic) setIsPublic(draftIsPublic);
        if (setVideoLoop) setVideoLoop(draftVideoLoop);
        if (setVideoLoopDelay) setVideoLoopDelay(draftVideoLoopDelay);
        setHiddenStats(draftHiddenStats);
        setEnforcePublicStats(draftEnforcePublicStats);
        setLocale(draftLocale);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reverts to original theme automatically via useEffect cleanup
    onClose();
  };
  
  // Default banners
  const banners = [
    { name: t('banner_default', locale), url: p?.cardWideUrl || "" },
    { name: "Ascent", url: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png" },
    { name: "Bind", url: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png" },
    { name: "Haven", url: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t("nav_settings", locale)}</h2>
        <button onClick={onClose} className="px-6 py-2.5 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)]">
          Retour au profil
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {[{id:'features', label: t('settings_features', locale)}, 
            {id:'privacy', label: t('settings_privacy', locale)}, 
            {id:'appearance', label: t('settings_appearance', locale)},
            {id:'language', label: t('settings_language', locale)},
            {id:'about', label: t('settings_about', locale)}].map(tab => (
            <button key={tab.id} onClick={() => { setSettingsTab(tab.id); pushUrl({ view: 'settings', settingsTab: tab.id }); }}
              className={`text-left px-5 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${settingsTab === tab.id ? 'bg-[var(--color-surface-hover)] border-l-4 border-[var(--color-val-red)] text-[var(--color-text-primary)] shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {settingsTab === 'features' && (
            <div className="glass-panel rounded-2xl p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{t('smart_rating', locale)}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('visual_indicators_desc', locale)}</p>
                  </div>
                  <button onClick={() => setDraftSmartRating(!draftSmartRating)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 ${draftSmartRating ? 'bg-[var(--color-val-red)]' : 'bg-gray-400 dark:bg-[rgba(255,255,255,0.1)]'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${draftSmartRating ? 'translate-x-7' : 'translate-x-1'}`}></span>
                  </button>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{t('video_loop', locale)}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('video_loop_desc', locale)}</p>
                    </div>
                    <button onClick={() => setDraftVideoLoop(!draftVideoLoop)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 ${draftVideoLoop ? 'bg-[var(--color-val-red)]' : 'bg-gray-400 dark:bg-[rgba(255,255,255,0.1)]'}`}>
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${draftVideoLoop ? 'translate-x-7' : 'translate-x-1'}`}></span>
                    </button>
                  </div>
                  
                  {draftVideoLoop && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 pl-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-[var(--color-text-secondary)]">{t('video_delay', locale)}</span>
                        <span className="text-sm font-bold text-[var(--color-val-red)]">{draftVideoLoopDelay} ms</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="3000" step="100" 
                        value={draftVideoLoopDelay}
                        onChange={(e) => setDraftVideoLoopDelay(Number(e.target.value))}
                        className="w-full accent-[var(--color-val-red)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'privacy' && (
            <div className="glass-panel rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{t('profile_privacy', locale)}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('profile_privacy_desc', locale)}</p>
              </div>

              <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${draftIsPublic ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {draftIsPublic ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[var(--color-text-primary)]">
                      {draftIsPublic ? t('public_profile', locale) : t('private_profile', locale)}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-md">
                      {draftIsPublic 
                        ? t('public_profile_desc', locale) 
                        : t('private_profile_desc', locale)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDraftIsPublic(!draftIsPublic)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${draftIsPublic ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${draftIsPublic ? 'translate-x-7' : 'translate-x-1'}`}></span>
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)]">
                <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-2">{t('stats_visibility', locale)}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                  Décochez les statistiques que vous ne souhaitez pas voir sur votre propre profil.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {statOptions.map(stat => (
                    <label key={stat.id} className="flex items-center gap-3 p-3 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-val-red)] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={!draftHiddenStats.includes(stat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDraftHiddenStats(draftHiddenStats.filter(id => id !== stat.id));
                          } else {
                            setDraftHiddenStats([...draftHiddenStats, stat.id]);
                          }
                        }}
                        className="w-4 h-4 accent-[var(--color-val-red)] cursor-pointer"
                      />
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">{stat.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
                  <div>
                    <h5 className="font-bold text-sm text-[var(--color-text-primary)]">{t('apply_to_visitors', locale)}</h5>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{t('apply_to_visitors_desc', locale)}</p>
                  </div>
                  <button onClick={() => setDraftEnforcePublicStats(!draftEnforcePublicStats)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${draftEnforcePublicStats ? 'bg-[var(--color-val-red)]' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${draftEnforcePublicStats ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {settingsTab === 'appearance' && (
            <div className="glass-panel rounded-2xl p-8 space-y-10">
              {/* Sélecteur de Thème */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">{t('ui_theme', locale)}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5">{t('ui_theme_desc', locale)}</p>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { id: 'dark', name: t('theme_dark', locale), bg: '#0a0e13', surface: '#0f1923', accent: '#8b97a3' },
                    { id: 'light', name: t('theme_light', locale), bg: '#f0f1f5', surface: '#ffffff', accent: '#525f6e' },
                    { id: 'midnight', name: t('theme_midnight', locale), bg: '#0d0b1a', surface: '#140f28', accent: '#8c64ff' },
                    { id: 'crimson', name: t('theme_crimson', locale), bg: '#120808', surface: '#1e0a0a', accent: '#ff4655' },
                    { id: 'ocean', name: t('theme_ocean', locale), bg: '#071014', surface: '#0a1923', accent: '#32c8b4' },
                    { id: 'custom', name: t('theme_custom', locale), bg: draftCustomBg, surface: draftCustomBg, accent: draftCustomAccent },
                  ].map(t => (
                    <button key={t.id} onClick={() => setDraftTheme(t.id)}
                      className={`relative rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all duration-300 cursor-pointer ${draftTheme === t.id ? 'border-[var(--color-val-red)] shadow-[0_0_20px_rgba(255,70,85,0.3)] scale-105' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}>
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: t.bg }}>
                        <div className="flex-1"></div>
                        <div className="h-[40%] rounded-t-md mx-1" style={{ backgroundColor: t.surface, border: `1px solid ${t.accent}20` }}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t.name}</span>
                      {draftTheme === t.id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-val-red)] rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                    </button>
                  ))}
                </div>
              </div>
              
              <hr className="border-[var(--color-border)]" />
              
              {/* Option Couleur Custom */}
              {draftTheme === 'custom' && (
                <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] animate-in fade-in duration-300">
                  <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-4">{t('color_customization', locale)}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] font-medium">{t('accent_color', locale)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase font-mono">{draftCustomAccent}</span>
                        <input type="color" value={draftCustomAccent} onChange={e => setDraftCustomAccent(e.target.value)} 
                          className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] font-medium">{t('bg_color', locale)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase font-mono">{draftCustomBg}</span>
                        <input type="color" value={draftCustomBg} onChange={e => setDraftCustomBg(e.target.value)} 
                          className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bannière - Only show if user has a Valorant profile to preview with */}
              {p && (
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-4">{t('banner_customization', locale)}</h3>
                  
                      <div className="flex gap-4 mb-6 flex-wrap">
                        {banners.map((b, i) => b.url && (
                          <button key={i} onClick={() => setDraftBannerUrl(b.url)}
                            className={`relative w-32 h-16 rounded-lg overflow-hidden border-2 transition-all ${draftBannerUrl === b.url || (!draftBannerUrl && i === 0) ? 'border-[var(--color-val-red)] shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'border-transparent hover:border-[var(--color-border)]'}`}>
                            <img referrerPolicy="no-referrer" src={b.url} alt={b.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-bold">{b.name}</span>
                            </div>
                          </button>
                        ))}
                        <button onClick={() => setCatalogOpen(true)}
                          className="relative w-32 h-16 rounded-lg overflow-hidden border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-val-red)] transition-all flex items-center justify-center group bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,70,85,0.1)] cursor-pointer">
                          <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-val-red)] text-xs font-bold uppercase tracking-widest transition-colors flex flex-col items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            Voir plus
                          </span>
                        </button>
                      </div>
                      
                      {/* Slider interactif avec APERÇU EN DIRECT */}
                      <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4 max-w-xl">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-sm text-[var(--color-text-primary)]">{t('vertical_crop', locale)}</label>
                          <span className="text-xs font-black text-white bg-[var(--color-val-red)] px-2 py-0.5 rounded">{draftBannerOffsetY}%</span>
                        </div>

                        {/* Visualiseur de cadre en temps réel */}
                        <div className="relative w-full aspect-[3.8/1] max-h-[140px] rounded-xl overflow-hidden border border-[var(--color-border)] bg-[#0a0e13] shadow-md">
                          <img referrerPolicy="no-referrer" src={draftBannerUrl || p?.cardWideUrl || ""} alt="Aperçu" style={{ objectPosition: `center ${draftBannerOffsetY}%` }} className="absolute inset-0 w-full h-full object-cover transition-all duration-75" />
                          <div className="absolute inset-0 bg-black/40"></div>
                          <div className="relative z-10 p-3 flex items-center justify-between h-full">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                                <img referrerPolicy="no-referrer" src={p?.cardUrl} alt="Avatar" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-black text-white drop-shadow-md">{p?.gameName || "Joueur"}</span>
                            </div>
                            <span className="text-[10px] font-black text-[var(--color-val-light)] border border-[var(--color-val-light)]/40 px-2 py-0.5 rounded backdrop-blur-sm">{t('live_preview', locale)}</span>
                          </div>
                        </div>

                        <input type="range" min="0" max="100" value={draftBannerOffsetY} onChange={e => setDraftBannerOffsetY(Number(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-val-red)]" />
                        <p className="text-[11px] text-[var(--color-text-secondary)]">Glissez le curseur pour voir l&apos;image s&apos;ajuster en temps réel dans le cadre ci-dessus.</p>
                      </div>
                      
                      <BannerCatalogModal isOpen={catalogOpen} onClose={() => setCatalogOpen(false)} onSelect={(url) => setDraftBannerUrl(url)} />
                </div>
              )}

            </div>
          )}
          
          {settingsTab === 'language' && (
            <div className="glass-panel rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{t('settings_language_title', locale)}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('settings_language_desc', locale)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                {LOCALES.map(l => (
                  <button key={l.code} onClick={() => setDraftLocale(l.code)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${draftLocale === l.code ? 'border-[var(--color-val-red)] bg-[var(--color-val-red)]/10 text-[var(--color-text-primary)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'}`}>
                    <span className="text-2xl">{l.flag}</span>
                    <span className="font-bold">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'about' && (
             <div className="glass-panel rounded-2xl p-8">
               <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">Valorant Performance Tracker</h3>
               <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{t('footer_desc', locale)}</p>
             </div>
           )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
            <button onClick={handleCancel} disabled={loading}
              className="px-6 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-bold rounded-xl transition-all border border-[var(--color-border)] disabled:opacity-50">
              Annuler
            </button>
            <button onClick={handleSave} disabled={loading}
              className="px-6 py-3 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] disabled:opacity-50 flex items-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t('settings_saving', locale)}</>
              ) : t('save_settings', locale)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Stat Card ====================
function StatCard({ label, value, suffix, sub, highlight, warning, smartRating, colSpan }: {
  label: string; value: string | number; suffix?: string; sub?: string; highlight?: boolean; warning?: string; smartRating: boolean; colSpan?: number;
}) {
  return (
    <div className={`glass-panel p-5 rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--color-surface-hover)] transition-all duration-300 ${highlight ? 'border border-[rgba(255,70,85,0.25)] bg-[rgba(255,70,85,0.03)]' : ''} ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <div className="flex items-center">
        <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-bold">{label}</span>
        {smartRating && warning && <Tooltip message={warning} />}
      </div>
      <span className={`text-3xl font-black mt-2 ${highlight ? 'text-[var(--color-val-red)] drop-shadow-[0_0_10px_rgba(255,70,85,0.3)]' : 'text-[var(--color-text-on-surface)]'} ${smartRating && warning ? 'text-[#ffb432]' : ''}`}>
        {value}{suffix}
      </span>
      {sub && <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest mt-1.5 font-bold">{sub}</span>}
    </div>
  );
}

// ==================== Debug Panel ====================
function DebugPanel({ isOpen, onClose, onGenerate }: { isOpen: boolean; onClose: () => void; onGenerate: () => void; }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}></div>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0d1117] border border-[rgba(255,70,85,0.3)] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] z-50 p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-[var(--color-val-red)] animate-pulse"></div>
          <h2 className="text-lg font-black uppercase tracking-widest text-[var(--color-val-red)]">Debug Panel</h2>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">Génère un joueur fictif avec des statistiques aléatoires pour tester l&apos;interface.</p>

        <button onClick={() => { onGenerate(); onClose(); }}
          className="w-full bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white font-bold py-3 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,70,85,0.3)] cursor-pointer mb-3">
          Générer un joueur aléatoire
        </button>

        <button onClick={() => { window.open('/?simulate=true', '_blank'); onClose(); }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer">
          Ouvrir Simulateur (Nouvel Onglet)
        </button>
        <button onClick={onClose} className="w-full mt-3 text-[var(--color-text-secondary)] hover:text-white font-bold py-3 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs cursor-pointer">
          Fermer
        </button>
      </div>
    </>
  );
}

import { Suspense } from "react";
import RichTextRenderer from "@/components/RichTextRenderer";
import { t, LOCALES, Locale } from "@/lib/i18n";

// ==================== News View Component (BDD Neon) ====================
function NewsViewComponent({ newsItems, setNewsItems, locale }: { newsItems: any[]; setNewsItems: (items: any[]) => void; locale: Locale; }) {
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [sortOption, setSortOption] = useState<'date_desc'|'date_asc'|'title_asc'|'title_desc'>('date_desc');

  useEffect(() => {
    setNewsLoading(true);
    fetch('/api/cms/news')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNewsItems(data);
        else setNewsItems([]);
      })
      .catch(() => setNewsError('Impossible de charger les actualités.'))
      .finally(() => setNewsLoading(false));
  }, [setNewsItems]);

  // Résout le nœud actif de chaque actualité (arbre de décision)
  const getActiveNode = (item: any) => {
    const nodes = item.nodes || [];
    return nodes.find((n: any) => n.id === item.currentNodeId) || nodes[0] || null;
  };

  const sortedNews = [...newsItems].sort((a, b) => {
    if (sortOption === 'date_desc') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortOption === 'date_asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    } else if (sortOption === 'title_asc') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortOption === 'title_desc') {
      return (b.title || '').localeCompare(a.title || '');
    }
    return 0;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t("nav_news", locale)}</h2>
        <select 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as any)}
          className="bg-[var(--color-surface)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg border border-[var(--color-border)] outline-none focus:border-[var(--color-val-red)] transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <option value="date_desc">Récentes d'abord</option>
          <option value="date_asc">Anciennes d'abord</option>
          <option value="title_asc">Titre (A-Z)</option>
          <option value="title_desc">Titre (Z-A)</option>
        </select>
      </div>

      {newsLoading && (
        <div className="text-center text-[var(--color-text-secondary)] animate-pulse py-20 uppercase tracking-widest font-bold">
          Chargement des actualités...
        </div>
      )}

      {newsError && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-[var(--color-text-secondary)] mb-2">{newsError}</p>
        </div>
      )}

      {!newsLoading && !newsError && sortedNews.length === 0 && (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-lg text-[var(--color-text-secondary)] font-bold">Aucune actualité pour le moment</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {sortedNews.map(item => {
          const activeNode = getActiveNode(item);
          return (
            <div key={item.id} className="glass-panel rounded-2xl p-6 hover:bg-[var(--color-surface-hover)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{item.title}</h3>
                <span className="text-[10px] text-[var(--color-text-secondary)] ml-auto">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              {activeNode && (
                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  <RichTextRenderer content={activeNode.content || ''} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Agents Wiki Component ====================
function AgentsWikiComponent({ videoLoop, videoLoopDelay, locale, pushUrl }: { videoLoop?: boolean, videoLoopDelay?: number, locale: Locale, pushUrl: any }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/cms/agents')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAgents(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (agents.length > 0) {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/agents\/([^/]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const agent = agents.find(a => a.name.toLowerCase() === slug.toLowerCase());
        if (agent) {
          setSelectedAgent(agent);
        }
      } else {
        setSelectedAgent(null);
      }
    }
  }, [agents]);

  // Écouter popstate pour mettre à jour l'agent si on fait précédent/suivant
  useEffect(() => {
    const handlePop = () => {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/agents\/([^/]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const agent = agents.find(a => a.name.toLowerCase() === slug.toLowerCase());
        if (agent) setSelectedAgent(agent);
      } else {
        setSelectedAgent(null);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [agents]);

  const abilitySlots = [
    { key: 'C', label: 'C — Gratuite', color: '#22c55e' },
    { key: 'Q', label: 'Q', color: '#3b82f6' },
    { key: 'E', label: 'E — Signature', color: '#f59e0b' },
    { key: 'X', label: 'X — Ultime', color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="text-center text-[var(--color-text-secondary)] animate-pulse py-20 uppercase tracking-widest font-bold">
        {t("loading_agents", locale)}
      </div>
    );
  }

  if (selectedAgent) {
    const abilities = selectedAgent.abilities || {};
    return (
      <div className="w-full max-w-4xl mx-auto px-8 animate-in fade-in duration-300">
        <button onClick={() => { setSelectedAgent(null); pushUrl({ view: 'agents', agentSlug: null }); }} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-val-red)] transition-colors mb-6 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {t('back_to_agents', locale)}
        </button>

        <div className="glass-panel rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            {selectedAgent.iconUrl && (
              <img referrerPolicy="no-referrer" src={selectedAgent.iconUrl} alt={selectedAgent.name} className="w-24 h-24 rounded-xl object-contain bg-[var(--color-background)] p-2 border border-[var(--color-border)]" />
            )}
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">{selectedAgent.name}</h2>
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-val-red)]">{selectedAgent.role}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {abilitySlots.map(slot => {
            const ab = abilities[slot.key];
            if (!ab || !ab.name) return null;
            return <AbilityCard key={slot.key} ability={ab} slotName={slot.label} globalLoop={videoLoop} globalLoopDelayMs={videoLoopDelay} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-8 animate-in fade-in duration-300">
      <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-8">{t("tab_agents", locale)}</h2>
      
      {agents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-lg text-[var(--color-text-secondary)] font-bold">{t("no_agents_configured", locale)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {agents.map(agent => (
            <button key={agent.id} onClick={() => { setSelectedAgent(agent); pushUrl({ view: 'agents', agentSlug: agent.name.toLowerCase() }); }}
              className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-[var(--color-surface-hover)] transition-all duration-300 group cursor-pointer border-none">
              {agent.iconUrl ? (
                <img referrerPolicy="no-referrer" src={agent.iconUrl} alt={agent.name} className="w-16 h-16 rounded-xl object-contain bg-[var(--color-background)] p-1 border border-[var(--color-border)] group-hover:border-[var(--color-val-red)] transition-colors" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] group-hover:border-[var(--color-val-red)] transition-colors flex items-center justify-center">
                  <span className="text-[var(--color-text-secondary)] font-bold text-xs">?</span>
                </div>
              )}
              <div className="text-center">
                <div className="font-bold uppercase tracking-widest text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-val-red)] transition-colors">{agent.name}</div>
                <div className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">{agent.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function HomeContent() {
  const { data: realSession, status: realStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSimulatedNewUser = searchParams?.get('simulate') === 'true';

  const simulatedSession = useMemo(() => ({
    user: {
      name: "test",
      email: "test@spycam.com",
      onboardingDone: true,
      riotId: null,
      riotPuuid: null,
    }
  }), []);

  const session = isSimulatedNewUser ? simulatedSession : realSession;
  const status = isSimulatedNewUser ? 'authenticated' as const : realStatus;

  const [riotId, setRiotId] = useState("");
  const [myRiotId, setMyRiotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("performance");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("features");
  const [debugOpen, setDebugOpen] = useState(false);
  const [newsView, setNewsView] = useState(false);
  const [agentsView, setAgentsView] = useState(false);
  const [locale, setLocale] = useState<Locale>('fr');

  // ==================== URL ROUTING HELPERS ====================
  // Mapping entre les noms d'onglets internes et les slugs URL
  const TAB_TO_SLUG: Record<string, string> = useMemo(() => ({
    'performance': 'home',
    'agents': 'agents-stats',
    'matches': 'historique',
  }), []);
  const SLUG_TO_TAB: Record<string, string> = useMemo(() => ({
    'home': 'performance',
    'agents-stats': 'agents',
    'historique': 'matches',
  }), []);
  const VALID_SLUGS = useMemo(() => ['home', 'performance', 'historique', 'agents', 'agents-stats', 'actualites', 'parametres'], []);

  // Convertit un Riot ID ("Gr4phØ#0001") en slug URL ("Gr4phØ-0001")
  const riotIdToSlug = useCallback((id: string) => {
    // Remplace le dernier # par un tiret (les Riot IDs sont format "Name#Tag")
    const hashIndex = id.lastIndexOf('#');
    if (hashIndex === -1) return encodeURIComponent(id);
    return encodeURIComponent(id.substring(0, hashIndex) + '-' + id.substring(hashIndex + 1));
  }, []);

  // Convertit un slug URL ("Gr4phØ-0001") en Riot ID ("Gr4phØ#0001")
  const slugToRiotId = useCallback((slug: string) => {
    const decoded = decodeURIComponent(slug);
    // Remplace le dernier tiret par un # 
    const lastDash = decoded.lastIndexOf('-');
    if (lastDash === -1) return decoded;
    return decoded.substring(0, lastDash) + '#' + decoded.substring(lastDash + 1);
  }, []);

  // Met à jour l'URL du navigateur sans recharger la page
  const pushUrl = useCallback((opts?: { tab?: string; playerId?: string | null; isOwnProfile?: boolean; view?: 'news' | 'agents' | 'settings' | null; agentSlug?: string | null; settingsTab?: string | null }) => {
    const tab = opts?.tab;
    const playerId = opts?.playerId;
    const isOwn = opts?.isOwnProfile ?? false;
    const view = opts?.view;
    const agentSlug = opts?.agentSlug;
    const sTab = opts?.settingsTab;

    let path = '/';

    if (view === 'news') {
      path = isOwn || !playerId ? '/actualites' : `/${riotIdToSlug(playerId)}/actualites`;
    } else if (view === 'agents') {
      if (agentSlug) {
        path = isOwn || !playerId ? `/agents/${agentSlug}` : `/${riotIdToSlug(playerId)}/agents/${agentSlug}`;
      } else {
        path = isOwn || !playerId ? '/agents' : `/${riotIdToSlug(playerId)}/agents`;
      }
    } else if (view === 'settings') {
      path = sTab ? `/parametres/${sTab}` : '/parametres';
    } else if (tab) {
      const slug = TAB_TO_SLUG[tab] || tab;
      if (isOwn || !playerId) {
        // Map 'home' -> '/home' explicitly instead of '/home/home' or just '/'
        path = (slug === 'home' && !isOwn && !playerId) ? '/home' : `/home/${slug}`;
        if (slug === 'home' && isOwn) path = '/home'; // simplifie pour le profil propre
      } else {
        path = `/${riotIdToSlug(playerId)}/home/${slug}`;
        if (slug === 'home') path = `/${riotIdToSlug(playerId)}/home`;
      }
    } else {
      // Default: home
      if (isOwn || !playerId) {
        path = '/home';
      } else {
        path = `/${riotIdToSlug(playerId)}/home`;
      }
    }

    // Ne push que si l'URL a changé
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [riotIdToSlug, TAB_TO_SLUG]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [gameMode, setGameMode] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [visibleMatchesCount, setVisibleMatchesCount] = useState(10);
  
  const availableSeasons = useMemo(() => {
    if (!playerData?.player?.matchHistory) return [];
    const seasons = new Set<string>();
    playerData.player.matchHistory.forEach((m: any) => {
      if (m.season) seasons.add(m.season);
    });
    return Array.from(seasons).sort((a: any, b: any) => b.localeCompare(a));
  }, [playerData]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  // Settings State
  const [smartRating, setSmartRating] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerOffsetY, setBannerOffsetY] = useState(50);
  const [isPublic, setIsPublic] = useState(true);
  const [videoLoop, setVideoLoop] = useState(true);
  const [videoLoopDelay, setVideoLoopDelay] = useState(500);
  const [hiddenStats, setHiddenStats] = useState<string[]>([]);
  const [enforcePublicStats, setEnforcePublicStats] = useState(false);

  // Favorites State (stored in localStorage)
  const [favorites, setFavorites] = useState<Array<{riotId: string, gameName: string, tagLine: string, cardUrl: string}>>([]);

  const favoritesKey = session?.user?.email 
    ? `spycam-favorites-${session.user.email}` 
    : 'spycam-favorites';

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(favoritesKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]); // Clear favorites if changing to an account with no favorites
      }
    } catch {}
  }, [favoritesKey]);

  // Save favorites to localStorage
  const saveFavorites = (newFavs: typeof favorites) => {
    setFavorites(newFavs);
    try { localStorage.setItem(favoritesKey, JSON.stringify(newFavs)); } catch {}
  };

  const toggleFavorite = (player: any) => {
    const id = `${player.gameName}#${player.tagLine}`;
    const exists = favorites.some(f => f.riotId === id);
    if (exists) {
      saveFavorites(favorites.filter(f => f.riotId !== id));
    } else {
      saveFavorites([...favorites, {
        riotId: id,
        gameName: player.gameName,
        tagLine: player.tagLine,
        cardUrl: player.cardUrl || ''
      }]);
    }
  };

  const isFavorited = (gameName: string, tagLine: string) => {
    return favorites.some(f => f.riotId === `${gameName}#${tagLine}`);
  };

  const goHome = () => {
    if (myRiotId) {
      setRiotId(myRiotId);
      setLoading(true); setError(""); setPlayerData(null);
      pushUrl({ tab: activeTab, playerId: myRiotId, isOwnProfile: true });
      fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riotId: myRiotId }) })
        .then(r => r.json())
        .then(d => { if (d.error) setError(d.error); else setPlayerData(d); })
        .catch(() => setError("Serveur inaccessible."))
        .finally(() => setLoading(false));
    }
  };

  const searchPlayer = (searchId: string) => {
    const isOwn = myRiotId && searchId.toLowerCase() === myRiotId.toLowerCase();
    setRiotId(searchId);
    setLoading(true); setError(""); setPlayerData(null);
    pushUrl({ tab: activeTab, playerId: searchId, isOwnProfile: !!isOwn });
    fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riotId: searchId }) })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setPlayerData(d); })
      .catch(() => setError("Serveur inaccessible."))
      .finally(() => setLoading(false));
  };

  const storageKey = isSimulatedNewUser ? 'val-tracker-settings-sim' : 'val-tracker-settings';

  const canEditProfile = !isSimulatedNewUser && (
    (playerData?.player?.puuid?.startsWith('debug-')) || 
    (session?.user?.email === 'laffont.romain64@gmail.com' && playerData?.player?.gameName === 'Gr4phØ') ||
    (session?.user?.email === 'spycam_riot_temp@gmail.com' && playerData?.player?.gameName?.toLowerCase() === 'riot_test') ||
    (session?.user?.email === 'romain.lft64@gmail.com' && playerData?.player?.gameName?.toLowerCase() === 'biflette64') ||
    ((session?.user as any)?.riotPuuid && (session?.user as any)?.riotPuuid === playerData?.player?.puuid)
  );

  // Auth redirect & Initial fetch
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated' && !isSimulatedNewUser) {
      router.replace('/login');
    } else if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (!user.onboardingDone && !isSimulatedNewUser) {
        router.replace('/onboarding');
      } else {
        if (user.theme) setTheme(user.theme);
        if (user.smartRating !== undefined) setSmartRating(user.smartRating);
        if (user.bannerUrl !== undefined) setBannerUrl(user.bannerUrl || '');
        if (user.bannerOffsetY !== undefined) setBannerOffsetY(user.bannerOffsetY ?? 50);
        if (user.isPublic !== undefined) setIsPublic(user.isPublic);
        if (user.videoLoop !== undefined) setVideoLoop(user.videoLoop);
        if (user.videoLoopDelay !== undefined) setVideoLoopDelay(user.videoLoopDelay);
        if (user.hiddenStats !== undefined) {
          try { setHiddenStats(JSON.parse(user.hiddenStats)); } catch {}
        }
        if (user.enforcePublicStats !== undefined) setEnforcePublicStats(user.enforcePublicStats);
        if (user.language) {
          setLocale(user.language as Locale);
        }

        if (!playerData && !loading) {
          let initialRiotId = user.riotId;
          
          if (!isSimulatedNewUser && user.email === 'laffont.romain64@gmail.com') {
             initialRiotId = 'Gr4phØ#0001';
           } else if (!isSimulatedNewUser && user.email === 'spycam_riot_temp@gmail.com') {
             initialRiotId = 'riot_test#TEST';
           } else if (!isSimulatedNewUser && user.email === 'romain.lft64@gmail.com') {
             initialRiotId = 'biflette64#1294';
           }
           
           if (initialRiotId) setMyRiotId(initialRiotId);
          
          if (isSimulatedNewUser) {
             initialRiotId = null; 
          }

          // === PARSE URL pour restaurer la navigation ===
          const pathname = window.location.pathname;
          const segments = pathname.split('/').filter(Boolean); // ex: ["Gr4phØ-0001", "historique"] ou ["home"]
          let urlRiotId: string | null = null;
          let urlTab: string | null = null;
          let urlView: 'news' | 'agents' | 'settings' | null = null;
          let uAgentSlug: string | null = null;
          let uSettingsTab: string | null = null;

          if (segments.length > 0) {
            if (segments[0] === 'actualites') {
              urlView = 'news';
            } else if (segments[0] === 'agents') {
              urlView = 'agents';
              if (segments[1]) uAgentSlug = segments[1];
            } else if (segments[0] === 'parametres') {
              urlView = 'settings';
              if (segments[1]) uSettingsTab = segments[1];
            } else if (segments[0] === 'home') {
              if (segments[1] && SLUG_TO_TAB[segments[1]]) {
                urlTab = SLUG_TO_TAB[segments[1]];
              } else {
                urlTab = 'performance';
              }
            } else {
              // C'est un profil joueur
              urlRiotId = slugToRiotId(segments[0]);
              if (segments[1] === 'actualites') {
                urlView = 'news';
              } else if (segments[1] === 'agents') {
                urlView = 'agents';
                if (segments[2]) uAgentSlug = segments[2];
              } else if (segments[1] === 'parametres') {
                urlView = 'settings';
                if (segments[2]) uSettingsTab = segments[2];
              } else if (segments[1] === 'home') {
                if (segments[2] && SLUG_TO_TAB[segments[2]]) {
                  urlTab = SLUG_TO_TAB[segments[2]];
                } else {
                  urlTab = 'performance';
                }
              }
            }
          }

          if (urlView === 'news') setNewsView(true);
          else if (urlView === 'agents') setAgentsView(true);
          else if (urlView === 'settings') {
            setSettingsOpen(true);
            if (uSettingsTab) setSettingsTab(uSettingsTab);
          }
          if (urlTab) setActiveTab(urlTab);

          // Déterminer quel joueur charger
          const targetRiotId = urlRiotId || initialRiotId;

          if (targetRiotId) {
            setRiotId(targetRiotId);
            setLoading(true); setError(""); setPlayerData(null);
            const isOwn = initialRiotId && targetRiotId.toLowerCase() === initialRiotId.toLowerCase();
            // Mettre à jour l'URL si on était sur "/"
            if (pathname === '/' || pathname === '') {
              pushUrl({ tab: urlTab || 'performance', playerId: targetRiotId, isOwnProfile: !!isOwn });
            }
            fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riotId: targetRiotId }) })
              .then(r => r.json())
              .then(d => { if (d.error) setError(d.error); else setPlayerData(d); })
              .catch(() => setError("Serveur inaccessible."))
              .finally(() => setLoading(false));
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isSimulatedNewUser]);

  // === Gérer les boutons Précédent/Suivant du navigateur ===
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);

      // Reset des vues
      setNewsView(false);
      setAgentsView(false);
      setSettingsOpen(false);

      if (segments.length === 0) {
        // URL racine → profil principal
        if (myRiotId) { searchPlayer(myRiotId); }
        setActiveTab('performance');
        return;
      }

      let urlRiotId: string | null = null;
      let urlTab: string | null = null;

      if (segments[0] === 'actualites') {
        setNewsView(true);
      } else if (segments[0] === 'agents') {
        setAgentsView(true);
        if (segments[1]) {
          // Géré plus tard dans l'effet des agents pour setSelectedAgent
          // Mais il faut un moyen de le passer au composant AgentsWiki
        }
      } else if (segments[0] === 'parametres') {
        setSettingsOpen(true);
        if (segments[1]) setSettingsTab(segments[1]);
      } else if (segments[0] === 'home') {
        if (segments[1] && SLUG_TO_TAB[segments[1]]) {
          urlTab = SLUG_TO_TAB[segments[1]];
        } else {
          urlTab = 'performance';
        }
      } else {
        // C'est un profil joueur
        urlRiotId = slugToRiotId(segments[0]);
        if (segments[1] === 'actualites') {
          setNewsView(true);
        } else if (segments[1] === 'agents') {
          setAgentsView(true);
        } else if (segments[1] === 'parametres') {
          setSettingsOpen(true);
        } else if (segments[1] === 'home') {
          if (segments[2] && SLUG_TO_TAB[segments[2]]) {
            urlTab = SLUG_TO_TAB[segments[2]];
          } else {
            urlTab = 'performance';
          }
        }
      }

      if (urlTab) setActiveTab(urlTab);

      // Charger le joueur si nécessaire
      if (urlRiotId && urlRiotId !== riotId) {
        setRiotId(urlRiotId);
        setLoading(true); setError(""); setPlayerData(null);
        fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riotId: urlRiotId }) })
          .then(r => r.json())
          .then(d => { if (d.error) setError(d.error); else setPlayerData(d); })
          .catch(() => setError(t('error_server', locale)))
          .finally(() => setLoading(false));
      } else if (!urlRiotId && myRiotId && riotId !== myRiotId) {
        // Retour au profil principal
        searchPlayer(myRiotId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRiotId, riotId, VALID_SLUGS, SLUG_TO_TAB, slugToRiotId, locale]);

  const filteredMatches = useMemo(() => {
    if (!playerData?.player?.matchHistory) return [];
    return playerData.player.matchHistory.filter((m: any) => {
      const modeMatch = gameMode === 'all' || 
        (gameMode === 'competitive' && m.mode === 'competitive') ||
        (gameMode === 'unrated' && m.mode === 'unrated') ||
        (gameMode === 'other' && m.mode !== 'competitive' && m.mode !== 'unrated');

      const seasonMatch = selectedSeason === 'all' || m.season === selectedSeason;

      return modeMatch && seasonMatch;
    });
  }, [playerData?.player?.matchHistory, gameMode, selectedSeason]);

  const filteredAgents = useMemo(() => {
    if (!playerData?.player?.agentStats) return [];
    if (gameMode === 'all' && selectedSeason === 'all') return playerData.player.agentStats;

    const counts: Record<string, any> = {};
    filteredMatches.forEach((m: any) => {
      if (!counts[m.agent]) counts[m.agent] = { games: 0, wins: 0, kills: 0, deaths: 0, hoursPlayed: 0, icon: m.agentIcon };
      counts[m.agent].games++;
      if (m.won) counts[m.agent].wins++;
      counts[m.agent].kills += m.kills;
      counts[m.agent].deaths += m.deaths;
      counts[m.agent].hoursPlayed += (m.duration || 0) / 3600;
    });

    return Object.keys(counts).map(name => {
      const data = counts[name];
      const orig = playerData.player.agentStats.find((a: any) => a.name === name);
      return {
        name,
        role: orig?.role || 'Agent',
        icon: data.icon,
        games: data.games,
        winRate: Math.round((data.wins / data.games) * 100),
        kd: parseFloat((data.kills / Math.max(data.deaths, 1)).toFixed(2)),
        hoursPlayed: parseFloat(data.hoursPlayed.toFixed(1))
      };
    }).sort((a: any, b: any) => b.games - a.games);
  }, [playerData?.player?.agentStats, gameMode, selectedSeason, filteredMatches]);

  const filteredStats = useMemo(() => {
    if (!playerData?.player?.stats) return null;
    if (gameMode === 'all' && selectedSeason === 'all') return playerData.player.stats;
    
    const matches = filteredMatches;
    if (matches.length === 0) return { ...playerData.player.stats, kills: 0, deaths: 0, assists: 0, kdRatio: 0, winRate: 0, matchesPlayed: 0, acs: 0, headshotPct: 0, aceCount: 0 };

    const totalKills = matches.reduce((sum: number, m: any) => sum + m.kills, 0);
    const totalDeaths = matches.reduce((sum: number, m: any) => sum + m.deaths, 0);
    const totalAssists = matches.reduce((sum: number, m: any) => sum + m.assists, 0);
    const wins = matches.filter((m: any) => m.won).length;
    const totalHS = matches.reduce((sum: number, m: any) => sum + (m.headshots || 0), 0);
    const totalShots = matches.reduce((sum: number, m: any) => sum + (m.headshots || 0) + (m.bodyshots || 0) + (m.legshots || 0), 0);
    const totalAces = matches.reduce((sum: number, m: any) => sum + (m.aces || 0), 0);
    
    return {
      ...playerData.player.stats,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      kdRatio: parseFloat((totalKills / Math.max(totalDeaths, 1)).toFixed(2)),
      winRate: Math.round((wins / matches.length) * 100),
      matchesPlayed: matches.length,
      acs: Math.round(matches.reduce((sum: number, m: any) => sum + m.acs, 0) / matches.length),
      headshotPct: totalShots > 0 ? parseFloat(((totalHS / totalShots) * 100).toFixed(1)) : playerData.player.stats.headshotPct,
      aceCount: totalAces
    };
  }, [playerData?.player?.stats, gameMode, selectedSeason, filteredMatches]);

  // Active theme: profile owner's custom theme from BDD when viewing someone else's profile, or viewer's theme
  const activeTheme = useMemo(() => {
    if (!canEditProfile && playerData?.player?.customTheme) {
      return playerData.player.customTheme;
    }
    return theme;
  }, [playerData?.player?.customTheme, canEditProfile, theme]);

  // Apply logged-in user's background theme to body ALWAYS
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-midnight', 'theme-crimson', 'theme-ocean', 'theme-custom');
    document.documentElement.style.removeProperty('--custom-bg');
    document.documentElement.style.removeProperty('--custom-accent');
    
    if (theme !== 'dark' && !theme?.startsWith('custom:')) {
      document.body.classList.add(`theme-${theme}`);
    } else if (theme?.startsWith('custom:')) {
      document.body.classList.add('theme-custom');
      const matchBg = theme.match(/bg=([^,]+)/);
      const matchAccent = theme.match(/accent=([^,]+)/);
      if (matchBg) document.documentElement.style.setProperty('--custom-bg', matchBg[1]);
      if (matchAccent) document.documentElement.style.setProperty('--custom-accent', matchAccent[1]);
    }
  }, [theme]);

  useEffect(() => {
    const ep = searchParams?.get('error');
    if (ep) setError(ep === 'missing_credentials' ? "Client ID RSO manquant." : ep === 'token_exchange_failed' ? "Échec token Riot." : "Erreur connexion.");
    if (searchParams?.get('loggedIn') === 'true') fetchMyData();
  }, [searchParams]);

  const fetchMyData = async () => {
    setLoading(true); setError("");
    try { const r = await fetch("/api/auth/me"); const d = await r.json(); if (!r.ok) setError(d.error); else setPlayerData(d); }
    catch { setError("Session invalide."); } finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setPlayerData(null);
    const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
    
    // Logic: 
    // If owner (isOwn): always hide what they chose to hide.
    // If visitor (!isOwn): only hide if enforcePublicStats is checked.
    const appliedHiddenStats = isOwn || enforcePublicStats ? hiddenStats : [];
    
    setNewsView(false); setAgentsView(false); setSettingsOpen(false);
    pushUrl({ tab: 'performance', playerId: riotId, isOwnProfile: !!isOwn });
    try {
      const r = await fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riotId }) });
      const d = await r.json(); if (!r.ok) setError(d.error); else setPlayerData(d);
    } catch { setError("Serveur inaccessible."); } finally { setLoading(false); }
  };

  const handleDebugGenerate = async () => {
    setLoading(true); setError(""); setPlayerData(null);
    try {
      const r = await fetch("/api/valorant/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ debug: true }) });
      const d = await r.json(); if (!r.ok) setError(d.error); else setPlayerData(d);
    } catch { setError("Erreur debug."); } finally { setLoading(false); }
  };

  const getWarnings = (s: any) => {
    if (!s) return {};
    const w: Record<string, string> = {};
    if (s.kdRatio < 1) w.kd = `K/D de ${s.kdRatio} — en dessous de 1.0. Vous mourez plus que vous ne tuez. Travaillez le positionnement.`;
    if (s.headshotPct < 20) w.hs = `Headshot à ${s.headshotPct}% — sous la moyenne de 20%. Travaillez le crosshair placement.`;
    if (s.winRate < 50) w.wr = `Win rate de ${s.winRate}% — sous 50%. Adaptez vos stratégies et communiquez.`;
    if (s.acs < 200) w.acs = `ACS de ${s.acs} — sous 200. Participez davantage aux rounds.`;
    if (s.kast < 65) w.kast = `KAST de ${s.kast}% — sous 65%. Impliquez-vous plus (Kill/Assist/Survived/Trade).`;
    if (s.ddDelta < 0) w.dd = `DDΔ négatif (${s.ddDelta}) — vous subissez plus de dégâts que vous n'en infligez.`;
    return w;
  };

  // Raccourci clavier pour le debug panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setDebugOpen(o => !o); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (status === 'loading') {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-20 h-20 bg-[var(--color-val-red)] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,70,85,0.3)]"><span className="text-white text-4xl font-black">V</span></div>
          <p className="text-[var(--color-text-secondary)] uppercase tracking-widest text-sm font-bold">Chargement...</p>
        </div>
      </main>
    );
  }


  return (
    <>
    <main className="flex-1 flex flex-col relative overflow-hidden min-h-screen pb-20">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-val-red)] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <DebugPanel isOpen={debugOpen} onClose={() => setDebugOpen(false)} onGenerate={handleDebugGenerate} />

      {/* Header Container */}
      <header className="w-full z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-md sticky top-0 mb-8 flex flex-col">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex-1">
            <div className="w-12 h-12 bg-[var(--color-val-red)] rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(255,70,85,0.4)] cursor-pointer"
              onDoubleClick={() => setDebugOpen(true)}>V</div>
          </div>
          <div className="flex-[2] flex justify-center items-center gap-2">
            {/* Home button */}
            {playerData?.player?.gameName && myRiotId && (
              <button onClick={() => { setNewsView(false); setAgentsView(false); setSettingsOpen(false); goHome(); }} title={t('nav_back_profile', locale)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${(!newsView && !agentsView && !settingsOpen) ? 'bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </button>
            )}
            {/* News button */}
            <button onClick={() => { setNewsView(true); setAgentsView(false); setSettingsOpen(false); const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase(); pushUrl({ view: 'news', playerId: riotId || myRiotId, isOwnProfile: !!isOwn }); }} title={t('nav_news', locale)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${newsView && !agentsView ? 'bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            </button>
            {/* Agents Wiki button */}
            <button onClick={() => { setAgentsView(true); setNewsView(false); setSettingsOpen(false); const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase(); pushUrl({ view: 'agents', playerId: riotId || myRiotId, isOwnProfile: !!isOwn }); }} title={t('nav_agents', locale)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${agentsView ? 'bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </button>
            <form onSubmit={handleSearch} className="relative w-full max-w-md flex justify-center ml-2">
              <input type="text" placeholder={t('search_placeholder', locale)} value={riotId} onChange={(e) => setRiotId(e.target.value)}
                onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                className={`bg-[var(--color-text-primary)] text-[var(--color-background)] font-medium px-6 py-3 rounded-full outline-none transition-all duration-500 ease-in-out ${isFocused ? 'w-full shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'w-64'}`} required />
              <button type="submit" className="hidden"></button>
            </form>
          </div>
          <div className="flex-1 flex justify-end gap-3 items-center">
            {session?.user && (
              <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block mr-1">
                {(session.user as any).firstName || session.user.name || session.user.email}
              </span>
            )}
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="hidden sm:flex bg-[var(--color-surface-hover)] hover:bg-[var(--color-val-red)] transition-colors text-[var(--color-text-primary)] hover:text-white font-bold px-4 py-2 rounded-full items-center text-sm gap-2 border border-[var(--color-border)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {t('logout_button', locale)}
            </button>
            <button onClick={() => { const newVal = !settingsOpen; setSettingsOpen(newVal); if (newVal) { pushUrl({ view: 'settings' }); } else { const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase(); pushUrl({ tab: activeTab, playerId: riotId || myRiotId, isOwnProfile: !!isOwn }); } }} title={t('nav_settings', locale)}
              className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center border ${settingsOpen ? 'bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] border-[var(--color-border)] text-[var(--color-text-primary)]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        
        {/* Favorites bar - Attached to header like Chrome Bookmarks */}
        {favorites.length > 0 && !settingsOpen && (
          <div className="w-full px-6 py-2 flex items-center gap-2 border-t border-[var(--color-border)]/50 bg-[var(--color-background)]/50 overflow-x-auto">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mr-1 flex-shrink-0">{t('favorites', locale)}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {favorites.map(fav => (
                <button key={fav.riotId} onClick={() => searchPlayer(fav.riotId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 text-xs font-bold border flex-shrink-0 ${playerData?.player?.gameName === fav.gameName ? 'bg-[var(--color-val-red)]/15 border-[var(--color-val-red)]/40 text-[var(--color-val-red)]' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
                  {fav.cardUrl && <img referrerPolicy="no-referrer" src={fav.cardUrl} alt="" className="w-5 h-5 rounded-full object-cover" />}
                  <span>{fav.gameName}</span>
                  <span className="text-[var(--color-text-secondary)] opacity-50">#{fav.tagLine}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {settingsOpen ? (
        <SettingsView 
          onClose={() => setSettingsOpen(false)} 
          smartRating={smartRating} 
          setSmartRating={setSmartRating} 
          theme={theme} 
          setTheme={setTheme} 
          bannerUrl={bannerUrl} 
          setBannerUrl={setBannerUrl} 
          bannerOffsetY={bannerOffsetY} 
          setBannerOffsetY={setBannerOffsetY} 
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          videoLoop={videoLoop}
          setVideoLoop={setVideoLoop}
          videoLoopDelay={videoLoopDelay}
          setVideoLoopDelay={setVideoLoopDelay}
          hiddenStats={hiddenStats}
          setHiddenStats={setHiddenStats}
          enforcePublicStats={enforcePublicStats}
          setEnforcePublicStats={setEnforcePublicStats}
          p={playerData?.player} 
          canEditProfile={canEditProfile}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          pushUrl={pushUrl}
          locale={locale}
          setLocale={setLocale}
        />
      ) : newsView && !agentsView ? (
        <NewsViewComponent newsItems={newsItems} setNewsItems={setNewsItems} locale={locale} />
      ) : agentsView && !newsView ? (
        <AgentsWikiComponent videoLoop={videoLoop} videoLoopDelay={videoLoopDelay} locale={locale} pushUrl={pushUrl} />
      ) : (
        <div className="flex-1 flex flex-col items-center px-8 z-10 w-full max-w-6xl mx-auto">
        {error && (
          error.includes('privé') ? (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center text-center max-w-lg mb-6 animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-2">{t('private_profile', locale)}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-3 rounded-lg mb-6 text-center max-w-lg">{error}</div>
          )
        )}
        {loading && <div className="text-[var(--color-text-secondary)] animate-pulse mt-10 text-xl font-bold tracking-widest uppercase">Chargement...</div>}

        {!playerData && !loading && (
          <div className="flex flex-col items-center justify-center mt-20 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-[var(--color-val-red)] rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(255,70,85,0.3)]"><span className="text-white text-5xl font-black">V</span></div>
            <h2 className="text-3xl font-bold mb-4">Bienvenue sur SPYCAM</h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">Recherchez un joueur ou connectez-vous via RSO.</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-6 opacity-50">Debug : Double-cliquez sur le logo V ou Ctrl+Shift+D</p>
          </div>
        )}

        {playerData && (() => {
          const p = {
            ...playerData.player,
            stats: filteredStats || playerData.player.stats,
            agentStats: filteredAgents,
            matchHistory: filteredMatches
          };
          const s = p.stats;
          const w = getWarnings(s);

          // Banner & theme determination: strictly separate owner settings from viewer settings
          const profileBannerUrl = canEditProfile 
            ? (bannerUrl || p.customBannerUrl || p.cardWideUrl)
            : (p.customBannerUrl || p.cardWideUrl);

          const profileBannerOffsetY = canEditProfile 
            ? (bannerOffsetY ?? p.customBannerOffsetY ?? 50)
            : (p.customBannerOffsetY ?? 50);

          const profileThemeClass = (!canEditProfile && p.customTheme && p.customTheme !== 'dark') ? `theme-${p.customTheme}` : '';

          return (
            <div className={`w-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 ${profileThemeClass}`}>
              {/* ===== Bannière paysage compacte ===== */}
              <div className="w-full relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[0_8px_30px_var(--color-glass-shadow)] bg-[#0a0e13] aspect-[3.8/1] min-h-[140px] max-h-[300px]">
                {/* Image de fond avec lissage haute qualité et positionnement vertical */}
                <img referrerPolicy="no-referrer" src={profileBannerUrl} alt="Banner" style={{ objectPosition: `center ${profileBannerOffsetY}%` }} className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
                
                {/* Overlay sombre léger pour la lisibilité globale */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Contenu */}
                <div className="relative z-10 px-8 py-5 grid grid-cols-3 items-center h-full w-full">
                  
                  {/* Gauche : Profil */}
                  <div className="flex items-center gap-5 justify-self-start">
                    {/* Avatar + Main badge */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.15)] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                        <img referrerPolicy="no-referrer" src={p.cardUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      {p.mainAgent && (
                        <div className="flex items-center gap-1.5 bg-[rgba(0,0,0,0.5)] rounded-full px-2 py-0.5 border border-[rgba(255,255,255,0.1)]">
                          <img referrerPolicy="no-referrer" src={p.mainAgent.icon} alt={p.mainAgent.name} className="w-4 h-4 rounded-full shadow-md" />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">{p.mainAgent.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Pseudo + Tag */}
                    <div className="flex flex-col min-w-0" style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.8)' }}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight text-white">{p.gameName}</span>
                        <span className="text-sm text-[var(--color-text-secondary)] font-medium">#{p.tagLine}</span>
                      </div>
                      {p.mainAgent && <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mt-0.5 font-bold">Main • {p.mainAgent.role}</span>}
                    </div>
                  </div>

                  {/* Centre : Niveau */}
                  <div className="flex flex-col items-center justify-self-center">
                    <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-2 font-bold" style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.8)' }}>Niveau</span>
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <div className="absolute inset-0 border-2 border-[var(--color-val-light)] opacity-50 transform rotate-45 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]"></div>
                      <span className="text-3xl font-black text-[var(--color-val-light)] drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] z-10">{p.level}</span>
                    </div>
                  </div>

                  {/* Droite : Rang + Favori */}
                  <div className="flex items-center gap-4 justify-self-end">
                    <div className="flex flex-col items-end" style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.8)' }}>
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-bold">Rang</span>
                      <span className="text-lg font-black text-white uppercase tracking-wider">{p.rank}</span>
                    </div>
                    <img referrerPolicy="no-referrer" src={p.rankUrl} alt={p.rank} className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]" />
                    
                    {/* Favorite button */}
                    {!canEditProfile && (
                      <button onClick={() => toggleFavorite(p)} title={isFavorited(p.gameName, p.tagLine) ? t('remove_favorite', locale) : t('add_favorite', locale)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${isFavorited(p.gameName, p.tagLine) ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-black/30 border-white/10 text-white/50 hover:text-yellow-400 hover:border-yellow-500/30'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorited(p.gameName, p.tagLine) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Tabs + Mode Filter */}
              <div className="w-full mt-8">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] mb-6">
                  <div className="flex items-center gap-8">
                    {[{id:'performance',label:t('tab_performance', locale)},{id:'agents',label:t('tab_agents', locale)},{id:'matches',label:t('tab_history', locale)}].map(tab => (
                      <button key={tab.id} onClick={() => { setActiveTab(tab.id); const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase(); pushUrl({ tab: tab.id, playerId: riotId || myRiotId, isOwnProfile: !!isOwn }); }}
                        className={`pb-4 text-sm uppercase tracking-widest font-bold transition-all relative ${activeTab === tab.id ? 'text-[var(--color-val-red)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-val-red)] shadow-[0_0_10px_var(--color-val-red)]"></div>}
                      </button>
                    ))}
                  </div>
                  {/* Filtres mode de jeu & saison */}
                  <div className="flex items-center gap-3 pb-3">
                    {/* Selecteur de Saison */}
                    <div className="relative">
                      <select 
                        value={selectedSeason} 
                        onChange={(e) => { setSelectedSeason(e.target.value); setVisibleMatchesCount(10); }}
                        className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-[var(--color-val-red)] transition-colors"
                      >
                        <option value="all">{t('match_all_seasons', locale)}</option>
                        {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      {[{id:'all',label: t('match_filter_all', locale)},{id:'competitive',label: t('match_filter_competitive', locale)},{id:'unrated',label: t('match_filter_unrated', locale)},{id:'other',label: t('match_filter_other', locale)}].map(mode => (
                        <button key={mode.id} onClick={() => { setGameMode(mode.id); setVisibleMatchesCount(10); }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${gameMode === mode.id ? 'bg-[var(--color-val-red)] text-white shadow-[0_0_10px_rgba(255,70,85,0.3)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'}`}>
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Tab */}
                {activeTab === 'performance' && s && (() => {
                  let appliedHiddenStats: string[] = [];
                  if (canEditProfile) {
                    appliedHiddenStats = hiddenStats;
                  } else if (playerData?.player?.enforcePublicStats) {
                    try {
                      appliedHiddenStats = typeof playerData.player.hiddenStats === 'string' 
                        ? JSON.parse(playerData.player.hiddenStats) 
                        : (playerData.player.hiddenStats || []);
                    } catch {
                      appliedHiddenStats = [];
                    }
                  }

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
                      {!appliedHiddenStats.includes('kills') && <StatCard label={t('stat_kills', locale)} value={s.kills} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('deaths') && <StatCard label={t('stat_deaths', locale)} value={s.deaths} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('assists') && <StatCard label={t('stat_assists', locale)} value={s.assists} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('kd') && <StatCard label={t('stat_kd', locale)} value={s.kdRatio.toFixed(2)} highlight warning={w.kd} smartRating={smartRating} />}
                      
                      {!appliedHiddenStats.includes('adr') && <StatCard label={t('stat_adr', locale)} value={s.adr} highlight smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('hs') && <StatCard label={t('stat_hs', locale)} value={s.headshotPct} suffix="%" warning={w.hs} smartRating={smartRating} />}
                                            {!appliedHiddenStats.includes('wr') && <StatCard label={t('stat_winrate', locale)} value={s.winRate} suffix="%" warning={w.wr} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('acs') && <StatCard label={t('stat_acs', locale)} value={s.acs} highlight warning={w.acs} smartRating={smartRating} />}
                      
                      {!appliedHiddenStats.includes('fb') && <StatCard label={t('stat_fb', locale)} value={s.firstBloods} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('ace') && <StatCard label={t('stat_ace', locale)} value={s.aceCount} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('kast') && <StatCard label={t('stat_kast', locale)} value={s.kast} suffix="%" sub={s.kastPercentile} warning={w.kast} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('dd') && <StatCard label="DDΔ / Round" value={s.ddDelta > 0 ? `+${s.ddDelta}` : s.ddDelta} warning={w.dd} smartRating={smartRating} />}
                      
                      {!appliedHiddenStats.includes('wins') && <StatCard label={t('stat_wins', locale)} value={Math.round((s.winRate / 100) * s.matchesPlayed)} smartRating={smartRating} />}
                      {!appliedHiddenStats.includes('matches') && <StatCard label={t('stat_matches', locale)} value={s.matchesPlayed} colSpan={3} smartRating={smartRating} />}
                    </div>
                  );
                })()}

                {/* Agents Tab */}
                {activeTab === 'agents' && p.agentStats && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    {p.agentStats.map((agent: any) => (
                      <div key={agent.name} className="glass-panel rounded-2xl p-5 flex items-center gap-5 hover:bg-[var(--color-surface-hover)] transition-all duration-300">
                        <img referrerPolicy="no-referrer" src={agent.icon} alt={agent.name} className="w-14 h-14 rounded-xl border border-[rgba(255,255,255,0.1)]" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[var(--color-text-on-surface)] text-lg">{agent.name}</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">{agent.role}</span>
                          </div>
                          <div className="flex items-center gap-5 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">Parties</span>
                              <span className="text-sm font-bold text-[var(--color-text-on-surface)]">{agent.games}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">{t('stat_winrate', locale)}</span>
                              <span className={`text-sm font-bold ${agent.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{agent.winRate}%</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">K/D</span>
                              <span className={`text-sm font-bold ${agent.kd >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>{agent.kd}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">Heures</span>
                              <span className="text-sm font-bold text-[var(--color-text-on-surface)]">{agent.hoursPlayed}h</span>
                            </div>
                          </div>
                        </div>
                        {/* Win Rate Bar */}
                        <div className="w-24 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full transition-all ${agent.winRate >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${agent.winRate}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Matches Tab */}
                {activeTab === 'matches' && filteredMatches && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    {filteredMatches.slice(0, visibleMatchesCount).map((match: any) => {
                      const isExpanded = expandedMatchId === match.matchId;
                      return (
                        <div key={match.matchId} className="flex flex-col gap-2">
                          <div 
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.matchId)}
                            className={`glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 border-l-4 cursor-pointer ${match.won ? 'border-l-emerald-500 hover:border-l-emerald-400' : 'border-l-red-500 hover:border-l-red-400'} ${isExpanded ? 'bg-[var(--color-surface-hover)] shadow-lg' : 'hover:bg-[var(--color-surface-hover)]'}`}
                          >
                            {/* Mode Icon */}
                            {match.modeIcon && <img referrerPolicy="no-referrer" src={match.modeIcon} alt={match.mode} className="w-8 h-8 opacity-70 drop-shadow-md mode-icon" title={match.mode} loading="eager" decoding="async" fetchPriority="high" />}
                            
                            <img referrerPolicy="no-referrer" src={match.agentIcon} alt={match.agent} className="w-12 h-12 rounded-xl border border-[rgba(255,255,255,0.1)] shadow-md" loading="eager" decoding="async" fetchPriority="high" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--color-text-on-surface)] text-sm">{match.agent}</span>
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">{match.map}</span>
                                {match.season && <span className="text-[9px] text-[var(--color-val-red)] font-bold bg-[rgba(255,70,85,0.1)] px-1.5 py-0.5 rounded">{match.season}</span>}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                  <span className="text-emerald-400 font-bold">{match.kills}</span>/<span className="text-red-400 font-bold">{match.deaths}</span>/<span className="text-blue-400 font-bold">{match.assists}</span>
                                </span>
                                <span className="text-xs text-[var(--color-text-secondary)]">ACS {match.acs}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-baseline gap-2">
                                {match.score && <span className="text-lg font-black text-[var(--color-text-on-surface)]">{match.score}</span>}
                                <span className={`text-xs font-black uppercase tracking-wider ${match.won ? 'text-emerald-400' : 'text-red-400'}`}>{match.won ? 'Victoire' : 'Défaite'}</span>
                              </div>
                              <span className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          {isExpanded && <ExpandedMatch match={match} searchPlayer={searchPlayer} />}
                        </div>
                      );
                    })}

                    {/* Bouton Charger Plus */}
                    {visibleMatchesCount < filteredMatches.length && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setVisibleMatchesCount((prev) => prev + 10)}
                          className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-val-red)] text-[var(--color-text-primary)] hover:text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 border border-[var(--color-border)] shadow-md hover:shadow-[0_0_20px_rgba(255,70,85,0.4)] cursor-pointer"
                        >
                          Charger plus (+10)
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          );
        })()}
        </div>
      )}
    </main>
      {/* Legal Disclaimer - Always visible at the very bottom */}
      <footer className="w-full text-center px-4 py-8 max-w-4xl mx-auto opacity-40 text-[10px] md:text-xs text-[var(--color-text-secondary)] leading-relaxed">
        Spycam n&apos;est pas affilié à Riot Games et ne reflète pas les opinions de Riot Games ni de toute personne impliquée dans la production ou la gestion des propriétés de Riot Games. Riot Games et toutes les propriétés associées sont des marques commerciales ou des marques déposées de Riot Games, Inc.
      </footer>
    </>
  );
}
// ==================== Expanded Match Components ====================

function ExpandedMatch({ match, searchPlayer }: { match: any, searchPlayer: (id: string) => void }) {
  const [tab, setTab] = useState<'overview' | 'scoreboard' | 'timeline' | 'duels'>('overview');
  
  return (
    <div className="glass-panel rounded-2xl p-6 mt-1 border border-[var(--color-border)] animate-in fade-in slide-in-from-top-4 duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-10 relative">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-[var(--color-border)] mb-6">
        {[{id:'overview',label:'Aperçu'}, {id:'scoreboard',label:'Classement'}, {id:'timeline',label:'Chronologie'}, {id:'duels',label:'Duels'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`pb-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all relative ${tab === t.id ? 'text-[var(--color-val-red)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
            {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-val-red)] shadow-[0_0_10px_var(--color-val-red)]"></div>}
          </button>
        ))}
      </div>
      
      {/* Overview */}
      {tab === 'overview' && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 text-center bg-emerald-500/10 py-1 rounded border border-emerald-500/20">Équipe Victoire</h4>
            {(match.won ? match.myTeam : match.enemyTeam)?.map((p: any) => <PlayerRow key={p.puuid} player={p} />)}
          </div>
          <div className="w-px bg-[var(--color-border)] hidden md:block"></div>
          <div className="flex-1 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3 text-center bg-red-500/10 py-1 rounded border border-red-500/20">Équipe Défaite</h4>
            {(match.won ? match.enemyTeam : match.myTeam)?.map((p: any) => <PlayerRow key={p.puuid} player={p} />)}
          </div>
        </div>
      )}
      
      {/* Scoreboard */}
      {tab === 'scoreboard' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
            <thead>
              <tr className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest border-b border-[var(--color-border)]">
                <th className="pb-3 px-2 font-bold w-12 text-center">#</th>
                <th className="pb-3 px-2 font-bold">Joueur</th>
                <th className="pb-3 px-2 font-bold text-center">Score Combat</th>
                <th className="pb-3 px-2 font-bold text-center">K / D / A</th>
                <th className="pb-3 px-2 font-bold text-center hidden sm:table-cell">Éco</th>
                <th className="pb-3 px-2 font-bold text-center hidden sm:table-cell">1er Sang</th>
              </tr>
            </thead>
            <tbody>
              {[...(match.myTeam||[]), ...(match.enemyTeam||[])].sort((a,b) => b.acs - a.acs).map((p: any, idx: number) => (
                <tr key={p.puuid} className={`border-b border-[rgba(255,255,255,0.02)] transition-colors ${p.isMe ? 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[var(--color-surface-hover)]'}`}>
                  <td className="py-2 px-2 text-center text-[10px] text-[var(--color-text-secondary)] font-bold">{idx+1}</td>
                  <td className="py-2 px-2 flex items-center gap-3">
                    <img referrerPolicy="no-referrer" src={p.agentIcon} className="w-8 h-8 rounded-lg shadow-sm" alt={p.agent} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.isPublicProfile && p.tag) {
                              searchPlayer(`${p.name}#${p.tag}`);
                            }
                          }}
                          className={`font-bold ${p.isPublicProfile ? 'hover:underline cursor-pointer' : 'cursor-default opacity-70'} ${p.isMe ? 'text-[var(--color-val-red)] drop-shadow-[0_0_5px_rgba(255,70,85,0.3)]' : 'text-[var(--color-text-on-surface)]'}`}
                        >
                          {p.name}
                        </button>
                        {!p.isPublicProfile && (
                          <span className="text-[8px] bg-[var(--color-background)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)] opacity-75 whitespace-nowrap">
                            Profil privé
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider">{p.agent}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-black text-[var(--color-text-on-surface)]">{p.acs}</td>
                  <td className="py-2 px-2 text-center text-xs font-bold">
                    <span className="text-emerald-400">{p.kills}</span> <span className="text-[var(--color-text-secondary)] font-normal">/</span> <span className="text-red-400">{p.deaths}</span> <span className="text-[var(--color-text-secondary)] font-normal">/</span> <span className="text-blue-400">{p.assists}</span>
                  </td>
                  <td className="py-2 px-2 text-center text-[var(--color-text-secondary)] font-bold hidden sm:table-cell">{p.econScore}</td>
                  <td className="py-2 px-2 text-center text-[var(--color-text-secondary)] font-bold hidden sm:table-cell">{p.firstBloods}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="flex flex-col gap-6 py-2">
           {/* Timeline Graph */}
           <div className="flex items-start justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 pt-16">
             {match.timeline?.slice(0,12).map((r: any) => <RoundBar key={r.roundNum} round={r} />)}
             {match.timeline?.length > 12 && (
                <div className="flex flex-col items-center justify-center h-20 px-1 sm:px-3">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-secondary)]"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path d="M12 7v5l3 3"></path></svg>
                </div>
             )}
             {match.timeline?.slice(12).map((r: any) => <RoundBar key={r.roundNum} round={r} />)}
           </div>
           
           {/* Event Log */}
           <div className="bg-[var(--color-background)] p-5 rounded-2xl text-xs space-y-3 max-h-[250px] overflow-y-auto border border-[var(--color-border)] shadow-inner custom-scrollbar">
             <h4 className="font-bold text-[var(--color-text-primary)] uppercase tracking-widest text-[10px] mb-4">Journal des événements marqués</h4>
             {match.timeline?.map((r: any) => (
                <div key={r.roundNum} className="flex gap-4 border-b border-[rgba(255,255,255,0.02)] pb-3 items-center group hover:bg-[rgba(255,255,255,0.01)] transition-colors px-2 rounded-lg">
                   <span className="text-[10px] text-[var(--color-text-secondary)] w-12 font-black tracking-widest">M {r.roundNum}</span>
                   
                   <div className="flex-1 flex gap-3">
                     {r.myKillsInRound > 0 && <span className="text-[#0ebf99] font-bold bg-[#0ebf99]/10 px-2 py-0.5 rounded border border-[#0ebf99]/20">{r.myKillsInRound} élimination(s)</span>}
                     {r.diedInRound && <span className="text-[#ff4655] font-bold bg-[#ff4655]/10 px-2 py-0.5 rounded border border-[#ff4655]/20">Mort(e)</span>}
                     {!r.myKillsInRound && !r.diedInRound && <span className="text-[var(--color-text-secondary)] italic">Pas d'événement majeur</span>}
                   </div>

                   <span className="text-[9px] uppercase tracking-widest text-right flex flex-col items-end gap-0.5">
                     <span className="text-[var(--color-text-secondary)]">{"Victoire"}</span>
                     <span className={`font-black ${r.winner === 'myTeam' ? 'text-[#0ebf99]' : 'text-[#ff4655]'}`}>{r.winCondition}</span>
                   </span>
                </div>
             ))}
           </div>
        </div>
      )}
      
      {/* Duels */}
      {tab === 'duels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {match.duels?.map((d: any, idx: number) => (
             <div key={idx} className="bg-[var(--color-background)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between hover:border-[var(--color-text-secondary)] transition-colors">
                <div className="flex items-center gap-3">
                   <img referrerPolicy="no-referrer" src={d.agentIcon} className="w-10 h-10 rounded-lg shadow-sm" alt={d.name} />
                   <div className="flex flex-col">
                     <span className="font-bold text-sm text-[var(--color-text-on-surface)]">{d.name}</span>
                     <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider">Ennemi</span>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <span className="text-[10px] font-bold tracking-wider"><span className="text-[var(--color-text-secondary)] uppercase">Tué :</span> <span className="text-emerald-400 text-sm ml-1">{d.kills}</span></span>
                   <span className="text-[10px] font-bold tracking-wider"><span className="text-[var(--color-text-secondary)] uppercase">Mort par :</span> <span className="text-red-400 text-sm ml-1">{d.deaths}</span></span>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ player }: { player: any }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${player.isMe ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] shadow-inner' : 'bg-[var(--color-background)] border border-transparent hover:border-[var(--color-border)]'}`}>
      <img referrerPolicy="no-referrer" src={player.agentIcon} className="w-10 h-10 rounded-lg shadow-sm" alt={player.agent} />
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate ${player.isMe ? 'text-[var(--color-val-red)] drop-shadow-[0_0_5px_rgba(255,70,85,0.3)]' : 'text-[var(--color-text-on-surface)]'}`}>{player.name}</div>
        <div className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest">{player.agent}</div>
      </div>
      <div className="flex items-center gap-3 text-xs font-bold px-2">
         <span className="w-8 text-right text-[var(--color-text-on-surface)] font-black" title="Score de combat">{player.acs}</span>
         <span className="w-[72px] text-right">
           <span className="text-emerald-400">{player.kills}</span>
           <span className="text-[var(--color-text-secondary)] font-normal mx-0.5">/</span>
           <span className="text-red-400">{player.deaths}</span>
           <span className="text-[var(--color-text-secondary)] font-normal mx-0.5">/</span>
           <span className="text-blue-400">{player.assists}</span>
         </span>
      </div>
    </div>
  );
}

// ==================== Icons ====================
const SkullIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-2 9H8V9h2v2zm6 0h-2V9h2v2zm-2.5 4h-3v-1.5h3V15z"/>
  </svg>
);

const SpikeExplodeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" className={className}>
    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/>
  </svg>
);

const SpikeDefuseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" className={className}>
    <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2zm-8 18l16-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function RoundBar({ round }: { round: any }) {
  const isWin = round.winner === 'myTeam';
  const hasSpikeAction = round.winCondition === 'SpikeExploded' || round.winCondition === 'SpikeDefused';
  
  return (
    <div className="flex flex-col items-center gap-1.5 group relative cursor-crosshair">
       {/* Tooltip */}
       <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0e13] border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 shadow-xl pointer-events-none flex flex-col gap-1">
          <span className="font-black uppercase tracking-widest text-[10px] text-[var(--color-text-secondary)]">Manche {round.roundNum}</span>
          <span className={`font-bold ${isWin ? 'text-[#0ebf99]' : 'text-[#ff4655]'}`}>{isWin ? 'Gagné' : 'Perdu'} ({round.winCondition})</span>
       </div>
       
       <span className="text-[10px] text-[var(--color-text-secondary)] font-bold tracking-widest mb-1">{round.roundNum}</span>
       
       {/* Main round bar */}
       <div className={`w-3.5 sm:w-4 h-10 sm:h-12 rounded-sm ${isWin ? 'bg-[#0ebf99]' : 'bg-[#ff4655]'} transition-transform group-hover:-translate-y-1`}>
       </div>
       
       {/* Events below the bar */}
       <div className="flex flex-col items-center gap-1.5 mt-1 h-14">
          {hasSpikeAction && (
             <div className="text-[var(--color-text-secondary)] flex justify-center mb-0.5">
                {round.winCondition === 'SpikeExploded' ? <SpikeExplodeIcon /> : <SpikeDefuseIcon />}
             </div>
          )}
          {round.myKillsInRound > 0 && (
             <div className="flex items-center gap-0.5 text-[#0ebf99] font-black text-[9px]">
                {round.myKillsInRound} <SkullIcon />
             </div>
          )}
          {round.diedInRound && (
             <div className="flex items-center gap-0.5 text-[#ff4655] font-black text-[9px]">
                1 <SkullIcon />
             </div>
          )}
       </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--color-text-secondary)] font-bold tracking-widest uppercase animate-pulse">Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}

