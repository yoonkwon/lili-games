/**
 * Background rendering module for the chicken egg-laying game.
 * Draws sky, sun, clouds, ground, grass, flowers, and fence.
 * Designed for children aged 5-6: bright, cheerful, pastel tones.
 */

export class Background {
  constructor() {
    // Initialize 5 clouds with random properties
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * 1500,
        y: 20 + Math.random() * 200,
        w: 80 + Math.random() * 120,
        speed: 10 + Math.random() * 20,
      });
    }

    // Initialize 12 flowers with random properties
    const flowerColors = ['#FF6B9D', '#FFD93D', '#FF8E53', '#C084FC', '#FB7185'];
    this.flowers = [];
    for (let i = 0; i < 12; i++) {
      this.flowers.push({
        x: Math.random() * 1500,
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        size: 6 + Math.random() * 8,
        sway: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Returns the Y coordinate of the ground line.
   * @param {number} canvasHeight
   * @returns {number}
   */
  getGroundY(canvasHeight) {
    return canvasHeight * 0.65;
  }

  /**
   * Move clouds from left to right, wrapping around when they exit.
   * @param {number} dt - delta time in seconds
   * @param {number} canvasWidth
   */
  update(dt, canvasWidth) {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt;
      // Wrap around: when cloud moves fully off the right edge, reappear on the left
      if (cloud.x - cloud.w > canvasWidth) {
        cloud.x = -cloud.w;
        cloud.y = 20 + Math.random() * 200;
      }
    }
  }

  /**
   * Draw the full background scene in layer order.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {Object} [theme] - optional stage theme colors
   */
  draw(ctx, canvasWidth, canvasHeight, theme) {
    const groundY = this.getGroundY(canvasHeight);

    this._drawSky(ctx, canvasWidth, canvasHeight, groundY, theme);
    this._drawSun(ctx, canvasWidth);
    this._drawClouds(ctx);
    this._drawGround(ctx, canvasWidth, canvasHeight, groundY, theme);
    this._drawGrassTufts(ctx, canvasWidth, groundY);
    this._drawFlowers(ctx, canvasWidth, groundY);
    this._drawFence(ctx, canvasWidth, groundY);

    // Stage-specific decorations
    if (theme) {
      this._drawStageDecorations(ctx, canvasWidth, groundY, theme);
    }
  }

  // ── Sky ──────────────────────────────────────────────────────────

  _drawSky(ctx, canvasWidth, canvasHeight, groundY, theme) {
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, theme ? theme.skyTop : '#87CEEB');
    grad.addColorStop(0.65, theme ? theme.skyMid : '#B0E0FF');
    grad.addColorStop(1, theme ? theme.skyBot : '#E0F0FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, groundY);
  }

  // ── Sun ──────────────────────────────────────────────────────────

  _drawSun(ctx, canvasWidth) {
    const sunX = canvasWidth - 100;
    const sunY = 90;
    const sunRadius = 45;

    // Outer glow ring
    const glowGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 2.2);
    glowGrad.addColorStop(0, 'rgba(255, 228, 77, 0.45)');
    glowGrad.addColorStop(0.5, 'rgba(255, 228, 77, 0.15)');
    glowGrad.addColorStop(1, 'rgba(255, 228, 77, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    const bodyGrad = ctx.createRadialGradient(sunX - 8, sunY - 8, 0, sunX, sunY, sunRadius);
    bodyGrad.addColorStop(0, '#FFF7AA');
    bodyGrad.addColorStop(0.7, '#FFE44D');
    bodyGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Clouds ───────────────────────────────────────────────────────

  _drawClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (const cloud of this.clouds) {
      const { x, y, w } = cloud;
      const h = w * 0.45;

      ctx.beginPath();
      // Main body (center ellipse)
      ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      // Left bump (slightly smaller)
      ctx.ellipse(x - w * 0.3, y + h * 0.08, w * 0.35, h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      // Right bump (slightly different size)
      ctx.ellipse(x + w * 0.28, y + h * 0.05, w * 0.38, h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Ground ───────────────────────────────────────────────────────

  _drawGround(ctx, canvasWidth, canvasHeight, groundY, theme) {
    const grad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
    grad.addColorStop(0, theme ? theme.groundTop : '#7EC850');
    grad.addColorStop(0.4, theme ? theme.groundTop : '#6BB840');
    grad.addColorStop(1, theme ? theme.groundBot : '#4A8B2C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
  }

  // ── Grass tufts ──────────────────────────────────────────────────

  _drawGrassTufts(ctx, canvasWidth, groundY) {
    ctx.fillStyle = '#8BD460';
    const spacing = 15;
    for (let x = 0; x < canvasWidth; x += spacing) {
      // Small ellipses sitting on the ground line
      const tuftW = 6 + Math.sin(x * 0.7) * 2;
      const tuftH = 8 + Math.sin(x * 1.3) * 3;
      ctx.beginPath();
      ctx.ellipse(x, groundY - tuftH * 0.3, tuftW, tuftH, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Flowers ──────────────────────────────────────────────────────

  _drawFlowers(ctx, canvasWidth, groundY) {
    const now = Date.now();

    for (const flower of this.flowers) {
      // Distribute flowers proportionally across canvas width
      const fx = (flower.x / 1500) * canvasWidth;
      const swayAngle = Math.sin(now * 0.002 + flower.sway) * 0.12;
      const stemHeight = flower.size * 2.5 + 6;

      ctx.save();
      ctx.translate(fx, groundY);
      ctx.rotate(swayAngle);

      // Stem (dark green rectangle)
      ctx.fillStyle = '#3A7D20';
      ctx.fillRect(-1.5, -stemHeight, 3, stemHeight);

      // 5 petals (colored ellipses arranged in a circle)
      const petalLen = flower.size * 0.8;
      const petalW = flower.size * 0.38;
      ctx.fillStyle = flower.color;
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * flower.size * 0.45;
        const py = -stemHeight + Math.sin(angle) * flower.size * 0.45;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, petalW, petalLen, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Yellow center dot
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(0, -stemHeight, flower.size * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ── Fence ────────────────────────────────────────────────────────

  _drawFence(ctx, canvasWidth, groundY) {
    const postSpacing = 60;
    const fenceTop = groundY - 50;
    const postWidth = 8;
    const postBottom = groundY + 10;
    const plankH = 6;
    const woodColor = '#DEB887';
    const woodDark = '#C4A06A';
    const woodHighlight = '#EED8B0';

    // Draw horizontal planks first (behind posts)
    const plank1Y = fenceTop + 10;
    const plank2Y = fenceTop + 30;

    // Upper plank
    ctx.fillStyle = woodColor;
    ctx.fillRect(0, plank1Y, canvasWidth, plankH);
    // Slight highlight on top edge
    ctx.fillStyle = woodHighlight;
    ctx.fillRect(0, plank1Y, canvasWidth, 1.5);
    // Shadow on bottom edge
    ctx.fillStyle = woodDark;
    ctx.fillRect(0, plank1Y + plankH - 1.5, canvasWidth, 1.5);

    // Lower plank
    ctx.fillStyle = woodColor;
    ctx.fillRect(0, plank2Y, canvasWidth, plankH);
    ctx.fillStyle = woodHighlight;
    ctx.fillRect(0, plank2Y, canvasWidth, 1.5);
    ctx.fillStyle = woodDark;
    ctx.fillRect(0, plank2Y + plankH - 1.5, canvasWidth, 1.5);

    // Draw vertical posts with pointed tops
    for (let x = postSpacing * 0.5; x < canvasWidth; x += postSpacing) {
      const px = x - postWidth / 2;

      // Post body
      ctx.fillStyle = woodColor;
      ctx.fillRect(px, fenceTop, postWidth, postBottom - fenceTop);

      // Pointed top (triangle)
      ctx.beginPath();
      ctx.moveTo(px - 1, fenceTop);
      ctx.lineTo(x, fenceTop - 10);
      ctx.lineTo(px + postWidth + 1, fenceTop);
      ctx.closePath();
      ctx.fill();

      // Left highlight
      ctx.fillStyle = woodHighlight;
      ctx.fillRect(px, fenceTop, 2, postBottom - fenceTop);

      // Right shadow
      ctx.fillStyle = woodDark;
      ctx.fillRect(px + postWidth - 2, fenceTop, 2, postBottom - fenceTop);
    }
  }

  // ── Stage-specific decorations ─────────────────────────────────

  _drawStageDecorations(ctx, canvasWidth, groundY, theme) {
    const now = Date.now();

    if (theme.name === '가을 숲') {
      // Falling leaves
      ctx.save();
      for (let i = 0; i < 8; i++) {
        const lx = ((now * 0.02 + i * 200) % (canvasWidth + 100)) - 50;
        const ly = ((now * 0.03 + i * 150) % (groundY + 50)) - 25;
        const rot = (now * 0.002 + i) % (Math.PI * 2);
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = ['#FF6B00', '#FFD700', '#FF4500', '#8B4513'][i % 4];
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    } else if (theme.name === '겨울 눈밭') {
      // Snowflakes
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 15; i++) {
        const sx = ((now * 0.015 + i * 130) % (canvasWidth + 40)) - 20;
        const sy = ((now * 0.025 + i * 100) % (groundY + 30)) - 15;
        ctx.globalAlpha = 0.4 + Math.sin(now * 0.003 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (theme.name === '무지개 마을') {
      // Rainbow arc
      ctx.save();
      ctx.globalAlpha = 0.2;
      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      const rcx = canvasWidth * 0.3;
      const rcy = groundY;
      for (let i = 0; i < colors.length; i++) {
        ctx.beginPath();
        ctx.arc(rcx, rcy, 200 + i * 12, Math.PI, 0);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 10;
        ctx.stroke();
      }
      ctx.restore();
    } else if (theme.name === '여름 들판') {
      // Butterflies
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const bx = (canvasWidth * 0.2) + Math.sin(now * 0.001 + i * 2) * canvasWidth * 0.3;
        const by = 80 + Math.sin(now * 0.0015 + i * 3) * 60;
        const wingAng = Math.sin(now * 0.008 + i) * 0.4;
        ctx.save();
        ctx.translate(bx, by);
        ctx.globalAlpha = 0.7;
        const bColor = ['#FF69B4', '#87CEEB', '#FFD700', '#DDA0DD'][i];
        // Left wing
        ctx.save();
        ctx.rotate(-wingAng);
        ctx.fillStyle = bColor;
        ctx.beginPath();
        ctx.ellipse(-5, 0, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Right wing
        ctx.save();
        ctx.rotate(wingAng);
        ctx.fillStyle = bColor;
        ctx.beginPath();
        ctx.ellipse(5, 0, 8, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Body
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, 0, 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  }
}
