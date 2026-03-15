// Game Over Scene - shown when HP reaches 0
import { DIFFICULTIES } from '../Difficulty.js';

export class GameOverScene {
    constructor(canvasWidth, canvasHeight, stats) {
        this.timer = 0;
        this.stats = stats || {};
        this._restartBtn = null;
        this._shakePhase = 0;

        // Improvement 5: Score data
        this.score = stats.score || 0;
    }

    update(dt) {
        this.timer += dt;
        this._shakePhase += dt * 8;
    }

    draw(ctx, w, h, bg) {
        bg.draw(ctx, w, h);

        // Dark overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Sad chicken in center
        this._drawSadChicken(ctx, w / 2, h * 0.4);

        // Floating broken hearts
        const heartCount = Math.min(15, Math.floor(this.timer * 3));
        for (let i = 0; i < heartCount; i++) {
            const hx = w / 2 + Math.sin(i * 1.7 + this.timer * 0.5) * 120;
            const hy = h * 0.3 - (this.timer * 15 + i * 20) % (h * 0.4);
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(i + this.timer) * 0.2;
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💔', hx, hy);
            ctx.restore();
        }

        // Title and stats box
        const titleAlpha = Math.min(1, this.timer / 1.5);
        ctx.save();
        ctx.globalAlpha = titleAlpha;

        const hasDiff = !!this.stats.difficulty;
        // Extra height for score display
        const boxH = 260 + (hasDiff ? 28 : 0);
        const boxY = 40;

        ctx.fillStyle = 'rgba(80,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 220, boxY, 440, boxH, 25);
        ctx.fill();

        // Red border
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('게임 오버!', w / 2, boxY + 40);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('엄마닭이 지쳐버렸어... 😢', w / 2, boxY + 80);

        // Stats
        ctx.font = 'bold 18px sans-serif';
        let statY = boxY + 115;

        if (this.stats.basketEggs !== undefined) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`🥚 모은 알: ${this.stats.basketEggs}개`, w / 2, statY);
            statY += 28;
        }

        if (this.stats.goldenEggs !== undefined && this.stats.goldenEggs > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`⭐ 황금알: ${this.stats.goldenEggs}개`, w / 2, statY);
            statY += 28;
        }

        if (this.stats.predatorsScared !== undefined && this.stats.predatorsScared > 0) {
            ctx.fillStyle = '#81D4FA';
            ctx.fillText(`💪 쫓아낸 천적: ${this.stats.predatorsScared}마리`, w / 2, statY);
            statY += 28;
        }

        if (this.stats.chicksLost !== undefined && this.stats.chicksLost > 0) {
            ctx.fillStyle = '#FF8A80';
            ctx.fillText(`🐣 잃은 병아리: ${this.stats.chicksLost}마리`, w / 2, statY);
            statY += 28;
        }

        if (this.stats.difficulty) {
            const d = DIFFICULTIES[this.stats.difficulty];
            if (d) {
                ctx.fillStyle = '#FFF';
                ctx.fillText(`난이도: ${d.emoji} ${d.label}`, w / 2, statY);
                statY += 28;
            }
        }

        // Improvement 5: Score display (no stars since didn't win)
        statY += 5;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`점수: ${this.score}`, w / 2, statY);

        ctx.globalAlpha = 1;
        ctx.restore();

        // Buttons (after 2 seconds)
        if (this.timer > 2) {
            const bW = 220, bH = 65;
            const bX = w / 2 - bW / 2;
            const bY = h - 180;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.roundRect(bX - 2, bY + 4, bW + 4, bH, 20);
            ctx.fill();

            // Button gradient
            const grad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
            grad.addColorStop(0, '#FF7043');
            grad.addColorStop(1, '#E64A19');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(bX, bY, bW, bH, 20);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.roundRect(bX + 5, bY + 3, bW - 10, bH / 2 - 3, [15, 15, 5, 5]);
            ctx.fill();

            // Pulse effect
            const pulse = 1 + Math.sin(this._shakePhase) * 0.03;
            ctx.save();
            ctx.translate(w / 2, bY + bH / 2);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('다시하기! 🔄', 0, 0);
            ctx.restore();

            this._restartBtn = { x: bX, y: bY, w: bW, h: bH };

            // "다른 게임하기" button
            const hY = bY + bH + 14;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.roundRect(bX, hY, bW, bH - 10, 20);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏠 다른 게임하기', w / 2, hY + (bH - 10) / 2);

            this._homeBtn = { x: bX, y: hY, w: bW, h: bH - 10 };
        }
    }

    handleTap(x, y) {
        const b = this._restartBtn;
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return 'restart';
        }
        const hb = this._homeBtn;
        if (hb && x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
            return 'home';
        }
        return null;
    }

    _drawSadChicken(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Body
        ctx.fillStyle = '#FFCC66';
        ctx.beginPath();
        ctx.ellipse(0, 10, 40, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -25, 22, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Comb (droopy)
        ctx.fillStyle = '#CC3333';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.ellipse(i * 8, -46, 6, 9, i * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sad eyes (downward arcs)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-8, -28, 5, 0, Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -28, 5, 0, Math.PI, false);
        ctx.stroke();

        // Tear drops
        ctx.fillStyle = 'rgba(100,180,255,0.7)';
        const tearOff = Math.sin(this._shakePhase * 0.5) * 2;
        ctx.beginPath();
        ctx.ellipse(-10, -18 + tearOff, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, -20 + tearOff, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sad beak (frown)
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(-4, -20);
        ctx.lineTo(4, -20);
        ctx.lineTo(0, -15);
        ctx.closePath();
        ctx.fill();

        // Droopy wings
        ctx.fillStyle = '#E8A317';
        ctx.save();
        ctx.translate(-35, 10);
        ctx.rotate(0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 28, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(35, 10);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 28, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}
