// Title Screen Scene
export class TitleScene {
    constructor() {
        this.bounce = 0;
        this._btn = null;
    }

    update(dt) {
        this.bounce += dt;
    }

    draw(ctx, w, h, bg) {
        // Draw background
        bg.draw(ctx, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // ===== Chicken character =====
        ctx.save();
        ctx.translate(cx, cy - 40 + Math.sin(this.bounce) * 10);
        ctx.scale(1.3, 1.3);

        // Body
        ctx.fillStyle = '#FFCC66';
        ctx.beginPath();
        ctx.ellipse(0, 10, 50, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(5, 15, 30, 28, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFCC66';
        ctx.beginPath();
        ctx.ellipse(5, -35, 28, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        // Comb
        ctx.fillStyle = '#FF4444';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.ellipse(5 + i * 10, -60, 8, 12, i * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Happy eyes (closed arcs)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-5, -38, 6, Math.PI, 0, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(15, -38, 6, Math.PI, 0, true);
        ctx.stroke();

        // Blush
        ctx.fillStyle = 'rgba(255,150,150,0.4)';
        ctx.beginPath();
        ctx.ellipse(-12, -30, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(22, -30, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(5, -32);
        ctx.lineTo(15, -25);
        ctx.lineTo(5, -20);
        ctx.lineTo(-5, -25);
        ctx.closePath();
        ctx.fill();

        // Wings (animated)
        ctx.fillStyle = '#E8A317';
        ctx.save();
        ctx.translate(-40, 5);
        ctx.rotate(Math.sin(this.bounce * 3) * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 32, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(40, 5);
        ctx.rotate(-Math.sin(this.bounce * 3) * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 32, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Feet
        ctx.fillStyle = '#FF8C00';
        for (let s = -1; s <= 1; s += 2) {
            for (let t = -1; t <= 1; t++) {
                ctx.beginPath();
                ctx.ellipse(s * 18 + t * 6, 53, 4, 8, t * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();

        // ===== Title text =====
        ctx.save();
        ctx.translate(cx, cy - 170 + Math.sin(this.bounce * 1.5) * 5);
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#E8860C';
        ctx.lineWidth = 6;
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText('꼬꼬닭 알 낳기', 0, 0);
        ctx.fillText('꼬꼬닭 알 낳기', 0, 0);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#8B6914';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.strokeText('🥚 알 100개를 모아보자! 🐣', 0, 40);
        ctx.fillText('🥚 알 100개를 모아보자! 🐣', 0, 40);
        ctx.restore();

        // ===== Start button =====
        const bW = 240, bH = 75;
        const bX = cx - bW / 2;
        const bY = cy + 130;
        const bb = Math.sin(this.bounce * 2) * 3;

        ctx.save();
        ctx.translate(0, bb);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.roundRect(bX - 2, bY + 5, bW + 4, bH, 24);
        ctx.fill();

        // Button body
        const btnGrad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
        btnGrad.addColorStop(0, '#FF6B6B');
        btnGrad.addColorStop(1, '#EE4444');
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 24);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.roundRect(bX + 6, bY + 4, bW - 12, bH / 2 - 4, [18, 18, 6, 6]);
        ctx.fill();

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('시작하기! 🎮', cx, bY + bH / 2);

        ctx.restore();

        this._btn = { x: bX, y: bY + bb, w: bW, h: bH };
    }

    handleTap(x, y) {
        const b = this._btn;
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return 'start';
        }
        return null;
    }
}
