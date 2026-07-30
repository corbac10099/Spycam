/* ==========================================================================
   APP ENTRY POINT - VALORANT TRACKER v2 INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[APP] Initializing Valorant Tracker v2...');

    initNavigation();
    initSearchForm();
    initDemoChips();
    initSettingsModal();
    initFilters();
    initMatchWindowSelector();
    initRefreshButton();
    initLeaderboardRegionSelector();

    // Default load: Primary profile Gr4phØ#0001
    loadPlayer('Gr4phØ', '0001', 'eu');

    // Load default leaderboard
    loadLeaderboard('eu');

    // Auto-refresh every 15 seconds
    setInterval(() => {
        console.log('[AUTO-REFRESH] Refreshing player data...');
        if (uiController.currentPlayerData) {
            const p = uiController.currentPlayerData;
            loadPlayerSilent(p.name, p.tag, (p.region || 'eu').toLowerCase());
        } else {
            loadPlayerSilent('Gr4phØ', '0001', 'eu');
        }
    }, 15000);
});

// â”€â”€ Player Data Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” € 
async function loadPlayer(name, tag, region) {
    uiController.showLoading();
    uiController.hideError();

    try {
        const playerData = await apiService.getPlayerData(name, tag, region);
        uiController.hideLoading();
        uiController.renderProfile(playerData);

        // Update search input
        const input = document.getElementById('player-search-input');
        if (input) input.value = `${playerData.name}#${playerData.tag}`;

        saveRecentSearch(playerData.name, playerData.tag, region);
    } catch (err) {
        console.error('[APP] Load player failed:', err);
        uiController.showError(
            'Erreur de chargement',
            `Impossible de récupérer les données pour ${name}#${tag}. Vérifiez le Riot ID ou votre clé API.`
        );
    }
}

// â”€â”€ Silent Player Refresh (No Loading Spinner) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadPlayerSilent(name, tag, region) {
    try {
        const playerData = await apiService.getPlayerData(name, tag, region);
        uiController.updateProfileDiff(playerData);
        console.log(`[AUTO-REFRESH] Updated at ${new Date().toLocaleTimeString()} → Rank: ${playerData.rank?.name || '?'} | ${(playerData.matches || []).length} matches`);
    } catch (err) {
        console.warn('[AUTO-REFRESH] Silent refresh failed:', err.message);
    }
}

// â”€â”€ Refresh Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initRefreshButton() {
    const refreshBtn = document.getElementById('refresh-player-btn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', () => {
    // refreshBtn.classList.add('refreshing');  ← SUPPRIMER CETTE LIGNE
    // setTimeout(() => refreshBtn.classList.remove('refreshing'), 1500);  ← SUPPRIMER

    if (uiController.currentPlayerData) {
        const p = uiController.currentPlayerData;
        loadPlayerSilent(p.name, p.tag, (p.region || 'eu').toLowerCase());
    } else {
        loadPlayerSilent('Gr4phØ', '0001', 'eu'); 
    }
});
}

// â”€â”€ Leaderboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadLeaderboard(region) {
    try {
        const data = await apiService.getLeaderboard(region);

        // Normalize leaderboard data format
        const normalized = data.map((p, i) => ({
            rank: p.leaderboardRank || p.rank || i + 1,
            name: p.gameName || p.name || 'Unknown',
            tag: p.tagLine || p.tag || '',
            rr: p.rankedRating || p.rr || 0,
            wins: p.numberOfWins || p.wins || 0,
            tier: p.competitiveTier?.id || p.competitiveTier || p.tier?.id || p.tier || 27
        }));

        uiController.renderLeaderboard(normalized);
    } catch (e) {
        console.warn('[APP] Leaderboard load error:', e);
    }
}

function initLeaderboardRegionSelector() {
    const btns = document.querySelectorAll('.region-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLeaderboard(btn.dataset.region || 'eu');
        });
    });
}

function initMatchWindowSelector() {
    const select = document.getElementById('match-window-select');
    if (!select) return;

    const saved = apiService.getSelectedMatchWindow();
    if (saved) select.value = saved;

    select.addEventListener('change', () => {
        apiService.setSelectedMatchWindow(select.value);
        applySelectedMatchWindow();
    });
}

function applySelectedMatchWindow() {
    if (!uiController.currentPlayerData) return;
    const windowValue = apiService.getSelectedMatchWindow();
    const updatedProfile = apiService.applyMatchWindow(uiController.currentPlayerData, windowValue);
    uiController.renderProfile(updatedProfile);
}

// â”€â”€ Tab Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// â”€â”€ Search Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSearchForm() {
    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('player-search-input').value.trim();
        const region = document.getElementById('region-select').value || 'eu';

        if (!inputVal.includes('#')) {
            alert('Veuillez saisir le format complet RiotID#Tag (ex: Gr4phØ#0001)');
            return;
        }

        const [name, tag] = inputVal.split('#');
        if (name && tag) {
            loadPlayer(name.trim(), tag.trim(), region);
        }
    });

    const retryBtn = document.getElementById('error-retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            loadPlayer('Gr4phØ', '0001', 'eu');
        });
    }
}

// â”€â”€ Demo Chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initDemoChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const playerTag = chip.getAttribute('data-player');
            const region = chip.getAttribute('data-region') || 'eu';
            if (playerTag && playerTag.includes('#')) {
                const [name, tag] = playerTag.split('#');
                document.getElementById('region-select').value = region;

                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                loadPlayer(name, tag, region);
            }
        });
    });

    const demoBtn = document.getElementById('demo-profiles-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            loadPlayer('Gr4phØ', '0001', 'eu');
        });
    }
}

// â”€â”€ Settings Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('close-settings');
    const saveBtn = document.getElementById('save-settings-btn');

    if (!modal || !settingsBtn) return;

    const henrikInput = document.getElementById('henrik-api-key-input');
    const trackerggInput = document.getElementById('trackergg-api-key-input');
    const modeSelect = document.getElementById('api-mode-select');

    settingsBtn.addEventListener('click', async () => {
        const currentSettings = await apiService.loadSettingsFromStorage();
        if (henrikInput && currentSettings.henrikKey) henrikInput.value = currentSettings.henrikKey;
        if (trackerggInput && currentSettings.trackerggKey) trackerggInput.value = currentSettings.trackerggKey;
        if (modeSelect && currentSettings.mode) modeSelect.value = currentSettings.mode;
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
        const newSettings = {
            henrikKey: henrikInput ? henrikInput.value.trim() : '',
            trackerggKey: trackerggInput ? trackerggInput.value.trim() : '',
            mode: modeSelect ? modeSelect.value : 'auto'
        };
        await apiService.saveSettings(newSettings);
        modal.classList.add('hidden');

        // Reload current player with new settings
        if (uiController.currentPlayerData) {
            const p = uiController.currentPlayerData;
            loadPlayer(p.name, p.tag, (p.region || 'eu').toLowerCase());
        }
    });
}

// â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initFilters() {
    const mapFilter = document.getElementById('filter-map');
    const modeFilter = document.getElementById('filter-mode');
    const refreshMatches = () => {
        if (uiController.currentPlayerData) {
            const history = uiController.currentPlayerData.historyMatches || uiController.currentPlayerData.matches || [];
            uiController.renderMatchesList(history);
        }
    };

    mapFilter.addEventListener('change', refreshMatches);
    modeFilter.addEventListener('change', refreshMatches);
}

// â”€â”€ Recent Searches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function saveRecentSearch(name, tag, region) {
    try {
        let searches = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES) || '[]');
        searches = searches.filter(s => !(s.name.toLowerCase() === name.toLowerCase() && s.tag.toLowerCase() === tag.toLowerCase()));
        searches.unshift({ name, tag, region, timestamp: Date.now() });
        if (searches.length > 5) searches.pop();
        localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
    } catch (e) { /* ignore */ }
}






