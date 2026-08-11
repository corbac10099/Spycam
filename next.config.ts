import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Routes réservées (ne PAS intercepter)
    // api, login, register, onboarding, _next, favicon
    
    // Onglets principaux (propre profil) — URL en français
    const mainTabs = ['home', 'actualites', 'agents', 'parametres'];
    // Sous-onglets du home
    const homeSubs = ['historique', 'agents-stats', 'performance'];
    // Sous-onglets des paramètres
    const settingsSubs = ['features', 'privacy', 'appearance', 'about', 'language'];

    return [
      // /home, /actualites, /agents, /parametres → racine
      ...mainTabs.map(tab => ({
        source: `/${tab}`,
        destination: '/',
      })),
      // /home/historique, /home/agents-stats, /home/performance → racine
      ...homeSubs.map(sub => ({
        source: `/home/${sub}`,
        destination: '/',
      })),
      // /parametres/privacy, /parametres/appearance, etc. → racine
      ...settingsSubs.map(sub => ({
        source: `/parametres/${sub}`,
        destination: '/',
      })),
      // /agents/:agentSlug → racine (ex: /agents/jett)
      {
        source: '/agents/:slug',
        destination: '/',
      },
      // === Routes avec Riot ID (autre joueur) ===
      // /:riotId/home, /:riotId/actualites, etc. → racine
      ...mainTabs.map(tab => ({
        source: `/:riotId/${tab}`,
        destination: '/',
      })),
      // /:riotId/home/historique, etc. → racine
      ...homeSubs.map(sub => ({
        source: `/:riotId/home/${sub}`,
        destination: '/',
      })),
      // /:riotId/agents/:slug → racine
      {
        source: '/:riotId/agents/:slug',
        destination: '/',
      },
      // /:riotId seul (sans tab) → racine, si pas réservé
      {
        source: '/:riotId((?!api|login|register|onboarding|_next|favicon).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
