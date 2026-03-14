/**
 * Draw Elsa - blonde hair, pale skin, ice blue dress
 * Shared drawing function for all scenes
 */

// Draw Mom Elsa (upper body)
export function drawElsaMom(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Dress / body - ice blue
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dress shimmer
  ctx.fillStyle = '#81D4FA';
  ctx.beginPath();
  ctx.ellipse(-6, 22, 8, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Cape / shoulders
  ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.quadraticCurveTo(-30, 40, -18, 55);
  ctx.lineTo(-16, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, 10);
  ctx.quadraticCurveTo(30, 40, 18, 55);
  ctx.lineTo(16, 12);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#FFF0F0';
  ctx.fillRect(-4, 2, 8, 8);

  // Head - pale/white skin
  ctx.fillStyle = '#FFF0F0';
  ctx.beginPath();
  ctx.arc(0, -10, 18, 0, Math.PI * 2);
  ctx.fill();

  // Hair - platinum blonde, braided style
  ctx.fillStyle = '#F5E6A0';
  // Main hair top
  ctx.beginPath();
  ctx.arc(0, -10, 19, Math.PI * 0.75, Math.PI * 2.25);
  ctx.fill();
  // Bangs
  ctx.beginPath();
  ctx.ellipse(-6, -22, 10, 6, -0.2, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -23, 8, 5, 0.2, 0, Math.PI);
  ctx.fill();
  // Side hair
  ctx.fillStyle = '#EDD98A';
  ctx.beginPath();
  ctx.ellipse(-18, -4, 5, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -4, 5, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Braid (over left shoulder)
  ctx.fillStyle = '#F5E6A0';
  ctx.beginPath();
  ctx.ellipse(-20, 10, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-22, 22, 3.5, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-23, 33, 3, 6, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - large, ice blue
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(-6, -11, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -11, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#29B6F6';
  ctx.beginPath();
  ctx.arc(-6, -10, 3, 0, Math.PI * 2);
  ctx.arc(6, -10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0277BD';
  ctx.beginPath();
  ctx.arc(-6, -10, 1.5, 0, Math.PI * 2);
  ctx.arc(6, -10, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-5, -12, 1.2, 0, Math.PI * 2);
  ctx.arc(7, -12, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyelashes
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(-6, -11, 5, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(6, -11, 5, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Eyebrows
  ctx.strokeStyle = '#C8B060';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-6, -16, 6, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(6, -16, 6, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#E8C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -5, 2, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Lips - rosy
  ctx.fillStyle = '#E88B8B';
  ctx.beginPath();
  ctx.ellipse(0, -1, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F0A0A0';
  ctx.beginPath();
  ctx.ellipse(0, -1.5, 3.5, 1, 0, 0, Math.PI);
  ctx.fill();

  // Blush
  ctx.fillStyle = 'rgba(255, 150, 180, 0.2)';
  ctx.beginPath();
  ctx.ellipse(-10, -5, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -5, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crown/tiara
  ctx.fillStyle = '#B3E5FC';
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -26);
  ctx.lineTo(-6, -32);
  ctx.lineTo(-2, -28);
  ctx.lineTo(0, -34);
  ctx.lineTo(2, -28);
  ctx.lineTo(6, -32);
  ctx.lineTo(8, -26);
  ctx.fill();
  ctx.stroke();

  // Snowflake on dress
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
