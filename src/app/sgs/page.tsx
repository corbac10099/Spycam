import Link from "next/link";
import { getSgsLegalSettings } from "@/lib/sgsLegal";

export default async function SgsHomePage() {
  const legal = await getSgsLegalSettings();
  const spycamUrl = process.env.NEXT_PUBLIC_SPYCAM_URL || "http://localhost:3000";

  const services = [
    {
      slug: "spycam",
      name: "Spycam — Valorant Performance Tracker",
      category: "Valorant / e-Sport",
      status: "En Ligne & Actif",
      statusColor: "bg-emerald-500",
      description: "Plateforme complète de suivi de performance Valorant, salons LFG avec vocal HD temps réel et isolation IA Krisp, et analytics avancés.",
      badge: "Flagship App",
      badgeColor: "bg-red-600",
      link: spycamUrl,
      stats: ["Salons LFG Vocaux", "Stats en Temps Réel", "IA Isolation Bruit", "Audit Anti-Toxicité"],
      icon: "🎯",
    },
    {
      slug: "aimlab-sync",
      name: "SGS Aim Sync & Warmup",
      category: "Entraînement / Mécaniques",
      status: "En Développement",
      statusColor: "bg-amber-500",
      description: "Synchronisez vos routines d'aim training, vos sensibilités entre jeux (Valorant, CS2, Apex) et suivez votre progression quotidienne.",
      badge: "Bientôt",
      badgeColor: "bg-gray-700",
      link: "#",
      stats: ["Cross-Game Sens", "Heatmaps de tir", "Warmup Daily"],
      icon: "⚡",
    },
    {
      slug: "tournament-hub",
      name: "SGS Tournament & Scrims",
      category: "Compétition / Équipes",
      status: "Prévu 2026",
      statusColor: "bg-purple-500",
      description: "Créez vos brackets de tournois, organisez vos scrims personnalisés et enregistrez vos statistiques d'équipe avec vos comptes SGS.",
      badge: "Roadmap",
      badgeColor: "bg-gray-800",
      link: "#",
      stats: ["Brackets automatiques", "Statistiques d'équipe", "Pick & Ban"],
      icon: "🏆",
    },
  ];

  return (
    <div className="space-y-16 py-6 animate-in fade-in duration-300">
      {/* HERO SECTION */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Écosystème Gaming Centralisé</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight">
          Un Compte Unique.<br />
          <span className="bg-gradient-to-r from-[#ff4655] via-red-400 to-amber-400 bg-clip-text text-transparent">
            Toutes Vos Applications e-Sport.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          <strong>SGS (Smart Gaming Suite)</strong> unifie vos outils compétitifs, vos statistiques de jeu et vos salons vocaux sous une seule identité sécurisée.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href={spycamUrl}
            className="px-8 py-4 rounded-2xl bg-[var(--sgs-red)] hover:bg-[#ff5e6c] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[rgba(255,70,85,0.4)] transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Lancer Spycam Tracker</span>
            <span>➔</span>
          </a>

          <Link
            href="/compte"
            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm uppercase tracking-wider transition-all"
          >
            Gérer mon Compte SGS
          </Link>
        </div>
      </section>

      {/* ECOSYSTEM STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl p-4 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-white">100%</span>
          <p className="text-[11px] text-gray-400 uppercase font-bold">Compte Centralisé</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-[var(--sgs-red)]">0 ms</span>
          <p className="text-[11px] text-gray-400 uppercase font-bold">Latence WebRTC Vocale</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">PostgreSQL</span>
          <p className="text-[11px] text-gray-400 uppercase font-bold">Neon DB Serverless</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-sky-400">Multi-Apps</span>
          <p className="text-[11px] text-gray-400 uppercase font-bold">Écosystème Extensible</p>
        </div>
      </section>

      {/* SERVICES SHOWCASE GRID */}
      <section id="services" className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[var(--sgs-red)] tracking-widest">Applications Connectées</span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase">Les Services SGS</h2>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{services.length} Service(s) au catalogue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.slug}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{srv.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${srv.badgeColor}`}>
                      {srv.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{srv.category}</span>
                  <h3 className="text-lg font-black text-white">{srv.name}</h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {srv.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {srv.stats.map((st, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-medium text-gray-300">
                      ✓ {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${srv.statusColor}`}></span>
                  <span className="text-[11px] font-bold text-gray-300">{srv.status}</span>
                </div>

                {srv.slug === "spycam" ? (
                  <a
                    href={srv.link}
                    className="px-4 py-2 rounded-xl bg-[var(--sgs-red)] hover:bg-[#ff5e6c] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Ouvrir ➔
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 font-bold uppercase">Bientôt</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UNIFIED LEGAL & COMPLIANCE BANNER */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto space-y-4 bg-gradient-to-r from-red-950/20 via-black/40 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[var(--sgs-red)] tracking-wider">Conformité Globale</span>
            <h3 className="text-lg font-black text-white uppercase">Conditions Générales d&apos;Utilisation & RGPD</h3>
            <p className="text-xs text-gray-400 max-w-xl mt-1">
              Toutes les applications de l&apos;écosystème SGS sont encadrées par une charte de modération unifiée et des CGU centralisées.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/cgu"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all"
            >
              Consulter les CGU
            </Link>
            <Link
              href="/mentions-legales"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all"
            >
              Mentions Légales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
