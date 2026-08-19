"use client";

import { useState, useEffect } from "react";
import AbilityCard from "./AbilityCard";
import { t, Locale } from "@/lib/i18n";

export interface AgentsWikiComponentProps {
  videoLoop?: boolean;
  videoLoopDelay?: number;
  locale: Locale;
  pushUrl: (opts: any) => void;
}

export default function AgentsWikiComponent({
  videoLoop,
  videoLoopDelay,
  locale,
  pushUrl,
}: AgentsWikiComponentProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/cms/agents")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (agents.length > 0) {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/agents\/([^/]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const agent = agents.find((a) => a.name.toLowerCase() === slug.toLowerCase());
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
        const agent = agents.find((a) => a.name.toLowerCase() === slug.toLowerCase());
        if (agent) setSelectedAgent(agent);
      } else {
        setSelectedAgent(null);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [agents]);

  const abilitySlots = [
    { key: "C", label: "C — Gratuite", color: "#22c55e" },
    { key: "Q", label: "Q", color: "#3b82f6" },
    { key: "E", label: "E — Signature", color: "#f59e0b" },
    { key: "X", label: "X — Ultime", color: "#ef4444" },
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 animate-in fade-in duration-300">
        <button
          onClick={() => {
            setSelectedAgent(null);
            pushUrl({ view: "agents", agentSlug: null });
          }}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-val-red)] transition-colors mb-6 font-bold cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux agents
        </button>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            {selectedAgent.iconUrl && (
              <img
                referrerPolicy="no-referrer"
                src={selectedAgent.iconUrl}
                alt={selectedAgent.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-[var(--color-background)] p-2 border border-[var(--color-border)]"
              />
            )}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                {selectedAgent.name}
              </h2>
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-val-red)]">{selectedAgent.role}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {abilitySlots.map((slot) => {
            const ab = abilities[slot.key];
            if (!ab || !ab.name) return null;
            return (
              <AbilityCard
                key={slot.key}
                ability={ab}
                slotName={slot.label}
                globalLoop={videoLoop}
                globalLoopDelayMs={videoLoopDelay}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 animate-in fade-in duration-300">
      <h2 className="text-3xl font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-8">{t("tab_agents", locale)}</h2>

      {agents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-lg text-[var(--color-text-secondary)] font-bold">{t("no_agents_configured", locale)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                pushUrl({ view: "agents", agentSlug: agent.name.toLowerCase() });
              }}
              className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-[var(--color-surface-hover)] transition-all duration-300 group cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-val-red)]"
            >
              {agent.iconUrl ? (
                <img
                  referrerPolicy="no-referrer"
                  src={agent.iconUrl}
                  alt={agent.name}
                  className="w-16 h-16 rounded-xl object-contain bg-[var(--color-background)] p-1 border border-[var(--color-border)] group-hover:border-[var(--color-val-red)] transition-colors"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] group-hover:border-[var(--color-val-red)] transition-colors flex items-center justify-center">
                  <span className="text-[var(--color-text-secondary)] font-bold text-xs">?</span>
                </div>
              )}
              <div className="text-center">
                <div className="font-bold uppercase tracking-widest text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-val-red)] transition-colors">
                  {agent.name}
                </div>
                <div className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">{agent.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
