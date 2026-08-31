import Link from "next/link";
import { getSgsLegalSettings } from "@/lib/sgsLegal";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const legal = await getSgsLegalSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--sgs-red)] tracking-widest">SGS Conformité</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">Politique de Confidentialité (RGPD)</h1>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all"
        >
          ← Retour au Hub
        </Link>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">Responsable du traitement : <strong>{legal.contactEmail}</strong></span>
          <span className="text-xs font-black text-emerald-400 uppercase">Protection des Données RGPD</span>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line space-y-4">
          {legal.privacyPolicy}
        </div>
      </div>
    </div>
  );
}
