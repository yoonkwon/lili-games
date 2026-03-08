// Ending Scene - Mother chicken + 100 chicks happy ending
export class EndingScene {
    constructor(canvasWidth, canvasHeight, stats) {
        this.timer = 0;
        this.chicks = [];
        this._restartBtn = null;
        this.stats = stats || {};

        const cx = canvasWidth / 2;
        const cy = canvasHeight * 0.65;
        const colors = [
            '#FFE44D', '#FFD700', '#FFC125', '#FFAA00', '#FFB347',
            '#FF8C69', '#DDA0DD', '#98FB98', '#87CEEB', '#FFB6C1'
        ];

        for (let i = 0; i < 100; i++) {
            const ring = Math.floor(i / 12);
            const angleOff = (i % 12) * (Math.PI * 2 / 12) + ring * 0.3;
            const radius = 80 + ring * 45;
            this.chicks.push({
                x: cx + Math.cos(angleOff) * radius + (Math.random() - 0.5) * 20,
                y: cy - 15 + Math.sin(angleOff) * radius * 0.4 + (Math.random() - 0.5) * 10,
                color: colors[i % colors.length],
                s: 0.35 + Math.random() * 0.2,
                facing: Math.random() > 0.5 ? 1 : -1,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    update(dt) {
        this.timer += dt;
    }

    draw(ctx, w, h, bg) {
        bg.draw(ctx, w, h);
        const gY = h * 0.65;

        // Mother chicken in center
        this._drawMotherChicken(ctx, w / 2, gY - 20);

        // Chicks appearing over time (15 per second)
        const chickCount = Math.min(100, Math.floor(this.timer * 15));
        for (let i = 0; i < chickCount; i++) {
            this._drawMiniChick(ctx, this.chicks[i], this.timer);
        }

        // Floating hearts
        const heartCount = Math.floor(this.timer * 3);
        for (let i = 0; i < Math.min(heartCount, 30); i++) {
            const hx = w / 2 + Math.sin(i * 1.3 + this.timer) * 150;
            const hy = gY - 80 - (this.timer * 20 + i * 15) % gY;
            ctx.globalAlpha = 0.3 + Math.sin(i + this.timer) * 0.3;
            ctx.fillStyle = ['#FF6B9D', '#FF4444', '#FFB6C1'][i % 3];
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', hx, hy);
        }
        ctx.globalAlpha = 1;

        // Title overlay
        const titleAlpha = Math.min(1, this.timer / 2);
        ctx.globalAlpha = titleAlpha;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        const hasStats = this.stats.goldenEggs !== undefined || this.stats.totalEggs !== undefined;
        const hasPredStats = this.stats.predatorsScared !== undefined && this.stats.predatorsScared > 0;
        const boxH = hasStats ? (hasPredStats ? 210 : 185) : 120;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 220, 40, 440, boxH, 25);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎉 축하해! 🎉', w / 2, 75);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`엄마닭과 병아리 ${chickCount}마리가`, w / 2, 110);
        ctx.fillText('행복하게 살았답니다! 🐔❤️🐣', w / 2, 140);

        // Stats display
        if (this.stats.goldenEggs !== undefined || this.stats.totalEggs !== undefined) {
            ctx.font = 'bold 20px sans-serif';
            if (this.stats.totalEggs !== undefined) {
                ctx.fillText(`총 알: ${this.stats.totalEggs}개`, w / 2, 175);
            }
            if (this.stats.goldenEggs !== undefined) {
                ctx.fillText(`황금알: ${this.stats.goldenEggs}개 ⭐`, w / 2, 200);
            }
            if (this.stats.predatorsScared !== undefined && this.stats.predatorsScared > 0) {
                ctx.fillText(`쫓아낸 천적: ${this.stats.predatorsScared}마리 💪`, w / 2, 225);
            }
        }
        ctx.globalAlpha = 1;

        // Restart button (after 5 seconds)
        if (this.timer > 5) {
            const bW = 220, bH = 65;
            const bX = w / 2 - bW / 2;
            const bY = h - 110;

            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.roundRect(bX - 2, bY + 4, bW + 4, bH, 20);
            ctx.fill();

            const grad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
            grad.addColorStop(0, '#4CAF50');
            grad.addColorStop(1, '#388E3C');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(bX, bY, bW, bH, 20);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.roundRect(bX + 5, bY + 3, bW - 10, bH / 2 - 3, [15, 15, 5, 5]);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('다시 하기! 🔄', w / 2, bY + bH / 2);

            this._restartBtn = { x: bX, y: bY, w: bW, h: bH };
        }
    }

    handleTap(x, y) {
        const b = this._restartBtn;
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return 'restart';
        }
        return null;
    }

    _drawMotherChicken(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1.2, 1.2);

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

        // Happy closed eyes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-5, -38, 6, Math.PI, 0, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(15, -38, 6, Math.PI, 0, true);
        ctx.stroke();

        // Blush
        ctx.fillStyle = 'rgba(255,150,150,0.5)';
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

        // Wings spread wide (hugging)
        ctx.fillStyle = '#E8A317';
        ctx.save();
        ctx.translate(-45, 5);
        ctx.rotate(-0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 38, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(45, 5);
        ctx.rotate(0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 38, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    _drawMiniChick(ctx, chick, timer) {
        if (!chick) return;
        const bob = Math.sin(timer * 5 + chick.phase) * 2;

        ctx.save();
        ctx.translate(chick.x, chick.y);
        ctx.scale(chick.s * chick.facing, chick.s);

        // Body
        ctx.fillStyle = chick.color;
        ctx.beginPath();
        ctx.ellipse(0, 5 + bob, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.ellipse(0, -8 + bob, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fluff
        ctx.beginPath();
        ctx.ellipse(0, -18 + bob, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-4, -10 + bob, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -10 + bob, 2, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlights
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-3, -11 + bob, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -11 + bob, 0.8, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(-2, -5 + bob);
        ctx.lineTo(3, -3 + bob);
        ctx.lineTo(-2, -1 + bob);
        ctx.closePath();
        ctx.fill();
        // Blush
        ctx.fillStyle = 'rgba(255,150,150,0.4)';
        ctx.beginPath();
        ctx.ellipse(-8, -4 + bob, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -4 + bob, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
