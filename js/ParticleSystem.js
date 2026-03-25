class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.baseColor = Math.random() > 0.5 ? '220, 30, 30' : '140, 50, 220';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    applyForce(forceX, forceY) {
        this.velocityX += forceX;
        this.velocityY += forceY;
    }

    update(mouseX, mouseY, isPowerMode, gravityInverted, timeScale, auraActive, vortexActive, heavyGravity, drainActive) {
        if (timeScale === 0) return; // Time Stop completely freezes updates

        this.velocityX *= 0.92;
        this.velocityY *= 0.92;

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        if (auraActive) {
            const dx = this.x - cx;
            const dy = this.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 350) {
                const force = (350 - dist) / 30;
                this.applyForce((dx / dist) * force, (dy / dist) * force);
            }
        }

        if (vortexActive) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10 && dist < 600) {
                const force = 400 / dist; 
                this.applyForce((dx / dist) * force * 0.15, (dy / dist) * force * 0.15);
            }
        }

        if (drainActive) {
            const dx = cx - this.x;
            const dy = cy - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / dist) * 15 * timeScale;
            this.y += (dy / dist) * 15 * timeScale;
            
            // Respawn if swallowed by the center
            if (dist < 40) {
                this.x = Math.random() * this.canvas.width;
                this.y = Math.random() > 0.5 ? -10 : this.canvas.height + 10;
            }
        }

        if (heavyGravity) {
            this.velocityY += 1.5; 
        }

        this.x += this.velocityX * timeScale;
        this.y += this.velocityY * timeScale;

        if (!drainActive) {
            const direction = gravityInverted ? 1 : -1;
            const floatSpeed = heavyGravity ? 0 : (this.speedY * (isPowerMode ? 5 : 1)) * direction;
            this.y += floatSpeed * timeScale;
        }
        
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
    }

    draw(ctx, isPowerMode, chakraSightActive) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (chakraSightActive) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${isPowerMode ? 0.9 : 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fillStyle = `rgba(${this.baseColor}, ${isPowerMode ? 0.8 : 0.4})`;
            ctx.fill();
        }
    }
}

export class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.gravityInverted = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        for(let i = 0; i < 150; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    triggerShockwave() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        this.particles.forEach(p => {
            const dx = p.x - cx;
            const dy = p.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = (800 - dist) / 50; 
            if (force > 0) p.applyForce((dx / dist) * force, (dy / dist) * force);
        });
    }

    toggleGravity() {
        this.gravityInverted = !this.gravityInverted;
    }

    drawAura(isPowerMode) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const gradient = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 350);
        
        const color = isPowerMode ? 'rgba(255, 50, 50,' : 'rgba(150, 100, 255,';
        gradient.addColorStop(0, `${color} 0)`);
        gradient.addColorStop(0.8, `${color} 0.1)`);
        gradient.addColorStop(1, `${color} 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 350, 0, Math.PI * 2);
        this.ctx.fill();
    }

    render(mouseX, mouseY, isPowerMode, timeScale, auraActive, vortexActive, chakraSightActive, heavyGravity, drainActive) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (auraActive) this.drawAura(isPowerMode);

        this.particles.forEach(p => { 
            p.update(mouseX, mouseY, isPowerMode, this.gravityInverted, timeScale, auraActive, vortexActive, heavyGravity, drainActive); 
            p.draw(this.ctx, isPowerMode, chakraSightActive); 
        });
    }
}