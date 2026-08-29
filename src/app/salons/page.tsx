"use client";

import { Suspense } from "react";
import { HomeContent } from "@/app/page";

/**
 * Route /salons — affiche directement la vue Salons LFG & Vocal de Spycam
 * tout en conservant l'URL /salons dans la barre d'adresse.
 */
export default function SalonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold tracking-widest uppercase animate-pulse">
          Chargement des salons...
        </div>
      }
    >
      <HomeContent initialLobbiesView={true} />
    </Suspense>
  );
}
