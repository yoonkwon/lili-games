/**
 * SpriteCache - pre-renders game sprites to offscreen canvases
 */
export class SpriteCache {
  constructor() {
    this.cache = new Map();
  }

  init() {
    this._renderCharacters();
    this._renderCompanions();
    this._renderDinoIcons();
    this._renderAnimalIcons();
  }

  get(name) {
    return this.cache.get(name);
  }

  draw(ctx, name, x, y, scale = 1, flipX = false) {
    const sprite = this.cache.get(name);
    if (!sprite) return;
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }

  _mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return [c, c.getContext('2d')];
  }

  _renderCharacters() {
    // Ria - 6yo girl, green outfit
    this._renderGirl('ria', '#4CAF50', '#2E7D32', '#3E2723', 'bob');
    // Lisa - 4yo girl, pink outfit, pigtails
    this._renderGirl('lisa', '#FF69B4', '#E91E63', '#5D4037', 'pigtails');
  }

  _renderGirl(name, bodyColor, bodyDark, hairColor, hairStyle) {
    const [c, ctx] = this._mk(48, 64);
    const cx = 24;
    const headY = 18;
    const bodyY = 38;
    const skinColor = '#FDDCB5';
    const eyeColor = name === 'lisa' ? '#6B4226' : '#2E4A1E';

    // --- Hair back layer ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(cx, headY, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 17, headY + 4, 6, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 17, headY + 4, 6, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(cx - 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.arc(cx + 17, headY - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 14, headY + 6, 5, 10, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 14, headY + 6, 5, 10, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Body ---
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx - 11, bodyY - 6);
    ctx.quadraticCurveTo(cx - 14, bodyY + 12, cx - 12, bodyY + 16);
    ctx.lineTo(cx + 12, bodyY + 16);
    ctx.quadraticCurveTo(cx + 14, bodyY + 12, cx + 11, bodyY - 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.moveTo(cx - 6, bodyY - 6);
    ctx.lineTo(cx, bodyY - 2);
    ctx.lineTo(cx + 6, bodyY - 6);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(cx - 13, bodyY + 2, 4, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 13, bodyY + 2, 4, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 12, bodyY - 2, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 12, bodyY - 2, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // --- Head ---
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(cx, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // --- Hair front ---
    ctx.fillStyle = hairColor;
    if (hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(cx, headY, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 12, headY - 8);
      ctx.quadraticCurveTo(cx - 6, headY - 2, cx, headY - 6);
      ctx.quadraticCurveTo(cx + 6, headY - 2, cx + 12, headY - 8);
      ctx.lineTo(cx + 15, headY - 12);
      ctx.arc(cx, headY, 16, -0.4, Math.PI + 0.4, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, headY - 1, 16, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 6);
      ctx.quadraticCurveTo(cx - 7, headY - 1, cx, headY - 4);
      ctx.quadraticCurveTo(cx + 7, headY - 1, cx + 14, headY - 6);
      ctx.lineTo(cx + 16, headY - 10);
      ctx.arc(cx, headY - 1, 16, -0.2, Math.PI + 0.2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx + 12, headY - 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Eyes ---
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 3, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(cx - 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, headY + 3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 7.5, headY + 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 7, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 5, headY + 4.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 6, headY + 2, 4.5, 5, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 6, headY + 2, 4.5, 5, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Blush
    ctx.fillStyle = 'rgba(255,140,140,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 9, headY + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = 'rgba(200,140,100,0.4)';
    ctx.beginPath();
    ctx.arc(cx, headY + 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#E57373';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, headY + 8, 3, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // --- Legs ---
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 6, bodyY + 14, 5, 8);
    ctx.fillRect(cx + 1, bodyY + 14, 5, 8);

    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - 6, bodyY + 18, 5, 4);
    ctx.fillRect(cx + 1, bodyY + 18, 5, 4);

    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.ellipse(cx - 4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, bodyY + 23, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderCompanions() {
    // Bori - black Chow Chow (larger, fluffier)
    this._renderChowChow('bori');
    // Jopssal - spotted puppy (distinct spots)
    this._renderSpottedPuppy('jopssal');
    // Ikdol - orange pteranodon
    this._renderPteranodon('ikdol', '#FF8C00', '#E67300');
    // Gosun - white cat with black patches
    this._renderCat('gosun', '#FFFFFF', '#333333');
    // Azzi twins - white and sky-blue rabbits
    this._renderRabbit('azzi_white', '#FFFFFF', '#F5F5F5', '#FFB6C1');
    this._renderRabbit('azzi_blue', '#B0E0FF', '#87CEEB', '#FFB6C1');
    // NPC versions (with "?" bubble)
    this._renderCompanionNPC('bori');
    this._renderCompanionNPC('jopssal');
    this._renderCompanionNPC('ikdol');
    this._renderCompanionNPC('gosun');
    this._renderCompanionNPC('azzi_white');
    this._renderCompanionNPC('azzi_blue');
  }

  _renderChowChow(name) {
    const [c, ctx] = this._mk(52, 50);
    const cx = 26, cy = 25;

    // Fluffy body (chow chow is very fluffy)
    ctx.fillStyle = '#2a2a2a';
    // Fur outline (bigger circle for fluffiness)
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy mane around neck
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 2, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (round chow face)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 6, 11, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cheeks
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 18, cy - 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small rounded ears
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 19, cy - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (small, characteristic of chow chow)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 7, 3, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 7, 1.8, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 7, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 8.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy - 8.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Blue-black tongue (chow chow signature!)
    ctx.fillStyle = '#4a3a6a';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy + 1, 3, 4, 0, 0, Math.PI);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy - 2, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy tail (curled up)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Legs (thick, fluffy)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx - 10, cy + 12, 6, 8);
    ctx.fillRect(cx - 2, cy + 12, 6, 8);
    ctx.fillRect(cx + 6, cy + 12, 6, 8);
    ctx.fillRect(cx + 14, cy + 12, 6, 8);

    // Paws
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(cx - 7, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 1, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 17, cy + 20, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderSpottedPuppy(name) {
    const [c, ctx] = this._mk(52, 48);
    const cx = 26, cy = 24;

    // Body (cream/beige)
    ctx.fillStyle = '#F5E6D3';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brown spots on body
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 1, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 7, 5, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#F5E6D3';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Brown patch over one eye
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy - 6, 6, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = '#A0784C';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 6, 5, 10, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy - 6, 5, 10, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (big, puppy eyes)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy - 5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 16, cy - 5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3010';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 4.5, 2.2, 0, Math.PI * 2);
    ctx.arc(cx + 17, cy - 4.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 4, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 17, cy - 4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 6, 1, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 6, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 20, cy - 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy mouth
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + 17, cy + 1, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Tongue
    ctx.fillStyle = '#FF8A9E';
    ctx.beginPath();
    ctx.ellipse(cx + 17, cy + 4, 2.5, 3, 0, 0, Math.PI);
    ctx.fill();

    // Wagging tail
    ctx.strokeStyle = '#F5E6D3';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 10, cx - 18, cy - 16);
    ctx.stroke();
    // Brown tip
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 12);
    ctx.quadraticCurveTo(cx - 19, cy - 16, cx - 18, cy - 16);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#F5E6D3';
    ctx.fillRect(cx - 10, cy + 12, 5, 7);
    ctx.fillRect(cx - 3, cy + 12, 5, 7);
    ctx.fillRect(cx + 4, cy + 12, 5, 7);
    ctx.fillRect(cx + 11, cy + 12, 5, 7);

    // Paws
    ctx.fillStyle = '#E8D5BF';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 1, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 6, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 13, cy + 19, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderPteranodon(name, bodyColor, darkColor) {
    const [c, ctx] = this._mk(64, 48);
    const cx = 32, cy = 24;

    // Wings (larger span)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx - 28, cy - 20, cx - 30, cy + 4);
    ctx.lineTo(cx - 20, cy + 4);
    ctx.lineTo(cx - 12, cy + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 28, cy - 20, cx + 30, cy + 4);
    ctx.lineTo(cx + 20, cy + 4);
    ctx.lineTo(cx + 12, cy + 2);
    ctx.fill();

    // Wing membrane lines
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 22, cy + 2);
    ctx.moveTo(cx - 6, cy - 2); ctx.lineTo(cx - 26, cy - 4);
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 22, cy + 2);
    ctx.moveTo(cx + 6, cy - 2); ctx.lineTo(cx + 26, cy - 4);
    ctx.stroke();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#FFE0A0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Crest (signature pteranodon feature - bigger)
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 13);
    ctx.lineTo(cx + 4, cy - 22);
    ctx.lineTo(cx + 8, cy - 14);
    ctx.lineTo(cx + 18, cy - 11);
    ctx.fill();

    // Beak (longer, more pointed)
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy - 5);
    ctx.lineTo(cx + 32, cy - 2);
    ctx.lineTo(cx + 22, cy);
    ctx.fill();
    // Beak line
    ctx.strokeStyle = '#E68900';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy - 3);
    ctx.lineTo(cx + 30, cy - 2);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 17, cy - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 17, cy - 6.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Small feet
    ctx.fillStyle = '#E68900';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 12);
    ctx.lineTo(cx - 8, cy + 18);
    ctx.lineTo(cx - 2, cy + 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 12);
    ctx.lineTo(cx, cy + 18);
    ctx.lineTo(cx + 6, cy + 14);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderCat(name, bodyColor, patchColor) {
    const [c, ctx] = this._mk(52, 48);
    const cx = 26, cy = 24;

    // Body (rounder, fluffier)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 4, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black patches on body
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy + 2, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 7, 5, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Head (round cat head)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Black patch on head (over one eye)
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 7, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy - 12);
    ctx.lineTo(cx + 1, cy - 22);
    ctx.lineTo(cx + 8, cy - 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 12);
    ctx.lineTo(cx + 19, cy - 22);
    ctx.lineTo(cx + 17, cy - 12);
    ctx.fill();

    // Inner ears (pink)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 13);
    ctx.lineTo(cx + 2, cy - 19);
    ctx.lineTo(cx + 7, cy - 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 13);
    ctx.lineTo(cx + 18, cy - 19);
    ctx.lineTo(cx + 17, cy - 13);
    ctx.fill();

    // Left ear black patch
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 16);
    ctx.lineTo(cx + 1, cy - 22);
    ctx.lineTo(cx + 5, cy - 15);
    ctx.fill();

    // Eyes (big green cat eyes)
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 5, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy - 5, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils (vertical slits)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 5, 1, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy - 5, 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 6.5, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 6.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose (pink triangle)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 2);
    ctx.lineTo(cx + 8.5, cy);
    ctx.lineTo(cx + 11.5, cy);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 1); ctx.lineTo(cx - 4, cy - 3);
    ctx.moveTo(cx + 5, cy); ctx.lineTo(cx - 4, cy + 1);
    ctx.moveTo(cx + 5, cy + 1); ctx.lineTo(cx - 3, cy + 3);
    ctx.moveTo(cx + 15, cy - 1); ctx.lineTo(cx + 24, cy - 3);
    ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 24, cy + 1);
    ctx.moveTo(cx + 15, cy + 1); ctx.lineTo(cx + 23, cy + 3);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 8, cy + 2);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 12, cy + 2);
    ctx.stroke();

    // Curvy tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 6, cx - 18, cy - 16);
    ctx.stroke();
    // Black tip
    ctx.strokeStyle = patchColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 12);
    ctx.quadraticCurveTo(cx - 19, cy - 16, cx - 18, cy - 16);
    ctx.stroke();

    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(cx - 8, cy + 12, 5, 6);
    ctx.fillRect(cx - 2, cy + 12, 5, 6);
    ctx.fillRect(cx + 4, cy + 12, 5, 6);
    ctx.fillRect(cx + 10, cy + 12, 5, 6);

    // Paws
    ctx.fillStyle = '#FFE0E0';
    ctx.beginPath();
    ctx.ellipse(cx - 6, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 6, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy + 18, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  _renderRabbit(name, bodyColor, shadowColor, innerEarColor) {
    const [c, ctx] = this._mk(48, 52);
    const cx = 24, cy = 26;

    // Body (round, plump)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body shadow
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 10, 5, 0, 0, Math.PI);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
    ctx.fill();

    // Long ears (upright, floppy)
    ctx.fillStyle = bodyColor;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 24, 4, 12, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // Right ear (slightly tilted)
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 23, 4, 11, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = innerEarColor;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 23, 2.5, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 22, 2.5, 7, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (big, round, cute)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 7, 3.5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 4, cy - 7, 3.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris
    ctx.fillStyle = name === 'azzi_white' ? '#8B4513' : '#4169E1';
    ctx.beginPath();
    ctx.arc(cx - 3.5, cy - 7, 2, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 7, 2, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - 3.5, cy - 7, 1, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 7, 1, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4.5, cy - 8, 0.8, 0, Math.PI * 2);
    ctx.arc(cx + 3.5, cy - 8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose (small pink triangle)
    ctx.fillStyle = '#FF9999';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3);
    ctx.lineTo(cx - 1.5, cy - 1.5);
    ctx.lineTo(cx + 1.5, cy - 1.5);
    ctx.fill();

    // Mouth (Y shape)
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 1.5);
    ctx.lineTo(cx, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 2, cy + 1.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 2, cy + 1.5);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 2); ctx.lineTo(cx - 10, cy - 3);
    ctx.moveTo(cx - 3, cy - 1); ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 3, cy - 2); ctx.lineTo(cx + 10, cy - 3);
    ctx.moveTo(cx + 3, cy - 1); ctx.lineTo(cx + 10, cy);
    ctx.stroke();

    // Front paws
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy + 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, cy + 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Paw pads
    ctx.fillStyle = innerEarColor;
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 13, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy + 13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cotton tail (behind body)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    this.cache.set(`${name}-idle`, c);
  }

  // --- Cute dinosaur & animal icon sprites ---

  _renderDinoIcons() {
    this._renderTrex();
    this._renderTricera();
    this._renderStego();
    this._renderBrachio();
    this._renderPteroIcon();
    this._renderVeloci();
    this._renderAnkylo();
    this._renderSpino();
    this._renderParasauro();
    this._renderDiplo();
    this._renderCompy();
    this._renderPachy();
  }

  _renderAnimalIcons() {
    this._renderSeahorse();
  }

  /** Cute shared eye helper: big round eye with shine */
  _cuteEye(ctx, x, y, r, irisColor) {
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = irisColor || '#2E2E2E';
    ctx.beginPath(); ctx.arc(x + r * 0.12, y + r * 0.1, r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(x + r * 0.15, y + r * 0.15, r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill();
  }

  _cuteBlush(ctx, x, y) {
    ctx.fillStyle = 'rgba(255,130,130,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  _cuteSmile(ctx, x, y, w) {
    ctx.strokeStyle = '#7B5B4D';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y - w * 0.3, w, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }

  _renderTrex() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 22;
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.ellipse(cx - 3, cy + 6, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8E6C9';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 8, 9, 7, 0, -0.3, Math.PI + 0.3); ctx.fill();
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 4);
    ctx.quadraticCurveTo(cx - 22, cy - 2, cx - 18, cy - 6);
    ctx.quadraticCurveTo(cx - 16, cy - 4, cx - 12, cy + 6);
    ctx.fill();
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.arc(cx + 10, cy - 2, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8E6C9';
    ctx.beginPath(); ctx.ellipse(cx + 13, cy + 2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy + 4); ctx.lineTo(cx + 12, cy + 7); ctx.lineTo(cx + 13, cy + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy + 4); ctx.lineTo(cx + 16, cy + 7); ctx.lineTo(cx + 17, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath(); ctx.arc(cx + 18, cy - 1, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 18, cy + 2, 1.2, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 7, cy - 5, 4, '#4E342E');
    this._cuteEye(ctx, cx + 15, cy - 5, 3.5, '#4E342E');
    this._cuteBlush(ctx, cx + 4, cy + 1);
    this._cuteBlush(ctx, cx + 18, cy + 1);
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.ellipse(cx + 2, cy + 6, 3, 2, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 5, cy + 7, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath(); ctx.ellipse(cx - 6, cy + 16, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 16, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-trex', c);
  }

  _renderTricera() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#A1887F';
    ctx.beginPath(); ctx.ellipse(cx - 4, cy + 4, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.ellipse(cx - 3, cy + 6, 8, 6, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#A1887F';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 2, cx - 18, cy - 4);
    ctx.quadraticCurveTo(cx - 16, cy - 1, cx - 14, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 8, 12, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    ctx.fillStyle = '#FF8A65';
    const spots = [[-3, -6], [3, -8], [9, -6], [14, -2], [14, 4]];
    for (const [sx, sy] of spots) {
      ctx.beginPath(); ctx.arc(cx + 8 + sx, cy - 8 + sy, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#A1887F';
    ctx.beginPath(); ctx.arc(cx + 10, cy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.ellipse(cx + 15, cy + 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath(); ctx.moveTo(cx + 18, cy - 1); ctx.lineTo(cx + 21, cy - 4); ctx.lineTo(cx + 19, cy + 1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 7, cy - 6); ctx.lineTo(cx + 3, cy - 14); ctx.lineTo(cx + 9, cy - 5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 13, cy - 6); ctx.lineTo(cx + 17, cy - 14); ctx.lineTo(cx + 15, cy - 5); ctx.fill();
    this._cuteEye(ctx, cx + 8, cy - 1, 3, '#5D4037');
    this._cuteEye(ctx, cx + 14, cy - 1, 2.5, '#5D4037');
    this._cuteBlush(ctx, cx + 5, cy + 3);
    this._cuteSmile(ctx, cx + 14, cy + 4, 3);
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath(); ctx.ellipse(cx - 8, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 1, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-tricera', c);
  }

  _renderStego() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8E6C9';
    ctx.beginPath(); ctx.ellipse(cx, cy + 7, 10, 5, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#FF7043';
    const plates = [[-7, 7], [-2, 9], [3, 9], [8, 7]];
    for (const [dx, sz] of plates) {
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy - 2 - sz);
      ctx.quadraticCurveTo(cx + dx - sz / 2, cy - 1, cx + dx, cy + 1);
      ctx.quadraticCurveTo(cx + dx + sz / 2, cy - 1, cx + dx, cy - 2 - sz);
      ctx.fill();
    }
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.arc(cx + 16, cy + 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8E6C9';
    ctx.beginPath(); ctx.ellipse(cx + 18, cy + 3, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 17, cy, 2.5, '#33691E');
    this._cuteBlush(ctx, cx + 19, cy + 4);
    this._cuteSmile(ctx, cx + 18, cy + 5, 2);
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy - 2, cx - 18, cy - 4);
    ctx.quadraticCurveTo(cx - 16, cy - 1, cx - 12, cy + 5);
    ctx.fill();
    ctx.fillStyle = '#FF7043';
    ctx.beginPath(); ctx.ellipse(cx - 20, cy - 5, 3, 2, -0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 18, cy - 7, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath(); ctx.ellipse(cx - 7, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 4, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-stego', c);
  }

  _renderBrachio() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 26;
    ctx.fillStyle = '#78909C';
    ctx.beginPath(); ctx.ellipse(cx - 2, cy + 4, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 6, 9, 6, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.strokeStyle = '#78909C'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy);
    ctx.quadraticCurveTo(cx + 14, cy - 14, cx + 10, cy - 22);
    ctx.stroke();
    ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 2);
    ctx.quadraticCurveTo(cx + 10, cy - 12, cx + 8, cy - 20);
    ctx.stroke();
    ctx.fillStyle = '#78909C';
    ctx.beginPath(); ctx.arc(cx + 10, cy - 24, 5, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 12, cy - 25, 2.5, '#37474F');
    this._cuteBlush(ctx, cx + 13, cy - 22);
    this._cuteSmile(ctx, cx + 12, cy - 21, 2);
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 2);
    ctx.quadraticCurveTo(cx - 20, cy - 4, cx - 16, cy - 8);
    ctx.quadraticCurveTo(cx - 14, cy - 4, cx - 10, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#607D8B';
    ctx.beginPath(); ctx.ellipse(cx - 7, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 4, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-brachio', c);
  }

  _renderPteroIcon() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 22;
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 2);
    ctx.quadraticCurveTo(cx - 16, cy - 10, cx - 20, cy);
    ctx.quadraticCurveTo(cx - 16, cy + 4, cx - 6, cy + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 2);
    ctx.quadraticCurveTo(cx + 16, cy - 10, cx + 20, cy);
    ctx.quadraticCurveTo(cx + 16, cy + 4, cx + 6, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#FFE0B2';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 2);
    ctx.quadraticCurveTo(cx - 12, cy - 4, cx - 14, cy + 2);
    ctx.quadraticCurveTo(cx - 10, cy + 4, cx - 4, cy + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 2);
    ctx.quadraticCurveTo(cx + 12, cy - 4, cx + 14, cy + 2);
    ctx.quadraticCurveTo(cx + 10, cy + 4, cx + 4, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFE0B2';
    ctx.beginPath(); ctx.ellipse(cx, cy + 5, 5, 4, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath(); ctx.arc(cx, cy - 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 11);
    ctx.quadraticCurveTo(cx - 8, cy - 18, cx - 10, cy - 14);
    ctx.quadraticCurveTo(cx - 6, cy - 12, cx - 1, cy - 10);
    ctx.fill();
    ctx.fillStyle = '#FFA726';
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 6); ctx.lineTo(cx + 13, cy - 5); ctx.lineTo(cx + 5, cy - 3);
    ctx.fill();
    this._cuteEye(ctx, cx - 1, cy - 7, 3, '#4E342E');
    this._cuteEye(ctx, cx + 4, cy - 7, 2.5, '#4E342E');
    this._cuteBlush(ctx, cx - 4, cy - 4);
    this._cuteBlush(ctx, cx + 7, cy - 4);
    ctx.fillStyle = '#F57C00';
    ctx.beginPath(); ctx.ellipse(cx - 3, cy + 10, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 10, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-ptero', c);
  }

  _renderVeloci() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 22;
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath(); ctx.ellipse(cx - 2, cy + 4, 10, 8, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DCEDC8';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 6, 7, 5, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#689F38';
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + 1);
    ctx.quadraticCurveTo(cx + 10, cy - 6, cx + 6, cy - 2);
    ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 4, cy - 4);
    ctx.lineTo(cx + 4, cy + 2);
    ctx.fill();
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 2);
    ctx.quadraticCurveTo(cx - 20, cy - 4, cx - 18, cy - 8);
    ctx.quadraticCurveTo(cx - 16, cy - 4, cx - 10, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#689F38';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 8);
    ctx.lineTo(cx - 22, cy - 12); ctx.lineTo(cx - 18, cy - 10);
    ctx.lineTo(cx - 20, cy - 14); ctx.lineTo(cx - 16, cy - 10);
    ctx.lineTo(cx - 16, cy - 7);
    ctx.fill();
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath(); ctx.arc(cx + 10, cy - 4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DCEDC8';
    ctx.beginPath(); ctx.ellipse(cx + 13, cy - 1, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy - 4); ctx.lineTo(cx + 21, cy - 2); ctx.lineTo(cx + 16, cy);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(cx + 17, cy - 1); ctx.lineTo(cx + 18, cy + 1); ctx.lineTo(cx + 19, cy - 1); ctx.fill();
    this._cuteEye(ctx, cx + 8, cy - 6, 3.5, '#F9A825');
    this._cuteEye(ctx, cx + 14, cy - 6, 2.5, '#F9A825');
    this._cuteBlush(ctx, cx + 5, cy - 2);
    ctx.fillStyle = '#7CB342';
    ctx.beginPath(); ctx.ellipse(cx - 5, cy + 12, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 12, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 12); ctx.lineTo(cx - 10, cy + 9); ctx.lineTo(cx - 6, cy + 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy + 12); ctx.lineTo(cx - 2, cy + 9); ctx.lineTo(cx + 2, cy + 11);
    ctx.fill();
    this.cache.set('dino-veloci', c);
  }

  _renderAnkylo() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A1887F';
    ctx.beginPath(); ctx.ellipse(cx, cy - 1, 14, 7, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#D7CCC8';
    const bumps = [[-8,-3],[-3,-5],[3,-5],[8,-3],[-5,0],[0,-2],[5,0]];
    for (const [bx, by] of bumps) {
      ctx.beginPath(); ctx.arc(cx + bx, cy + by, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#FFCC80';
    [-14, -10, 10, 14].forEach(dx => {
      ctx.beginPath(); ctx.ellipse(cx + dx, cy + 2, 3, 2, dx > 0 ? 0.3 : -0.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath(); ctx.arc(cx + 14, cy + 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.ellipse(cx + 17, cy + 3, 3.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 15, cy, 2.5, '#4E342E');
    this._cuteBlush(ctx, cx + 18, cy + 4);
    this._cuteSmile(ctx, cx + 17, cy + 5, 2);
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 2);
    ctx.quadraticCurveTo(cx - 22, cy, cx - 20, cy - 2);
    ctx.lineTo(cx - 16, cy);
    ctx.fill();
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath(); ctx.arc(cx - 21, cy - 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath(); ctx.arc(cx - 21, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#795548';
    ctx.beginPath(); ctx.ellipse(cx - 7, cy + 10, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 5, cy + 10, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-ankylo', c);
  }

  _renderSpino() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#78909C';
    ctx.beginPath(); ctx.ellipse(cx - 2, cy + 5, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 7, 9, 6, 0, -0.2, Math.PI + 0.2); ctx.fill();
    const grad = ctx.createLinearGradient(cx - 6, cy - 16, cx + 6, cy);
    grad.addColorStop(0, '#EF5350');
    grad.addColorStop(0.5, '#FF7043');
    grad.addColorStop(1, '#78909C');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 1);
    ctx.quadraticCurveTo(cx - 2, cy - 18, cx, cy - 20);
    ctx.quadraticCurveTo(cx + 4, cy - 18, cx + 8, cy + 1);
    ctx.fill();
    ctx.fillStyle = '#78909C';
    ctx.beginPath(); ctx.arc(cx + 12, cy + 1, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 2);
    ctx.quadraticCurveTo(cx + 26, cy + 1, cx + 18, cy + 4);
    ctx.fill();
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath(); ctx.ellipse(cx + 20, cy + 2, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 10, cy - 2, 3, '#D32F2F');
    this._cuteEye(ctx, cx + 16, cy - 2, 2.5, '#D32F2F');
    this._cuteBlush(ctx, cx + 7, cy + 2);
    ctx.fillStyle = '#607D8B';
    ctx.beginPath(); ctx.arc(cx + 22, cy, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 3);
    ctx.quadraticCurveTo(cx - 22, cy - 2, cx - 18, cy - 6);
    ctx.quadraticCurveTo(cx - 16, cy - 2, cx - 12, cy + 6);
    ctx.fill();
    ctx.fillStyle = '#607D8B';
    ctx.beginPath(); ctx.ellipse(cx - 6, cy + 14, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 4, cy + 14, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-spino', c);
  }

  _renderParasauro() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#26A69A';
    ctx.beginPath(); ctx.ellipse(cx - 2, cy + 5, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#80CBC4';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 7, 8, 5, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#26A69A';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy + 1);
    ctx.quadraticCurveTo(cx + 10, cy - 6, cx + 10, cy - 10);
    ctx.lineTo(cx + 6, cy - 10);
    ctx.quadraticCurveTo(cx + 4, cy - 4, cx + 2, cy + 3);
    ctx.fill();
    ctx.fillStyle = '#26A69A';
    ctx.beginPath(); ctx.arc(cx + 10, cy - 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF7043';
    ctx.lineWidth = 4; ctx.strokeStyle = '#FF7043'; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 16);
    ctx.quadraticCurveTo(cx + 2, cy - 24, cx - 4, cy - 20);
    ctx.stroke();
    ctx.fillStyle = '#FF5722';
    ctx.beginPath(); ctx.arc(cx - 4, cy - 20, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#80CBC4';
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 13); ctx.lineTo(cx + 19, cy - 11); ctx.lineTo(cx + 14, cy - 10);
    ctx.fill();
    this._cuteEye(ctx, cx + 12, cy - 13, 2.5, '#004D40');
    this._cuteBlush(ctx, cx + 14, cy - 10);
    this._cuteSmile(ctx, cx + 15, cy - 9, 2);
    ctx.fillStyle = '#26A69A';
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy + 3);
    ctx.quadraticCurveTo(cx - 20, cy - 2, cx - 16, cy - 4);
    ctx.quadraticCurveTo(cx - 14, cy - 1, cx - 11, cy + 5);
    ctx.fill();
    ctx.fillStyle = '#00897B';
    ctx.beginPath(); ctx.ellipse(cx - 6, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-parasauro', c);
  }

  _renderDiplo() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 26;
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 7, 5, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy);
    ctx.quadraticCurveTo(cx + 16, cy - 14, cx + 12, cy - 22);
    ctx.stroke();
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 2);
    ctx.quadraticCurveTo(cx + 12, cy - 12, cx + 10, cy - 20);
    ctx.stroke();
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath(); ctx.arc(cx + 12, cy - 24, 4.5, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 14, cy - 25, 2.2, '#616161');
    this._cuteBlush(ctx, cx + 15, cy - 22);
    this._cuteSmile(ctx, cx + 14, cy - 22, 1.5);
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 1);
    ctx.quadraticCurveTo(cx - 20, cy - 6, cx - 20, cy - 12);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 12);
    ctx.quadraticCurveTo(cx - 22, cy - 16, cx - 20, cy - 18);
    ctx.stroke();
    ctx.fillStyle = '#757575';
    ctx.beginPath(); ctx.ellipse(cx - 5, cy + 10, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 5, cy + 10, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-diplo', c);
  }

  _renderCompy() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#AED581';
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F1F8E9';
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 6, 4, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#AED581';
    ctx.beginPath(); ctx.arc(cx + 6, cy - 6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F1F8E9';
    ctx.beginPath(); ctx.ellipse(cx + 10, cy - 3, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AED581';
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 5); ctx.lineTo(cx + 16, cy - 3); ctx.lineTo(cx + 12, cy - 2);
    ctx.fill();
    this._cuteEye(ctx, cx + 3, cy - 8, 4, '#33691E');
    this._cuteEye(ctx, cx + 9, cy - 8, 3.5, '#33691E');
    this._cuteBlush(ctx, cx, cy - 4);
    this._cuteBlush(ctx, cx + 12, cy - 4);
    this._cuteSmile(ctx, cx + 10, cy - 2, 2);
    ctx.strokeStyle = '#AED581'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 1);
    ctx.quadraticCurveTo(cx - 16, cy - 6, cx - 14, cy - 10);
    ctx.stroke();
    ctx.fillStyle = '#9CCC65';
    ctx.beginPath(); ctx.ellipse(cx - 3, cy + 8, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 8, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-compy', c);
  }

  _renderPachy() {
    const [c, ctx] = this._mk(44, 44);
    const cx = 22, cy = 24;
    ctx.fillStyle = '#7986CB';
    ctx.beginPath(); ctx.ellipse(cx - 2, cy + 5, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C5CAE9';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy + 7, 7, 5, 0, -0.2, Math.PI + 0.2); ctx.fill();
    ctx.fillStyle = '#7986CB';
    ctx.beginPath(); ctx.arc(cx + 8, cy - 2, 8, 0, Math.PI * 2); ctx.fill();
    const domeGrad = ctx.createRadialGradient(cx + 6, cy - 12, 2, cx + 8, cy - 8, 12);
    domeGrad.addColorStop(0, '#9FA8DA');
    domeGrad.addColorStop(0.5, '#5C6BC0');
    domeGrad.addColorStop(1, '#3949AB');
    ctx.fillStyle = domeGrad;
    ctx.beginPath(); ctx.arc(cx + 8, cy - 8, 11, Math.PI * 0.9, Math.PI * 0.1, true); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(cx + 4, cy - 14, 4, 2.5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3949AB';
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * 0.95 + i * 0.25;
      const bx = cx + 8 + Math.cos(a) * 11;
      const by = cy - 8 + Math.sin(a) * 11;
      ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#C5CAE9';
    ctx.beginPath(); ctx.ellipse(cx + 12, cy + 2, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    this._cuteEye(ctx, cx + 12, cy - 2, 3, '#283593');
    this._cuteBlush(ctx, cx + 15, cy + 1);
    this._cuteSmile(ctx, cx + 13, cy + 3, 2.5);
    ctx.fillStyle = '#7986CB';
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 19, cy + 1); ctx.lineTo(cx + 15, cy + 3);
    ctx.fill();
    ctx.fillStyle = '#7986CB';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 3);
    ctx.quadraticCurveTo(cx - 20, cy - 2, cx - 16, cy - 4);
    ctx.quadraticCurveTo(cx - 14, cy - 1, cx - 10, cy + 6);
    ctx.fill();
    ctx.fillStyle = '#5C6BC0';
    ctx.beginPath(); ctx.ellipse(cx - 6, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 13, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    this.cache.set('dino-pachy', c);
  }

  _renderSeahorse() {
    const [c, ctx] = this._mk(38, 38);
    const cx = 19, cy = 19;
    ctx.strokeStyle = '#FF9800'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.quadraticCurveTo(cx + 2, cy, cx, cy + 4);
    ctx.quadraticCurveTo(cx - 3, cy + 10, cx - 6, cy + 14);
    ctx.quadraticCurveTo(cx - 4, cy + 16, cx - 2, cy + 14);
    ctx.stroke();
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath(); ctx.ellipse(cx, cy - 2, 5, 8, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF3E0';
    ctx.beginPath(); ctx.ellipse(cx + 1, cy, 3, 5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#F57C00'; ctx.lineWidth = 0.6;
    for (let i = -4; i <= 4; i += 2) {
      ctx.beginPath(); ctx.moveTo(cx - 5, cy + i); ctx.lineTo(cx + 5, cy + i); ctx.stroke();
    }
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath(); ctx.ellipse(cx + 2, cy - 10, 4, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 11); ctx.lineTo(cx + 12, cy - 10); ctx.lineTo(cx + 5, cy - 9);
    ctx.fill();
    this._cuteEye(ctx, cx + 3, cy - 11, 2, '#4E342E');
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14); ctx.lineTo(cx - 1, cy - 18); ctx.lineTo(cx + 1, cy - 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 14); ctx.lineTo(cx + 3, cy - 17); ctx.lineTo(cx + 4, cy - 14);
    ctx.fill();
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx - 8, cy - 2); ctx.lineTo(cx - 4, cy + 2);
    ctx.fill();
    ctx.strokeStyle = '#FF9800'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 4, cy + 14, 3, 0, Math.PI * 1.3);
    ctx.stroke();
    this.cache.set('animal-seahorse', c);
  }


  /**
   * Render NPC version of companion (with "?" indicator)
   */
  _renderCompanionNPC(type) {
    const sprite = this.cache.get(`${type}-idle`);
    if (!sprite) return;
    const padding = 12;
    const [c, ctx] = this._mk(sprite.width + padding, sprite.height + padding + 16);

    // Draw "?" bubble above
    const bubbleX = c.width / 2;
    const bubbleY = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = 'Bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6B00';
    ctx.fillText('?', bubbleX, bubbleY);

    // Draw the companion sprite below the bubble (slightly transparent)
    ctx.globalAlpha = 0.75;
    ctx.drawImage(sprite, padding / 2, padding / 2 + 16);
    ctx.globalAlpha = 1;

    this.cache.set(`${type}-npc`, c);
  }
}
