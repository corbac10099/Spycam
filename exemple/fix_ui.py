import re

with open('js/ui.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix encodings in renderCareerStats and renderCoaching
text = text.replace('Pas assez de donnes pour gnrer des conseils.', 'Pas assez de données pour générer des conseils.')
text = text.replace('D?samor?ages', 'Désamorçages')

# 2. Add updateProfileDiff method just after constructor
diff_method = """
    updateProfileDiff(p) {
        if (!this.currentPlayerData || this.currentPlayerData.name !== p.name || this.currentPlayerData.tag !== p.tag) {
            this.renderProfile(p);
            return;
        }
        
        this.currentPlayerData = p;

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
"""

text = re.sub(r'(this\.currentPlayerData = null;\n    })', r'\1\n' + diff_method, text)

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(text)
