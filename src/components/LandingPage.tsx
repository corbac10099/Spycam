"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface LandingPageProps {
  onEnterBeta: () => void;
  onOpenLogin: () => void;
}

export default function LandingPage({ onEnterBeta, onOpenLogin }: LandingPageProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: "customization",
      number: "01",
      tag: "SUR-MESURE",
      title: "Personnalisation Totale",
      desc: "Adaptez chaque pixel de votre interface : importez votre bannière avec réglage vertical en direct, activez une boucle vidéo d'ambiance et appliquez nos thèmes exclusifs (Crimson, Midnight, Ocean, Light).",
      preview: {
        type: "custom",
        items: [
          { title: "Bannière Personnalisée", val: "Ajustement d'offset en direct", icon: "🖼️" },
          { title: "Thèmes d'Interface", val: "Palette Midnight / Crimson / Dark", icon: "🎨" },
          { title: "Contrôle d'Affichage", val: "Modules configurables selon vos préférences", icon: "⚙️" },
        ],
      },
    },
    {
      id: "privacy",
      number: "02",
      tag: "SÉCURITÉ",
      title: "Confidentialité & Partage",
      desc: "Partagez vos exploits avec un lien public dédié (spycam.gg/pseudo/home) ou activez le mode privé pour masquer sélectif de vos données compétitives et de votre historique.",
      preview: {
        type: "privacy",
        url: "spycam.gg/Gr4phØ/home",
        items: [
          { label: "Lien de profil public", status: "Actif en 1-clic" },
          { label: "Visibilité des matchs", status: "Contrôlée" },
          { label: "Protection des statistiques", status: "Sécurisée" },
        ],
      },
    },
    {
      id: "stats",
      number: "03",
      tag: "INTELLIGENCE",
      title: "Smart Rating & Analyse",
      desc: "Découvrez votre véritable impact au-delà du simple K/D. Notre algorithme calcule votre cote d'efficacité round par round avec métriques avancées : KAST, dégâts différentiels (DDΔ), headshot % et clutchs.",
      preview: {
        type: "stats",
        metrics: [
          { label: "Smart Rating", val: "88.4", sub: "Top 3.2% Global" },
          { label: "Ratio K/D", val: "1.48", sub: "+0.14 cette semaine" },
          { label: "Headshot %", val: "36.2%", sub: "Précision d'élite" },
          { label: "Win Rate", val: "69.5%", sub: "16 Victoires / 7 Défaites" },
        ],
      },
    },
    {
      id: "agents",
      number: "04",
      tag: "TACTIQUE",
      title: "Encyclopédie des Agents",
      desc: "Accédez aux fiches exhaustives de chaque agent VALORANT : compétences décortiquées, taux de sélection, synergies et guides vidéo fluides pour perfectionner votre utilitaire.",
      preview: {
        type: "agents",
        agents: [
          { name: "Jett", role: "Duelliste", pick: "42.8%", stat: "1.34 K/D" },
          { name: "Omen", role: "Contrôleur", pick: "28.5%", stat: "1.18 K/D" },
          { name: "Sova", role: "Initiateur", pick: "24.1%", stat: "1.22 K/D" },
        ],
      },
    },
    {
      id: "news",
      number: "05",
      tag: "EN DIRECT",
      title: "Actualités & Notes de Patch",
      desc: "Restez toujours informé des équilibrages d'agents, nouvelles cartes et bundles de skins avec des notes de patch complètes et synchronisées en temps réel.",
      preview: {
        type: "news",
        news: [
          { tag: "PATCH 13.02", title: "Ajustements des Duellistes & Mode Retake", date: "Actif" },
          { tag: "COLLECTION", title: "Bundle Aeris avec effets évolutifs", date: "Boutique" },
        ],
      },
    },
  ];

  // Handle natural scroll progress in the pinned showcase section
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollSectionRef.current) return;
      const rect = scrollSectionRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = Math.min(Math.max(-rect.top / totalHeight, 0), 1);
      const stepIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);
      setActiveStep(stepIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#ece8e1] selection:bg-[var(--color-val-red)] selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Soft Glows (Subtle, non-distracting) */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--color-val-red)]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none z-0" />

      {/* Floating Top Navbar (Clean, transparent, no solid bar) */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        {/* Left: Full Logo preserved exactly as provided */}
        <div className="flex items-center gap-3.5 select-none">
          <img
            src="/spycam-logo.png"
            alt="SPYCAM"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,70,85,0.4)]"
          />
        </div>

        {/* Right: Floating Compact Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onEnterBeta}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[var(--color-val-red)] hover:bg-[#ff5865] shadow-[0_0_20px_rgba(255,70,85,0.35)] hover:shadow-[0_0_30px_rgba(255,70,85,0.6)] hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Accéder à la Bêta</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="glass-pill inline-flex items-center px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wider text-white/80 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>Se connecter</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Static, sharp tactical pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--color-val-red)]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-white/90">
            Tracker Personnalisable & Hub Stratégique
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] max-w-4xl mx-auto mb-6">
          Votre progression VALORANT,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-val-red)] via-[#ff7b86] to-white">
            entièrement sur mesure.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-white/70 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Analysez vos statistiques en temps réel, personnalisez votre profil avec vos bannières et thèmes favoris, contrôlez votre confidentialité et explorez l'encyclopédie des agents.
        </p>

        {/* Hero CTA Buttons (Sleek, refined) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
          <button
            onClick={onEnterBeta}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-[var(--color-val-red)] hover:bg-[#ff5865] shadow-[0_0_30px_rgba(255,70,85,0.4)] hover:shadow-[0_0_45px_rgba(255,70,85,0.7)] hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <span>⚡ Tester la Bêta Démo</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="glass-card w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>Mon Compte</span>
          </button>
        </div>

        {/* 4 Clean Glass Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-white/10">
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-xl sm:text-2xl font-black text-white mb-0.5">100%</div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Personnalisable</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-xl sm:text-2xl font-black text-white mb-0.5">Public / Privé</div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Confidentialité</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-xl sm:text-2xl font-black text-white mb-0.5">Smart Rating</div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Analyse d'Impact</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-xl sm:text-2xl font-black text-white mb-0.5">Wiki & Actus</div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Hub Stratégique</div>
          </div>
        </div>
      </section>

      {/* Sticky Interactive Showcase (Scroll to change features like professional landing pages) */}
      <section ref={scrollSectionRef} className="relative z-10 min-h-[280vh] border-y border-white/10 bg-black/40">
        <div className="sticky top-20 min-h-[80vh] flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[var(--color-val-red)] font-black text-[10px] uppercase tracking-widest block mb-1">
              EXPÉRIENCE INTERACTIVE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
              Conçu pour votre confort de jeu
            </h2>
            <p className="text-white/50 text-xs sm:text-sm">
              Faites défiler la page pour explorer chaque facette de Spycam.
            </p>
          </div>

          {/* Sticky 2-Column Split: Steps list on Left, Live Glass Showcase on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Timeline List */}
            <div className="lg:col-span-5 space-y-3">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
                      isActive
                        ? "glass-card border-[var(--color-val-red)]/50 bg-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-x-1"
                        : "border-transparent bg-transparent hover:bg-white/[0.02] opacity-40 hover:opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-mono font-black ${isActive ? "text-[var(--color-val-red)]" : "text-white/40"}`}>
                        {step.number}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {step.title}
                      </span>
                    </div>
                    {isActive && (
                      <p className="text-xs text-white/70 leading-relaxed mt-2 animate-dissolve">
                        {step.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Live Glass Preview with Smooth Dissolution */}
            <div className="lg:col-span-7">
              <div
                key={activeStep}
                className="animate-dissolve glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Preview Window Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="text-[10px] font-mono uppercase text-white/40 ml-2">
                      SPYCAM // {steps[activeStep].tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--color-val-red)] bg-[var(--color-val-red)]/10 px-2 py-0.5 rounded border border-[var(--color-val-red)]/30">
                    MODULE 0{activeStep + 1}
                  </span>
                </div>

                {/* Step 1: Customization */}
                {steps[activeStep].preview.type === "custom" && (
                  <div className="space-y-3">
                    {steps[activeStep].preview.items?.map((it: any, i: number) => (
                      <div
                        key={i}
                        className="glass-pill flex items-center justify-between p-3.5 rounded-xl transition-all hover:border-white/25"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{it.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{it.title}</div>
                            <div className="text-[11px] text-white/50">{it.val}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/80 bg-white/10 px-2 py-0.5 rounded">
                          Configurable
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Privacy */}
                {steps[activeStep].preview.type === "privacy" && (
                  <div className="space-y-4">
                    <div className="glass-pill p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs text-white">
                        <span className="text-[var(--color-val-red)]">🔒</span>
                        <span>{steps[activeStep].preview.url}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-white/10 text-white/90 px-2 py-0.5 rounded">
                        Partage 1-Clic
                      </span>
                    </div>
                    <div className="space-y-2">
                      {steps[activeStep].preview.items?.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="glass-pill flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs"
                        >
                          <span className="text-white/70">{item.label}</span>
                          <span className="font-bold text-white">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Stats */}
                {steps[activeStep].preview.type === "stats" && (
                  <div className="grid grid-cols-2 gap-3.5">
                    {steps[activeStep].preview.metrics?.map((m: any, i: number) => (
                      <div key={i} className="glass-pill p-4 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-white/40 mb-1">{m.label}</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mb-0.5">{m.val}</div>
                        <div className="text-[10px] text-white/50">{m.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 4: Agents */}
                {steps[activeStep].preview.type === "agents" && (
                  <div className="space-y-2.5">
                    {steps[activeStep].preview.agents?.map((ag: any, i: number) => (
                      <div
                        key={i}
                        className="glass-pill flex items-center justify-between p-3 rounded-xl hover:border-white/25"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-val-red)]/20 text-[var(--color-val-red)] flex items-center justify-center font-black text-xs">
                            {ag.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{ag.name}</div>
                            <div className="text-[10px] text-white/50">{ag.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">{ag.stat}</div>
                          <div className="text-[10px] text-white/40">Pick {ag.pick}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 5: News */}
                {steps[activeStep].preview.type === "news" && (
                  <div className="space-y-3">
                    {steps[activeStep].preview.news?.map((n: any, i: number) => (
                      <div key={i} className="glass-pill p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white px-2 py-0.5 rounded">
                            {n.tag}
                          </span>
                          <span className="text-[10px] text-white/40">{n.date}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{n.title}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Interactive Trigger */}
                <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-mono">
                    Défilez pour passer au module suivant
                  </span>
                  <button
                    onClick={onEnterBeta}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-val-red)] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Essayer en démo</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Floating CTA Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
            Prêt à transformer votre analyse ?
          </h2>
          <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto mb-8">
            Testez la plateforme immédiatement en mode démo sans création de compte, ou connectez-vous pour commencer votre suivi personnalisé.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onEnterBeta}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-[var(--color-val-red)] hover:bg-[#ff5865] shadow-[0_0_25px_rgba(255,70,85,0.4)] hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
            >
              ⚡ Tester la Bêta Démo
            </button>
            <button
              onClick={onOpenLogin}
              className="glass-pill w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white hover:text-white transition-all duration-200 cursor-pointer"
            >
              Se Connecter
            </button>
          </div>
        </div>
      </section>

      {/* Clean Minimalist Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/60 py-8 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-white/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-white/70">SPYCAM</span>
            <span>— Tracker de Performance & Hub Tactique VALORANT</span>
          </div>
          <div>
            <span>Non affilié à Riot Games. VALORANT est une marque déposée de Riot Games, Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
