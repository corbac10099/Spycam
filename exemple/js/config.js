/* ==========================================================================
   CONFIG - Valorant Tracker v2
   ========================================================================== */

const CONFIG = {
    HENRIK_API_BASE: '/api/henrik',       // Proxied via server.py
    TRACKER_API_BASE: '/api/tracker',     // Proxied via server.py
    VALORANT_ASSETS: 'https://media.valorant-api.com',
    STORAGE_KEYS: {
        USER_PROFILE: 'tracker_valo_user_profile',
        RECENT_SEARCHES: 'tracker_valo_recent_searches',
        SETTINGS: 'tracker_valo_settings',
        MATCH_WINDOW: 'tracker_valo_match_window'
    },
    DEFAULT_REGION: 'eu',
    API_TIMEOUT: 8000  // 8 seconds
};

// â”€â”€ All Valorant Agents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AGENTS_META = {
    'Astra':    { name: 'Astra',    role: 'Controller', icon: 'https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png' },
    'Breach':   { name: 'Breach',   role: 'Initiator', icon: 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png' },
    'Brimstone':{ name: 'Brimstone',role: 'Controller', icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png' },
    'Chamber':  { name: 'Chamber', role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png' },
    'Clove':    { name: 'Clove',    role: 'Controller', icon: 'https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png' },
    'Cypher':   { name: 'Cypher',   role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png' },
    'Deadlock': { name: 'Deadlock', role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png' },
    'Fade':     { name: 'Fade',     role: 'Initiator', icon: 'https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png' },
    'Gekko':    { name: 'Gekko',    role: 'Initiator', icon: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png' },
    'Harbor':   { name: 'Harbor',   role: 'Controller', icon: 'https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png' },
    'Iso':      { name: 'Iso',      role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png' },
    'Jett':     { name: 'Jett',     role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png' },
    'KAY/O':    { name: 'KAY/O',    role: 'Initiator', icon: 'https://media.valorant-api.com/agents/601dbe02-90fb-4a32-9428-d476fc701e93/displayicon.png' },
    'Killjoy':  { name: 'Killjoy', role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png' },
    'Neon':     { name: 'Neon',     role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png' },
    'Omen':     { name: 'Omen',     role: 'Controller', icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png' },
    'Phoenix':  { name: 'Phoenix', role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png' },
    'Raze':     { name: 'Raze',     role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-8e18-284bd4a12606/displayicon.png' },
    'Reyna':    { name: 'Reyna',    role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png' },
    'Sage':     { name: 'Sage',     role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png' },
    'Skye':     { name: 'Skye',     role: 'Initiator', icon: 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png' },
    'Sova':     { name: 'Sova',     role: 'Initiator', icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png' },
    'Viper':    { name: 'Viper',    role: 'Controller', icon: 'https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png' },
    'Vyse':     { name: 'Vyse',     role: 'Sentinel',   icon: 'https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png' },
    'Yoru':     { name: 'Yoru',     role: 'Duelist',    icon: 'https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png' },
    'Tejo':     { name: 'Tejo',     role: 'Initiator', icon: 'https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png' }
};

// â”€â”€ Competitive Ranks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COMP_TIER_UUID = '03621f52-342b-cf4e-4f86-9350a49c6d04';
const RANKS_META = {};
const RANK_NAMES = [
    null, null, null,
    'Iron 1','Iron 2','Iron 3',
    'Bronze 1','Bronze 2','Bronze 3',
    'Silver 1','Silver 2','Silver 3',
    'Gold 1','Gold 2','Gold 3',
    'Platinum 1','Platinum 2','Platinum 3',
    'Diamond 1','Diamond 2','Diamond 3',
    'Ascendant 1','Ascendant 2','Ascendant 3',
    'Immortal 1','Immortal 2','Immortal 3',
    'Radiant'
];
for (let i = 3; i <= 27; i++) {
    RANKS_META[i] = {
        name: RANK_NAMES[i],
        icon: `https://media.valorant-api.com/competitivetiers/${COMP_TIER_UUID}/${i}/largeicon.png`
    };
}

// â”€â”€ Maps Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MAPS_META = {
    'Ascent':   { name: 'Ascent',   splash: 'https://media.valorant-api.com/maps/7eaecc1b-4b83-df47-db07-0baf8f602bb2/splash.png' },
    'Bind':     { name: 'Bind',     splash: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2ece-7199cce30b69/splash.png' },
    'Breeze':   { name: 'Breeze',   splash: 'https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png' },
    'Fracture': { name: 'Fracture', splash: 'https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png' },
    'Haven':    { name: 'Haven',    splash: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png' },
    'Icebox':   { name: 'Icebox',   splash: 'https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9a90-8f8f0db62748/splash.png' },
    'Lotus':    { name: 'Lotus',    splash: 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png' },
    'Pearl':    { name: 'Pearl',    splash: 'https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png' },
    'Split':    { name: 'Split',    splash: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png' },
    'Sunset':   { name: 'Sunset',   splash: 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png' },
    'Abyss':    { name: 'Abyss',    splash: 'https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png' },
};

// â”€â”€ Weapons Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WEAPONS_META = [
    {
        name: 'Phantom',
        type: 'Fusils d\'assaut',
        icon: 'https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png',
        head: '11%', body: '67%', legs: '21%', kills: 566
    },
    {
        name: 'Vandal',
        type: 'Fusils d\'assaut',
        icon: 'https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png',
        head: '11%', body: '70%', legs: '20%', kills: 372
    },
    {
        name: 'Ghost',
        type: 'Armes de poing',
        icon: 'https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/displayicon.png',
        head: '12%', body: '67%', legs: '21%', kills: 137
    }
];

// ── Coaching Tips Engine ──────────────────────────────────────────────────────────
function generateCoachingTips(stats, mainAgent) {
    const tips = [];
    const kd = parseFloat(stats.kd) || 0;
    const hs = parseFloat(stats.hs) || 0;
    const wr = parseFloat(stats.winRate) || 0;
    const adr = parseFloat(stats.adr) || 0;
    const kast = parseFloat(stats.kast) || 0;
    const fb = parseInt(stats.firstBloods) || 0;
    const matches = parseInt(stats.matches) || 0;
    const isCypher = mainAgent === 'Cypher';

    // K/D analysis
    if (kd < 0.8) {
        tips.push({ type: 'negative', icon: '', title: 'K/D trop bas', desc: `Ton K/D de ${stats.kd} est en dessous de la moyenne. ${isCypher ? 'Utilise tes caméras et trapwires pour obtenir des kills gratuits avant de t\'engager.' : 'Concentre-toi sur le positionnement et le crosshair placement.'}` });
    } else if (kd >= 1.2) {
        tips.push({ type: 'positive', icon: '', title: 'Excellent K/D !', desc: `${stats.kd} K/D • tu élimines bien plus que tu ne meurs. Continue sur cette lancée !` });
    } else {
        tips.push({ type: 'neutral', icon: '⚖️', title: 'K/D correct', desc: `${stats.kd} K/D est dans la moyenne. ${isCypher ? 'Place tes trapwires en positions agressives pour gratter des kills early round.' : 'Travaille le peeking et les duels pour le pousser au-dessus de 1.0.'}` });
    }

    // Headshot analysis
    if (hs < 15) {
        tips.push({ type: 'negative', icon: '', title: 'Headshot % critique', desc: `${stats.hs} HS est très bas. Entraîne-toi au crosshair placement : vise TOUJOURS au niveau de la tête en marchant. Essaie les modes Deathmatch et les maps d'aim training.` });
    } else if (hs >= 25) {
        tips.push({ type: 'positive', icon: '', title: 'Précision remarquable', desc: `${stats.hs} de headshots, ton aim est au-dessus de la moyenne. Tu devrais carry plus souvent avec cette précision !` });
    }

    // Winrate
    if (wr < 48) {
        tips.push({ type: 'negative', icon: '', title: 'Taux de victoire bas', desc: `${stats.winRate} WR • tu perds plus que tu gagnes. ${isCypher ? 'Communique les infos de tes caméras à ton équipe et anchor les sites plus efficacement.' : 'Focus sur les calls et joue pour l\'équipe plutôt que pour les frags.'}` });
    } else if (wr >= 55) {
        tips.push({ type: 'positive', icon: '🏆', title: 'Machine à gagner', desc: `${stats.winRate} WR • tu es un vrai moteur de victoire pour ton équipe !` });
    }

    // ADR
    if (adr < 120) {
        tips.push({ type: 'negative', icon: '', title: 'Impact faible (ADR)', desc: `ADR de ${stats.adr} • tu ne fais pas assez de dégâts par round. ${isCypher ? 'N\'hésite pas à prendre des duels après avoir obtenu de l\'info avec ta caméra.' : 'Sois plus agressif et cherche les duels au lieu de te cacher.'}` });
    } else if (adr >= 160) {
        tips.push({ type: 'positive', icon: '', title: 'Gros impact !', desc: `ADR de ${stats.adr} • tu as un impact énorme chaque round. Tu es probablement le carry de ton équipe.` });
    }

    // Cypher-specific tips
    if (isCypher) {
        tips.push({ type: 'neutral', icon: '', title: 'Tips Cypher', desc: 'Pense à varier tes placements de trapwires chaque round. Les joueurs malins retiendront tes spots. Utilise ta cage + trapwire combo pour des one-ways mortels.' });
        if (kast < 70) {
            tips.push({ type: 'negative', icon: '', title: 'KAST à améliorer', desc: `KAST de ${stats.kast} • tu n'es pas impliqué dans assez de rounds. Place tes utilitaires pour avoir au minimum des assists si tu ne frag pas.` });
        }
    }

    // First Bloods
    if (matches > 0 && fb / matches < 0.5) {
        tips.push({ type: 'neutral', icon: '🗡️', title: 'Plus de premiers sangs', desc: `${fb} first bloods en ${matches} matchs, ${isCypher ? 'utilise tes trapwires early pour attraper les rusheurs et gratter des first bloods passifs.' : 'essaie de prendre plus d\'initiatives en début de round.'}` });
    }

    return tips;
}

// â”€â”€ Match Generators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function generateGr4ph0Matches() {
    // Complete 20-match history extracted directly from Tracker.gg (20 - 26 Juillet)
    const realMatches = [
        // 26 Juillet (5 matchs)
        { map: 'Ascent', agent: 'Cypher', result: 'WIN', score: '13 - 8', kills: 13, deaths: 14, assists: 10, acs: 168, hs: '7%', rrChange: '+18 RR', mvpTag: null,        date: new Date('2026-07-26T20:00:00Z').toISOString() },
        { map: 'Summit', agent: 'Cypher', result: 'WIN', score: '13 - 9', kills: 6, deaths: 16, assists: 10, acs: 122, hs: '5%', rrChange: '+12 RR', mvpTag: null,        date: new Date('2026-07-26T19:00:00Z').toISOString() },
        { map: 'Haven',   agent: 'Cypher', result: 'WIN', score: '15 - 13', kills: 19, deaths: 22, assists: 11, acs: 216, hs: '7%', rrChange: '+15 RR', mvpTag: null,        date: new Date('2026-07-26T18:00:00Z').toISOString() },
        { map: 'Sunset', agent: 'Cypher', result: 'WIN', score: '13 - 8', kills: 12, deaths: 12, assists: 4, acs: 153, hs: '10%', rrChange: '+14 RR', mvpTag: null,        date: new Date('2026-07-26T17:00:00Z').toISOString() },
        { map: 'Haven',   agent: 'Cypher', result: 'WIN', score: '13 - 6', kills: 11, deaths: 11, assists: 9, acs: 187, hs: '5%', rrChange: '+19 RR', mvpTag: null,        date: new Date('2026-07-26T16:00:00Z').toISOString() },

        // 25 Juillet (3 matchs)
        { map: 'Lotus',   agent: 'Cypher', result: 'WIN', score: '13 - 3', kills: 12, deaths: 9, assists: 2, acs: 189, hs: '5%', rrChange: '+20 RR', mvpTag: 'TEAM MVP', date: new Date('2026-07-25T21:00:00Z').toISOString() },
        { map: 'Split',   agent: 'Cypher', result: 'WIN', score: '13 - 9', kills: 11, deaths: 16, assists: 12, acs: 165, hs: '2%', rrChange: '+10 RR', mvpTag: null,        date: new Date('2026-07-25T20:00:00Z').toISOString() },
        { map: 'Summit', agent: 'Cypher', result: 'LOSS', score: '14 - 16', kills: 20, deaths: 23, assists: 8, acs: 196, hs: '9%', rrChange: '-16 RR', mvpTag: null,        date: new Date('2026-07-25T19:00:00Z').toISOString() },

        // 24 Juillet (4 matchs)
        { map: 'Breeze', agent: 'Clove', result: 'WIN', score: '13 - 3', kills: 12, deaths: 11, assists: 6, acs: 185, hs: '6%', rrChange: '+21 RR', mvpTag: null,        date: new Date('2026-07-24T21:00:00Z').toISOString() },
        { map: 'Lotus',   agent: 'Clove', result: 'WIN', score: '11 - 2', kills: 9, deaths: 7, assists: 5, acs: 209, hs: '17%', rrChange: '+24 RR', mvpTag: 'TEAM MVP', date: new Date('2026-07-24T20:00:00Z').toISOString() },
        { map: 'Ascent', agent: 'Cypher', result: 'LOSS', score: '11 - 13', kills: 15, deaths: 18, assists: 8, acs: 193, hs: '10%', rrChange: '-13 RR', mvpTag: null,        date: new Date('2026-07-24T19:00:00Z').toISOString() },
        { map: 'Lotus',   agent: 'Cypher', result: 'LOSS', score: '1 - 13', kills: 5, deaths: 13, assists: 0, acs: 99, hs: '8%', rrChange: '-22 RR', mvpTag: null,        date: new Date('2026-07-24T18:00:00Z').toISOString() },

        // 22 Juillet (2 matchs)
        { map: 'Haven',   agent: 'Cypher', result: 'WIN', score: '14 - 12', kills: 35, deaths: 18, assists: 12, acs: 358, hs: '11%', rrChange: '+31 RR', mvpTag: 'MATCH MVP', date: new Date('2026-07-22T21:00:00Z').toISOString() },
        { map: 'Sunset', agent: 'Cypher', result: 'WIN', score: '14 - 12', kills: 20, deaths: 20, assists: 2, acs: 211, hs: '7%', rrChange: '+17 RR', mvpTag: null,        date: new Date('2026-07-22T20:00:00Z').toISOString() },

        // 21 Juillet (2 matchs)
        { map: 'Split',   agent: 'Cypher', result: 'LOSS', score: '7 - 13', kills: 17, deaths: 15, assists: 1, acs: 230, hs: '8%', rrChange: '-12 RR', mvpTag: null,        date: new Date('2026-07-21T21:00:00Z').toISOString() },
        { map: 'Haven',   agent: 'Cypher', result: 'LOSS', score: '11 - 13', kills: 13, deaths: 18, assists: 6, acs: 171, hs: '5%', rrChange: '-15 RR', mvpTag: null,        date: new Date('2026-07-21T20:00:00Z').toISOString() },

        // 20 Juillet (4 matchs)
        { map: 'Split',   agent: 'Clove', result: 'LOSS', score: '3 - 13', kills: 21, deaths: 13, assists: 5, acs: 394, hs: '5%', rrChange: '-10 RR', mvpTag: 'TEAM MVP', date: new Date('2026-07-20T22:00:00Z').toISOString() },
        { map: 'Lotus',   agent: 'Cypher', result: 'LOSS', score: '11 - 13', kills: 10, deaths: 19, assists: 5, acs: 124, hs: '3%', rrChange: '-14 RR', mvpTag: null,        date: new Date('2026-07-20T21:00:00Z').toISOString() },
        { map: 'Summit', agent: 'Clove', result: 'WIN', score: '13 - 11', kills: 17, deaths: 26, assists: 9, acs: 240, hs: '5%', rrChange: '+18 RR', mvpTag: null,        date: new Date('2026-07-20T20:00:00Z').toISOString() },
        { map: 'Lotus',   agent: 'Clove', result: 'WIN', score: '13 - 7', kills: 20, deaths: 17, assists: 7, acs: 281, hs: '7%', rrChange: '+23 RR', mvpTag: null,        date: new Date('2026-07-20T19:00:00Z').toISOString() }
    ];

    const poolAllies = [
        { name: 'Nekro', tag: 'EU1', agent: 'Reyna' },
        { name: 'Z3ro', tag: 'FRA', agent: 'Jett' },
        { name: 'Anekos', tag: '001', agent: 'Omen' },
        { name: 'Bisket', tag: 'TTV', agent: 'Sova' }
    ];
    const poolEnemies = [
        { name: 'ViperX', tag: '777', agent: 'Viper' },
        { name: 'SniperKing', tag: 'EZ', agent: 'Chamber' },
        { name: 'DeadZone', tag: '999', agent: 'Deadlock' },
        { name: 'GekkoBro', tag: 'PET', agent: 'Gekko' },
        { name: 'PhoenixRising', tag: 'FIRE', agent: 'Phoenix' }
    ];

    return realMatches.map((m, i) => {
        const isWin = m.result === 'WIN';
        const allies = [
            { name: 'Gr4ph?hÃ˜', tag: '0001', agent: m.agent, kills: m.kills, deaths: m.deaths, assists: m.assists, acs: m.acs, adr: Math.floor(m.acs * 0.7), hs: m.hs, isSelf: true }
        ];

        for (let j = 0; j < 4; j++) {
            const p = poolAllies[j];
            const k = Math.floor(Math.random() * 12 + 6);
            const d = Math.floor(Math.random() * 10 + 6);
            const a = Math.floor(Math.random() * 6 + 2);
            const acs = Math.floor((k * 12) + (a * 4) + 60);
            allies.push({ name: p.name, tag: p.tag, agent: p.agent, kills: k, deaths: d, assists: a, acs, adr: Math.floor(acs * 0.68), hs: `${Math.floor(Math.random() * 12 + 8)}%`, isSelf: false });
        }
        allies.sort((a, b) => b.acs - a.acs);

        const enemies = [];
        for (let j = 0; j < 5; j++) {
            const p = poolEnemies[j];
            const k = isWin ? Math.floor(Math.random() * 8 + 4) : Math.floor(Math.random() * 12 + 10);
            const d = isWin ? Math.floor(Math.random() * 8 + 10) : Math.floor(Math.random() * 6 + 4);
            const a = Math.floor(Math.random() * 6 + 2);
            const acs = Math.floor((k * 12) + (a * 4) + 60);
            enemies.push({ name: p.name, tag: p.tag, agent: p.agent, kills: k, deaths: d, assists: a, acs, adr: Math.floor(acs * 0.68), hs: `${Math.floor(Math.random() * 12 + 8)}%`, isSelf: false });
        }
        enemies.sort((a, b) => b.acs - a.acs);

        return {
            id: `real_match_${i}`,
            map: m.map,
            agent: m.agent,
            result: m.result,
            score: m.score,
            rrChange: m.rrChange,
            mvpTag: m.mvpTag,
            fourK: m.fourK || false,
            hasAce: m.hasAce || false,
            kda: `${m.kills} / ${m.deaths} / ${m.assists}`,
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists,
            acs: m.acs,
            adr: Math.floor(m.acs * 0.7),
            headshots: Math.floor(m.kills * 0.15),
            bodyshots: Math.floor(m.kills * 0.65),
            legshots: Math.floor(m.kills * 0.2),
            date: m.date,
            duration: '35m',
            mode: 'Comp?titif',
            allies, enemies
        };
    });
}

const generateGr4phØMatches = generateGr4ph0Matches;

function generateSampleMatches() {
    const matches = [];
    const maps = ['Ascent', 'Bind', 'Haven', 'Split', 'Lotus', 'Sunset'];
    const agents = ['Jett', 'Reyna', 'Omen', 'Sova', 'Raze', 'Phoenix'];
    for (let i = 0; i < 20; i++) {
        const isWin = Math.random() > 0.5;
        const kills = Math.floor(Math.random() * 20 + 5);
        const deaths = Math.floor(Math.random() * 15 + 5);
        const assists = Math.floor(Math.random() * 10);
        matches.push({
            id: `sample_match_${i}`,
            map: maps[Math.floor(Math.random() * maps.length)],
            agent: agents[Math.floor(Math.random() * agents.length)],
            result: isWin ? 'WIN' : 'LOSS',
            score: isWin ? '13 - 10' : '8 - 13',
            kda: `${kills} / ${deaths} / ${assists}`,
            kills, deaths, assists,
            acs: Math.floor(Math.random() * 150 + 100),
            adr: Math.floor(Math.random() * 60 + 100),
            headshots: Math.floor(Math.random() * 8), bodyshots: Math.floor(Math.random() * 20 + 10), legshots: Math.floor(Math.random() * 5),
            date: new Date(Date.now() - i * 86400000).toISOString(),
            duration: `${Math.floor(Math.random() * 15 + 25)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            mode: 'Competitive'
        });
    }
    return matches;
}

// â”€â”€ Demo Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_PROFILES = {
    'gr4ph0#0001': {
        name: 'Gr4ph?hÃ˜', tag: '0001', region: 'EU', level: 39,
        rankId: 6, rr: 30,
        avatar: 'https://media.valorant-api.com/playercards/9fb348bc-4148-02ea-0720-6d9b04870505/largeart.png',
        bannerBg: 'https://media.valorant-api.com/playercards/9fb348bc-4148-02ea-0720-6d9b04870505/wideart.png',
        stats: {
            matches: 81, wins: 41, losses: 39, draws: 1,
            winRate: '50.6%', adr: '146.0', kd: '0.89',
            hs: '7.6%', kast: '71.6%',
            kills: 1213, deaths: 1363, assists: 501,
            acs: '221.4', kad: '1.26',
            firstBloods: 139, flawless: 52, aces: 5,
            clutches: 12, plants: 45, defuses: 18
        },
        precision: {
            head: { percent: '7.1%', hits: 109 },
            body: { percent: '67.1%', hits: 1036 },
            legs: { percent: '25.8%', hits: 398 }
        },
        topWeapons: WEAPONS_META,
        topAgents: [
            { name: 'Clove', matches: 56, winRate: '48.2%', kd: '0.89', adr: '156.1', acs: '236.2', hs: '7.2%' },
            { name: 'Cypher', matches: 23, winRate: '56.5%', kd: '0.92', adr: '127.5', acs: '194.1', hs: '8.1%' },
            { name: 'Neon', matches: 2, winRate: '50.0%', kd: '0.57', adr: '97.9', acs: '151.4', hs: '10.0%' }
        ],
        roles: [
            { role: 'Contrleur', winrate: '48.2%', kda: '1.24', wins: 27, losses: 29, matches: 56, color: '#00f0ff' },
            { role: 'Sentinelle', winrate: '56.5%', kda: '1.32', wins: 13, losses: 10, matches: 23, color: '#00e676' },
            { role: 'Duelliste', winrate: '50.0%', kda: '0.86', wins: 1, losses: 1, matches: 2, color: '#ff4655' }
        ],
        careerStats: {
            trackerScore: '577',
            peakRank: 'Bronze 1 (V26: ACTE IV)',
            kast: '71.6%',
            firstKills: 139,
            flawlessRounds: 52,
            aces: 5,
            mostUsedWeapon: 'Phantom',
            clutches: 12,
            plants: 45,
            defuses: 18
        },
        matches: generateGr4ph0Matches(),
        dataSource: 'HenrikDev API'
    },
    'tenz#0505': {
        name: 'TenZ', tag: '0505', region: 'NA', level: 320,
        rankId: 27, rr: 850,
        avatar: 'https://media.valorant-api.com/playercards/9fb348bc-4148-02ea-0720-6d9b04870505/largeart.png',
        bannerBg: 'https://media.valorant-api.com/playercards/9fb348bc-4148-02ea-0720-6d9b04870505/wideart.png',
        stats: {
            matches: 500, wins: 300, losses: 200, draws: 0,
            winRate: '60.0%', adr: '180.5', kd: '1.35',
            hs: '35.0%', acs: '280.4', kast: '80%',
            kills: 8500, deaths: 6300, assists: 2100,
            kad: '1.68', firstBloods: 500, flawless: 100, aces: 50,
            clutches: 85, plants: 120, defuses: 60
        },
        topWeapons: WEAPONS_META,
        topAgents: [
            { name: 'Jett', matches: 300, winRate: '62%', kd: '1.4', adr: '185', acs: '290', hs: '36%' },
            { name: 'Reyna', matches: 150, winRate: '58%', kd: '1.3', adr: '175', acs: '265', hs: '33%' },
            { name: 'Raze', matches: 50, winRate: '56%', kd: '1.2', adr: '170', acs: '255', hs: '30%' }
        ],
        roles: [
            { role: 'Duelliste', winrate: '60.0%', kda: '1.5', wins: 280, losses: 170, matches: 450, color: '#ff4655' },
            { role: 'Contrleur', winrate: '55.0%', kda: '1.2', wins: 20, losses: 30, matches: 50, color: '#00f0ff' }
        ],
        careerStats: {
            trackerScore: '950', peakRank: 'Radiant',
            kast: '80%', firstKills: 500, flawlessRounds: 100,
            aces: 50, mostUsedWeapon: 'Vandal',
            clutches: 85, plants: 120, defuses: 60
        },
        precision: {
            head: { percent: '35%', hits: 5000 },
            body: { percent: '60%', hits: 8500 },
            legs: { percent: '5%', hits: 700 }
        },
        matches: generateSampleMatches(),
        dataSource: 'HenrikDev API'
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, AGENTS_META, RANKS_META, MAPS_META, WEAPONS_META, DEMO_PROFILES, generateCoachingTips, generateGr4ph0Matches, generateSampleMatches };
}

