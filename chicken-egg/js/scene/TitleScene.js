// Title Screen Scene - with difficulty selection and achievement trophy
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../Difficulty.js';
import { AchievementManager } from '../Achievement.js';

export class TitleScene {
    constructor() {
        this.bounce = 0;
        this._btn = null;
        this._diffBtns = [];
        this._trophyBtn = null;
        this.selectedDifficulty = 'normal';
        this.achievements = new AchievementManager();

        // Trophy overlay
        this.showTrophies = false;
        this._trophyCloseBtn = null;
        this._trophyScroll = 0;
    }

    update(dt) {
        this.bounce += dt;
    }

    draw(ctx, w, h, bg) {
        bg.draw(ctx, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // ===== Chicken character =====
        ctx.save();
        ctx.translate(cx, cy - 60 + Math.sin(this.bounce) * 10);
        ctx.scale(1.3, 1.3);

        ctx.fillStyle = '#FFCC66';
        ctx.beginPath();
        ctx.ellipse(0, 10, 50, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(5, 15, 30, 28, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFCC66';
        ctx.beginPath();
        ctx.ellipse(5, -35, 28, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FF4444';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.ellipse(5 + i * 10, -60, 8, 12, i * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(-5, -38, 6, Math.PI, 0, true); ctx.stroke();
        ctx.beginPath(); ctx.arc(15, -38, 6, Math.PI, 0, true); ctx.stroke();

        ctx.fillStyle = 'rgba(255,150,150,0.4)';
        ctx.beginPath(); ctx.ellipse(-12, -30, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(22, -30, 8, 5, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(5, -32); ctx.lineTo(15, -25); ctx.lineTo(5, -20); ctx.lineTo(-5, -25);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#E8A317';
        ctx.save(); ctx.translate(-40, 5); ctx.rotate(Math.sin(this.bounce * 3) * 0.2);
        ctx.beginPath(); ctx.ellipse(0, 0, 20, 32, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(40, 5); ctx.rotate(-Math.sin(this.bounce * 3) * 0.2);
        ctx.beginPath(); ctx.ellipse(0, 0, 20, 32, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        ctx.fillStyle = '#FF8C00';
        for (let s = -1; s <= 1; s += 2) {
            for (let t = -1; t <= 1; t++) {
                ctx.beginPath(); ctx.ellipse(s * 18 + t * 6, 53, 4, 8, t * 0.3, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();

        // ===== Title text =====
        const diff = DIFFICULTIES[this.selectedDifficulty];
        ctx.save();
        ctx.translate(cx, cy - 190 + Math.sin(this.bounce * 1.5) * 5);
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
        ctx.strokeText(`🥚 알 ${diff.targetEggs}개를 모아보자! 🐣`, 0, 40);
        ctx.fillText(`🥚 알 ${diff.targetEggs}개를 모아보자! 🐣`, 0, 40);
        ctx.restore();

        // ===== Difficulty selector =====
        const diffY = cy + 100;
        const diffBtnW = 90, diffBtnH = 42, diffGap = 12;
        const totalDiffW = DIFFICULTY_ORDER.length * diffBtnW + (DIFFICULTY_ORDER.length - 1) * diffGap;
        const diffStartX = cx - totalDiffW / 2;

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('난이도 선택', cx, diffY - 18);

        this._diffBtns = [];
        for (let i = 0; i < DIFFICULTY_ORDER.length; i++) {
            const key = DIFFICULTY_ORDER[i];
            const d = DIFFICULTIES[key];
            const bx = diffStartX + i * (diffBtnW + diffGap);
            const selected = key === this.selectedDifficulty;

            // Button bg
            ctx.save();
            if (selected) {
                ctx.shadowColor = d.color;
                ctx.shadowBlur = 12;
            }
            const grad = ctx.createLinearGradient(bx, diffY, bx, diffY + diffBtnH);
            if (selected) {
                grad.addColorStop(0, d.color);
                grad.addColorStop(1, d.color + 'CC');
            } else {
                grad.addColorStop(0, 'rgba(255,255,255,0.25)');
                grad.addColorStop(1, 'rgba(255,255,255,0.1)');
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(bx, diffY, diffBtnW, diffBtnH, 14);
            ctx.fill();

            if (selected) {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();

            // Label
            ctx.fillStyle = selected ? '#FFF' : 'rgba(255,255,255,0.7)';
            ctx.font = `bold ${selected ? 16 : 14}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${d.emoji} ${d.label}`, bx + diffBtnW / 2, diffY + diffBtnH / 2);

            this._diffBtns.push({ x: bx, y: diffY, w: diffBtnW, h: diffBtnH, key });
        }

        // ===== Start button =====
        const bW = 240, bH = 70;
        const bX = cx - bW / 2;
        const bY = diffY + diffBtnH + 24;
        const bb = Math.sin(this.bounce * 2) * 3;

        ctx.save();
        ctx.translate(0, bb);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.roundRect(bX - 2, bY + 5, bW + 4, bH, 24); ctx.fill();

        const btnGrad = ctx.createLinearGradient(bX, bY, bX, bY + bH);
        btnGrad.addColorStop(0, '#FF6B6B');
        btnGrad.addColorStop(1, '#EE4444');
        ctx.fillStyle = btnGrad;
        ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 24); ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.roundRect(bX + 6, bY + 4, bW - 12, bH / 2 - 4, [18, 18, 6, 6]); ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('시작하기! 🎮', cx, bY + bH / 2);
        ctx.restore();

        this._btn = { x: bX, y: bY + bb, w: bW, h: bH };

        // ===== Trophy button (bottom-right) =====
        const tSize = 48;
        const tX = w - tSize - 16;
        const tY = h - tSize - 16;
        const count = this.achievements.getUnlockedCount();
        const total = this.achievements.getTotalCount();

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.roundRect(tX, tY, tSize, tSize, 14); ctx.fill();

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆', tX + tSize / 2, tY + tSize / 2 - 2);

        // Badge count
        if (count > 0) {
            const bR = 10;
            ctx.fillStyle = '#FF4444';
            ctx.beginPath();
            ctx.arc(tX + tSize - 4, tY + 4, bR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(String(count), tX + tSize - 4, tY + 5);
        }
        ctx.restore();

        this._trophyBtn = { x: tX, y: tY, w: tSize, h: tSize };

        // ===== Trophy overlay =====
        if (this.showTrophies) {
            this._drawTrophyOverlay(ctx, w, h);
        }
    }

    _drawTrophyOverlay(ctx, w, h) {
        // Dim background
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);

        // Panel
        const pw = Math.min(500, w - 40);
        const ph = Math.min(500, h - 60);
        const px = (w - pw) / 2;
        const py = (h - ph) / 2;

        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 20); ctx.fill();

        // Header
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆 업적', w / 2, py + 35);

        const count = this.achievements.getUnlockedCount();
        const total = this.achievements.getTotalCount();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText(`${count} / ${total} 달성`, w / 2, py + 60);

        // Achievement list
        const all = this.achievements.getAll();
        const itemH = 52;
        const listY = py + 80;
        const listH = ph - 130;

        ctx.save();
        ctx.beginPath();
        ctx.rect(px + 10, listY, pw - 20, listH);
        ctx.clip();

        for (let i = 0; i < all.length; i++) {
            const a = all[i];
            const iy = listY + i * itemH + this._trophyScroll;

            if (iy + itemH < listY || iy > listY + listH) continue;

            // Row bg
            if (i % 2 === 0) {
                ctx.fillStyle = '#F8F8F8';
                ctx.fillRect(px + 15, iy, pw - 30, itemH - 4);
            }

            if (a.unlocked) {
                // Emoji
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(a.emoji, px + 25, iy + itemH / 2);

                // Name
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = '#333';
                ctx.fillText(a.name, px + 60, iy + 16);

                // Desc
                ctx.font = '13px sans-serif';
                ctx.fillStyle = '#888';
                ctx.fillText(a.desc, px + 60, iy + 36);
            } else {
                // Locked
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#CCC';
                ctx.fillText('🔒', px + 25, iy + itemH / 2);

                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = '#CCC';
                ctx.fillText('???', px + 60, iy + itemH / 2);
            }
        }
        ctx.restore();

        // Close button
        const cbSize = 36;
        const cbX = px + pw - cbSize - 8;
        const cbY = py + 8;

        ctx.fillStyle = '#EEE';
        ctx.beginPath(); ctx.roundRect(cbX, cbY, cbSize, cbSize, 10); ctx.fill();
        ctx.fillStyle = '#666';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', cbX + cbSize / 2, cbY + cbSize / 2);

        this._trophyCloseBtn = { x: cbX, y: cbY, w: cbSize, h: cbSize };

        ctx.restore();
    }

    handleTap(x, y) {
        // Trophy overlay open
        if (this.showTrophies) {
            const cb = this._trophyCloseBtn;
            if (cb && x >= cb.x && x <= cb.x + cb.w && y >= cb.y && y <= cb.y + cb.h) {
                this.showTrophies = false;
            }
            return null;
        }

        // Trophy button
        const tb = this._trophyBtn;
        if (tb && x >= tb.x && x <= tb.x + tb.w && y >= tb.y && y <= tb.y + tb.h) {
            this.showTrophies = true;
            this._trophyScroll = 0;
            return null;
        }

        // Difficulty buttons
        for (const db of this._diffBtns) {
            if (x >= db.x && x <= db.x + db.w && y >= db.y && y <= db.y + db.h) {
                this.selectedDifficulty = db.key;
                return null;
            }
        }

        // Start button
        const b = this._btn;
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return 'start';
        }
        return null;
    }
}
