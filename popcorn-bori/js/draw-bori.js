/**
 * Bori - 검은 차우차우. 큰 사이즈로 그릴 수 있게 scale 인자 받음.
 * 입을 벌리고 닫는 두 가지 표정 + 행복 표정 지원.
 */

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} scale - 1 = ~150px tall
 * @param {object} opts - { mouthOpen: bool, happy: bool, phase: number }
 */
export function drawBori(ctx, cx, cy, scale = 1, opts = {}) {
  const { mouthOpen = false, happy = false, phase = 0 } = opts;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Shadow
  ellipse(ctx, 0, 60, 70, 12, 'rgba(0,0,0,0.2)');

  // Tail (wagging when happy)
  ctx.save();
  const tailWag = happy ? Math.sin(phase * 8) * 0.5 : Math.sin(phase * 1.5) * 0.15;
  ctx.translate(-55, -10);
  ctx.rotate(tailWag);
  ellipse(ctx, -10, -10, 22, 18, '#1a1a1a');
  ellipse(ctx, -8, -12, 16, 14, '#2a2a2a');
  ellipse(ctx, -6, -14, 10, 9, '#0d0d0d');
  ctx.restore();

  // Body (rounder, fluffy chow chow)
  ctx.beginPath();
  ctx.ellipse(0, 5, 60, 50, 0, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(-10, -10, 8, 0, 5, 60);
  bg.addColorStop(0, '#3a3a3a');
  bg.addColorStop(0.5, '#1f1f1f');
  bg.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bg;
  ctx.fill();

  // Belly fluff
  ellipse(ctx, 5, 18, 38, 30, '#2a2a2a');
  ellipse(ctx, 8, 24, 28, 22, '#1a1a1a');

  // Legs
  for (let s = -1; s <= 1; s += 2) {
    ellipse(ctx, s * 24, 42, 16, 16, '#0d0d0d');
    ellipse(ctx, s * 24, 48, 18, 10, '#1a1a1a');
    // Paw pads
    ellipse(ctx, s * 24, 50, 6, 4, '#444');
  }

  // Mane / fluffy collar around head
  ellipse(ctx, 0, -22, 52, 36, '#1a1a1a');
  // Mane bumps for fluff
  for (let i = -3; i <= 3; i++) {
    const a = (i / 3) * 1.4 + Math.PI;
    const r = 48;
    ellipse(ctx, Math.cos(a) * r, -22 + Math.sin(a) * r * 0.6, 14, 12, '#0d0d0d');
  }
  ellipse(ctx, 0, -22, 44, 30, '#222');

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -28, 38, 35, 0, 0, Math.PI * 2);
  const hg = ctx.createRadialGradient(-8, -38, 4, 0, -28, 40);
  hg.addColorStop(0, '#3a3a3a');
  hg.addColorStop(1, '#0e0e0e');
  ctx.fillStyle = hg;
  ctx.fill();

  // Ears (chow chow's small triangle ears)
  for (let s = -1; s <= 1; s += 2) {
    ctx.save();
    ctx.translate(s * 28, -52);
    ctx.rotate(s * 0.3);
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(0, -12);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    // Inner ear
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(0, -6);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fillStyle = '#5a3a3a';
    ctx.fill();
    ctx.restore();
  }

  // Eyes
  for (let s = -1; s <= 1; s += 2) {
    const ex = s * 13, ey = -32;
    if (happy) {
      // Happy curved eyes
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, ey, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ellipse(ctx, ex, ey, 6, 7, '#FFFFFF');
      ellipse(ctx, ex + s * 1.5, ey + 1, 4, 5, '#1a0a00');
      ellipse(ctx, ex + s * 0.5, ey - 2, 1.8, 1.8, '#FFF');
    }
  }

  // Eyebrows (slight curve makes him cute)
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.moveTo(s * 18, -42);
    ctx.quadraticCurveTo(s * 13, -44, s * 8, -42);
    ctx.stroke();
  }

  // Muzzle / nose area
  ellipse(ctx, 0, -16, 16, 12, '#2a2a2a');
  // Nose
  ellipse(ctx, 0, -20, 6, 4.5, '#1a1a1a');
  ellipse(ctx, -1.5, -22, 2, 1.2, 'rgba(255,255,255,0.5)');

  // Mouth
  if (mouthOpen) {
    // Open mouth (tongue out, ready to eat popcorn)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -10, 10, 7, 0, 0, Math.PI);
    ctx.fill();
    // Tongue
    ctx.fillStyle = '#FF6B7A';
    ctx.beginPath();
    ctx.ellipse(0, -7, 7, 5, 0, 0, Math.PI);
    ctx.fill();
    // Tongue line
    ctx.strokeStyle = '#D04050';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, -3);
    ctx.stroke();
  } else if (happy) {
    // Smile
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-4, -12, 4, 0, Math.PI * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, -12, 4, Math.PI * 0.4, Math.PI);
    ctx.stroke();
  } else {
    // Closed neutral mouth
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, -12);
    ctx.lineTo(0, -10);
    ctx.lineTo(5, -12);
    ctx.stroke();
  }

  // Cheeks
  if (happy) {
    ctx.fillStyle = 'rgba(255,150,150,0.35)';
    ellipse(ctx, -22, -20, 6, 4, 'rgba(255,150,150,0.35)');
    ellipse(ctx, 22, -20, 6, 4, 'rgba(255,150,150,0.35)');
  }

  ctx.restore();
}
