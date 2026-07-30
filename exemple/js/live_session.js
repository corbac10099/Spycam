/* ==========================================================================
   LIVE SESSION CONTROLLER
   ========================================================================== */

class LiveSessionController {
    constructor() {
        this.isOpen = false;
        this.chartInstance = null;
        this.init();
    }

    persistProfile(profile) {
        try {
            localStorage.setItem('tracker_valo_live_session_profile', JSON.stringify(profile));
        } catch (e) {}
    }

    init() {
        const bindEvents = () => {
            const btn = document.getElementById('live-session-btn');
            const closeBtn = document.getElementById('close-live-session');
            const view = document.getElementById('live-session-view');

            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (window.uiController && window.uiController.currentPlayerData) {
                        this.persistProfile(window.uiController.currentPlayerData);
                    }
                    window.location.href = 'session_live.html';
                };
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.uiController && window.uiController.currentPlayerData) {
                        this.persistProfile(window.uiController.currentPlayerData);
                    }
                    window.location.href = 'session_live.html';
                }, { once: false });
            }

            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.preventDefault();
                    this.close(view);
                };
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close(view);
                }, { once: false });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindEvents, { once: true });
        } else {
            bindEvents();
        }
    }

    open(view = document.getElementById('live-session-view')) {
        this.isOpen = true;
        if (view) {
            view.classList.remove('hidden');
            view.style.display = 'flex';
            view.style.visibility = 'visible';
            view.style.opacity = '1';
        }

        if (window.uiController && window.uiController.currentPlayerData) {
            this.persistProfile(window.uiController.currentPlayerData);
            this.updateData(window.uiController.currentPlayerData);
        }
    }

    close(view = document.getElementById('live-session-view')) {
        this.isOpen = false;
        if (view) {
            view.classList.add('hidden');
            view.style.display = 'none';
            view.style.visibility = 'hidden';
            view.style.opacity = '0';
        }
    }

    updateData(profile) {
        if (!this.isOpen || !profile || !profile.matches || profile.matches.length === 0) return;

        // Player Info Update
        document.getElementById('live-player-name').textContent = profile.name;
        document.getElementById('live-rank-text').textContent = profile.rank?.name?.toUpperCase() || '-';
        document.getElementById('live-rank-icon').src = profile.rank?.icon || '';

        // Extract the two most recent matches
        const currentMatch = profile.matches[0];
        const prevMatch = profile.matches.length > 1 ? profile.matches[1] : null;

        // Populate Current Match Stats
        document.getElementById('live-acs-main').textContent = currentMatch.acs || 0;
        document.getElementById('live-kills').textContent = currentMatch.kills || 0;
        document.getElementById('live-rr-change').textContent = currentMatch.rrChange || '-';
        
        const kdCurrent = (currentMatch.kills / (currentMatch.deaths || 1)).toFixed(2);
        const kadCurrent = ((currentMatch.kills + currentMatch.assists) / (currentMatch.deaths || 1)).toFixed(2);
        
        document.getElementById('live-kd').textContent = kdCurrent;
        document.getElementById('live-kad').textContent = kadCurrent;

        // Calculate and format deltas
        const updateDiff = (id, currentVal, prevVal, isFloat = false) => {
            const el = document.getElementById(id);
            if (!prevMatch) {
                el.textContent = '';
                return;
            }
            
            const diff = isFloat ? (currentVal - prevVal).toFixed(2) : Math.round(currentVal - prevVal);
            const numDiff = parseFloat(diff);
            
            if (numDiff > 0) {
                el.textContent = `+${diff}`;
                el.style.color = '#00e676'; // Green
            } else if (numDiff < 0) {
                el.textContent = diff; // Already has minus sign
                el.style.color = '#ff4655'; // Red
            } else {
                el.textContent = '=';
                el.style.color = '#a0a0a0'; // Gray
            }
        };

        if (prevMatch) {
            const kdPrev = (prevMatch.kills / (prevMatch.deaths || 1));
            const kadPrev = ((prevMatch.kills + prevMatch.assists) / (prevMatch.deaths || 1));
            
            updateDiff('live-kills-diff', currentMatch.kills || 0, prevMatch.kills || 0);
            updateDiff('live-kd-diff', parseFloat(kdCurrent), kdPrev, true);
            updateDiff('live-kad-diff', parseFloat(kadCurrent), kadPrev, true);
        }

        this.updateChart(profile.matches);
    }

    updateChart(matches) {
        const ctx = document.getElementById('live-chart-kd');
        if (!ctx) return;

        // Take last 10 matches, reverse for chronological order
        const recent = [...matches].slice(0, 10).reverse();
        
        const labels = recent.map(m => m.agent);
        const data = recent.map(m => parseFloat((m.kills / (m.deaths || 1)).toFixed(2)));

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        if (window.Chart) {
            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'K/D Ratio',
                        data: data,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#00f0ff',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#a0a0a0' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a0a0a0' }
                        }
                    }
                }
            });
        }
    }
}

// Instantiate globally
window.liveSessionController = new LiveSessionController();
