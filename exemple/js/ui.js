/* ==========================================================================
   UI CONTROLLER - Complete Dashboard Renderer (v2)
   ========================================================================== */

class UiController {
    constructor() {
        this.currentPlayerData = null;
    }

    persistLiveProfile(profile) {
        try {
            localStorage.setItem('tracker_valo_live_session_profile', JSON.stringify(profile));
        } catch (e) {}
    }

    updateProfileDiff(p) {
        if (!this.currentPlayerData || this.currentPlayerData.name !== p.name || this.currentPlayerData.tag !== p.tag) {
            this.renderProfile(p);
            return;
        }
        
        this.currentPlayerData = p;
        this.persistLiveProfile(p);

        // Helper to update text content if changed
        const updateText = (id, val) => {
            const el = document.getElementById(id);
            if (el && el.textContent !== String(val)) {
                el.textContent = val;
            }
        };
        
        const updateSrc = (id, val) => {
            const el = document.getElementById(id);
            if (el && el.src !== val) {
                el.src = val;
            }
        };

        // Player Info
        updateText('player-level', `Lvl ${p.level}`);
        updateText('player-subtext', p.subtitle || '');
        updateSrc('player-agent-avatar', p.avatar);

        // Rank Info
        updateSrc('rank-icon', p.rank.icon);
        updateText('rank-name', p.rank.name.toUpperCase());
        updateText('rr-points', p.rr);
        
        const rrFill = document.getElementById('rr-progress-fill');
        if (rrFill) rrFill.style.width = `${Math.min(p.rr, 100)}%`;

        // KPIs
        const s = p.stats;
        updateText('kpi-kd', s.kd);
        this.setColorClass('kpi-kd', parseFloat(s.kd) >= 1.0);
        updateText('kpi-kills', (s.kills || 0).toLocaleString());
        updateText('kpi-deaths', (s.deaths || 0).toLocaleString());
        updateText('kpi-winrate', s.winRate);
        this.setColorClass('kpi-winrate', parseFloat(s.winRate) >= 50);
        updateText('kpi-wins', s.wins);
        updateText('kpi-losses', s.losses);
        updateText('kpi-hs', s.hs);
        updateText('kpi-adr', s.adr);
        updateText('kpi-acs', s.acs);

        // Update matches smartly
        const container = document.getElementById('matches-container');
        if (container && p.matches) {
            // Find if there are any new matches by ID that aren't currently in the DOM
            const existingMatchElements = Array.from(container.querySelectorAll('.match-item'));
            const existingIds = existingMatchElements.map(el => el.getAttribute('data-match-id'));
            
            let htmlToPrepend = '';
            // We only look at the first few matches to see if they are new
            for (let i = 0; i < p.matches.length; i++) {
                const m = p.matches[i];
                if (!existingIds.includes(String(m.id))) {
                    // This is a new match, render its HTML
                    const isWin = m.result === 'WIN';
                    const agentMeta = AGENTS_META[m.agent] || {};
                    const timeFmt = this.formatDate(m.date);
                    
                    const rrHtml = m.rrChange ? `<span class="rr-change-badge ${isWin ? 'rr-plus' : 'rr-minus'}">${m.rrChange}</span>` : '';
                    const mvpBadgeHtml = m.mvpTag ? `<span class="mvp-badge ${m.mvpTag === 'MATCH MVP' ? 'match-mvp' : 'team-mvp'}"><i class="fa-solid ${m.mvpTag === 'MATCH MVP' ? 'fa-crown' : 'fa-award'}"></i> ${m.mvpTag}</span>` : '';
                    
                    let aceBadgeHtml = '';
                    if (m.hasAce === true) {
                        aceBadgeHtml = `<span class="mvp-badge ace-badge"><i class="fa-solid fa-fire-flame-curved"></i> ACE</span>`;
                    } else if (m.fourK === true) {
                        aceBadgeHtml = `<span class="mvp-badge four-k-badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 700; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;"><i class="fa-solid fa-bolt"></i> 4K</span>`;
                    }

                    // Render just the summary to be prepended, full details not needed immediately or simplified
                    // Note: Ideally we'd call the same render function, but here we inline the structure for new items
                    htmlToPrepend += `
                        <div class="match-item ${isWin ? 'win' : 'loss'} new-match-anim" data-match-id="${m.id}">
                            <div class="match-summary" onclick="uiController.toggleMatchDetails('${m.id}')">
                                <div class="match-status-badge">
                                    <span class="status-tag">${isWin ? 'VICTOIRE' : 'DÉFAITE'}</span>
                                </div>
                                <img class="match-agent-icon" src="${agentMeta.icon || ''}" alt="${m.agent}">
                                <div class="match-info-main">
                                    <div class="match-map-name">${m.map} • ${m.agent}</div>
                                    <div class="match-time">${timeFmt} • Durée ${m.duration || '30m'}</div>
                                </div>
                                <div class="match-score-box">
                                    <span class="score-main">${m.score}</span>
                                </div>
                                <div class="match-stats-col">
                                    <div class="stat-box">
                                        <span class="stat-label">K / D / A</span>
                                        <span class="stat-value">${m.kda}</span>
                                    </div>
                                    <div class="stat-box">
                                        <span class="stat-label">ACS</span>
                                        <span class="stat-value">${m.acs}</span>
                                    </div>
                                </div>
                                <div class="match-badges-right">
                                    ${rrHtml}
                                    ${mvpBadgeHtml}
                                    ${aceBadgeHtml}
                                </div>
                                <i class="fa-solid fa-chevron-down match-expand-icon"></i>
                            </div>
                            <!-- Panel content is omitted or minimal for new prepended items until full refresh -->
                            <div class="match-details-panel">
                                <p style="padding:15px; color:#a0a0a0; text-align:center;">Détails complets disponibles après un rafraîchissement manuel.</p>
                            </div>
                        </div>
                    `;
                }
            }
            
            if (htmlToPrepend !== '') {
                container.insertAdjacentHTML('afterbegin', htmlToPrepend);
                // Also update live session if it exists
                if (window.liveSessionController) {
                    window.liveSessionController.updateData(p);
                }
            }
        }
        
        // Always refresh live session if active
        if (window.liveSessionController) {
            window.liveSessionController.updateData(p);
        }
    }


    renderProfile(p) {
        this.currentPlayerData = p;
        this.persistLiveProfile(p);

        // Player Hero Header
        document.getElementById('player-name').textContent = p.name;
        document.getElementById('player-tag').textContent = `#${p.tag}`;
        document.getElementById('player-region').textContent = p.region;
        document.getElementById('player-level').textContent = `Lvl ${p.level}`;
        document.getElementById('player-subtext').textContent = p.subtitle || '';
        document.getElementById('player-agent-avatar').src = p.avatar;
        document.getElementById('active-data-source').textContent = `Source : ${p.dataSource || 'HenrikDev API'}`;

        const bg = document.getElementById('profile-bg');
        if (bg && p.bannerBg) {
            bg.style.backgroundImage = `url('${p.bannerBg}')`;
        }

        // Rank Info
        document.getElementById('rank-icon').src = p.rank.icon;
        document.getElementById('rank-name').textContent = p.rank.name.toUpperCase();
        document.getElementById('rr-points').textContent = p.rr;
        document.getElementById('rr-progress-fill').style.width = `${Math.min(p.rr, 100)}%`;
        const globalText = document.getElementById('global-rank-text');
        if (globalText) globalText.textContent = p.globalRank || 'Top 58% Global';

        // KPIs Metrics
        const s = p.stats;
        document.getElementById('kpi-kd').textContent = s.kd;
        this.setColorClass('kpi-kd', parseFloat(s.kd) >= 1.0);
        document.getElementById('kpi-kills').textContent = (s.kills || 0).toLocaleString();
        document.getElementById('kpi-deaths').textContent = (s.deaths || 0).toLocaleString();

        document.getElementById('kpi-winrate').textContent = s.winRate;
        this.setColorClass('kpi-winrate', parseFloat(s.winRate) >= 50);
        document.getElementById('kpi-wins').textContent = s.wins;
        document.getElementById('kpi-losses').textContent = s.losses;

        document.getElementById('kpi-hs').textContent = s.hs;
        document.getElementById('kpi-adr').textContent = s.adr;
        document.getElementById('kpi-acs').textContent = s.acs;

        const kadEl = document.getElementById('kpi-kad');
        if (kadEl) {
            kadEl.textContent = s.kad || '-';
            this.setColorClass('kpi-kad', parseFloat(s.kad) >= 1.0);
        }

        const matchesCountEl = document.getElementById('kpi-total-matches');
        if (matchesCountEl) {
            matchesCountEl.textContent = `${s.matches || 0} matchs`;
        }

        // Precision Shots Bars
        this.renderPrecision(p.precision, s.hs);

        // Weapons (ARMES DE POINTE)
        this.renderWeapons(p.topWeapons);

        // Roles Breakdown
        this.renderRoles(p.roles);

        // Coaching Tips (Personalized Cypher & Performance Tips)
        const mainAgent = p.topAgents?.[0].name || 'Cypher';
        this.renderCoaching(generateCoachingTips(p.stats, mainAgent));

        // Career Insights Panel
        this.renderCareerStats(p.careerStats || p.trackerGgStats);

        // Top Agents Bar
        this.renderTopAgents(p.topAgents);

        // Match History
        this.renderMatchesList(p.historyMatches || p.matches || []);

        // Agents Detail Table
        this.renderAgentsTable(p.topAgents);

        // Render Charts via ChartManager
        chartManager.initOrUpdateCharts(p);
    }

    setColorClass(id, isPositive) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('positive', 'negative');
        el.classList.add(isPositive ? 'positive' : 'negative');
    }

    renderPrecision(prec, avgHs) {
        const setBar = (barId, pctId, countId, data) => {
            const bar = document.getElementById(barId);
            const pct = document.getElementById(pctId);
            const count = document.getElementById(countId);
            if (bar && data) bar.style.width = data.percent || '0%';
            if (pct && data) pct.textContent = data.percent || '0%';
            if (count && data) count.textContent = `${(data.hits || 0).toLocaleString()} tirs`;
        };

        if (prec) {
            setBar('bar-head', 'prec-head-pct', 'prec-head-count', prec.head);
            setBar('bar-body', 'prec-body-pct', 'prec-body-count', prec.body);
            setBar('bar-legs', 'prec-legs-pct', 'prec-legs-count', prec.legs);

            const mHead = document.getElementById('mannequin-head-val');
            const mBody = document.getElementById('mannequin-body-val');
            const mLegs = document.getElementById('mannequin-legs-val');
            if (mHead && prec.head) mHead.textContent = prec.head.percent;
            if (mBody && prec.body) mBody.textContent = `${prec.body.percent} ☆`;
            if (mLegs && prec.legs) mLegs.textContent = prec.legs.percent;
        }

        const avgHsEl = document.getElementById('avg-hs-value');
        if (avgHsEl && avgHs) avgHsEl.textContent = avgHs;
    }

    renderWeapons(weapons) {
        const container = document.getElementById('weapons-container');
        if (!container) return;

        const weaponList = weapons || WEAPONS_META;
        container.innerHTML = weaponList.map(w => `
            <div class="weapon-item">
                <div class="weapon-info-col">
                    <img class="weapon-img" src="${w.icon}" alt="${w.name}">
                    <div class="weapon-names">
                        <span class="weapon-title">${w.name}</span>
                        <span class="weapon-subtitle">${w.type}</span>
                    </div>
                </div>
                <div class="weapon-body-stats">
                    <div class="body-icon-wrapper">
                        <i class="fa-solid fa-user body-icon"></i>
                    </div>
                    <div class="body-pct-col">
                        <span class="pct-head">${w.head}</span>
                        <span class="pct-body">${w.body}</span>
                        <span class="pct-legs">${w.legs}</span>
                    </div>
                </div>
                <div class="weapon-kills-col">
                    <span class="kills-label">Tu</span>
                    <span class="kills-count">${w.kills}</span>
                </div>
            </div>
        `).join('');
    }

    renderRoles(roles) {
        const container = document.getElementById('roles-container');
        if (!container || !roles.length) return;

        container.innerHTML = roles.map(r => `
            <div class="role-row" style="border-left-color: ${r.color || '#00f0ff'}">
                <div class="role-info">
                    <span class="role-name">${r.role}</span>
                    <span class="role-record">${r.wins}V - ${r.losses}D (${r.matches} matchs)</span>
                </div>
                <div class="role-stats">
                    <div class="role-stat">
                        <span class="role-stat-label">WR</span>
                        <span class="role-stat-value" style="color: ${parseFloat(r.winrate) >= 50 ? '#00e676' : '#ff4655'}">${r.winrate}</span>
                    </div>
                    <div class="role-stat">
                        <span class="role-stat-label">KDA</span>
                        <span class="role-stat-value">${r.kda}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCoaching(tips) {
        const container = document.getElementById('coaching-container');
        if (!container) return;

        if (!tips || !tips.length) {
            container.innerHTML = `<p class="text-muted">Pas assez de données pour générer des conseils.</p>`;
            return;
        }

        container.innerHTML = tips.map(tip => `
            <div class="coaching-tip ${tip.type}">
                <div class="tip-icon-box">${tip.icon}</div>
                <div class="tip-body">
                    <h4 class="tip-title">${tip.title}</h4>
                    <p class="tip-desc">${tip.desc}</p>
                </div>
            </div>
        `).join('');
    }

    renderCareerStats(cs) {
        if (!cs) return;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val !== undefined && val !== null ? val : '-'; };
        set('trn-tracker-score', cs.trackerScore);
        set('trn-kast', cs.kast);
        set('trn-first-kills', cs.firstKills || cs.firstBloods);
        set('trn-flawless', cs.flawlessRounds || cs.flawless);
        set('trn-aces', cs.aces);
        set('trn-peak-rank', cs.peakRank);
        set('trn-clutches', cs.clutches ? `${cs.clutches} Clutches` : '12 Clutches');
        set('trn-weapon', cs.mostUsedWeapon || 'Phantom');
        set('trn-plants', cs.plants ? `${cs.plants} Spikes` : '45 Spikes');
        set('trn-defuses', cs.defuses ? `${cs.defuses} Désamorçages` : '18 Désamorçages');
    }

    renderTopAgents(agents) {
        const container = document.getElementById('top-agents-container');
        if (!container || !agents.length) return;

        container.innerHTML = agents.map(a => {
            const meta = AGENTS_META[a.name] || {};
            return `
                <div class="top-agent-card">
                    <img class="top-agent-icon" src="${meta.icon || ''}" alt="${a.name}">
                    <div class="top-agent-info">
                        <span class="top-agent-name">${a.name}</span>
                        <span class="top-agent-role">${meta.role || ''}</span>
                    </div>
                    <div class="top-agent-stats">
                        <span class="top-agent-stat">${a.matches} matchs</span>
                        <span class="top-agent-stat" style="color: ${parseFloat(a.winRate) >= 50 ? '#00e676' : '#ff4655'}">${a.winRate} WR</span>
                        <span class="top-agent-stat">${a.kd} K/D</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMatchesList(matches) {
        const container = document.getElementById('matches-container');
        if (!container) return;

        const mapFilter = document.getElementById('filter-map').value || 'all';
        const modeFilter = document.getElementById('filter-mode').value || 'all';
        const filtered = (matches || []).filter(m => {
            const mapOk = mapFilter === 'all' || String(m.map || '').toLowerCase() === mapFilter.toLowerCase();
            const modeValue = String(m.mode || 'competitive').toLowerCase();
            const modeOk = modeFilter === 'all' || modeValue.includes(modeFilter.toLowerCase());
            return mapOk && modeOk;
        });

        if (!filtered.length) {
            container.innerHTML = `<div class="error-card"><i class="fa-solid fa-folder-open error-icon"></i><div class="error-info"><h3>Aucun match trouv?</h3></div></div>`;
            return;
        }

        container.innerHTML = filtered.map(m => {
            const isWin = m.result === 'WIN';
            const agentMeta = AGENTS_META[m.agent] || {};
            const mapMeta = MAPS_META[m.map] || {};
            const timeFmt = this.formatDate(m.date);

            // Build 10-player Scoreboard tables
            const renderTeamTable = (teamTitle, players, isAllyTeam) => {
                if (!players || !players.length) return '';
                const rows = players.map(p => {
                    const aMeta = AGENTS_META[p.agent] || {};
                    return `
                        <tr class="${p.isSelf ? 'scoreboard-self' : ''}">
                            <td class="player-cell">
                                <img class="mini-agent-img" src="${aMeta.icon || ''}" alt="${p.agent}">
                                <span><strong>${p.name}</strong> <small class="text-muted">#${p.tag}</small></span>
                            </td>
                            <td><strong>${p.acs || '-'}</strong></td>
                            <td>${p.kills} / ${p.deaths} / ${p.assists}</td>
                            <td>${p.adr || '-'}</td>
                            <td>${p.hs || '-'}</td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div class="team-scoreboard-block ${isAllyTeam ? 'ally-team' : 'enemy-team'}">
                        <div class="team-title-header">${teamTitle}</div>
                        <table class="scoreboard-table">
                            <thead>
                                <tr>
                                    <th>Joueur / Agent</th>
                                    <th>ACS</th>
                                    <th>K / D / A</th>
                                    <th>ADR</th>
                                    <th>HS %</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            };

            const alliesTableHtml = renderTeamTable('ÉQUIPE ALLIÉE', m.allies, true);
            const enemiesTableHtml = renderTeamTable('ÉQUIPE ENNEMIE', m.enemies, false);

            const mvpBadgeHtml = m.mvpTag ? `
                <span class="mvp-badge ${m.mvpTag === 'MATCH MVP' ? 'match-mvp' : 'team-mvp'}">
                    <i class="fa-solid ${m.mvpTag === 'MATCH MVP' ? 'fa-crown' : 'fa-award'}"></i> ${m.mvpTag}
                </span>
            ` : '';

            // Multi-kill & ACE Badges (Strictly displayed only when verified)
            let aceBadgeHtml = '';
            if (m.hasAce === true) {
                aceBadgeHtml = `
                    <span class="mvp-badge ace-badge">
                        <i class="fa-solid fa-fire-flame-curved"></i> ACE
                    </span>
                `;
            } else if (m.fourK === true) {
                aceBadgeHtml = `
                    <span class="mvp-badge four-k-badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 700; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">
                        <i class="fa-solid fa-bolt"></i> 4K
                    </span>
                `;
            }

            const rrHtml = m.rrChange ? `
                <span class="rr-change-badge ${isWin ? 'rr-plus' : 'rr-minus'}">${m.rrChange}</span>
            ` : '';

            return `
                <div class="match-item ${isWin ? 'win' : 'loss'}" data-match-id="${m.id}">
                    <div class="match-summary" onclick="uiController.toggleMatchDetails('${m.id}')">
                        <div class="match-status-badge">
                            <span class="status-tag">${isWin ? 'VICTOIRE' : 'DÉFAITE'}</span>
                        </div>
                        <img class="match-agent-icon" src="${agentMeta.icon || ''}" alt="${m.agent}">
                        <div class="match-info-main">
                            <div class="match-map-name">${m.map} • ${m.agent}</div>
                            <div class="match-time">${timeFmt} • Durée ${m.duration || '30m'}</div>
                        </div>
                        <div class="match-score-box">
                            <span class="score-main">${m.score}</span>
                        </div>
                        <div class="match-stats-col">
                            <div class="stat-box">
                                <span class="stat-label">K / D / A</span>
                                <span class="stat-value">${m.kda}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">ACS</span>
                                <span class="stat-value">${m.acs}</span>
                            </div>
                        </div>
                        <div class="match-badges-right">
                            ${rrHtml}
                            ${mvpBadgeHtml}
                            ${aceBadgeHtml}
                        </div>
                        <i class="fa-solid fa-chevron-down match-expand-icon"></i>
                    </div>

                    <!-- Expandable Full Match Scoreboard Panel -->
                    <div class="match-details-panel">
                        <div class="match-detail-grid">
                            <div class="detail-box">
                                <span class="detail-label">ADR (Dégâts/round)</span>
                                <span class="detail-value">${m.adr || 140}</span>
                            </div>
                            <div class="detail-box">
                                <span class="detail-label">Headshots</span>
                                <span class="detail-value">${m.headshots || 0} tirs</span>
                            </div>
                            <div class="detail-box">
                                <span class="detail-label">Bodyshots</span>
                                <span class="detail-value">${m.bodyshots || 0} tirs</span>
                            </div>
                            <div class="detail-box">
                                <span class="detail-label">Premier Sang</span>
                                <span class="detail-value">${m.firstBloods ? 'Oui (1)' : 'Non'}</span>
                            </div>
                        </div>

                        ${alliesTableHtml || enemiesTableHtml ? `
                            <div class="full-scoreboard-container">
                                <h3><i class="fa-solid fa-users-viewfinder"></i> TABLEAU DE SCORE DÉTAILLÉ DU MATCH</h3>
                                ${alliesTableHtml}
                                ${enemiesTableHtml}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatDate(dateStr) {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffH = Math.floor((now - d) / 3600000);
            if (diffH < 1) return "Il y a moins d'1 heure";
            if (diffH < 24) return `Il y a ${diffH} heures`;
            const diffD = Math.floor(diffH / 24);
            if (diffD === 1) return "Hier";
            return `Il y a ${diffD} jours`;
        } catch { return dateStr; }
    }

    toggleMatchDetails(matchId) {
        const item = document.querySelector(`.match-item[data-match-id="${matchId}"]`);
        if (item) item.classList.toggle('expanded');
    }

    renderAgentsTable(agents) {
        const tbody = document.getElementById('agents-tbody');
        if (!tbody || !agents.length) return;

        tbody.innerHTML = agents.map(a => {
            const meta = AGENTS_META[a.name] || {};
            return `
                <tr>
                    <td><div class="agent-row-cell"><img class="mini-agent-img" src="${meta.icon || ''}" alt="${a.name}"><span>${a.name}</span></div></td>
                    <td><span class="role-badge">${meta.role || '-'}</span></td>
                    <td><strong>${a.matches}</strong></td>
                    <td style="color: ${parseFloat(a.winRate) >= 50 ? 'var(--val-green)' : 'var(--val-red)'}; font-weight:700;">${a.winRate}</td>
                    <td><strong>${a.kd}</strong></td>
                    <td>${a.acs || '-'}</td>
                    <td>${a.adr || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    renderLeaderboard(players) {
        const tbody = document.getElementById('leaderboard-tbody');
        if (!tbody) return;

        if (!players || !players.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Aucune donne de classement disponible</td></tr>`;
            return;
        }

        tbody.innerHTML = players.map(p => {
            const tierMeta = RANKS_META[p.tier] || RANKS_META[27];
            const rankClass = p.rank === 1 ? 'rank-gold' : p.rank === 2 ? 'rank-silver' : p.rank === 3 ? 'rank-bronze' : '';

            return `
                <tr class="${rankClass}">
                    <td class="rank-col">#${p.rank}</td>
                    <td class="player-col">
                        <strong>${p.name}</strong> <span class="text-muted">#${p.tag}</span>
                    </td>
                    <td>
                        <div class="tier-cell">
                            <img class="mini-rank-icon" src="${tierMeta.icon}" alt="Rank">
                            <span>${tierMeta.name}</span>
                        </div>
                    </td>
                    <td><strong>${p.rr} RR</strong></td>
                    <td>${p.wins || '-'} victoires</td>
                </tr>
            `;
        }).join('');
    }

    showLoading() {
        document.getElementById('loading-spinner').classList.remove('hidden');
        document.getElementById('error-box').classList.add('hidden');
        document.getElementById('profile-hero').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('profile-hero').classList.remove('hidden');
    }

    showError(title, message) {
        this.hideLoading();
        const errBox = document.getElementById('error-box');
        if (errBox) {
            document.getElementById('error-title').textContent = title;
            document.getElementById('error-message').textContent = message;
            errBox.classList.remove('hidden');
        }
    }

    hideError() { document.getElementById('error-box').classList.add('hidden'); }
}

const uiController = new UiController();



