import { EyeController } from './EyeController.js';
import { ParticleSystem } from './ParticleSystem.js';
import { TrailSystem } from './TrailSystem.js';
import { AudioEngine } from './AudioEngine.js';
import { FlameSystem } from './FlameSystem.js';
import { StateMemory } from './StateMemory.js';
import { ScreenshotEngine } from './ScreenshotEngine.js';
import { HapticFeedback } from './HapticFeedback.js';

class App {
    constructor() {
        this.eyeController = new EyeController();
        this.particleSystem = new ParticleSystem('chakra-canvas');
        this.trailSystem = new TrailSystem('chakra-canvas');
        this.flameSystem = new FlameSystem('chakra-canvas');
        this.audioEngine = new AudioEngine();
        
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        
        window.isPowerMode = false;
        this.isShiftPressed = false;
        this.hueShift = 0;
        this.timeScale = 1.0;
        
        this.keyBuffer = [];
        this.reticleX = window.innerWidth / 2;
        this.reticleY = window.innerHeight / 2;
        this.targetX = this.reticleX;
        this.targetY = this.reticleY;

        this.ctx = document.getElementById('chakra-canvas').getContext('2d');

        // Human-readable names for the Active Panel
        this.stateDisplayNames = {
            aura: "Defensive Aura", vortex: "Spatial Vortex", sight: "Chakra Sight", susanoo: "Ribcage Shield",
            overdrive: "Overdrive Pulse", kamui: "Phase Shift (Kamui)", gravity: "Heavy Gravity", limbo: "Limbo Shadows",
            tsukuyomi: "Tsukuyomi Realm", drain: "Chakra Drain", neon: "Neon Cyber-Shift", timeStop: "Time Stop", shatter: "Shattered Reality",
            byakugan: "Byakugan Veins", tenseigan: "Tenseigan Aura", lightning: "Jougan Lightning", tear: "Blood Tear",
            scorch: "Scorch Marks", rasengan: "Rasengan Distortion", kyuubi: "Kyuubi Cloak", chidori: "Chidori Sparks", dynamicShadows: "Dynamic Shadows",
            susanooEvo: "Susanoo Skeleton", reticle: "Targeting Reticle"
        };

        this.injectDynamicElements();
        this.injectInfoPanel(); 
        this.injectActivePanel();
        
        this.stateMemory = new StateMemory();
        this.screenshotEngine = new ScreenshotEngine('chakra-canvas');
        this.haptics = new HapticFeedback();

        const defaultStates = {
            aura: false, vortex: false, sight: false, susanoo: false,
            overdrive: false, kamui: false, gravity: false, limbo: false,
            tsukuyomi: false, drain: false, neon: false, timeStop: false, shatter: false,
            byakugan: false, tenseigan: false, lightning: false, tear: false,
            scorch: false, rasengan: false, kyuubi: false, chidori: false, dynamicShadows: false,
            susanooEvo: false, reticle: false, info: false, activePanel: false
        };
        this.states = this.stateMemory.load(defaultStates);

        this.applySavedStates();
        this.updateActivePanel();
        
        this.setupEventListeners();
        this.loop();
    }

    applySavedStates() {
        if(this.states.susanoo) this.shieldDiv.classList.add('active');
        if(this.states.info) this.infoDiv.classList.add('active');
        if(this.states.activePanel) this.activePanelDiv.classList.add('show');
        document.body.classList.toggle('overdrive-active', this.states.overdrive);
        document.body.classList.toggle('kamui-active', this.states.kamui);
        document.body.classList.toggle('limbo-active', this.states.limbo);
        document.body.classList.toggle('tsukuyomi-active', this.states.tsukuyomi);
        document.body.classList.toggle('neon-active', this.states.neon);
        document.body.classList.toggle('shatter-active', this.states.shatter);
        document.body.classList.toggle('byakugan-active', this.states.byakugan);
        document.body.classList.toggle('tenseigan-active', this.states.tenseigan);
        document.body.classList.toggle('tear-active', this.states.tear);
        document.body.classList.toggle('scorch-active', this.states.scorch);
        document.body.classList.toggle('rasengan-active', this.states.rasengan);
        document.body.classList.toggle('kyuubi-active', this.states.kyuubi);
        document.body.classList.toggle('susanoo-evo-active', this.states.susanooEvo);
    }

    injectDynamicElements() {
        this.scorchCanvas = document.createElement('canvas');
        this.scorchCanvas.id = 'scorch-canvas';
        this.scorchCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none; opacity: 0; transition: opacity 0.3s;';
        document.body.insertBefore(this.scorchCanvas, document.getElementById('chakra-canvas'));
        this.sCtx = this.scorchCanvas.getContext('2d');
        this.scorchCanvas.width = window.innerWidth;
        this.scorchCanvas.height = window.innerHeight;

        const style = document.createElement('style');
        style.innerHTML = `
            .susanoo-shield { position: fixed; inset: 0; border: 15px solid rgba(150, 50, 255, 0.4); box-shadow: inset 0 0 80px rgba(150, 50, 255, 0.6), 0 0 80px rgba(150, 50, 255, 0.6); pointer-events: none; z-index: 40; opacity: 0; transition: all 0.3s ease; }
            .susanoo-shield.active { opacity: 1; }
            .susanoo-shield.power { border-color: rgba(255, 50, 50, 0.6); box-shadow: inset 0 0 80px rgba(255, 50, 50, 0.6), 0 0 80px rgba(255, 50, 50, 0.6); }
            
            .susanoo-evo-active .susanoo-shield { border-width: 40px; border-image: repeating-linear-gradient(45deg, rgba(150,50,255,0.8) 0, rgba(150,50,255,0.2) 20px, rgba(150,50,255,0.8) 40px) 40; }
            .susanoo-evo-active .susanoo-shield.power { border-image: repeating-linear-gradient(45deg, rgba(255,50,50,0.8) 0, rgba(255,50,50,0.2) 20px, rgba(255,50,50,0.8) 40px) 40; }

            .target-reticle { position: fixed; width: 40px; height: 40px; border: 2px solid #0f0; border-radius: 50%; pointer-events: none; z-index: 50; display: none; transform: translate(-50%, -50%); box-shadow: 0 0 10px #0f0, inset 0 0 10px #0f0; transition: transform 0.1s; }
            .target-reticle::before, .target-reticle::after { content: ''; position: absolute; background: #0f0; }
            .target-reticle::before { top: 50%; left: -10px; right: -10px; height: 2px; transform: translateY(-50%); }
            .target-reticle::after { left: 50%; top: -10px; bottom: -10px; width: 2px; transform: translateX(-50%); }

            @keyframes overdrive-pulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.02); filter: brightness(1.2); } }
            body.overdrive-active { animation: overdrive-pulse 0.8s infinite; }
            .mirage-clone { position: fixed; inset: 0; pointer-events: none; z-index: 5; opacity: 0.4; filter: saturate(2) hue-rotate(45deg); transition: transform 0.4s ease-out, opacity 0.4s ease-out; }
            #scene { transition: opacity 0.3s ease, filter 0.3s ease, filter 0.1s linear; }
            .kamui-active #scene { opacity: 0.2; filter: blur(4px) grayscale(0.5); }
            .limbo-active #scene { filter: drop-shadow(-300px 0 0 rgba(20, 0, 40, 0.7)) drop-shadow(300px 0 0 rgba(20, 0, 40, 0.7)); }
            body { transition: background-color 0.5s ease; }
            body.tsukuyomi-active { background-color: #200000; }
            body.neon-active { filter: hue-rotate(90deg) saturate(2.5) contrast(1.2); }
            .shatter-overlay { position: fixed; inset: 0; z-index: 60; pointer-events: none; display: none; background: linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.8) 49%, transparent 51%), linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.8) 49%, transparent 51%); }
            body.shatter-active .shatter-overlay { display: block; backdrop-filter: blur(2px); }
            .byakugan-active .veins { opacity: 1 !important; filter: brightness(2) contrast(3) grayscale(1); transform: scale(1.2); }
            .tenseigan-active .eye-socket { filter: drop-shadow(0 0 50px rgba(0, 255, 255, 0.8)) !important; }
            .blood-tear { position: absolute; bottom: 20%; left: 50%; width: 6px; height: 20px; background: #900; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; opacity: 0; transform: translate(-50%, 0); z-index: 25; transition: opacity 0.2s; }
            .tear-active .blood-tear { animation: tear-drop 3s infinite ease-in; opacity: 1; }
            @keyframes tear-drop { 0% { transform: translate(-50%, 0) scaleY(1); opacity: 1; } 80% { transform: translate(-50%, 150px) scaleY(1.5); opacity: 0; } 100% { transform: translate(-50%, 150px); opacity: 0; } }
            .kyuubi-cloak { position: fixed; bottom: -50px; left: 0; width: 100%; height: 40vh; background: radial-gradient(ellipse at bottom, rgba(255, 80, 0, 0.8), transparent 70%); filter: blur(20px); opacity: 0; pointer-events: none; z-index: 45; transition: opacity 0.5s; mix-blend-mode: screen; }
            .kyuubi-active .kyuubi-cloak { opacity: 1; animation: pulse-cloak 2s infinite alternate; }
            @keyframes pulse-cloak { 0% { transform: scaleY(1); opacity: 0.7; } 100% { transform: scaleY(1.2); opacity: 1; } }
            .rasengan-orb { position: fixed; width: 160px; height: 160px; border-radius: 50%; pointer-events: none; z-index: 35; opacity: 0; transform: translate(-50%, -50%) scale(0.5); transition: opacity 0.2s, transform 0.1s linear; box-shadow: inset 0 0 40px rgba(0, 200, 255, 0.8), 0 0 20px rgba(0, 200, 255, 0.5); backdrop-filter: blur(8px) contrast(1.5); mix-blend-mode: hard-light; }
            .rasengan-orb::after { content: ''; position: absolute; inset: 10px; border-radius: 50%; border: 4px dashed rgba(255,255,255,0.8); animation: spin 0.5s linear infinite; }
            .rasengan-active .rasengan-orb { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            .scorch-active #scorch-canvas { opacity: 1; }
            .ultimate-flash { position: fixed; inset: 0; background: #fff; z-index: 200; pointer-events: none; opacity: 0; transition: opacity 2s ease-out; mix-blend-mode: difference; }
        `;
        document.head.appendChild(style);

        this.shieldDiv = document.createElement('div');
        this.shieldDiv.className = 'susanoo-shield';
        document.body.appendChild(this.shieldDiv);

        this.shatterDiv = document.createElement('div');
        this.shatterDiv.className = 'shatter-overlay';
        document.body.appendChild(this.shatterDiv);

        this.kyuubiDiv = document.createElement('div');
        this.kyuubiDiv.className = 'kyuubi-cloak';
        document.body.appendChild(this.kyuubiDiv);

        this.rasenganDiv = document.createElement('div');
        this.rasenganDiv.className = 'rasengan-orb';
        document.body.appendChild(this.rasenganDiv);

        this.reticleDiv = document.createElement('div');
        this.reticleDiv.className = 'target-reticle';
        document.body.appendChild(this.reticleDiv);

        const flash = document.createElement('div');
        flash.id = 'ult-flash';
        flash.className = 'ultimate-flash';
        document.body.appendChild(flash);

        const leftEye = document.querySelector('#left-eye .sclera');
        const tear = document.createElement('div');
        tear.className = 'blood-tear';
        leftEye.appendChild(tear);
    }

    injectInfoPanel() {
        const style = document.createElement('style');
        style.innerHTML = `
            .info-panel { position: fixed; top: 20px; right: -380px; width: 340px; background: rgba(5, 5, 10, 0.92); border-left: 2px solid rgba(150, 100, 255, 0.8); padding: 20px; color: #aaa; font-family: monospace; font-size: 13px; transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1000; backdrop-filter: blur(10px); overflow-y: auto; max-height: 85vh; box-shadow: -5px 0 25px rgba(0,0,0,0.8); }
            .info-panel.active { right: 0; }
            .info-panel h3 { color: #fff; margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 12px; font-size: 15px; letter-spacing: 2px; }
            .info-panel ul { list-style: none; padding: 0; margin: 0; }
            .info-panel li { margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; }
            .info-panel kbd { background: #1a1a1a; border: 1px solid #555; padding: 3px 7px; border-radius: 4px; color: #0df; font-size: 11px; box-shadow: 0 2px 0 #000; font-family: sans-serif; font-weight: bold; letter-spacing: 0.5px; }
            .section-title { color: #b388ff; margin-top: 20px; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
            .info-panel::-webkit-scrollbar { width: 5px; }
            .info-panel::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
            .info-panel::-webkit-scrollbar-thumb { background: rgba(150, 100, 255, 0.6); border-radius: 3px; }
        `;
        document.head.appendChild(style);

        this.infoDiv = document.createElement('div');
        this.infoDiv.className = 'info-panel';
        this.infoDiv.innerHTML = `
            <h3>SYSTEM TERMINAL</h3>
            <ul>
                <div class="section-title">Core & UI</div>
                <li><span>Power Mode</span> <kbd>L-Click</kbd></li>
                <li><span>Toggle Control Panel</span> <kbd>I</kbd></li>
                <li><span>Toggle Active Systems</span> <kbd>A</kbd></li>
                <li><span>Targeting Reticle</span> <kbd>Y</kbd></li>
                <li><span>Capture Screenshot</span> <kbd>K</kbd></li>

                <div class="section-title">Combat & Defense</div>
                <li><span>Black Fire (Amaterasu)</span> <kbd>Hold Shift</kbd></li>
                <li><span>Shockwave Blast</span> <kbd>C</kbd></li>
                <li><span>Defensive Aura</span> <kbd>Q</kbd></li>
                <li><span>Spatial Vortex Pull</span> <kbd>Hold V</kbd></li>
                <li><span>Chakra Drain</span> <kbd>D</kbd></li>
                <li><span>Ribcage Shield</span> <kbd>S</kbd></li>
                <li><span>Susanoo Evolution</span> <kbd>0</kbd></li>
                <li><span>Ultimate Jutsu Combo</span> <kbd>↑ ↓ ← → Space</kbd></li>

                <div class="section-title">Reality & Time Manipulation</div>
                <li><span>Evolve / Hue Invert</span> <kbd>Space</kbd></li>
                <li><span>Time Dilation (Slow)</span> <kbd>T</kbd></li>
                <li><span>Time Stop (Freeze)</span> <kbd>Z</kbd></li>
                <li><span>Overdrive (Pulse)</span> <kbd>O</kbd></li>
                <li><span>Speed Mirage</span> <kbd>M</kbd></li>
                <li><span>Phase Shift (Kamui)</span> <kbd>P</kbd></li>
                <li><span>Genjutsu Gravity Invert</span> <kbd>F</kbd></li>
                <li><span>Heavy Gravity Drop</span> <kbd>G</kbd></li>
                <li><span>Limbo Shadows</span> <kbd>L</kbd></li>
                <li><span>Tsukuyomi Realm</span> <kbd>R</kbd></li>
                <li><span>Neon Cyber-Shift</span> <kbd>N</kbd></li>
                <li><span>Shattered Reality</span> <kbd>X</kbd></li>

                <div class="section-title">Optical Visuals (Keys 1-9)</div>
                <li><span>Byakugan Veins</span> <kbd>1</kbd></li>
                <li><span>Tenseigan Aura</span> <kbd>2</kbd></li>
                <li><span>Jougan Lightning</span> <kbd>3</kbd></li>
                <li><span>Blood Tear</span> <kbd>4</kbd></li>
                <li><span>Scorch Marks</span> <kbd>5</kbd></li>
                <li><span>Rasengan Distortion</span> <kbd>6</kbd></li>
                <li><span>Kyuubi Cloak</span> <kbd>7</kbd></li>
                <li><span>Chidori Sparks</span> <kbd>8</kbd></li>
                <li><span>Dynamic Shadows</span> <kbd>9</kbd></li>
                <li><span>Chakra Sight (Wireframe)</span> <kbd>B</kbd></li>
            </ul>
        `;
        document.body.appendChild(this.infoDiv);
    }

    injectActivePanel() {
        const style = document.createElement('style');
        style.innerHTML = `
            .active-panel { position: fixed; top: 20px; left: -380px; width: 280px; background: rgba(5, 5, 10, 0.92); border-right: 2px solid rgba(0, 220, 255, 0.8); padding: 20px; color: #aaa; font-family: monospace; font-size: 13px; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1000; backdrop-filter: blur(10px); box-shadow: 5px 0 25px rgba(0,0,0,0.8); }
            .active-panel.show { left: 0; }
            .active-panel h3 { color: #fff; margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 12px; font-size: 15px; letter-spacing: 2px; }
            .active-panel ul { list-style: none; padding: 0; margin: 0; }
            .active-panel li { margin-bottom: 8px; color: #fff; font-weight: bold; letter-spacing: 0.5px; }
            .active-panel .dot { color: #0df; margin-right: 8px; text-shadow: 0 0 5px #0df; }
        `;
        document.head.appendChild(style);

        this.activePanelDiv = document.createElement('div');
        this.activePanelDiv.className = 'active-panel';
        this.activePanelDiv.innerHTML = `
            <h3>ACTIVE SYSTEMS</h3>
            <ul id="active-systems-list"></ul>
        `;
        document.body.appendChild(this.activePanelDiv);
    }

    updateActivePanel() {
        const list = document.getElementById('active-systems-list');
        if (!list) return;
        
        list.innerHTML = '';
        let hasActive = false;
        
        for (const [key, isActive] of Object.entries(this.states)) {
            if (isActive && this.stateDisplayNames[key]) {
                hasActive = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="dot">■</span> ${this.stateDisplayNames[key]}`;
                list.appendChild(li);
            }
        }
        
        if (!hasActive) {
            list.innerHTML = '<li style="color: #666; font-weight: normal;">No systems engaged.</li>';
        }
    }

    triggerUltimate() {
        this.audioEngine.playIgnition();
        const flash = document.getElementById('ult-flash');
        flash.style.opacity = '1';
        this.particleSystem.triggerShockwave();
        document.body.classList.add('shake-active');
        
        setTimeout(() => {
            flash.style.opacity = '0';
            document.body.classList.remove('shake-active');
        }, 100);
    }

    drawLightning() {
        if (!this.states.lightning || Math.random() > 0.1) return;
        this.ctx.beginPath();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        this.ctx.moveTo(x, y);
        for (let i = 0; i < 10; i++) {
            x += (Math.random() - 0.5) * 200;
            y += (Math.random() - 0.5) * 200;
            this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#0ff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawChidori(speed) {
        if (!this.states.chidori || speed < 40) return;
        this.ctx.beginPath();
        let cx = this.mouseX;
        let cy = this.mouseY;
        this.ctx.moveTo(cx, cy);
        for(let i=0; i<5; i++) {
            cx += (Math.random() - 0.5) * 100;
            cy += (Math.random() - 0.5) * 100;
            this.ctx.lineTo(cx, cy);
        }
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    applyDynamicShadows() {
        if (!this.states.dynamicShadows) {
            document.getElementById('scene').style.filter = '';
            return;
        }
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const shadowX = ((cx - this.mouseX) / cx) * 50;
        const shadowY = ((cy - this.mouseY) / cy) * 50;
        document.getElementById('scene').style.filter = `drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.9))`;
    }

    setupEventListeners() {
        // --- CURSOR TRACKING ---
        document.addEventListener('mousemove', (e) => {
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            const speed = Math.hypot(this.mouseX - this.lastMouseX, this.mouseY - this.lastMouseY);
            this.drawChidori(speed);
            this.applyDynamicShadows();

            if (this.states.rasengan) {
                this.rasenganDiv.style.left = `${this.mouseX}px`;
                this.rasenganDiv.style.top = `${this.mouseY}px`;
            }

            this.eyeController.updateTracking(this.mouseX, this.mouseY, window.isPowerMode);
            
            if (this.isShiftPressed && !this.states.timeStop) {
                this.flameSystem.addFlame(this.mouseX, this.mouseY);
                if (this.states.scorch) {
                    this.sCtx.fillStyle = 'rgba(0,0,0,0.2)';
                    this.sCtx.beginPath();
                    this.sCtx.arc(this.mouseX, this.mouseY, 20, 0, Math.PI*2);
                    this.sCtx.fill();
                }
            }
        });

        // --- POWER IGNITION ---
        document.addEventListener('mousedown', () => {
            window.isPowerMode = true;
            this.audioEngine.playIgnition();
            document.documentElement.style.setProperty('--eye-open', '45%'); 
            document.documentElement.style.setProperty('--emotion-glow', '3'); 
            document.documentElement.style.setProperty('--pupil-scale', '0.5'); 
            document.querySelector('.sharingan-iris').style.animationDuration = '2s';
            document.body.classList.add('shake-active');
            document.getElementById('vignette').classList.add('power-vignette');
            this.shieldDiv.classList.add('power');
        });

        document.addEventListener('mouseup', () => {
            window.isPowerMode = false;
            document.documentElement.style.setProperty('--eye-open', '35%'); 
            document.documentElement.style.setProperty('--emotion-glow', '1');
            document.documentElement.style.setProperty('--pupil-scale', '1'); 
            document.querySelector('.sharingan-iris').style.animationDuration = '8s';
            document.body.classList.remove('shake-active');
            document.getElementById('vignette').classList.remove('power-vignette');
            this.shieldDiv.classList.remove('power');
        });

        // --- KEYBOARD TACTICS ---
        document.addEventListener('keydown', (e) => {
            const comboKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'];
            if (comboKeys.includes(e.code)) {
                if (e.code !== 'Space' || document.activeElement === document.body) {
                    e.preventDefault();
                }
            }

            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isShiftPressed = true;
            if (e.code === 'KeyV') this.states.vortex = true;
            
            if (this.keyBuffer[this.keyBuffer.length - 1] !== e.code) {
                this.keyBuffer.push(e.code);
            }
            if (this.keyBuffer.length > 5) this.keyBuffer.shift();
            
            const currentCombo = this.keyBuffer.join(',');
            if (currentCombo === 'ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Space' || 
                currentCombo === 'KeyW,KeyS,KeyA,KeyD,Space') {
                this.triggerUltimate();
                this.haptics.shockwave(); 
                this.keyBuffer = []; 
            }

            if (e.code === 'KeyK') {
                this.screenshotEngine.capture();
                this.audioEngine.playShift();
                this.haptics.pulse();
            }

            const toggleState = (key, prop, cssClass) => {
                if (e.code === key) {
                    this.states[prop] = !this.states[prop];
                    if (cssClass) document.body.classList.toggle(cssClass, this.states[prop]);
                    this.audioEngine.playShift();
                    this.haptics.pulse(); 
                    this.updateActivePanel();
                    this.stateMemory.save(this.states); 
                }
            };

            toggleState('KeyI', 'info', 'active');
            if (e.code === 'KeyI') this.infoDiv.classList.toggle('active');

            toggleState('KeyA', 'activePanel', 'show');
            if (e.code === 'KeyA') this.activePanelDiv.classList.toggle('show');

            toggleState('KeyT', 'timeDilation');
            if (e.code === 'KeyT') this.timeScale = this.timeScale === 1.0 ? 0.15 : 1.0;

            toggleState('KeyQ', 'aura');
            toggleState('KeyB', 'sight');
            toggleState('KeyS', 'susanoo', 'active');
            if (e.code === 'KeyS') this.shieldDiv.classList.toggle('active', this.states.susanoo);
            
            toggleState('KeyO', 'overdrive', 'overdrive-active');
            toggleState('KeyP', 'kamui', 'kamui-active');
            toggleState('KeyG', 'gravity');
            toggleState('KeyL', 'limbo', 'limbo-active');
            toggleState('KeyR', 'tsukuyomi', 'tsukuyomi-active');
            toggleState('KeyD', 'drain');
            toggleState('KeyN', 'neon', 'neon-active');
            toggleState('KeyZ', 'timeStop');
            toggleState('KeyX', 'shatter', 'shatter-active');

            toggleState('Digit1', 'byakugan', 'byakugan-active');
            toggleState('Digit2', 'tenseigan', 'tenseigan-active');
            toggleState('Digit3', 'lightning');
            toggleState('Digit4', 'tear', 'tear-active');
            toggleState('Digit5', 'scorch', 'scorch-active');
            toggleState('Digit6', 'rasengan', 'rasengan-active');
            toggleState('Digit7', 'kyuubi', 'kyuubi-active');
            toggleState('Digit8', 'chidori');
            toggleState('Digit9', 'dynamicShadows');
            toggleState('Digit0', 'susanooEvo', 'susanoo-evo-active');
            toggleState('KeyY', 'reticle');

            if (e.code === 'Space') {
                this.audioEngine.playShift();
                const scene = document.getElementById('scene');
                scene.classList.remove('glitch-active');
                void scene.offsetWidth; 
                scene.classList.add('glitch-active');
                this.hueShift = this.hueShift === 0 ? 180 : 0;
                document.documentElement.style.setProperty('--chakra-hue', `${this.hueShift}deg`);
                this.haptics.pulse();
            }

            if (e.code === 'KeyC') { 
                this.particleSystem.triggerShockwave();
                this.audioEngine.playShift(); 
                document.body.classList.add('shake-active');
                setTimeout(() => document.body.classList.remove('shake-active'), 400);
                this.haptics.shockwave();
            }

            if (e.code === 'KeyF') { 
                this.particleSystem.toggleGravity();
                document.body.style.filter = this.particleSystem.gravityInverted ? 'invert(1) hue-rotate(180deg)' : 'none';
                this.audioEngine.playIgnition();
                this.haptics.pulse();
            }

            if (e.code === 'KeyM') {
                const scene = document.getElementById('scene');
                const clone = scene.cloneNode(true);
                clone.classList.add('mirage-clone');
                clone.removeAttribute('id');
                document.body.appendChild(clone);
                void clone.offsetWidth; 
                clone.style.transform = `scale(1.15) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px)`;
                clone.style.opacity = '0';
                setTimeout(() => clone.remove(), 400);
                this.audioEngine.playShift();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isShiftPressed = false;
            if (e.code === 'KeyV') {
                this.states.vortex = false;
                this.updateActivePanel();
            }
        });

        window.addEventListener('resize', () => {
            if(this.scorchCanvas) {
                this.scorchCanvas.width = window.innerWidth;
                this.scorchCanvas.height = window.innerHeight;
            }
        });
    }

    loop() {
        if (this.states.reticle) {
            this.reticleDiv.style.display = 'block';
            this.reticleX += (this.targetX - this.reticleX) * 0.08;
            this.reticleY += (this.targetY - this.reticleY) * 0.08;
            this.reticleDiv.style.left = this.reticleX + 'px';
            this.reticleDiv.style.top = this.reticleY + 'px';
            if (Math.random() < 0.02) {
                this.targetX = Math.random() * window.innerWidth;
                this.targetY = Math.random() * window.innerHeight;
            }
        } else {
            this.reticleDiv.style.display = 'none';
        }

        let finalTimeScale = this.states.timeStop ? 0 : (this.states.overdrive ? this.timeScale * 3 : this.timeScale);
        
        this.particleSystem.render(this.mouseX, this.mouseY, window.isPowerMode, finalTimeScale, this.states.aura, this.states.vortex, this.states.sight, this.states.gravity, this.states.drain);
        
        if (!this.states.timeStop) {
            this.trailSystem.updateAndDraw(this.mouseX, this.mouseY, window.isPowerMode);
            this.flameSystem.updateAndDraw(this.isShiftPressed);
            this.drawLightning();
            if (this.states.scorch) {
                this.sCtx.fillStyle = 'rgba(0,0,0,0.02)';
                this.sCtx.fillRect(0, 0, this.scorchCanvas.width, this.scorchCanvas.height);
            }
        }
        
        requestAnimationFrame(() => this.loop());
    }
}

new App();