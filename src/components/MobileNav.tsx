"use client";

export interface MobileNavProps {
  activeTab: string;
  newsView: boolean;
  agentsView: boolean;
  settingsOpen: boolean;
  onGoHome: () => void;
  onSelectTab: (tab: string) => void;
  onOpenNews: () => void;
  onOpenAgents: () => void;
  onToggleSettings: () => void;
}

export default function MobileNav({
  activeTab,
  newsView,
  agentsView,
  settingsOpen,
  onGoHome,
  onSelectTab,
  onOpenNews,
  onOpenAgents,
  onToggleSettings,
}: MobileNavProps) {
  const isHomeActive = !newsView && !agentsView && !settingsOpen && activeTab === "performance";
  const isMatchesActive = !newsView && !agentsView && !settingsOpen && activeTab === "matches";
  const isAgentsStatsActive = !newsView && !agentsView && !settingsOpen && activeTab === "agents";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
      {/* Home / Perf */}
      <button
        onClick={() => {
          onGoHome();
          onSelectTab("performance");
        }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          isHomeActive ? "text-[var(--color-val-red)] font-bold scale-105" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isHomeActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px] tracking-tight">Accueil</span>
      </button>

      {/* Matchs */}
      <button
        onClick={() => {
          onGoHome();
          onSelectTab("matches");
        }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          isMatchesActive ? "text-[var(--color-val-red)] font-bold scale-105" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isMatchesActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-[10px] tracking-tight">Matchs</span>
      </button>

      {/* Wiki Agents */}
      <button
        onClick={onOpenAgents}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          agentsView ? "text-[var(--color-val-red)] font-bold scale-105" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={agentsView ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="text-[10px] tracking-tight">Agents</span>
      </button>

      {/* Actualités */}
      <button
        onClick={onOpenNews}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          newsView ? "text-[var(--color-val-red)] font-bold scale-105" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={newsView ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
        <span className="text-[10px] tracking-tight">Actus</span>
      </button>

      {/* Paramètres */}
      <button
        onClick={onToggleSettings}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          settingsOpen ? "text-[var(--color-val-red)] font-bold scale-105" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={settingsOpen ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className="text-[10px] tracking-tight">Réglages</span>
      </button>
    </nav>
  );
}
