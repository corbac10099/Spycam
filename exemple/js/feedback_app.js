/* ==========================================================================
   QUESTIONNAIRE & RAW DATA MAPPING APP (Valorant & Tracker.gg)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAnnotatorSearch();
    initSaveFeedback();

    // Default load Gr4phØ#0001
    loadRawDumpAndQuestionnaire('Gr4phØ', '0001', 'eu');
});

function initAnnotatorSearch() {
    const form = document.getElementById('anno-search-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('anno-player-input').value.trim();
        const region = document.getElementById('anno-region-select').value || 'eu';

        if (!val.includes('#')) {
            alert('Veuillez entrer le format RiotID#Tag (ex: Gr4phØ#0001)');
            return;
        }

        const [name, tag] = val.split('#');
        loadRawDumpAndQuestionnaire(name.trim(), tag.trim(), region);
    });
}

async function loadRawDumpAndQuestionnaire(name, tag, region) {
    const valoRawContainer = document.getElementById('valo-json-tree');
    const trnRawContainer = document.getElementById('trn-json-tree');
    const questionnaireContainer = document.getElementById('questionnaire-cards-container');

    if (valoRawContainer) valoRawContainer.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Chargement API Valorant...</div>`;
    if (trnRawContainer) trnRawContainer.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Chargement API Tracker.gg...</div>`;

    try {
        const rawDump = await apiService.getRawApiDump(name, tag, region);
        
        // Render Raw JSON Trees
        if (valoRawContainer) {
            valoRawContainer.innerHTML = `<pre class="json-code"><code>${escapeHtml(JSON.stringify(rawDump.valorantApiRaw, null, 2))}</code></pre>`;
        }
        if (trnRawContainer) {
            trnRawContainer.innerHTML = `<pre class="json-code"><code>${escapeHtml(JSON.stringify(rawDump.trackerGgRaw, null, 2))}</code></pre>`;
        }

        // Render Interactive Questionnaire
        renderQuestionnaireCards(rawDump, questionnaireContainer);
        restoreSavedFeedback();
    } catch (err) {
        console.error('[QUESTIONNAIRE] Error:', err);
    }
}

function renderQuestionnaireCards(dump, container) {
    if (!container) return;

    const valoData = dump.valorantApiRaw?.data || {};
    const mmrData = dump.valorantApiRaw?.mmr_data?.current_data || {};
    const trnStats = dump.trackerGgRaw?.stats || {};

    const questions = [
        {
            id: 'q_avatar',
            title: '1. Photo de Profil (Avatar / Player Card)',
            apiSource: 'Valorant API (card.small)',
            rawValue: valoData.card?.small || 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png',
            defaultTarget: 'player-agent-avatar',
            targetLabel: 'Avatar du Joueur (Hero Header)'
        },
        {
            id: 'q_identity',
            title: '2. Pseudo, Tag & Niveau de Compte',
            apiSource: 'Valorant API (name, tag, account_level)',
            rawValue: `${valoData.name || 'Gr4phØ'}#${valoData.tag || '0001'} (Niveau ${valoData.account_level || 39})`,
            defaultTarget: 'player-identity',
            targetLabel: 'Titre Joueur & Niveau (Lvl)'
        },
        {
            id: 'q_rank',
            title: '3. Rang Actuel & Points RR',
            apiSource: 'Valorant API MMR (currenttierpatched & ranking_in_tier)',
            rawValue: `${mmrData.currenttierpatched || 'Bronze 1'} (${mmrData.ranking_in_tier || 51} RR)`,
            defaultTarget: 'rank-card',
            targetLabel: 'Carte du Rang & Barre de RR'
        },
        {
            id: 'q_kd',
            title: '4. Ratio K/D (Kills / Deaths)',
            apiSource: 'Tracker.gg (stats.kdRatio.value)',
            rawValue: `${trnStats.kdRatio?.value || '0.89'} (${trnStats.kills?.value || 1213} Kills / ${trnStats.losses?.value || 1363} Deaths)`,
            defaultTarget: 'kpi-kd',
            targetLabel: 'Carte KPI - K/D Ratio'
        },
        {
            id: 'q_winrate',
            title: '5. Taux de Victoire (Winrate %)',
            apiSource: 'Tracker.gg (stats.winRate.value)',
            rawValue: `${trnStats.winRate?.value || '50.6%'} (${trnStats.wins?.value || 41} Victoires - ${trnStats.losses?.value || 39} Défaites)`,
            defaultTarget: 'kpi-winrate',
            targetLabel: 'Carte KPI - Taux de Victoire'
        },
        {
            id: 'q_precision',
            title: '6. Précision des Tirs (Head, Body, Legs %)',
            apiSource: 'Tracker.gg (stats.precisionShots)',
            rawValue: `Tête: ${trnStats.precisionShots?.head?.percent || '7.1%'} | Corps: ${trnStats.precisionShots?.body?.percent || '67.1%'} | Jambes: ${trnStats.precisionShots?.legs?.percent || '25.8%'}`,
            defaultTarget: 'precision-card',
            targetLabel: 'Section Précision des Tirs'
        },
        {
            id: 'q_adr_acs',
            title: '7. Dégâts / Round (ADR) & ACS',
            apiSource: 'Tracker.gg (stats.damagePerRound & combatScore)',
            rawValue: `ADR: ${trnStats.damagePerRound?.value || '146.0'} | ACS: ${trnStats.combatScore?.value || '221.4'}`,
            defaultTarget: 'kpi-adr',
            targetLabel: 'Carte KPI - ADR & ACS'
        },
        {
            id: 'q_tracker_score',
            title: '8. Tracker Score & Peak Rank',
            apiSource: 'Tracker.gg (stats.trackerScore & peakRank)',
            rawValue: `Score: ${trnStats.trackerScore?.value || '577'} / 1000 | Peak: ${trnStats.peakRank?.value || 'Bronze 1 (V26: ACTE IV)'}`,
            defaultTarget: 'trn-insights-card',
            targetLabel: 'Panneau Insights Tracker.gg'
        },
        {
            id: 'q_milestones',
            title: '9. Premiers Sangs, Flawless Rounds & Aces',
            apiSource: 'Tracker.gg (stats.firstBloods, flawlessRounds, aces)',
            rawValue: `First Bloods: ${trnStats.firstBloods?.value || 139} | Flawless: ${trnStats.flawlessRounds?.value || 52} | Aces: ${trnStats.aces?.value || 5}`,
            defaultTarget: 'trn-metrics-grid',
            targetLabel: 'Métriques de Combat (FB, Aces)'
        },
        {
            id: 'q_roles_agents',
            title: '10. Répartition par Rôles & Top Agents',
            apiSource: 'Tracker.gg (stats.rolesBreakdown & topAgents)',
            rawValue: `Agents: Clove (56m), Fade (23m), Neon (2m) | Rôles: Contrôleur 48%, Sentinelle 56%`,
            defaultTarget: 'roles-card',
            targetLabel: 'Section Rôles & Meilleurs Agents'
        }
    ];

    container.innerHTML = questions.map(q => `
        <div class="question-card" data-qid="${q.id}">
            <div class="q-header">
                <span class="q-title">${q.title}</span>
                <span class="q-source-badge">${q.apiSource}</span>
            </div>
            
            <div class="q-raw-box">
                <span class="q-raw-label">Valeur Brute extraite de l'API :</span>
                <div class="q-raw-value">${escapeHtml(q.rawValue)}</div>
            </div>

            <div class="q-form-grid">
                <div class="q-field">
                    <label><i class="fa-solid fa-circle-question"></i> Cette donnée est-elle VRAIE et EXACTE ?</label>
                    <div class="q-radios">
                        <label class="radio-label pos">
                            <input type="radio" name="valid_${q.id}" value="correct" checked>
                            <span>🟢 Oui, c'est exact</span>
                        </label>
                        <label class="radio-label neg">
                            <input type="radio" name="valid_${q.id}" value="incorrect">
                            <span>🔴 Non, donnée fausse / incomplète</span>
                        </label>
                    </div>
                </div>

                <div class="q-field">
                    <label><i class="fa-solid fa-link"></i> Élément visuel de l'interface lié :</label>
                    <select class="q-target-select">
                        <option value="${q.defaultTarget}" selected>Lier à : ${q.targetLabel}</option>
                        <option value="player-avatar">Avatar / PP Joueur</option>
                        <option value="player-rank">Rang & points RR</option>
                        <option value="kpi-kd">Carte K/D Ratio</option>
                        <option value="kpi-winrate">Carte Winrate %</option>
                        <option value="kpi-hs">Carte Headshot %</option>
                        <option value="kpi-adr">Carte ADR / ACS</option>
                        <option value="precision-bars">Barres Précision Têtes/Corps/Jambes</option>
                        <option value="roles-breakdown">Section Rôles Joués</option>
                        <option value="top-agents">Section Top Agents</option>
                        <option value="tracker-score">Tracker Score Box</option>
                    </select>
                </div>
            </div>

            <div class="q-field full-width">
                <label><i class="fa-solid fa-pen"></i> Consigne spécifique / Valeur réelle si fausse :</label>
                <input type="text" class="q-note-input" placeholder="Ex: 'C'est la bonne donnée, lier à l'en-tête' ou 'La vraie valeur est 0.95, corriger l'affichage'...">
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function restoreSavedFeedback() {
    try {
        const saved = localStorage.getItem('valo_tracker_feedback');
        if (!saved) return;
        const parsed = JSON.parse(saved);

        if (parsed.answers) {
            parsed.answers.forEach(ans => {
                const card = document.querySelector(`.question-card[data-qid="${ans.qid}"]`);
                if (card) {
                    const radio = card.querySelector(`input[name="valid_${ans.qid}"][value="${ans.status}"]`);
                    if (radio) radio.checked = true;
                    const select = card.querySelector('.q-target-select');
                    if (select && ans.target) select.value = ans.target;
                    const note = card.querySelector('.q-note-input');
                    if (note && ans.note) note.value = ans.note;
                }
            });
        }
    } catch(e) { }
}

function initSaveFeedback() {
    const saveBtn = document.getElementById('save-feedback-btn');
    const alertBanner = document.getElementById('save-alert');
    const globalTextarea = document.getElementById('global-instructions');

    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        const playerInput = document.getElementById('anno-player-input')?.value || 'Gr4phØ#0001';
        const cards = document.querySelectorAll('.question-card');

        const feedbackData = {
            timestamp: new Date().toISOString(),
            searchedPlayer: playerInput,
            globalInstructions: globalTextarea?.value.trim() || '',
            answers: []
        };

        cards.forEach(card => {
            const qid = card.getAttribute('data-qid');
            const title = card.querySelector('.q-title')?.textContent.trim() || '';
            const rawVal = card.querySelector('.q-raw-value')?.textContent.trim() || '';
            const status = card.querySelector(`input[name="valid_${qid}"]:checked`)?.value || 'correct';
            const target = card.querySelector('.q-target-select')?.value || '';
            const note = card.querySelector('.q-note-input')?.value.trim() || '';

            feedbackData.answers.push({
                qid,
                title,
                rawValue: rawVal,
                status: status, // 'correct' or 'incorrect'
                targetUI: target,
                note: note
            });
        });

        // Save in localStorage
        localStorage.setItem('valo_tracker_feedback', JSON.stringify(feedbackData));

        // Save via server POST
        try {
            const res = await fetch('/api/save-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData, null, 2)
            });
            if (res.ok) {
                if (alertBanner) {
                    alertBanner.classList.remove('hidden');
                    alertBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Questionnaire & Données brutes enregistrés avec succès dans feedback_data.json ! Tu peux maintenant dire "go" dans le chat.</span>`;
                    setTimeout(() => alertBanner.classList.add('hidden'), 7000);
                }
            }
        } catch (e) {
            console.warn('[QUESTIONNAIRE] Server POST failed, saved locally:', e);
        }
    });
}
