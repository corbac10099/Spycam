"use client";

import { Suspense } from "react";
import { HomeContent } from "@/app/page";

/**
 * Route /leaderboard — affiche directement la page dédiée au Classement officiel Riot
 * tout en conservant l'URL /leaderboard dans la barre d'adresse.
 */
export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold tracking-widest uppercase animate-pulse">
          Chargement du classement...
        </div>
      }
    >
      <HomeContent initialLeaderboardView={true} />
    </Suspense>
  );
}
