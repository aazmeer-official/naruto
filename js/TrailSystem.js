export class TrailSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.maxPoints = 20;
    }

    updateAndDraw(mouseX, mouseY, isPowerMode) {
        // Add current mouse position
        this.points.push({ x: mouseX, y: mouseY });
        
        // Keep trail within limit
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }

        // Draw the trail
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        this.ctx.strokeStyle = isPowerMode ? 'rgba(255, 50, 50, 0.8)' : 'rgba(150, 100, 255, 0.5)';
        this.ctx.lineWidth = isPowerMode ? 8 : 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Fade out trail
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.ctx.strokeStyle;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0; // Reset
        
        // Gradually remove points when mouse stops
        if (this.points.length > 0) {
            this.points.shift();
        }
    }
}