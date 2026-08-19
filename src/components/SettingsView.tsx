"use client";

import { useState, useEffect } from "react";
import BannerCatalogModal from "./BannerCatalogModal";
import { loadLanguagesList, setLanguage, LanguageInfo, Locale } from "@/lib/i18n";

export interface SettingsViewProps {
  onClose: () => void;
  smartRating: boolean;
  setSmartRating: (val: boolean) => void;
  theme: string;
  setTheme: (val: string) => void;
  bannerUrl: string;
  setBannerUrl: (val: string) => void;
  bannerOffsetY: number;
  setBannerOffsetY: (val: number) => void;
  isPublic: boolean;
  setIsPublic: (val: boolean) => void;
  videoLoop: boolean;
  setVideoLoop: (val: boolean) => void;
  videoLoopDelay: number;
  setVideoLoopDelay: (val: number) => void;
  hiddenStats: string[];
  setHiddenStats: (val: string[]) => void;
  enforcePublicStats: boolean;
  setEnforcePublicStats: (val: boolean) => void;
  p?: any;
  canEditProfile?: boolean;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  pushUrl: (opts: any) => void;
  locale: Locale;
}

export default function SettingsView({
  onClose,
  smartRating,
  setSmartRating,
  theme,
  setTheme,
  bannerUrl,
  setBannerUrl,
  bannerOffsetY,
  setBannerOffsetY,
  isPublic,
  setIsPublic,
  videoLoop,
  setVideoLoop,
  videoLoopDelay,
  setVideoLoopDelay,
  hiddenStats,
  setHiddenStats,
  enforcePublicStats,
  setEnforcePublicStats,
  p,
  canEditProfile,
  settingsTab,
  setSettingsTab,
  pushUrl,
  locale,
}: SettingsViewProps) {
  const statOptions = [
    { id: "kills", label: "Éliminations" },
    { id: "deaths", label: "Morts" },
    { id: "assists", label: "Passes décisives" },
    { id: "kd", label: "Ratio K/D" },
    { id: "adr", label: "ADR Moyen" },
    { id: "hs", label: "Tirs à la tête %" },
    { id: "wr", label: "Taux de victoire" },
    { id: "acs", label: "ACS Moyen" },
    { id: "fb", label: "Premiers sangs" },
    { id: "ace", label: "ACE" },
    { id: "kast", label: "KAST %" },
    { id: "dd", label: "Différence de dégâts" },
    { id: "wins", label: "Victoires" },
    { id: "matches", label: "Parties jouées" },
  ];
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");

  useEffect(() => {
    loadLanguagesList().then((list) => {
      if (list && list.length > 0) setLanguages(list);
    });
  }, []);

  // Draft State
  const [draftSmartRating, setDraftSmartRating] = useState(smartRating);
  const [draftVideoLoop, setDraftVideoLoop] = useState(videoLoop ?? true);
  const [draftVideoLoopDelay, setDraftVideoLoopDelay] = useState(videoLoopDelay ?? 500);
  const [draftHiddenStats, setDraftHiddenStats] = useState<string[]>(hiddenStats || []);
  const [draftEnforcePublicStats, setDraftEnforcePublicStats] = useState(enforcePublicStats || false);
  const [draftTheme, setDraftTheme] = useState(theme?.startsWith("custom:") ? "custom" : theme);
  const [draftCustomBg, setDraftCustomBg] = useState(() => {
    if (theme?.startsWith("custom:")) {
      const match = theme.match(/bg=([^,]+)/);
      return match ? match[1] : "#0a0e13";
    }
    return "#0a0e13";
  });
  const [draftCustomAccent, setDraftCustomAccent] = useState(() => {
    if (theme?.startsWith("custom:")) {
      const match = theme.match(/accent=([^,]+)/);
      return match ? match[1] : "#ff4655";
    }
    return "#ff4655";
  });
  const [draftBannerUrl, setDraftBannerUrl] = useState(bannerUrl);
  const [draftBannerOffsetY, setDraftBannerOffsetY] = useState(bannerOffsetY);
  const [draftIsPublic, setDraftIsPublic] = useState(isPublic ?? true);
  const [draftLocale, setDraftLocale] = useState<string>(locale || "french");

  useEffect(() => {
    if (locale) setDraftLocale(locale);
  }, [locale]);

  // Preview theme live
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-midnight", "theme-crimson", "theme-ocean", "theme-custom");
    if (draftTheme !== "dark" && draftTheme !== "custom") document.body.classList.add(`theme-${draftTheme}`);
    if (draftTheme === "custom") {
      document.body.classList.add("theme-custom");
      document.documentElement.style.setProperty("--custom-bg", draftCustomBg);
      document.documentElement.style.setProperty("--custom-accent", draftCustomAccent);
    }

    // Cleanup on unmount (restore original theme if not saved)
    return () => {
      document.body.classList.remove("theme-light", "theme-midnight", "theme-crimson", "theme-ocean", "theme-custom");
      document.documentElement.style.removeProperty("--custom-bg");
      document.documentElement.style.removeProperty("--custom-accent");
      if (theme !== "dark" && !theme?.startsWith("custom:")) document.body.classList.add(`theme-${theme}`);
      if (theme?.startsWith("custom:")) {
        document.body.classList.add("theme-custom");
        const matchBg = theme.match(/bg=([^,]+)/);
        const matchAccent = theme.match(/accent=([^,]+)/);
        if (matchBg) document.documentElement.style.setProperty("--custom-bg", matchBg[1]);
        if (matchAccent) document.documentElement.style.setProperty("--custom-accent", matchAccent[1]);
      }
    };
  }, [draftTheme, draftCustomBg, draftCustomAccent, theme]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smartRating: draftSmartRating,
          theme: draftTheme === "custom" ? `custom:bg=${draftCustomBg},accent=${draftCustomAccent}` : draftTheme,
          bannerUrl: draftBannerUrl,
          bannerOffsetY: draftBannerOffsetY,
          isPublic: draftIsPublic,
          videoLoop: draftVideoLoop,
          videoLoopDelay: draftVideoLoopDelay,
          hiddenStats: JSON.stringify(draftHiddenStats),
          enforcePublicStats: draftEnforcePublicStats,
          language: draftLocale,
        }),
      });
      if (res.ok) {
        setSmartRating(draftSmartRating);
        setTheme(draftTheme === "custom" ? `custom:bg=${draftCustomBg},accent=${draftCustomAccent}` : draftTheme);
        setBannerUrl(draftBannerUrl);
        setBannerOffsetY(draftBannerOffsetY);
        if (setIsPublic) setIsPublic(draftIsPublic);
        if (setVideoLoop) setVideoLoop(draftVideoLoop);
        if (setVideoLoopDelay) setVideoLoopDelay(draftVideoLoopDelay);
        setHiddenStats(draftHiddenStats);
        setEnforcePublicStats(draftEnforcePublicStats);
        await setLanguage(draftLocale);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Default banners
  const banners = [
    { name: "Par défaut", url: p?.cardWideUrl || "" },
    { name: "Ascent", url: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png" },
    { name: "Bind", url: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png" },
    { name: "Haven", url: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-8 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-8 gap-3">
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">Paramètres</h2>
        <button
          onClick={onClose}
          className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] cursor-pointer flex items-center gap-1.5 flex-shrink-0"
        >
          <span className="text-sm sm:text-base">←</span>
          <span>Retour au profil</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
        {/* Sidebar / Top Tabs Bar on mobile */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1.5 sm:gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex-shrink-0">
          {[
            { id: "features", label: "Fonctionnalités" },
            { id: "privacy", label: "Confidentialité" },
            { id: "appearance", label: "Apparence & Bannière" },
            { id: "language", label: "Langue & Traductions" },
            { id: "about", label: "À propos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSettingsTab(tab.id);
                pushUrl({ view: "settings", settingsTab: tab.id });
              }}
              className={`text-left px-3.5 sm:px-5 py-2.5 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                settingsTab === tab.id
                  ? "bg-[var(--color-surface-hover)] border-b-2 md:border-b-0 md:border-l-4 border-[var(--color-val-red)] text-[var(--color-text-primary)] shadow-md"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {settingsTab === "features" && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Indicateurs visuels (Smart Rating)</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Active les repères visuels colorés sur les performances clés (K/D, ADR, Winrate, etc.)
                    </p>
                  </div>
                  <button
                    onClick={() => setDraftSmartRating(!draftSmartRating)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${
                      draftSmartRating ? "bg-[var(--color-val-red)]" : "bg-gray-400 dark:bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        draftSmartRating ? "translate-x-7" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Lecture en boucle des vidéos d&apos;agents</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Rejoue automatiquement les aperçus vidéo des compétences d&apos;agents
                      </p>
                    </div>
                    <button
                      onClick={() => setDraftVideoLoop(!draftVideoLoop)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${
                        draftVideoLoop ? "bg-[var(--color-val-red)]" : "bg-gray-400 dark:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          draftVideoLoop ? "translate-x-7" : "translate-x-1"
                        }`}
                      ></span>
                    </button>
                  </div>

                  {draftVideoLoop && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 pl-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-[var(--color-text-secondary)]">Délai avant relecture</span>
                        <span className="text-sm font-bold text-[var(--color-val-red)]">{draftVideoLoopDelay} ms</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3000"
                        step="100"
                        value={draftVideoLoopDelay}
                        onChange={(e) => setDraftVideoLoopDelay(Number(e.target.value))}
                        className="w-full accent-[var(--color-val-red)] cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {settingsTab === "privacy" && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Confidentialité du profil</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Gérez qui peut consulter vos statistiques et historiques de parties
                </p>
              </div>

              <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                      draftIsPublic ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {draftIsPublic ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[var(--color-text-primary)]">
                      {draftIsPublic ? "Profil Public" : "Profil Privé"}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-md">
                      {draftIsPublic
                        ? "Tout le monde peut consulter votre profil et vos statistiques."
                        : "Votre profil est masqué pour les autres utilisateurs."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDraftIsPublic(!draftIsPublic)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${
                    draftIsPublic ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      draftIsPublic ? "translate-x-7" : "translate-x-1"
                    }`}
                  ></span>
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)]">
                <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-2">Visibilité des statistiques</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                  Décochez les statistiques que vous ne souhaitez pas voir sur votre propre profil.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {statOptions.map((stat) => (
                    <label
                      key={stat.id}
                      className="flex items-center gap-3 p-3 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-val-red)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!draftHiddenStats.includes(stat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDraftHiddenStats(draftHiddenStats.filter((id) => id !== stat.id));
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
                    <h5 className="font-bold text-sm text-[var(--color-text-primary)]">Appliquer le masquage aux visiteurs</h5>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Masque également ces statistiques pour tous les visiteurs de votre profil
                    </p>
                  </div>
                  <button
                    onClick={() => setDraftEnforcePublicStats(!draftEnforcePublicStats)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ml-4 cursor-pointer ${
                      draftEnforcePublicStats ? "bg-[var(--color-val-red)]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        draftEnforcePublicStats ? "translate-x-6" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "appearance" && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 space-y-10">
              {/* Sélecteur de Thème */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">Thème de l&apos;interface</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5">Choisissez l&apos;ambiance visuelle globale</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { id: "dark", name: "Sombre", bg: "#0a0e13", surface: "#0f1923", accent: "#8b97a3" },
                    { id: "light", name: "Clair", bg: "#f0f1f5", surface: "#ffffff", accent: "#525f6e" },
                    { id: "midnight", name: "Midnight", bg: "#0d0b1a", surface: "#140f28", accent: "#8c64ff" },
                    { id: "crimson", name: "Crimson", bg: "#120808", surface: "#1e0a0a", accent: "#ff4655" },
                    { id: "ocean", name: "Océan", bg: "#071014", surface: "#0a1923", accent: "#32c8b4" },
                    { id: "custom", name: "Personnalisé", bg: draftCustomBg, surface: draftCustomBg, accent: draftCustomAccent },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDraftTheme(t.id)}
                      className={`relative rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all duration-300 cursor-pointer ${
                        draftTheme === t.id
                          ? "border-[var(--color-val-red)] shadow-[0_0_20px_rgba(255,70,85,0.3)] scale-105"
                          : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: t.bg }}>
                        <div className="flex-1"></div>
                        <div className="h-[40%] rounded-t-md mx-1" style={{ backgroundColor: t.surface, border: `1px solid ${t.accent}20` }}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t.name}</span>
                      {draftTheme === t.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-val-red)] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-[var(--color-border)]" />

              {/* Option Couleur Custom */}
              {draftTheme === "custom" && (
                <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] animate-in fade-in duration-300">
                  <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-4">Personnalisation des couleurs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] font-medium">Couleur d&apos;accentuation</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={draftCustomAccent}
                          onChange={(e) => setDraftCustomAccent(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-xs text-[var(--color-text-primary)]">{draftCustomAccent}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] font-medium">Couleur de fond</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={draftCustomBg}
                          onChange={(e) => setDraftCustomBg(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-xs text-[var(--color-text-primary)]">{draftCustomBg}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gestion de la Bannière */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Bannière de profil</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Personnalisez l&apos;image d&apos;en-tête de votre profil
                    </p>
                  </div>
                  <button
                    onClick={() => setCatalogOpen(true)}
                    className="px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer text-[var(--color-text-primary)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    Choisir dans le catalogue
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {banners.map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDraftBannerUrl(b.url)}
                      className={`relative aspect-[3/1] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#0a0e13] ${
                        draftBannerUrl === b.url
                          ? "border-[var(--color-val-red)] shadow-[0_0_15px_rgba(255,70,85,0.3)] scale-[1.02]"
                          : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
                      }`}
                    >
                      {b.url ? (
                        <img referrerPolicy="no-referrer" src={b.url} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                          Par défaut
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-[10px] font-bold text-white uppercase">{b.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ajustement Vertical de la Bannière (Y Offset) */}
                <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">Cadrage vertical (Hauteur)</span>
                    <span className="text-xs font-mono font-bold text-[var(--color-val-red)]">{draftBannerOffsetY}%</span>
                  </div>

                  {/* Visual Preview Box */}
                  <div className="relative w-full aspect-[3.8/1] max-h-[140px] rounded-xl overflow-hidden border border-[var(--color-border)] bg-[#0a0e13] shadow-md">
                    <img
                      referrerPolicy="no-referrer"
                      src={draftBannerUrl || p?.cardWideUrl || "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png"}
                      alt="Aperçu"
                      style={{ objectPosition: `center ${draftBannerOffsetY}%` }}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-75"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 p-3 flex items-center justify-between h-full">
                      <div className="flex items-center gap-2">
                        {p?.cardUrl ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                            <img referrerPolicy="no-referrer" src={p.cardUrl} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                        <span className="text-xs font-black text-white drop-shadow-md">{p?.gameName || "Mon Profil"}</span>
                      </div>
                      <span className="text-[10px] font-black text-[var(--color-val-light)] border border-[var(--color-val-light)]/40 px-2 py-0.5 rounded backdrop-blur-sm">
                        Aperçu
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draftBannerOffsetY}
                    onChange={(e) => setDraftBannerOffsetY(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-val-red)]"
                  />
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Glissez le curseur pour voir l&apos;image s&apos;ajuster en temps réel dans le cadre ci-dessus.
                  </p>
                </div>

                <BannerCatalogModal isOpen={catalogOpen} onClose={() => setCatalogOpen(false)} onSelect={(url) => setDraftBannerUrl(url)} />
              </div>
            </div>
          )}

          {settingsTab === "language" && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Langue de l&apos;interface</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sélectionnez votre langue d&apos;affichage préférée.</p>
              </div>

              {/* Language Search Bar */}
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  value={languageSearchQuery}
                  onChange={(e) => setLanguageSearchQuery(e.target.value)}
                  placeholder="Rechercher une langue..."
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 pl-10 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:border-[var(--color-val-red)] focus:outline-none transition-colors"
                />
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {languageSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLanguageSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Languages List with Background Cover Image + Dark Gradient to Right */}
              {(() => {
                const filtered = languages.filter((l) => {
                  if (!languageSearchQuery.trim()) return true;
                  const q = languageSearchQuery.toLowerCase();
                  return (l.label || "").toLowerCase().includes(q) || (l.id || "").toLowerCase().includes(q);
                });
                const displayed = languageSearchQuery.trim() || showAllLanguages ? filtered : filtered.slice(0, 5);

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--color-border)]">
                      {displayed.map((l) => {
                        const isSelected = (draftLocale || "french") === l.id;
                        const isImageFlag = l.flag && (l.flag.startsWith("/") || l.flag.startsWith("http") || l.flag.includes("."));

                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setDraftLocale(l.id)}
                            className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-300 flex items-center justify-between text-left group min-h-[90px] cursor-pointer ${
                              isSelected
                                ? "border-[var(--color-val-red)] shadow-[0_0_25px_rgba(255,70,85,0.4)] scale-[1.02] bg-[var(--color-val-red)]/10"
                                : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)] hover:scale-[1.01] bg-[#0a0e13]"
                            }`}
                          >
                            {/* Image background with dark gradient to the right with transparency */}
                            {isImageFlag ? (
                              <>
                                <img
                                  src={l.flag}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 pointer-events-none"></div>
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-[var(--color-surface)] pointer-events-none"></div>
                            )}

                            {/* Content with high contrast text */}
                            <div className="relative z-10 flex items-center gap-3.5">
                              {!isImageFlag && <span className="text-3xl filter drop-shadow-md select-none">{l.flag || "🌐"}</span>}
                              <div className="flex flex-col">
                                <span className="font-black text-base text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                  {l.label}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                  {l.id}
                                </span>
                              </div>
                            </div>

                            {/* Check badge when selected */}
                            {isSelected && (
                              <div className="relative z-10 w-6 h-6 rounded-full bg-[var(--color-val-red)] flex items-center justify-center shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Toggle "Afficher plus" / "Afficher moins" */}
                    {!languageSearchQuery.trim() && filtered.length > 5 && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAllLanguages(!showAllLanguages)}
                          className="px-6 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>{showAllLanguages ? "Afficher moins" : `Afficher plus (+${filtered.length - 5})`}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${showAllLanguages ? "rotate-180" : ""}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {settingsTab === "about" && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8">
              <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">Valorant Performance Tracker</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Suivez vos performances Valorant, vos statistiques d&apos;agents, historiques de parties et analyses détaillées.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] text-xs sm:text-sm font-bold rounded-xl transition-all border border-[var(--color-border)] disabled:opacity-50 cursor-pointer text-center"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
