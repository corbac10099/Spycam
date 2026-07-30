/* ==========================================================================
   CHARTS MANAGER - Chart.js Visualizations (v2)
   ========================================================================== */

class ChartManager {
    constructor() {
        this.trendChartInstance = null;
        this.mapsChartInstance = null;
        this.accuracyChartInstance = null;
        this.radarChartInstance = null;
        this.sparklineInstance = null;
    }

    initOrUpdateCharts(playerData) {
        this.renderTrendChart(playerData.matches || []);
        this.renderMapsChart(playerData.matches || []);
        this.renderAccuracyChart(playerData.precision || {});
        this.renderRadarChart(playerData.topAgents || []);
        this.renderHsSparklineChart(playerData.matches || []);
    }

    renderTrendChart(matches) {
        const ctx = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx) return;
        if (this.trendChartInstance) this.trendChartInstance.destroy();

        const reversed = [...matches].reverse();
        const labels = reversed.map((m, i) => `#${i + 1} ${m.map}`);

        const kdValues = reversed.map(m => {
            if (typeof m.kd === 'number') return m.kd;
            if (m.kda) {
                const parts = m.kda.split('/').map(s => parseInt(s.trim()));
                return parts.length >= 2 ? parseFloat((parts[0] / (parts[1] || 1)).toFixed(2)) : 1.0;
            }
            return 1.0;
        });
        const acsValues = reversed.map(m => m.acs || 200);

        this.trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'K/D Ratio',
                        data: kdValues,
                        borderColor: 'rgb(0, 240, 255)',
                        backgroundColor: 'rgba(0, 240, 255, 0.15)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'yKD',
                        pointBackgroundColor: '#00f0ff',
                        pointRadius: 5,
                        pointBorderColor: '#111823',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        segment: {
                            borderColor: ctx => kdValues[ctx.p0DataIndex] > 1.0 ? 'rgb(0, 230, 118)' : 'rgba(0, 240, 255, 0.8)'
                        }
                    },
                    {
                        label: 'ACS',
                        data: acsValues,
                        borderColor: 'rgb(255, 70, 85)',
                        backgroundColor: 'rgba(255, 70, 85, 0.12)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'yACS',
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111823', titleColor: '#fff', bodyColor: '#cbd5e1',
                        borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1, padding: 12, cornerRadius: 8
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
                    yKD: { type: 'linear', position: 'left', title: { display: true, text: 'K/D', color: '#00f0ff' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' }, suggestedMin: 0, suggestedMax: 3 },
                    yACS: { type: 'linear', position: 'right', title: { display: true, text: 'ACS', color: '#ff4655' }, grid: { drawOnChartArea: false }, ticks: { color: '#9ca3af' }, suggestedMin: 50, suggestedMax: 400 }
                }
            }
        });
    }

    renderMapsChart(matches) {
        const ctx = document.getElementById('mapsChart')?.getContext('2d');
        if (!ctx) return;
        if (this.mapsChartInstance) this.mapsChartInstance.destroy();

        const mapStats = {};
        matches.forEach(m => {
            if (!mapStats[m.map]) mapStats[m.map] = { wins: 0, losses: 0 };
            if (m.result === 'WIN') mapStats[m.map].wins++;
            else mapStats[m.map].losses++;
        });

        const labels = Object.keys(mapStats);
        const winRates = labels.map(map => {
            const s = mapStats[map];
            const total = s.wins + s.losses;
            return total > 0 ? Math.round((s.wins / total) * 100) : 0;
        });
        const totals = labels.map(map => mapStats[map].wins + mapStats[map].losses);

        this.mapsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '% Victoires', data: winRates,
                    backgroundColor: winRates.map(v => v >= 60 ? 'rgba(0,230,118,0.75)' : v >= 50 ? 'rgba(0,240,255,0.75)' : 'rgba(255,70,85,0.75)'),
                    borderColor: winRates.map(v => v >= 60 ? '#00e676' : v >= 50 ? '#00f0ff' : '#ff4655'),
                    borderWidth: 1, borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111823', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1,
                        callbacks: { afterLabel: (ctx) => `Matchs: ${totals[ctx.dataIndex]}` }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { family: 'Rajdhani', size: 13, weight: 'bold' } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: v => `${v}%` }, min: 0, max: 100 }
                }
            }
        });
    }

    renderAccuracyChart(precision) {
        const ctx = document.getElementById('accuracyChart')?.getContext('2d');
        if (!ctx) return;
        if (this.accuracyChartInstance) this.accuracyChartInstance.destroy();

        const headPct = parseFloat(precision.head?.percent) || 7.1;
        const bodyPct = parseFloat(precision.body?.percent) || 67.1;
        const legsPct = parseFloat(precision.legs?.percent) || 25.8;

        this.accuracyChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Tête (Headshot)', 'Corps (Bodyshot)', 'Jambes (Legshot)'],
                datasets: [{
                    data: [headPct, bodyPct, legsPct],
                    backgroundColor: ['#ff4655', '#00f0ff', '#6b7280'],
                    borderColor: '#111823', borderWidth: 3, hoverOffset: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', font: { family: 'Outfit', size: 12 }, padding: 16, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: '#111823', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1,
                        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}%` }
                    }
                }
            }
        });
    }

    renderRadarChart(topAgents) {
        const ctx = document.getElementById('radarChart')?.getContext('2d');
        if (!ctx) return;
        if (this.radarChartInstance) this.radarChartInstance.destroy();

        const mainAgent = topAgents?.[0] || { name: 'Cypher', kd: 1.0, winRate: '54%', acs: 200, adr: 140 };
        const kdScore = Math.min((parseFloat(mainAgent.kd) / 2.0) * 100, 100);
        const wrScore = parseFloat(mainAgent.winRate) || 50;
        const acsScore = Math.min((parseFloat(mainAgent.acs) / 300) * 100, 100);
        const adrScore = Math.min((parseFloat(mainAgent.adr) / 200) * 100, 100);

        this.radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Ratio K/D', '% Victoire', 'ACS', 'ADR', 'Implication'],
                datasets: [{
                    label: mainAgent.name,
                    data: [kdScore, wrScore, acsScore, adrScore, 75],
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderColor: '#00f0ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00f0ff'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#9ca3af', font: { size: 11, family: 'Outfit' } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    renderHsSparklineChart(matches) {
        const ctx = document.getElementById('hs-sparkline-canvas')?.getContext('2d');
        if (!ctx) return;
        if (this.sparklineInstance) this.sparklineInstance.destroy();

        const reversed = [...matches].reverse();
        const hsValues = reversed.map(m => {
            if (typeof m.headshots === 'string') return parseFloat(m.headshots) || 7.0;
            if (typeof m.headshots === 'number') {
                const totalHits = m.headshots + (m.bodyshots || 10) + (m.legshots || 2);
                return totalHits > 0 ? parseFloat(((m.headshots / totalHits) * 100).toFixed(1)) : 7.0;
            }
            return 7.0;
        });

        const labels = reversed.map((_, i) => `#${i + 1}`);

        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(255, 70, 85, 0.45)');
        gradient.addColorStop(1, 'rgba(255, 70, 85, 0.0)');

        this.sparklineInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: hsValues,
                    borderColor: '#ff4655',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#ff4655'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#111823',
                        titleColor: '#fff',
                        bodyColor: '#ff4655',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 6,
                        callbacks: {
                            label: (ctx) => ` HS%: ${ctx.raw}%`
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false, min: 0 }
                }
            }
        });
    }
}

const chartManager = new ChartManager();
