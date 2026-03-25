export class AudioEngine {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playIgnition() {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // Deep bass sweep like an engine rev
        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioCtx.currentTime + 0.6);
        
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.6);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.6);
    }

    playShift() {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // Sharp metallic ping for evolution shift
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
    }
}