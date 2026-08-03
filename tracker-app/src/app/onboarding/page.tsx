'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 5 Language options
const LANGUAGES = [
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { id: 'pt', name: 'Português', flag: '🇧🇷' },
];

// 5 Theme options with background and accent previews
const THEMES = [
  {
    id: 'dark',
    name: 'Sombre',
    bg: '#0a0e13',
    surface: '#0f1923',
    accent: '#ff4655',
    border: 'rgba(255, 70, 85, 0.2)',
  },
  {
    id: 'light',
    name: 'Clair',
    bg: '#f0f1f5',
    surface: '#ffffff',
    accent: '#0f1923',
    border: 'rgba(15, 25, 35, 0.2)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0d0b1a',
    surface: '#140f28',
    accent: '#8c64ff',
    border: 'rgba(140, 100, 255, 0.2)',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    bg: '#120808',
    surface: '#1e0a0a',
    accent: '#ff2e43',
    border: 'rgba(255, 46, 67, 0.2)',
  },
  {
    id: 'ocean',
    name: 'Océan',
    bg: '#071014',
    surface: '#0a1923',
    accent: '#32c8b4',
    border: 'rgba(50, 200, 180, 0.2)',
  },
];

// Riot Games Inline SVG Fist Logo
function RiotGamesLogo({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M211.9 44.5L107.5 94.6v270.8l104.4-38.2V44.5zm192.6 0l-104.4 38.2v282.7l104.4 38.2V44.5zM107.5 385.9l104.4 38.2v43.4L107.5 431v-45.1zm192.6 0v45.1l104.4 36.5v-43.4l-104.4-38.2z" />
    </svg>
  );
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State tracking
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [language, setLanguage] = useState<string>('fr');
  const [theme, setTheme] = useState<string>('dark');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Dynamically apply selected theme class for live preview
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-midnight', 'theme-crimson', 'theme-ocean');
    if (theme !== 'dark') {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 3) {
      setDirection('next');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection('prev');
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Complete Onboarding - POST to /api/auth/onboarding
  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, theme }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur s'est produite lors de la finalisation.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Erreur de connexion au serveur.');
      setIsSubmitting(false);
    }
  };

  // Loading state during session check
  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-background)]">
        <div className="w-16 h-16 bg-[var(--color-val-red)] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-[0_0_30px_rgba(255,70,85,0.5)] animate-pulse mb-4">
          V
        </div>
        <div className="text-[var(--color-text-secondary)] text-sm font-bold uppercase tracking-widest animate-pulse">
          Chargement...
        </div>
      </div>
    );
  }

  // If unauthenticated, do not flash content before redirect
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {/* Valorant ambient background glows */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-[var(--color-val-red)] opacity-10 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-[var(--color-val-red)] opacity-10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header / Progress Indicator (3 Steps) */}
      <div className="w-full max-w-xl mb-8 flex flex-col items-center z-10">
        {/* Logo and Protocol subtitle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[var(--color-val-red)] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(255,70,85,0.4)]">
            V
          </div>
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-text-secondary)]">
            SPYCAM // ONBOARDING
          </span>
        </div>

        {/* 3 Steps Dots Progress Bar */}
        <div className="flex items-center justify-between w-full relative px-8">
          {/* Background line */}
          <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--color-border)] z-0">
            <div
              className="h-full bg-[var(--color-val-red)] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,70,85,0.5)]"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              }}
            />
          </div>

          {/* Dots */}
          {[1, 2, 3].map((step) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (step < currentStep) {
                      setDirection('prev');
                      setCurrentStep(step);
                    }
                  }}
                  disabled={step > currentStep}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-[var(--color-val-red)] text-white shadow-[0_0_25px_rgba(255,70,85,0.7)] scale-110 ring-4 ring-[#ff4655]/20 cursor-default'
                      : isCompleted
                      ? 'bg-[var(--color-val-red)] text-white shadow-[0_0_12px_rgba(255,70,85,0.4)] cursor-pointer hover:scale-105'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[var(--color-val-red)]'
                      : isCompleted
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {step === 1 ? 'Langue' : step === 2 ? 'Thème' : 'Riot Games'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphism Card Container */}
      <div
        key={currentStep}
        className={`w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl z-10 relative overflow-hidden transition-all ${
          direction === 'next' ? 'animate-slide-right' : 'animate-slide-left'
        }`}
      >
        {/* STEP 1 - LANGUE */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-val-red)] mb-2">
              Étape 01 sur 03
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-2">
              Choisissez votre langue
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-8">
              Sélectionnez la langue dans laquelle vous souhaitez afficher l'interface.
            </p>

            {/* Language options grid: 2 cols on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-10">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-val-red)] bg-[var(--color-val-red)]/10 shadow-[0_0_20px_rgba(255,70,85,0.25)] scale-[1.02]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-text-secondary)]/30'
                    }`}
                  >
                    <span className="text-4xl drop-shadow-md">{lang.flag}</span>
                    <span
                      className={`text-sm font-bold tracking-wide ${
                        isSelected ? 'text-[var(--color-text-primary)] font-black' : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {lang.name}
                    </span>

                    {/* Selected card red indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--color-val-red)] rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Suivant Button */}
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,70,85,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Suivant</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 - THÈME */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-val-red)] mb-2">
              Étape 02 sur 03
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-2">
              Choisissez votre thème
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-8">
              Personnalisez l'apparence visuelle de votre tableau de bord.
            </p>

            {/* Theme options grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mb-10">
              {THEMES.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`relative rounded-2xl p-3.5 flex flex-col items-center gap-3 border-2 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-val-red)] bg-[var(--color-val-red)]/10 shadow-[0_0_20px_rgba(255,70,85,0.25)] scale-[1.03]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-text-secondary)]/30'
                    }`}
                  >
                    {/* Visual Color Preview */}
                    <div
                      className="w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col p-1.5 shadow-inner border border-white/5 relative"
                      style={{ backgroundColor: t.bg }}
                    >
                      <div className="h-2 w-full rounded-sm mb-1 opacity-80" style={{ backgroundColor: t.accent }} />
                      <div
                        className="flex-1 rounded-md p-1 flex flex-col justify-between"
                        style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                      >
                        <div className="w-1/2 h-1.5 rounded bg-white/20 mb-1" />
                        <div className="w-full h-2 rounded" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
                      </div>
                    </div>

                    {/* Theme Label */}
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {t.name}
                    </span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--color-val-red)] rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons: Retour & Suivant */}
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-[var(--color-val-red)] hover:bg-[#ff5a67] text-white font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,70,85,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Suivant</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - CONNEXION RIOT */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-val-red)] mb-2">
              Étape 03 sur 03
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-2">
              Connectez votre compte Riot Games
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-8 max-w-md leading-relaxed">
              Liez votre compte pour accéder à vos vraies statistiques de jeu.
            </p>

            {/* Big Central Card */}
            <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 mb-8 flex flex-col items-center text-center shadow-inner relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--color-val-red)]/10 blur-3xl rounded-full pointer-events-none" />

              {/* Riot SVG Fist Icon */}
              <div className="w-20 h-20 bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/30 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-val-red)] shadow-[0_0_30px_rgba(255,70,85,0.2)]">
                <RiotGamesLogo className="w-12 h-12" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Riot Games Sign-On (RSO)
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-sm">
                Synchronisez automatiquement vos rangs, historiques de parties et statistiques d'agents directement depuis Riot.
              </p>

              {/* Connect Riot Button (with opacity-60 and '(Bientôt disponible)') */}
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full max-w-md py-4 bg-[var(--color-val-red)] text-white font-black uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(255,70,85,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer opacity-60 hover:opacity-80 mb-4 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RiotGamesLogo className="w-5 h-5 flex-shrink-0" />
                    <span>Connecter mon compte Riot (Bientôt disponible)</span>
                  </>
                )}
              </button>

              {/* Link / Button below: Passer cette étape */}
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline underline-offset-4 transition-colors cursor-pointer"
              >
                Passer cette étape
              </button>
            </div>

            {error && (
              <div className="mb-6 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl w-full">
                {error}
              </div>
            )}

            {/* Navigation button: Retour */}
            <div className="w-full flex items-center justify-start">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Inline Keyframes CSS for Slide Transitions */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(35px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-35px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-left {
          animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  );
}
