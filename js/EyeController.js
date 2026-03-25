export class EyeController {
    constructor() {
        this.root = document.documentElement;
        this.sockets = document.querySelectorAll('.eye-socket');
        this.startBlinking();
    }

    updateTracking(mouseX, mouseY, isPowerMode) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;

        // 3D socket rotation
        const rotateX = (dy / cy) * -15;
        const rotateY = (dx / cx) * 15;
        this.sockets.forEach(s => s.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

        // Iris tracking
        const irisMaxX = 35;
        const irisMaxY = 15;
        this.root.style.setProperty('--iris-x', `${(dx / cx) * irisMaxX}px`);
        this.root.style.setProperty('--iris-y', `${(dy / cy) * irisMaxY}px`);

        // Focus logic
        if (!isPowerMode) {
            const dist = Math.hypot(dx, dy);
            const maxDist = Math.hypot(cx, cy);
            const focusLevel = 1 - (dist / maxDist);
            this.root.style.setProperty('--eye-open', `${35 - (focusLevel * 7)}%`);
            this.root.style.setProperty('--emotion-glow', 1 + (focusLevel * 0.3));
        }
    }

    startBlinking() {
        const blink = () => {
            if (window.isPowerMode) return; // Prevent blinking during power mode
            this.root.style.setProperty('--eye-open', '0%');
            setTimeout(() => {
                this.root.style.setProperty('--eye-open', '35%');
            }, 150);
            setTimeout(blink, Math.random() * 4000 + 2000);
        };
        setTimeout(blink, 2000);
    }
}