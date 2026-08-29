"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Route /salons — redirige vers la page principale avec la vue Salons activée.
 * Permet l'accès direct via http://127.0.0.1:3000/salons
 */
export default function SalonsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?view=lobbies");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[var(--color-val-red)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
          Chargement des salons...
        </span>
      </div>
    </div>
  );
}
