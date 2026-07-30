import re

with open('js/config.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Define the new generateCoachingTips function
new_func = """function generateCoachingTips(stats, mainAgent) {
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
        tips.push({ type: 'negative', icon: '', title: 'K/D trop bas', desc: `Ton K/D de ${stats.kd} est en dessous de la moyenne. ${isCypher ? 'Utilise tes caméras et trapwires pour obtenir des kills gratuits avant de t\\'engager.' : 'Concentre-toi sur le positionnement et le crosshair placement.'}` });
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
        tips.push({ type: 'negative', icon: '', title: 'Taux de victoire bas', desc: `${stats.winRate} WR • tu perds plus que tu gagnes. ${isCypher ? 'Communique les infos de tes caméras à ton équipe et anchor les sites plus efficacement.' : 'Focus sur les calls et joue pour l\\'équipe plutôt que pour les frags.'}` });
    } else if (wr >= 55) {
        tips.push({ type: 'positive', icon: '🏆', title: 'Machine à gagner', desc: `${stats.winRate} WR • tu es un vrai moteur de victoire pour ton équipe !` });
    }

    // ADR
    if (adr < 120) {
        tips.push({ type: 'negative', icon: '', title: 'Impact faible (ADR)', desc: `ADR de ${stats.adr} • tu ne fais pas assez de dégâts par round. ${isCypher ? 'N\\'hésite pas à prendre des duels après avoir obtenu de l\\'info avec ta caméra.' : 'Sois plus agressif et cherche les duels au lieu de te cacher.'}` });
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
        tips.push({ type: 'neutral', icon: '🗡️', title: 'Plus de premiers sangs', desc: `${fb} first bloods en ${matches} matchs, ${isCypher ? 'utilise tes trapwires early pour attraper les rusheurs et gratter des first bloods passifs.' : 'essaie de prendre plus d\\'initiatives en début de round.'}` });
    }

    return tips;
}"""

# Use a regular expression to replace everything from "function generateCoachingTips(stats, mainAgent) {" down to "return tips;\n}" (and any garbled leftovers)
pattern = re.compile(r'function generateCoachingTips\(stats, mainAgent\) \{.*?return tips;\n\}', re.DOTALL)
new_text = pattern.sub(new_func, text)

# There is a duplicate broken block left from previous tool call error: "on: 'ðŸ †', title: 'Machine ? gagner'..."
# Let's just remove anything between the new return tips;\n} and // ―― Match Generators
pattern2 = re.compile(r'return tips;\n\}.*?// â”€â”€ Match Generators', re.DOTALL)
new_text = pattern2.sub('return tips;\n}\n\n// â”€â”€ Match Generators', new_text)

with open('js/config.js', 'w', encoding='utf-8') as f:
    f.write(new_text)
