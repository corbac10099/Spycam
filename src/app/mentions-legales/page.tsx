import Link from "next/link";
import { getSgsLegalSettings } from "@/lib/sgsLegal";

export const dynamic = "force-dynamic";

export default async function MentionsPage() {
  const legal = await getSgsLegalSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--sgs-red)] tracking-widest">SGS Conformité</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">Mentions Légales & Hébergeurs</h1>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all"
        >
          ← Retour au Hub
        </Link>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Éditeur</span>
            <p className="text-xs font-black text-white">{legal.companyName}</p>
            <p className="text-xs text-[var(--sgs-red)]">{legal.contactEmail}</p>
            <p className="text-xs text-gray-400">{legal.contactAddress}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Hébergeur Web & Edge</span>
            <p className="text-xs font-black text-white">{legal.hostName}</p>
            <p className="text-xs text-gray-400">{legal.hostAddress}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Base de données Cloud</span>
            <p className="text-xs font-black text-white">{legal.dbHost}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Stockage & CDN</span>
            <p className="text-xs font-black text-white">{legal.storageHost}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line space-y-4 pt-4 border-t border-white/10">
          {legal.mentionsLegales}
        </div>

        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 space-y-2">
          <h3 className="font-bold text-white uppercase text-xs">Clause Officielle Riot Games (Legal Jibber-Jabber)</h3>
          <p className="whitespace-pre-line leading-relaxed">{legal.riotDisclaimer}</p>
        </div>
      </div>
    </div>
  );
}
