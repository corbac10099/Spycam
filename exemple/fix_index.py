import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Annotateur link
old_link = """<a href="feedback.html" class="btn-secondary" style="border-color: var(--val-red); color: var(--val-red);" title="Mode Annotateur & Cartographie">
                    <i class="fa-solid fa-pen-ruler"></i> Annotateur
                </a>"""
new_link = """<button id="live-session-btn" class="btn-secondary" style="border-color: #00f0ff; color: #00f0ff; box-shadow: 0 0 10px rgba(0,240,255,0.3);" title="Vue Live Session">
                    <i class="fa-solid fa-desktop"></i> Session Live
                </button>"""

text = text.replace(old_link, new_link)

# Add the live session UI HTML before scripts
live_session_html = """
    <!-- Live Session Full Screen View -->
    <div id="live-session-view" class="hidden" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #0f1923; z-index: 9999; display: none; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; padding: 20px 40px; border-bottom: 2px solid rgba(255,255,255,0.1);">
            <h1 style="color: #ece8e1; margin:0; font-size: 2rem;"><i class="fa-solid fa-satellite-dish" style="color:#ff4655;"></i> LIVE SESSION TRACKER</h1>
            <button id="close-live-session" style="background:none; border:none; color: white; font-size: 2rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="flex: 1; padding: 40px; display: flex; flex-direction: column; gap: 40px; overflow-y: auto;">
            
            <div style="display:flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 20px; align-items: center;">
                    <img id="live-rank-icon" src="" style="width: 100px; height: 100px; object-fit: contain;">
                    <div>
                        <h2 id="live-player-name" style="font-size: 2.5rem; margin:0;">-</h2>
                        <h3 id="live-rank-text" style="color: var(--val-red); font-size: 1.5rem; margin:0;">-</h3>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 1.2rem; color: #a0a0a0;">Score de Combat Global</span>
                    <div id="live-acs-main" style="font-size: 4rem; font-weight: 900; color: #00f0ff;">-</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                <!-- Kills -->
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 8px; border-top: 4px solid #ff4655; display:flex; flex-direction:column;">
                    <span style="font-size: 1.2rem; color: #a0a0a0;">KILLS MATCH ACTUEL</span>
                    <div style="display:flex; align-items:baseline; gap: 15px;">
                        <span id="live-kills" style="font-size: 3.5rem; font-weight: bold;">-</span>
                        <span id="live-kills-diff" style="font-size: 1.5rem; font-weight:bold;"></span>
                    </div>
                </div>
                <!-- K/D -->
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 8px; border-top: 4px solid #00f0ff; display:flex; flex-direction:column;">
                    <span style="font-size: 1.2rem; color: #a0a0a0;">K/D RATIO</span>
                    <div style="display:flex; align-items:baseline; gap: 15px;">
                        <span id="live-kd" style="font-size: 3.5rem; font-weight: bold;">-</span>
                        <span id="live-kd-diff" style="font-size: 1.5rem; font-weight:bold;"></span>
                    </div>
                </div>
                <!-- KAD -->
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 8px; border-top: 4px solid #00e676; display:flex; flex-direction:column;">
                    <span style="font-size: 1.2rem; color: #a0a0a0;">KAD RATIO</span>
                    <div style="display:flex; align-items:baseline; gap: 15px;">
                        <span id="live-kad" style="font-size: 3.5rem; font-weight: bold;">-</span>
                        <span id="live-kad-diff" style="font-size: 1.5rem; font-weight:bold;"></span>
                    </div>
                </div>
                <!-- RR -->
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 8px; border-top: 4px solid #f59e0b; display:flex; flex-direction:column;">
                    <span style="font-size: 1.2rem; color: #a0a0a0;">RR GAGNÉS/PERDUS</span>
                    <div style="display:flex; align-items:baseline; gap: 15px;">
                        <span id="live-rr-change" style="font-size: 3.5rem; font-weight: bold;">-</span>
                    </div>
                </div>
            </div>

            <!-- Mini historical charts -->
            <div style="flex: 1; display:flex; gap: 20px;">
                <div style="flex:1; background: rgba(0,0,0,0.3); border-radius:8px; padding: 20px;">
                    <h3 style="margin-top:0; color:#ece8e1;">Évolution K/D Session</h3>
                    <canvas id="live-chart-kd" style="width:100%; height: 200px;"></canvas>
                </div>
            </div>
            
        </div>
    </div>
"""

text = text.replace('    <!-- Scripts -->', live_session_html + '\n    <!-- Scripts -->\n    <script src="js/live_session.js"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
