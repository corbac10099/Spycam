<p align="center">
  <img src="https://img.shields.io/badge/SPYCAM-Valorant%20Tracker-ff4655?style=for-the-badge&logo=valorant&logoColor=white" alt="SPYCAM" />
</p>

<h1 align="center">🎯 SPYCAM — Valorant Performance Tracker</h1>

<p align="center">
  Application web de suivi de performances pour <strong>Valorant</strong>.<br/>
  Analysez vos statistiques, votre historique de matchs, et améliorez votre gameplay.
</p>

<p align="center">
  <a href="https://spycam.vercel.app">🌐 Démo en ligne</a> •
  <a href="#installation">📦 Installation</a> •
  <a href="#fonctionnalités">✨ Fonctionnalités</a>
</p>

---

## ✨ Fonctionnalités

- **Dashboard complet** — K/D, Win Rate, ACS, Headshot %, KAST, ADR, DDΔ, et plus
- **Historique des matchs** — Détails de chaque partie avec agent, map, score et performance
- **Statistiques par agent** — Taux de victoire, K/D et temps de jeu par agent
- **Filtres avancés** — Par saison, mode de jeu (Classé, Non Classé, etc.)
- **Système de thèmes** — 5 thèmes visuels (Dark, Light, Midnight, Crimson, Ocean)
- **Bannière personnalisable** — Choisissez et cadrez votre bannière de profil
- **Smart Rating** — Alertes intelligentes sur vos points faibles à travailler
- **Authentification** — Connexion via Google OAuth / Inscription classique
- **Multi-profils** — Recherchez n'importe quel joueur par son Riot ID

---

## 🛠️ Stack Technique

| Technologie | Usage |
|---|---|
| **Next.js 16** | Framework React (App Router) |
| **TypeScript** | Typage statique |
| **Tailwind CSS v4** | Styling |
| **NextAuth.js v4** | Authentification (Google OAuth, Credentials) |
| **Prisma** | ORM + SQLite (dev) |
| **HenrikDev API** | Données Valorant (temporaire, en attendant l'API Riot officielle) |

---

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) ou yarn

### Étapes

```bash
# 1. Clonez le repo
git clone https://github.com/VOTRE_USERNAME/spycam.git
cd spycam/tracker-app

# 2. Installez les dépendances
npm install

# 3. Configurez les variables d'environnement
cp .env.example .env.local
# Remplissez vos clés dans .env.local

# 4. Initialisez la base de données
npx prisma db push

# 5. Lancez le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🔑 Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez :

| Variable | Description | Où l'obtenir |
|---|---|---|
| `RIOT_API_KEY` | Clé API Riot Games | [developer.riotgames.com](https://developer.riotgames.com/) |
| `RIOT_CLIENT_ID` | Client ID RSO | [developer.riotgames.com](https://developer.riotgames.com/) |
| `RIOT_CLIENT_SECRET` | Client Secret RSO | [developer.riotgames.com](https://developer.riotgames.com/) |
| `HENRIK_API_KEY` | Clé API HenrikDev | [docs.henrikdev.xyz](https://docs.henrikdev.xyz/) |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth | [console.cloud.google.com](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | [console.cloud.google.com](https://console.cloud.google.com/) |
| `NEXTAUTH_SECRET` | Secret pour NextAuth | `openssl rand -base64 32` |

---

## 📸 Aperçu

> *Screenshots à venir — l'application est en développement actif.*

---

## 📜 Licence

Ce projet est soumis aux [Conditions d'utilisation de l'API Riot Games](https://developer.riotgames.com/terms).

> SPYCAM isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
