/**
 * Title scene - 보리랑 팝콘 만들기
 */
import { drawBori } from '../draw-bori.js';
import { drawMachine, drawPopcorn } from '../draw-machine.js';
import { RAINBOW } from '../config.js';

export class TitleScene {
  constructor() {
    this.phase = 0;
    // Floating decorative popcorn
    this.floaters = [];
    for (let i = 0; i < 14; i++) {
      this.floaters.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.04 + Math.random() * 0.05,
        size: 14 + Math.random() * 10,
        color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
        rotSpeed: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI * 2,
      });
    }
  }

  handleTap(x, y, w, h) {
    const btnW = Math.min(280, w * 0.7);
    const btnH = 70;
    const btnX = (w - btnW) / 2;
    const btnY = h * 0.78;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      return 'start';
    }
    return null;
  }

  update(dt) {
    this.phase += dt;
    for (const f of this.floaters) {
      f.y -= f.speed * dt;
      f.rot += f.rotSpeed * dt;
      if (f.y < -0.05) {
        f.y = 1.05;
        f.x = Math.random();
      }
    }
  }

  draw(ctx, w, h) {
    // Background - warm cinema gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3a1f0a');
    g.addColorStop(0.4, '#7a3a14');
    g.addColorStop(0.8, '#C9582E');
    g.addColorStop(1, '#FFD93D');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft polka dots backdrop
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 30; i++) {
      const dx = (i * 73 + this.phase * 10) % w;
      const dy = (i * 137 + this.phase * 6) % h;
      ctx.beginPath();
      ctx.arc(dx, dy, 8 + (i % 4) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Floating popcorn
    for (const f of this.floaters) {
      const px = f.x * w;
      const py = f.y * h;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(f.rot);
      drawPopcorn(ctx, 0, 0, f.size, f.color, f.color);
      ctx.restore();
    }

    // Machine in middle-back
    const machineW = Math.min(180, w * 0.45);
    const machineH = machineW * 1.3;
    drawMachine(ctx, w * 0.30, h * 0.5, machineW, machineH, {
      cornCount: 0.6,
      flavorColor: '#FFD93D',
      cooking: true,
      shake: this.phase * 0.5,
    });

    // Bori on the right, looking at the machine
    const boriScale = Math.min(1.0, w / 500);
    const boriBob = Math.sin(this.phase * 1.5) * 4;
    drawBori(ctx, w * 0.72, h * 0.55 + boriBob, boriScale, {
      mouthOpen: Math.floor(this.phase * 1.5) % 2 === 0,
      happy: true,
      phase: this.phase,
    });

    // Title
    ctx.save();
    ctx.font = `Bold ${Math.min(40, w * 0.09)}px "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#FFF';
    ctx.fillText('🍿 보리랑 팝콘 만들기 🍿', w / 2, h * 0.16);
    ctx.shadowBlur = 0;

    ctx.font = `${Math.min(17, w * 0.045)}px "Apple SD Gothic Neo", sans-serif`;
    ctx.fillStyle = '#FFEFC2';
    ctx.fillText('재료를 넣고 기계를 돌려요!', w / 2, h * 0.24);
    ctx.fillText('맛에 따라 알록달록 색이 변해요 🌈', w / 2, h * 0.28);
    ctx.restore();

    // Start button
    const btnW = Math.min(280, w * 0.7);
    const btnH = 70;
    const btnX = (w - btnW) / 2;
    const btnY = h * 0.78;
    const pulse = 1 + Math.sin(this.phase * 4) * 0.03;

    ctx.save();
    ctx.translate(w / 2, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-w / 2, -(btnY + btnH / 2));

    const bg = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
    bg.addColorStop(0, '#FFD93D');
    bg.addColorStop(1, '#FF8C00');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 24);
    ctx.fill();

    ctx.strokeStyle = '#7A3A0A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = '#FFD93D';
    ctx.shadowBlur = 18;
    ctx.font = `Bold ${Math.min(26, w * 0.07)}px "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5A2A0A';
    ctx.fillText('▶ 시작하기 🍿', w / 2, btnY + btnH / 2);
    ctx.restore();

    // Footer
    ctx.font = `${Math.min(13, w * 0.034)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('1. 옥수수  →  2. 맛 고르기  →  3. 기계 돌리기!', w / 2, h * 0.91);
  }
}
