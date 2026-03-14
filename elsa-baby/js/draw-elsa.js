/**
 * Draw Elsa - blonde hair, pale skin, ice blue dress
 * More Disney-accurate character rendering
 */

// Draw Mom Elsa (upper body) - Disney Frozen style
export function drawElsaMom(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // === Dress / Body - ice blue with crystalline details ===
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dress shimmer highlights
  ctx.fillStyle = '#81D4FA';
  ctx.beginPath();
  ctx.ellipse(-6, 20, 8, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(179,229,252,0.4)';
  ctx.beginPath();
  ctx.ellipse(8, 26, 5, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Snowflake pattern on dress
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(-4, 32, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, 40, 4, 0, Math.PI * 2);
  ctx.fill();

  // Cape / transparent sleeves
  ctx.fillStyle = 'rgba(79, 195, 247, 0.35)';
  ctx.beginPath();
  ctx.moveTo(-22, 8);
  ctx.quadraticCurveTo(-32, 35, -20, 55);
  ctx.lineTo(-16, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, 8);
  ctx.quadraticCurveTo(32, 35, 20, 55);
  ctx.lineTo(16, 12);
  ctx.fill();

  // === Neck ===
  ctx.fillStyle = '#FFF0F0';
  ctx.fillRect(-5, 1, 10, 9);

  // Neckline V-shape
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(0, 14);
  ctx.lineTo(8, 8);
  ctx.lineTo(10, 10);
  ctx.lineTo(0, 17);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fill();

  // === Head - pale porcelain skin ===
  ctx.fillStyle = '#FFF0F0';
  ctx.beginPath();
  ctx.ellipse(0, -12, 17, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw contour (slightly pointed chin like Disney Elsa)
  ctx.fillStyle = '#FFF0F0';
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.quadraticCurveTo(-10, 6, 0, 9);
  ctx.quadraticCurveTo(10, 6, 12, -4);
  ctx.fill();

  // === Hair - platinum blonde, swept-back with braid ===
  // Main hair volume (top and back)
  ctx.fillStyle = '#F5E6A0';
  ctx.beginPath();
  ctx.ellipse(0, -16, 19, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair swept back (Elsa's signature style)
  ctx.fillStyle = '#EDD98A';
  ctx.beginPath();
  ctx.moveTo(-16, -14);
  ctx.quadraticCurveTo(-18, -28, -4, -30);
  ctx.quadraticCurveTo(6, -32, 16, -26);
  ctx.quadraticCurveTo(20, -18, 18, -12);
  ctx.lineTo(16, -8);
  ctx.quadraticCurveTo(8, -20, 0, -22);
  ctx.quadraticCurveTo(-8, -20, -14, -10);
  ctx.closePath();
  ctx.fill();

  // Bangs - side-swept like Frozen Elsa
  ctx.fillStyle = '#F5E6A0';
  ctx.beginPath();
  ctx.moveTo(-14, -16);
  ctx.quadraticCurveTo(-8, -22, 2, -24);
  ctx.quadraticCurveTo(10, -26, 16, -20);
  ctx.quadraticCurveTo(12, -14, 6, -14);
  ctx.quadraticCurveTo(0, -16, -4, -12);
  ctx.quadraticCurveTo(-10, -10, -16, -12);
  ctx.closePath();
  ctx.fill();

  // Side hair strands
  ctx.fillStyle = '#EDD98A';
  ctx.beginPath();
  ctx.ellipse(-17, -2, 4, 14, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Braid over left shoulder (Elsa signature)
  ctx.fillStyle = '#F5E6A0';
  // Braid segments
  const braidX = -19;
  for (let i = 0; i < 5; i++) {
    const by = 6 + i * 9;
    const bx = braidX - i * 0.5;
    const r = 4 - i * 0.3;
    ctx.beginPath();
    ctx.ellipse(bx, by, r, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Braid cross pattern
    ctx.fillStyle = '#EDD98A';
    ctx.beginPath();
    ctx.ellipse(bx + 1.5, by + 2, r * 0.6, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F5E6A0';
  }
  // Braid tie
  ctx.fillStyle = '#B3E5FC';
  ctx.beginPath();
  ctx.arc(braidX - 2.5, 50, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // === Eyes - large, Disney-style with detailed iris ===
  // Eye whites (larger, more almond-shaped)
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(-6, -12, 5.5, 6, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -12, 5.5, 6, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Iris - ice blue gradient effect
  ctx.fillStyle = '#4FC3F7';
  ctx.beginPath();
  ctx.arc(-6, -11, 3.8, 0, Math.PI * 2);
  ctx.arc(6, -11, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Iris inner ring
  ctx.fillStyle = '#29B6F6';
  ctx.beginPath();
  ctx.arc(-6, -11, 2.8, 0, Math.PI * 2);
  ctx.arc(6, -11, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#0D47A1';
  ctx.beginPath();
  ctx.arc(-6, -11, 1.8, 0, Math.PI * 2);
  ctx.arc(6, -11, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine (two highlights per eye - Disney style)
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-4.5, -13, 1.5, 0, Math.PI * 2);
  ctx.arc(7.5, -13, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-7, -9.5, 0.8, 0, Math.PI * 2);
  ctx.arc(5, -9.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Upper eyelid line (thick, defined like Disney)
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-6, -12, 5.5, 6, -0.05, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(6, -12, 5.5, 6, 0.05, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // Eyelashes (longer, more dramatic)
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 1.2;
  // Left eye lashes
  ctx.beginPath();
  ctx.moveTo(-11, -14); ctx.lineTo(-12.5, -16);
  ctx.moveTo(-9, -16); ctx.lineTo(-10, -18.5);
  ctx.moveTo(-6, -17.5); ctx.lineTo(-6, -19.5);
  ctx.stroke();
  // Right eye lashes
  ctx.beginPath();
  ctx.moveTo(11, -14); ctx.lineTo(12.5, -16);
  ctx.moveTo(9, -16); ctx.lineTo(10, -18.5);
  ctx.moveTo(6, -17.5); ctx.lineTo(6, -19.5);
  ctx.stroke();

  // Eyebrows - arched, elegant
  ctx.strokeStyle = '#C8B060';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -19);
  ctx.quadraticCurveTo(-6, -22, -2, -19.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, -19);
  ctx.quadraticCurveTo(6, -22, 2, -19.5);
  ctx.stroke();

  // === Nose - small, delicate Disney nose ===
  ctx.strokeStyle = '#E8C0C0';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -6);
  ctx.quadraticCurveTo(0, -3, 1, -4);
  ctx.stroke();

  // === Lips - rosy, Disney-style ===
  // Upper lip
  ctx.fillStyle = '#E07070';
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.quadraticCurveTo(-2, -2.5, 0, -1.5);
  ctx.quadraticCurveTo(2, -2.5, 4, -1);
  ctx.quadraticCurveTo(2, 0.5, 0, 1);
  ctx.quadraticCurveTo(-2, 0.5, -4, -1);
  ctx.closePath();
  ctx.fill();
  // Lower lip
  ctx.fillStyle = '#E88B8B';
  ctx.beginPath();
  ctx.moveTo(-3.5, -0.5);
  ctx.quadraticCurveTo(0, 3, 3.5, -0.5);
  ctx.quadraticCurveTo(0, 1.5, -3.5, -0.5);
  ctx.fill();
  // Lip shine
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, -1, 1.5, 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === Blush ===
  ctx.fillStyle = 'rgba(255, 150, 180, 0.2)';
  ctx.beginPath();
  ctx.ellipse(-10, -6, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -6, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // === Crown/tiara - ice crystal tiara ===
  ctx.fillStyle = '#B3E5FC';
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-10, -26);
  ctx.lineTo(-7, -30);
  ctx.lineTo(-4, -27);
  ctx.lineTo(-2, -33);
  ctx.lineTo(0, -36);
  ctx.lineTo(2, -33);
  ctx.lineTo(4, -27);
  ctx.lineTo(7, -30);
  ctx.lineTo(10, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Tiara gem
  ctx.fillStyle = '#E1F5FE';
  ctx.beginPath();
  ctx.arc(0, -31, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath();
  ctx.arc(0, -31, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Snowflake detail on dress
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('❄️', 0, 35);

  ctx.restore();
}

// Draw baby Elsa (in belly)
export function drawBabyElsa(ctx, x, y, size, emotion, phase, growthRatio) {
  ctx.save();
  ctx.translate(x, y);

  // Baby body - very pale skin
  ctx.fillStyle = '#FFF5F5';
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks - rosy
  ctx.fillStyle = 'rgba(255, 182, 193, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-size * 0.4, size * 0.15, size * 0.18, size * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.4, size * 0.15, size * 0.18, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeY = -size * 0.1;
  const eyeSpread = size * 0.25;
  if (emotion === 'happy') {
    ctx.strokeStyle = '#29B6F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-eyeSpread, eyeY, size * 0.1, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeSpread, eyeY, size * 0.1, Math.PI, 0);
    ctx.stroke();
  } else if (emotion === 'angry') {
    // Ice blue glowing eyes
    ctx.fillStyle = '#4fc3f7';
    ctx.shadowColor = '#4fc3f7';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-eyeSpread, eyeY, size * 0.1, 0, Math.PI * 2);
    ctx.arc(eyeSpread, eyeY, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Normal - ice blue eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-eyeSpread, eyeY, size * 0.1, size * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeSpread, eyeY, size * 0.1, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#29B6F6';
    ctx.beginPath();
    ctx.arc(-eyeSpread, eyeY, size * 0.06, 0, Math.PI * 2);
    ctx.arc(eyeSpread, eyeY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0277BD';
    ctx.beginPath();
    ctx.arc(-eyeSpread, eyeY, size * 0.03, 0, Math.PI * 2);
    ctx.arc(eyeSpread, eyeY, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-eyeSpread + 1, eyeY - 1, size * 0.02, 0, Math.PI * 2);
    ctx.arc(eyeSpread + 1, eyeY - 1, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  const mouthY = size * 0.22;
  if (emotion === 'happy') {
    ctx.fillStyle = '#F0A0A0';
    ctx.beginPath();
    ctx.arc(0, mouthY, size * 0.1, 0, Math.PI);
    ctx.fill();
  } else if (emotion === 'sad' || emotion === 'angry') {
    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, mouthY + size * 0.08, size * 0.08, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#F0A0A0';
    ctx.beginPath();
    ctx.arc(0, mouthY, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair - platinum blonde tuft (grows with baby)
  if (growthRatio > 0.15) {
    const hairSize = Math.min(1, (growthRatio - 0.15) * 2);
    ctx.fillStyle = '#F5E6A0';
    // Top tuft
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.88, size * 0.22 * hairSize, size * 0.18 * hairSize, 0, Math.PI, 0);
    ctx.fill();
    // Side wisps
    if (growthRatio > 0.5) {
      ctx.beginPath();
      ctx.ellipse(-size * 0.4, -size * 0.6, size * 0.08, size * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size * 0.4, -size * 0.6, size * 0.08, size * 0.15, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tiny snowflake near baby when bigger
  if (growthRatio > 0.6) {
    const sparkAlpha = 0.3 + Math.sin(phase * 3) * 0.2;
    ctx.globalAlpha = sparkAlpha;
    ctx.font = `${size * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('❄️', size * 0.7, -size * 0.5);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
