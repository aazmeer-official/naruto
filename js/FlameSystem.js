export class FlameSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.flames = [];
    }

    addFlame(x, y) {
        for (let i = 0; i < 3; i++) {
            this.flames.push({
                x: x + (Math.random() * 20 - 10),
                y: y + (Math.random() * 20 - 10),
                size: Math.random() * 15 + 10,
                life: 1.0,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * -3 - 1
            });
        }
    }

    updateAndDraw(isShiftPressed) {
        for (let i = this.flames.length - 1; i >= 0; i--) {
            let f = this.flames[i];
            f.x += f.speedX;
            f.y += f.speedY;
            f.size *= 0.95; // Shrink
            f.life -= 0.02; // Fade

            if (f.life <= 0 || f.size <= 0.5) {
                this.flames.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = `rgba(10, 0, 10, ${f.life})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(150, 0, 0, 0.8)'; // Crimson glow
            
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
}